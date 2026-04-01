import { describe, it, expect, beforeAll } from 'vitest';
import { scoreByInDegree, scoreByRecency, scoreByFileType, scoreByPin } from '../src/scorer';
import { selectFiles } from '../src/selector';
import { DEFAULT_CONFIG } from '@context-pilot-v1/shared';
import type { FileNode } from '@context-pilot-v1/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeFile(overrides: Partial<FileNode> = {}): FileNode {
  return {
    path: '/project/src/index.ts',
    relativePath: 'src/index.ts',
    extension: '.ts',
    tokenCount: 500,
    score: 0,
    inDegree: 0,
    mtime: new Date(),
    isPinned: false,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scorer tests
// ─────────────────────────────────────────────────────────────────────────────

describe('scoreByInDegree', () => {
  it('returns 1.0 for a file with the maximum in-degree', () => {
    expect(scoreByInDegree(10, 10)).toBe(1.0);
  });

  it('returns 0 for a file with 0 in-degree', () => {
    expect(scoreByInDegree(0, 10)).toBe(0);
  });

  it('returns 0 when maxInDegree is 0 (no imports in project)', () => {
    expect(scoreByInDegree(0, 0)).toBe(0);
  });

  it('normalises proportionally', () => {
    expect(scoreByInDegree(5, 10)).toBe(0.5);
    expect(scoreByInDegree(3, 10)).toBeCloseTo(0.3, 5);
  });

  it('caps at 1.0 even if inDegree > maxInDegree', () => {
    expect(scoreByInDegree(15, 10)).toBe(1.0);
  });
});

describe('scoreByRecency', () => {
  it('returns close to 1.0 for a file modified today', () => {
    const score = scoreByRecency(new Date());
    expect(score).toBeGreaterThan(0.99);
  });

  it('returns a lower score for a file modified 30 days ago', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const score = scoreByRecency(thirtyDaysAgo);
    // e^(-1) ≈ 0.368 at the 30-day constant
    expect(score).toBeGreaterThan(0.3);
    expect(score).toBeLessThan(0.45);
  });

  it('returns a low score for a file modified 90 days ago', () => {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const score = scoreByRecency(ninetyDaysAgo);
    expect(score).toBeLessThan(0.1);
  });

  it('recent file always scores higher than old file', () => {
    const today = new Date();
    const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    expect(scoreByRecency(today)).toBeGreaterThan(scoreByRecency(lastYear));
  });
});

describe('scoreByFileType', () => {
  const priorities = DEFAULT_CONFIG.fileTypePriorities;

  it('gives index.ts the highest score', () => {
    expect(scoreByFileType('src/index.ts', priorities)).toBe(1.0);
  });

  it('gives test files a low score', () => {
    const score = scoreByFileType('src/foo.test.ts', priorities);
    expect(score).toBeLessThanOrEqual(0.25);
  });

  it('gives regular .ts files a mid score', () => {
    const score = scoreByFileType('src/service.ts', priorities);
    expect(score).toBeGreaterThan(0.4);
    expect(score).toBeLessThan(0.8);
  });
});

describe('scoreByPin', () => {
  it('returns 1.0 for pinned files', () => {
    expect(scoreByPin(true)).toBe(1.0);
  });

  it('returns 0.0 for unpinned files', () => {
    expect(scoreByPin(false)).toBe(0.0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Selector tests
// ─────────────────────────────────────────────────────────────────────────────

describe('selectFiles', () => {
  it('returns empty selection when budget is 0', () => {
    const files = [makeFile({ score: 0.9, tokenCount: 100 })];
    const result = selectFiles(files, 0);
    expect(result.included).toHaveLength(0);
    expect(result.excluded).toHaveLength(1);
    expect(result.totalTokens).toBe(0);
  });

  it('includes files up to token budget', () => {
    const files = [
      makeFile({ relativePath: 'a.ts', score: 0.9, tokenCount: 300 }),
      makeFile({ relativePath: 'b.ts', score: 0.8, tokenCount: 300 }),
      makeFile({ relativePath: 'c.ts', score: 0.7, tokenCount: 300 }),
    ];
    const result = selectFiles(files, 700);
    expect(result.totalTokens).toBeLessThanOrEqual(700);
    expect(result.included.length).toBeGreaterThan(0);
  });

  it('never exceeds the budget', () => {
    const files = Array.from({ length: 20 }, (_, i) =>
      makeFile({
        relativePath: `file${i}.ts`,
        score: Math.random(),
        tokenCount: Math.floor(Math.random() * 1000) + 100,
      })
    );
    const budget = 5000;
    const result = selectFiles(files, budget);
    expect(result.totalTokens).toBeLessThanOrEqual(budget);
  });

  it('always includes pinned files', () => {
    const pinned = makeFile({ relativePath: 'pinned.ts', score: 0.1, tokenCount: 100, isPinned: true });
    const regular = makeFile({ relativePath: 'regular.ts', score: 0.9, tokenCount: 400 });
    const result = selectFiles([pinned, regular], 450);
    const includedPaths = result.included.map(f => f.relativePath);
    expect(includedPaths).toContain('pinned.ts');
  });

  it('prefers high score-per-token files', () => {
    // File A: score 0.9, 1000 tokens → ratio 0.0009
    // File B: score 0.5, 100 tokens  → ratio 0.005 (better ratio)
    const fileA = makeFile({ relativePath: 'a.ts', score: 0.9, tokenCount: 1000 });
    const fileB = makeFile({ relativePath: 'b.ts', score: 0.5, tokenCount: 100 });
    const result = selectFiles([fileA, fileB], 200);
    const includedPaths = result.included.map(f => f.relativePath);
    expect(includedPaths).toContain('b.ts');
  });

  it('includes all files when budget is large enough', () => {
    const files = [
      makeFile({ relativePath: 'a.ts', tokenCount: 100 }),
      makeFile({ relativePath: 'b.ts', tokenCount: 200 }),
    ];
    const result = selectFiles(files, 1000);
    expect(result.included).toHaveLength(2);
    expect(result.excluded).toHaveLength(0);
  });
});
