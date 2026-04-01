# /map
> Analyse the codebase and write ARCHITECTURE.md and STACK.md.

## When to use
- At the start of any new session (gives AI full codebase context)
- Before /plan if the codebase has changed significantly
- When onboarding a new contributor or AI agent

## What to map

### Step 1: Read existing context files
Read in this order (stop at each — use what you find):
1. .gsd/SPEC.md — the vision
2. .gsd/STATE.md — current position
3. PROJECT_RULES.md — constraints
4. .gsd/ARCHITECTURE.md (if exists) — prior mapping

### Step 2: Scan the repository structure
**Bash:**
```bash
find . -type f -name "*.ts" | grep -v node_modules | grep -v dist | head -50
ls packages/
cat packages/core/src/index.ts 2>/dev/null
cat packages/cli/src/index.ts 2>/dev/null
cat packages/vscode/package.json 2>/dev/null
```
**PowerShell:**
```powershell
Get-ChildItem -Recurse -Filter "*.ts" | Where-Object { $_.FullName -notmatch "node_modules|dist" } | Select-Object -First 50 FullName
```

### Step 3: Write ARCHITECTURE.md

Write to .gsd/ARCHITECTURE.md (max 200 lines):

```markdown
# ARCHITECTURE.md
Last mapped: {date}

## Package dependency graph
@context-pilot/shared → (no deps)
@context-pilot/core → @context-pilot/shared
@context-pilot/cli → @context-pilot/core, @context-pilot/shared
packages/vscode → @context-pilot/core, @context-pilot/shared
packages/web → @context-pilot/core, @context-pilot/shared

## Core package — key modules
{list modules with 1-line description each}

## Data flow
User runs CLI → scanner.ts → tokenizer.ts → scorer.ts → selector.ts → exporter.ts → CONTEXT.md

## Key interfaces (from shared/src/types.ts)
{list the main TypeScript interfaces}

## Current build status
{what builds, what doesn't, any known issues}
```

### Step 4: Write STACK.md

Write to .gsd/STACK.md (max 100 lines):

```markdown
# STACK.md
Last updated: {date}

## Runtime
- Node.js: {version}
- TypeScript: {version}
- pnpm: {version}

## Core dependencies
{package → version → why it's here}

## Dev toolchain
- Build: tsup
- Test: vitest
- Lint: eslint + @typescript-eslint
- Format: prettier

## Deployment targets
- CLI: npm registry
- Extension: VS Code Marketplace
- Web: Vercel (Next.js)
- DB: Supabase (Postgres)
```

## After mapping
Update .gsd/STATE.md: "Last mapped: {date}"
Tell user: "Map complete. ARCHITECTURE.md and STACK.md written. Codebase is ready for planning."
