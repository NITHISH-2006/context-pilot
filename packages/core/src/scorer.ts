import * as path from 'path';
import type { ContextConfig, FileNode, ScoringWeights } from '@context-pilot-v1/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Individual scoring components (all return 0.0–1.0)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score based on how many other files import this one (graph centrality).
 * A file with the maximum in-degree in the project scores 1.0.
 */
export function scoreByInDegree(inDegree: number, maxInDegree: number): number {
  if (maxInDegree === 0) return 0;
  return Math.min(inDegree / maxInDegree, 1.0);
}

/**
 * Score based on recency of last modification.
 * Uses exponential decay with a 30-day half-life:
 * - Modified today → ~1.0
 * - Modified 30 days ago → ~0.37
 * - Modified 90 days ago → ~0.05
 */
export function scoreByRecency(mtime: Date): number {
  const daysSince = (Date.now() - mtime.getTime()) / (1000 * 60 * 60 * 24);
  // Exponential decay constant: 30 days
  return Math.exp(-daysSince / 30);
}

/**
 * Score based on file type and name patterns.
 * Matches file type priorities from config (glob-style patterns).
 * Falls back to extension-based defaults.
 */
export function scoreByFileType(
  relativePath: string,
  fileTypePriorities: ContextConfig['fileTypePriorities']
): number {
  const filename = path.basename(relativePath);
  const ext = path.extname(relativePath);

  // Check exact filename match first (e.g. "index.ts" → 1.0)
  if (filename in fileTypePriorities) {
    return fileTypePriorities[filename] ?? 0.5;
  }

  // Check wildcard extension match (e.g. "*.test.ts" → 0.2)
  for (const [pattern, score] of Object.entries(fileTypePriorities)) {
    if (pattern.startsWith('*.') && filename.endsWith(pattern.slice(1))) {
      return score;
    }
    if (pattern.startsWith('*.') && ext === pattern.slice(1)) {
      return score;
    }
  }

  // Default priorities by extension
  const defaults: Record<string, number> = {
    '.ts': 0.6,
    '.tsx': 0.6,
    '.js': 0.5,
    '.jsx': 0.5,
    '.py': 0.6,
    '.md': 0.3,
    '.json': 0.4,
    '.yaml': 0.4,
    '.yml': 0.4,
    '.css': 0.3,
    '.scss': 0.3,
    '.html': 0.4,
  };

  return defaults[ext] ?? 0.3;
}

/**
 * Score based on whether the user has explicitly pinned this file.
 * Pinned files always score 1.0 on this component.
 */
export function scoreByPin(isPinned: boolean): number {
  return isPinned ? 1.0 : 0.0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite scorer
// ─────────────────────────────────────────────────────────────────────────────

function validateWeights(weights: ScoringWeights): void {
  const sum = weights.centrality + weights.recency + weights.fileType + weights.pin;
  const diff = Math.abs(sum - 1.0);
  if (diff > 0.001) {
    throw new Error(
      `Scoring weights must sum to 1.0, got ${sum.toFixed(3)}. ` +
      `Check your .contextpilot.json scoringWeights config.`
    );
  }
}

/**
 * Compute a composite importance score for a file (0.0–1.0).
 * Higher = more important to include in context.
 */
export function computeScore(
  file: Omit<FileNode, 'score'>,
  maxInDegree: number,
  config: ContextConfig
): number {
  validateWeights(config.scoringWeights);
  const { weights } = { weights: config.scoringWeights };

  const centralityScore = scoreByInDegree(file.inDegree, maxInDegree);
  const recencyScore = scoreByRecency(file.mtime);
  const fileTypeScore = scoreByFileType(file.relativePath, config.fileTypePriorities);
  const pinScore = scoreByPin(file.isPinned);

  return (
    weights.centrality * centralityScore +
    weights.recency * recencyScore +
    weights.fileType * fileTypeScore +
    weights.pin * pinScore
  );
}

/**
 * Apply scores to all files in a scan result.
 * Mutates the score field on each FileNode.
 */
export function scoreFiles(files: FileNode[], config: ContextConfig): FileNode[] {
  const maxInDegree = Math.max(0, ...files.map(f => f.inDegree));

  return files.map(file => ({
    ...file,
    score: computeScore(file, maxInDegree, config),
  }));
}
