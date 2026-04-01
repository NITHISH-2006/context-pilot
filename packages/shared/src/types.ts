// ─────────────────────────────────────────────────────────────────────────────
// Core domain types
// Every other package imports from here. Change carefully.
// ─────────────────────────────────────────────────────────────────────────────

/** A single file discovered during a repository scan */
export interface FileNode {
  /** Absolute path on disk */
  path: string;
  /** Path relative to project root (used in CONTEXT.md output) */
  relativePath: string;
  /** File extension including dot, e.g. ".ts", ".py" */
  extension: string;
  /** Exact token count from tiktoken cl100k_base encoding */
  tokenCount: number;
  /** Composite importance score 0.0–1.0 */
  score: number;
  /** Number of other files that import this file (graph in-degree) */
  inDegree: number;
  /** Last modified timestamp from filesystem */
  mtime: Date;
  /** Whether the user has explicitly pinned this file via config */
  isPinned: boolean;
}

/** Result of scanning a repository */
export interface ScanResult {
  /** Absolute path to the project root */
  root: string;
  /** All discovered files with scores and token counts */
  files: FileNode[];
  /**
   * Directed import graph.
   * Key: absolute file path
   * Value: array of absolute paths that this file imports
   */
  importGraph: Map<string, string[]>;
  /** Sum of tokenCount for all files */
  totalTokens: number;
  /** When the scan was performed */
  scannedAt: Date;
}

/** Result of selecting files within a token budget */
export interface SelectionResult {
  /** Files selected for inclusion in CONTEXT.md */
  included: FileNode[];
  /** Files that didn't fit in the budget (sorted by score desc) */
  excluded: FileNode[];
  /** Total tokens of included files */
  totalTokens: number;
  /** The budget this selection was made against */
  budget: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration types
// ─────────────────────────────────────────────────────────────────────────────

/** Scoring weight configuration (must sum to 1.0) */
export interface ScoringWeights {
  /** Weight for graph centrality (in-degree) component */
  centrality: number;
  /** Weight for recency (last modified) component */
  recency: number;
  /** Weight for file type priority component */
  fileType: number;
  /** Weight for user pin component */
  pin: number;
}

/** File type priority map — glob patterns to priority scores */
export type FileTypePriorities = Record<string, number>;

/** User configuration from .contextpilot.json */
export interface ContextConfig {
  /** Maximum tokens to include in CONTEXT.md */
  budget: number;
  /** Glob patterns to ignore (in addition to .gitignore) */
  ignorePaths: string[];
  /** Absolute paths of files to always include */
  pinnedFiles: string[];
  /** File type to priority score map */
  fileTypePriorities: FileTypePriorities;
  /** Scoring component weights (must sum to 1.0) */
  scoringWeights: ScoringWeights;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: ContextConfig = {
  budget: 40_000,
  ignorePaths: [
    'node_modules',
    'dist',
    '.git',
    'build',
    '.next',
    'coverage',
    '*.lock',
    '*.log',
    '*.vsix',
  ],
  pinnedFiles: [],
  fileTypePriorities: {
    'index.ts': 1.0,
    'index.tsx': 1.0,
    'main.ts': 1.0,
    'app.ts': 0.95,
    'types.ts': 0.95,
    'types.tsx': 0.95,
    '*.config.ts': 0.7,
    '*.config.js': 0.7,
    '*.test.ts': 0.2,
    '*.test.tsx': 0.2,
    '*.spec.ts': 0.2,
    '*.spec.tsx': 0.2,
    '*.md': 0.3,
    '*.json': 0.4,
  },
  scoringWeights: {
    centrality: 0.40,
    recency: 0.25,
    fileType: 0.20,
    pin: 0.15,
  },
};

export const SUPPORTED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.cs', '.rb',
  '.md', '.json', '.yaml', '.yml', '.toml',
  '.html', '.css', '.scss',
] as const;

export type SupportedExtension = typeof SUPPORTED_EXTENSIONS[number];

export const CONTEXT_OUTPUT_FILE = 'CONTEXT.md';
export const ARCHITECTURE_OUTPUT_FILE = 'ARCHITECTURE.md';
export const CONFIG_FILE = '.contextpilot.json';
