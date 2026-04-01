# PROJECT RULES — Context Pilot
> Single source of truth. Every AI agent reads this before acting.

## Identity
Project: **Context Pilot**
Stack: TypeScript monorepo (pnpm workspaces) · packages/core · packages/cli · packages/vscode · packages/web
Goal: Ship a VS Code extension + CLI tool + web SaaS that solves AI context window management

## The Four Core Rules (NEVER violate)

### Rule 1 — Plan before building
- SPEC.md must say `Status: FINALIZED` before any code is written
- If SPEC.md is missing or draft, run /new-project first
- No exceptions. Not even for "small" changes.

### Rule 2 — State persistence
- Update STATE.md after every completed task
- Update JOURNAL.md after every session
- Never rely on conversation memory — always read STATE.md to resume

### Rule 3 — 3-Strike debug rule
- Track failures in DEBUG.md
- After 3 failed attempts at the same problem: STOP, export state, start fresh session
- Never spiral. Fresh context fixes 80% of stuck loops.

### Rule 4 — Empirical validation only
- "It should work" is not evidence
- Every must-have needs proof: command output, screenshot, test result
- Run the actual command. Show the actual output.

---

## Monorepo Package Map
```
context-pilot/
├── packages/
│   ├── core/          # @context-pilot/core — scanner, scorer, tokenizer, selector, exporter
│   ├── cli/           # @context-pilot/cli  — commander.js wrapper, npm published
│   ├── vscode/        # VS Code Extension   — sidebar, status bar, file watcher
│   ├── web/           # Next.js 14 App      — dashboard, auth, Stripe, GitHub App
│   └── shared/        # @context-pilot/shared — types, constants, utils
├── .gsd/              # GSD state files
├── .agent/            # AI workflow commands
└── pnpm-workspace.yaml
```

## Technology Constraints
- TypeScript strict mode everywhere. No `any`. No `@ts-ignore` without comment.
- Node 20 LTS minimum
- pnpm only — never npm install at root
- tsup for building core/cli/shared packages
- Vitest for all tests — no Jest
- Never use `console.log` in library code — use a passed logger or return results
- tiktoken WASM build only (no native bindings — breaks VS Code extension packaging)

## File Size Limits (AI context quality thresholds)
- SPEC.md: max 300 lines
- PLAN.md: max 150 lines (2-3 tasks per plan, not 10)
- STATE.md: max 80 lines
- Any single workflow: max 200 lines

## Commit Convention
```
type(scope): description

Types: feat | fix | refactor | test | docs | chore
Scopes: core | cli | vscode | web | shared | gsd

Examples:
feat(core): add tiktoken WASM tokenizer wrapper
fix(vscode): debounce file watcher at 2000ms
feat(cli): publish 0.1.0 to npm
```

## Wave Execution Rules
- Tasks in the same wave have NO dependencies on each other
- Wave N+1 never starts until Wave N is fully committed
- One task = one atomic git commit, immediately after completion
- Max 3 waves per PLAN.md. More complexity = split the phase.

## Definition of Done (every task)
1. Code written and compiles with zero TypeScript errors
2. Tests written and passing (`pnpm test`)
3. Linter clean (`pnpm lint`)
4. Committed with correct message format
5. STATE.md updated

## What NOT to do
- Never rewrite working code without a failing test proving it's broken
- Never add a dependency without checking bundle size impact on the VS Code extension
- Never skip the SPEC → PLAN → EXECUTE → VERIFY cycle "just this once"
- Never modify .gsd/SPEC.md after Status: FINALIZED without /discuss-phase first
