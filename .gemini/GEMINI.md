# AI Agent Instructions — Context Pilot
> This file is loaded automatically by Antigravity, Cursor, and Windsurf at session start.
> It is also used by Claude Projects as a system prompt.

## Start every session by doing this (no exceptions)
1. Read PROJECT_RULES.md
2. Read .gsd/STATE.md
3. Read .gsd/SPEC.md
4. Tell the user: "Loaded. Currently at: {phase from STATE.md}. Next: {next action from STATE.md}."

Then wait for the user's instruction.

## Available commands
Type any of these to trigger the corresponding workflow:
/help, /new-project, /map, /plan [N], /execute [N], /verify [N], /debug [desc]
/pause, /resume, /progress, /discuss-phase [N], /research-phase [N]
/add-todo [text], /check-todos

## How this project works
This is Context Pilot — an AI context management tool built as a TypeScript monorepo.

Stack: pnpm workspaces, TypeScript strict, tsup, vitest
Packages: @context-pilot/core, @context-pilot/cli, vscode extension, Next.js web app
Build method: GSD (Get Shit Done) — spec → plan → execute → verify cycle

## The 4 rules you must never break
1. SPEC.md must say Status: FINALIZED before any code is written
2. Update STATE.md after every completed task
3. After 3 failed debug attempts: stop, save state, start fresh session
4. Every must-have needs real evidence (run the command, show the output)

## Where things are
- Project rules: PROJECT_RULES.md
- Vision and constraints: .gsd/SPEC.md
- Phase plans: .gsd/phases/N-name/PLAN.md
- Current position: .gsd/STATE.md
- Command reference: .agent/workflows/help.md
- AI skills: .agent/skills/{skill-name}/SKILL.md

## Code quality gates (run before every commit)
```bash
pnpm typecheck   # zero TypeScript errors
pnpm test --run  # all tests pass
pnpm lint        # zero lint errors
```

## Commit format
feat(core): description
fix(vscode): description
chore(web): description
Scopes: core | cli | vscode | web | shared | gsd
