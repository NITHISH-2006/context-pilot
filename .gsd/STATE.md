# STATE.md — Context Pilot
Last Updated: 2026-03-14
Session: INITIAL SETUP

---

## Current Position
Milestone: 1 — MVP Ship
Phase: 0 — Not started (setup complete)
Next action: Run /plan 1 to generate Phase 1 execution plan

## What's Done
- [x] SPEC.md finalized
- [x] ROADMAP.md created
- [x] GSD workflow system installed
- [x] PROJECT_RULES.md written
- [x] Directory structure created
- [x] `packages/cli` built, tested, and passing with pnpm

## What's In Progress
- Nothing yet

## Blockers
- None

## Key Decisions Made
- pnpm workspaces for monorepo (not Nx, not Turborepo — simpler, faster)
- tiktoken WASM only — no native bindings (VS Code extension constraint)
- Supabase for auth + DB on web (free tier covers MVP)
- Stripe for payments (not Paddle — better TypeScript SDK)
- cl100k_base encoding for tokenizer (covers GPT-4, Claude, Gemini approximately)
- Greedy knapsack for file selection (O(n log n), within 5% of optimal in practice)
- Scoring weights: 40/25/20/15 (centrality/recency/filetype/pins) — adjustable in config

## Environment
- Node: 20 LTS
- Package manager: pnpm
- OS: Linux/Mac (bash scripts) + Windows (ps1 scripts both provided)

## Important File Locations
- Project spec: .gsd/SPEC.md
- Roadmap: .gsd/ROADMAP.md
- Phase plans: .gsd/phases/N-name/PLAN.md
- Summaries: .gsd/phases/N-name/SUMMARY.md
- Rules: PROJECT_RULES.md

## Last Session Notes
CLI package implemented. Fixed multiple `tsconfig.json` omissions in the `core` and `shared` packages, fixed CJS/ESM pathing in exports, and successfully ran the `scan`, `budget`, and `init` commands.
