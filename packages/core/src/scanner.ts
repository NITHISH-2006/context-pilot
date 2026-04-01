import * as fs from 'fs';
import * as path from 'path';
import ignore, { type Ignore } from 'ignore';
import type { ContextConfig, FileNode, ScanResult } from '@context-pilot-v1/shared';
import { SUPPORTED_EXTENSIONS } from '@context-pilot-v1/shared';
import { countAllFileTokens } from './tokenizer';

// ─────────────────────────────────────────────────────────────────────────────
// Import graph building
// ─────────────────────────────────────────────────────────────────────────────

/** Regex patterns to extract import paths from JS/TS files */
const IMPORT_PATTERNS = [
  /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /export\s+.*\s+from\s+['"]([^'"]+)['"]/g,
];

/**
 * Extract all local import paths from a file's source text.
 * Only returns relative imports (starting with . or /) — ignores npm packages.
 */
function extractLocalImports(source: string): string[] {
  const imports: string[] = [];
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      const importPath = match[1];
      if (importPath !== undefined && (importPath.startsWith('.') || importPath.startsWith('/'))) {
        imports.push(importPath);
      }
    }
  }
  return [...new Set(imports)];
}

/**
 * Resolve a relative import path to an absolute file path.
 * Tries adding common extensions if the path has none.
 */
function resolveImport(fromFile: string, importPath: string, allPaths: Set<string>): string | null {
  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(fromDir, importPath);

  // Exact match
  if (allPaths.has(resolved)) return resolved;

  // Try adding extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    if (allPaths.has(withExt)) return withExt;
    // Try index file
    const asIndex = path.join(resolved, `index${ext}`);
    if (allPaths.has(asIndex)) return asIndex;
  }

  return null;
}

/**
 * Build a directed import graph for all JS/TS files.
 * Returns Map<filePath, [importedFilePaths]>
 */
export function buildImportGraph(files: string[]): Map<string, string[]> {
  const allPaths = new Set(files);
  const graph = new Map<string, string[]>();

  for (const filePath of files) {
    const ext = path.extname(filePath);
    const isJsTs = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext);

    if (!isJsTs) {
      graph.set(filePath, []);
      continue;
    }

    let source: string;
    try {
      source = fs.readFileSync(filePath, 'utf-8');
    } catch {
      graph.set(filePath, []);
      continue;
    }

    const localImports = extractLocalImports(source);
    const resolvedImports: string[] = [];

    for (const importPath of localImports) {
      const resolved = resolveImport(filePath, importPath, allPaths);
      if (resolved !== null) {
        resolvedImports.push(resolved);
      }
    }

    graph.set(filePath, resolvedImports);
  }

  return graph;
}

/**
 * Compute in-degree for every file: how many files import it.
 * Returns Map<filePath, inDegree>
 */
export function computeInDegree(graph: Map<string, string[]>): Map<string, number> {
  const inDegree = new Map<string, number>();

  // Initialise every file with 0
  for (const filePath of graph.keys()) {
    inDegree.set(filePath, 0);
  }

  // Count incoming edges
  for (const imports of graph.values()) {
    for (const imported of imports) {
      const current = inDegree.get(imported) ?? 0;
      inDegree.set(imported, current + 1);
    }
  }

  return inDegree;
}

// ─────────────────────────────────────────────────────────────────────────────
// Directory walker
// ─────────────────────────────────────────────────────────────────────────────

function buildIgnoreFilter(root: string, config: ContextConfig): Ignore {
  const ig = ignore();

  // Load .gitignore if it exists
  const gitignorePath = path.join(root, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    ig.add(gitignoreContent);
  }

  // Add config ignore patterns
  ig.add(config.ignorePaths);

  return ig;
}

/**
 * Recursively walk a directory and collect all supported source files.
 * Respects .gitignore and config.ignorePaths.
 */
function walkDirectory(root: string, ig: Ignore): string[] {
  const results: string[] = [];

  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(root, fullPath);

      // Check against ignore rules using relative path
      if (ig.ignores(relativePath)) continue;
      // Always skip hidden directories (except .github for context)
      if (entry.isDirectory() && entry.name.startsWith('.')) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if ((SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(root);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main scan function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scan a repository and return a complete ScanResult with token counts,
 * import graph, and in-degree scores for every file.
 */
export async function scanFiles(root: string, config: ContextConfig): Promise<ScanResult> {
  const absoluteRoot = path.resolve(root);
  const ig = buildIgnoreFilter(absoluteRoot, config);

  // 1. Walk the directory tree
  const filePaths = walkDirectory(absoluteRoot, ig);

  // 2. Build import graph and compute in-degrees
  const importGraph = buildImportGraph(filePaths);
  const inDegreeMap = computeInDegree(importGraph);

  // 3. Count tokens for all files in parallel
  const tokenCounts = await countAllFileTokens(filePaths);

  // 4. Collect file stats
  const pinnedSet = new Set(
    config.pinnedFiles.map(p => path.resolve(absoluteRoot, p))
  );

  const files: FileNode[] = [];
  for (const filePath of filePaths) {
    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      continue;
    }

    files.push({
      path: filePath,
      relativePath: path.relative(absoluteRoot, filePath),
      extension: path.extname(filePath),
      tokenCount: tokenCounts.get(filePath) ?? 0,
      score: 0, // set by scorer
      inDegree: inDegreeMap.get(filePath) ?? 0,
      mtime: stat.mtime,
      isPinned: pinnedSet.has(filePath),
    });
  }

  const totalTokens = files.reduce((sum, f) => sum + f.tokenCount, 0);

  return {
    root: absoluteRoot,
    files,
    importGraph,
    totalTokens,
    scannedAt: new Date(),
  };
}
