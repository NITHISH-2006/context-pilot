# SPEC.md — Context Pilot
Status: FINALIZED
Version: 1.0
Last Updated: 2026-03-14

---

## Vision
Context Pilot is an AI context management system that solves the #1 failure mode in AI-assisted coding: models losing track of the project mid-task due to context window overflow and poor file selection.

It ships as three interconnected products:
1. **CLI tool** (`context-pilot`) — published to npm
2. **VS Code Extension** — published to VS Code Marketplace
3. **Web Dashboard** — SaaS at contextpilot.dev

---

## The Problem (non-negotiable)
- A medium TypeScript project = 150,000+ tokens of source code
- Even 200k-context models degrade on content past the midpoint
- Existing tools (IDE @-mention, repo-to-txt dump) use keyword search, not architectural importance
- No tool gives developers a real-time token budget with accurate counts (tiktoken-level accuracy)
- Developers manually copy-paste context every session — inconsistent, wasteful, wrong

---

## Target User
Primary: Solo developer using Cursor, Windsurf, or Antigravity on a TypeScript/JavaScript project
Secondary: Small team (2–5 devs) who want shared context config
NOT: Enterprise (v1), Java/C# projects (v1), teams > 10 (v1)

---

## Core Features (v1 — must ship)

### Package: core
- [ ] Repository scanner — recursive file walk, respects .gitignore + custom ignore list
- [ ] Import graph builder — extract all import/require statements, build adjacency list
- [ ] Tokenizer — tiktoken WASM wrapper, cl100k_base encoding, cached instance
- [ ] Scorer — composite score: 40% in-degree centrality, 25% recency, 20% file type, 15% user pins
- [ ] Selector — greedy knapsack by score/token ratio, target budget in tokens
- [ ] Exporter — writes CONTEXT.md (selected files) and ARCHITECTURE.md (project summary)
- [ ] Config reader — reads .contextpilot.json for pinned files, ignore patterns, budget override

### Package: cli
- [ ] `context-pilot scan [dir]` — run full scan + export with default 40k budget
- [ ] `context-pilot scan --budget 80000` — custom token budget
- [ ] `context-pilot budget` — show token breakdown per file, no export
- [ ] `context-pilot init` — create .contextpilot.json in current directory
- [ ] `--json` flag on all commands for machine-readable output

### Package: vscode
- [ ] Status bar item — "CP: 38,210 / 40,000 tokens" — always visible
- [ ] Sidebar panel (TreeView) — shows included/excluded files with scores and token counts
- [ ] File watcher — debounced 2000ms, triggers background rescan on .ts/.tsx/.js/.jsx/.py changes
- [ ] Auto-export — writes CONTEXT.md on every rescan
- [ ] Commands: "Context Pilot: Scan Project", "Context Pilot: Show Budget", "Context Pilot: Open Panel"
- [ ] Settings: tokenBudget (default 40000), ignorePaths, autoExport (default true)
- [ ] Published to VS Code Marketplace

### Package: web (MVP)
- [ ] Auth — Supabase magic link (no password)
- [ ] Dashboard — list projects, show context health per project
- [ ] Project detail — file tree with scores, token budget visualisation
- [ ] GitHub App — webhook on PR open/sync, post context-diff comment
- [ ] Stripe — Free plan (1 project) and Pro plan ($9/mo, unlimited projects + PR comments)
- [ ] Deployed to Vercel

---

## Non-Goals (v1)
- JetBrains plugin
- Neovim plugin
- Java, C#, Go, Rust language support (add in v2 based on demand)
- Team plan (add at month 3)
- AI-suggested refactoring
- Real-time collaboration

---

## Success Metrics (8 weeks post-launch)
- 100+ VS Code Marketplace installs
- 500+ npm weekly downloads
- 10+ paying Pro users ($90+ MRR)
- 4.0+ Marketplace rating

---

## Constraints
- VS Code extension bundle must stay under 5MB (tiktoken WASM is ~1.2MB, budget carefully)
- Core package must be importable in both Node.js and browser (Next.js server components)
- No native Node.js bindings anywhere (breaks VS Code extension packaging on all platforms)
- Free tier must work offline (no network calls in CLI or extension)
