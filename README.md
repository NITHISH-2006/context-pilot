# Context Pilot — Free Claude Code Workflow AI OS

> **The zero-friction AI coding system.** One command gives your AI assistant the context it needs — no subscription, no cloud, no lock-in.

Context Pilot scans your codebase, builds an import graph, scores files by importance (centrality, recency, type, pins), and packs the most relevant source files into a **CONTEXT.md** that fits inside any AI's context window. Combined with the workflow layer (task management, persistent memory, auto-rescan), it gives you a **Claude Code–level experience for free**.

---

## ✨ Why Context Pilot?

| Feature | Claude Code / Cursor | Context Pilot |
|---|---|---|
| Smart context selection | ✅ (proprietary) | ✅ Graph-based, open source |
| Token budget management | ✅ | ✅ Knapsack algorithm |
| Works with any AI tool | ❌ (vendor lock-in) | ✅ Continue.dev, Aider, ChatGPT, Claude, etc. |
| Persistent memory | ❌ | ✅ `AI-MEMORY.md` |
| Task tracking | ❌ | ✅ `AI-TASK.md` |
| File watching | ✅ | ✅ `--watch` mode |
| Cost | $20–200/mo | **Free forever** |

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g @context-pilot-v1/cli

# Initialize in your project
cd your-project
context-pilot init              # Create .contextpilot.json config
context-pilot init-workflow     # Scaffold AI workflow files
context-pilot scan              # Generate CONTEXT.md + ARCHITECTURE.md

# Start coding with AI
context-pilot task "Implement user authentication"
context-pilot scan --watch      # Auto-rescan on changes
```

---

## 🔄 The Daily AI Coding Loop

```
1. Set your task      →  context-pilot task "add payment API"
2. Scan context       →  context-pilot scan
3. Open AI tool       →  Paste CONTEXT.md or use Continue.dev integration
4. Code with AI       →  AI has full project context automatically
5. Save discoveries   →  context-pilot memory add "payments use Stripe SDK"
6. Repeat             →  Context stays fresh with --watch mode
```

---

## 📦 Commands

| Command | Description |
|---|---|
| `context-pilot init` | Create `.contextpilot.json` with default settings |
| `context-pilot init-workflow` | Scaffold the full AI workflow stack in the current directory |
| `context-pilot scan [dir]` | Scan project and write `CONTEXT.md` + `ARCHITECTURE.md` |
| `context-pilot scan --watch` | Watch for file changes and auto-rescan |
| `context-pilot scan --budget 60000` | Override token budget |
| `context-pilot budget [dir]` | Show token breakdown per file (dry run) |
| `context-pilot task "description"` | Set the current AI task |
| `context-pilot memory add "entry"` | Add a persistent memory entry |

---

## 📁 What Gets Created

After running `context-pilot init` and `context-pilot init-workflow`:

```
your-project/
├── .contextpilot.json          # Config (budget, ignore patterns, pins)
├── AI-RULES.md                 # Coding rules for AI assistants
├── AI-TASK.md                  # Current task (git-ignored)
├── AI-MEMORY.md                # Persistent memory (git-ignored)
├── dev.sh                      # One-command dev loop script
├── .continue/
│   └── config.json             # Continue.dev integration
├── CONTEXT.md                  # ← AI reads this (auto-generated)
└── ARCHITECTURE.md             # ← System architecture (auto-generated)
```

---

## 🧠 How Scoring Works

Context Pilot uses a **weighted multi-factor scoring system** to decide which files matter most:

| Factor | Weight | How It Works |
|---|---|---|
| **Centrality** | 40% | Files imported by many others rank higher (PageRank-like) |
| **Recency** | 25% | Recently modified files are more relevant |
| **File Type** | 20% | `index.ts`, `types.ts` rank higher than test files |
| **Pin** | 15% | Manually pinned files always get included |

Files are then packed into the token budget using a **knapsack algorithm** — maximizing total importance score while staying within the budget.

---

## 🏗️ Architecture

This is a **pnpm monorepo** with three packages:

```
packages/
├── shared/     # Types, constants, config defaults
├── core/       # Scanner, tokenizer, scorer, selector, exporter, workflow
└── cli/        # Commander.js CLI — the user-facing tool
```

- **shared** → Zero dependencies. Pure types and constants.
- **core** → Graph-based file scanner, tiktoken tokenizer, importance scorer, knapsack selector, markdown exporter, and the new workflow system.
- **cli** → Thin command layer that calls core functions and formats output.

---

## 🔧 Development

```bash
# Clone and install
git clone https://github.com/NITHISH-2006/context-pilot.git
cd context-pilot
pnpm install

# Build all packages
pnpm build

# Development mode (watch)
pnpm dev:cli

# Run tests
pnpm test

# Type check
pnpm typecheck
```

---

## 🤝 Works With

- **[Continue.dev](https://continue.dev)** — Auto-configured via `continue-config.json`
- **[Aider](https://aider.chat)** — Paste `CONTEXT.md` content
- **[Cursor](https://cursor.sh)** — Add `AI-RULES.md` to Cursor rules
- **Claude / ChatGPT** — Copy `CONTEXT.md` into any conversation
- **Any AI tool** — Standard markdown, works everywhere

---

## 📄 License

MIT — Free forever. No telemetry. No cloud. Your code stays on your machine.
