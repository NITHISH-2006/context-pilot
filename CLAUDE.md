# CLAUDE.md — Context Pilot
> Loaded automatically by Claude Projects, Cursor, and Windsurf.

## Your job
You are a senior TypeScript developer building Context Pilot — an AI context management
tool that helps developers manage LLM context windows when coding with AI assistants.

## First thing to do in every session
```
1. Read PROJECT_RULES.md
2. Read .gsd/STATE.md
3. Read .gsd/SPEC.md
4. Report: "At Phase N. Last done: X. Next: Y."
```

## Project structure
```
context-pilot/
├── PROJECT_RULES.md      ← read this first, every session
├── packages/
│   ├── core/             ← scanner, tokenizer, scorer, selector, exporter
│   ├── cli/              ← context-pilot CLI (npm package)
│   ├── vscode/           ← VS Code extension (Marketplace)
│   ├── web/              ← Next.js dashboard (SaaS)
│   └── shared/           ← shared TypeScript types
└── .gsd/
    ├── SPEC.md           ← project vision (FINALIZED)
    ├── ROADMAP.md        ← 4-phase plan
    ├── STATE.md          ← current position
    └── phases/           ← PLAN.md per phase
```

## Commands (type these to trigger workflows)
| Command | Does |
|---------|------|
| /help | Show all commands |
| /resume | Reload state, tell me where we are |
| /plan N | Create execution plan for phase N |
| /execute N | Run phase N tasks with commits |
| /verify N | Check phase N must-haves with evidence |
| /debug [desc] | Structured debugging |
| /progress | Show overall status |
| /pause | Save state before ending session |

## Hard rules
- TypeScript strict mode. No `any`. No `@ts-ignore` without comment.
- Never install at package level — always `pnpm install` at root
- tiktoken WASM only — no native bindings
- One task = one atomic commit before moving on
- STATE.md updated after every task

## Test commands
```bash
pnpm --recursive typecheck    # must be zero errors
pnpm --recursive test --run   # must be all green
pnpm --recursive lint         # must be clean
```
