import type { FileNode, SelectionResult } from '@context-pilot-v1/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Greedy knapsack selection
//
// Problem: given N files with scores (value) and tokenCounts (weight),
// maximise total score without exceeding the token budget.
//
// Exact 0/1 knapsack is O(n × W) — infeasible for W=100,000 tokens.
// Greedy approximation: sort by value/weight ratio, include in order.
// Within ~5% of optimal for realistic codebases.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Select files to include in the context window given a token budget.
 *
 * Rules:
 * 1. Pinned files are always included first (they consume budget)
 * 2. Remaining files are sorted by score/tokenCount ratio (value per token)
 * 3. Files are included greedily until budget is exhausted
 */
export function selectFiles(files: FileNode[], budget: number): SelectionResult {
  if (budget <= 0) {
    return { included: [], excluded: [...files], totalTokens: 0, budget };
  }

  const pinned = files.filter(f => f.isPinned);
  const unpinned = files.filter(f => !f.isPinned);

  // Always include pinned files (even if they exceed budget)
  const included: FileNode[] = [...pinned];
  let remainingBudget = budget - pinned.reduce((sum, f) => sum + f.tokenCount, 0);

  // Sort unpinned files by score-per-token (highest value density first)
  const sorted = [...unpinned].sort((a, b) => {
    const ratioA = a.tokenCount > 0 ? a.score / a.tokenCount : 0;
    const ratioB = b.tokenCount > 0 ? b.score / b.tokenCount : 0;
    return ratioB - ratioA;
  });

  const excluded: FileNode[] = [];

  for (const file of sorted) {
    if (file.tokenCount <= remainingBudget) {
      included.push(file);
      remainingBudget -= file.tokenCount;
    } else {
      excluded.push(file);
    }
  }

  // Sort excluded by score desc so callers can show "what almost made it"
  excluded.sort((a, b) => b.score - a.score);

  const totalTokens = included.reduce((sum, f) => sum + f.tokenCount, 0);

  return { included, excluded, totalTokens, budget };
}
