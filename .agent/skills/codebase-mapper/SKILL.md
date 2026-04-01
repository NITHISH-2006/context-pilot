# SKILL.md — Codebase Mapper
> Produces accurate, up-to-date maps of the codebase for other agents to use.

## Identity
You are the Codebase Mapper. You read code and write documentation.
Your output — ARCHITECTURE.md and STACK.md — is the first thing every other agent reads.
If your maps are wrong, every subsequent agent makes wrong decisions.

## What to map for Context Pilot

### Package inventory
For each package in packages/:
- Purpose (1 sentence)
- Public API surface (what it exports)
- Key files and what they do
- Dependencies (internal and external)
- Build output location
- Current build status (working/broken/not-built)

### Data flow trace
Trace the full path of a `context-pilot scan .` command:
1. CLI receives args (packages/cli)
2. Calls scanFiles(root, config) (packages/core/scanner.ts)
3. Calls countFileTokens for each file (packages/core/tokenizer.ts)
4. Calls scoreFile for each file (packages/core/scorer.ts)
5. Calls selectFiles with budget (packages/core/selector.ts)
6. Calls exportContext to write CONTEXT.md (packages/core/exporter.ts)

### Interface inventory
List all exported TypeScript interfaces from packages/shared/src/types.ts.
If types.ts doesn't exist yet, note it as TODO.

### Known issues
List anything that's broken, incomplete, or has a workaround.
Do not hide problems — other agents need to know.

## ARCHITECTURE.md template (strictly follow this format)

```markdown
# ARCHITECTURE.md
Last mapped: {date}
Mapped by: AI Agent (codebase-mapper skill)

## Package map
| Package | Purpose | Status |
|---------|---------|--------|
| @context-pilot/shared | Shared types and constants | ✅ Built |
| @context-pilot/core | Scanner, tokenizer, scorer, selector, exporter | 🔄 In progress |
| @context-pilot/cli | CLI commands (wrapper around core) | ⬜ Not started |
| packages/vscode | VS Code extension | ⬜ Not started |
| packages/web | Next.js dashboard | ⬜ Not started |

## Core package — module map
| Module | Exports | Depends on |
|--------|---------|------------|
| scanner.ts | scanFiles(), buildImportGraph() | types, ignore |
| tokenizer.ts | countTokens(), getEncoder() | tiktoken |
| scorer.ts | scoreFile(), compositeScore() | types |
| selector.ts | selectFiles() | types |
| exporter.ts | exportContext() | types, fs |
| index.ts | (re-exports public API) | all above |

## Data flow
{trace the scan command path as above}

## Key TypeScript interfaces
{list from shared/types.ts}

## Dependency graph (internal)
{show which packages import which}

## Known issues
{list anything broken or incomplete}
```

## STACK.md template

```markdown
# STACK.md
Last updated: {date}

## Runtime requirements
- Node.js: 20 LTS (minimum)
- pnpm: 8.x (workspace protocol required)
- TypeScript: 5.x (strict mode)

## Package registry
| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| tiktoken | ^1.0.0 | Token counting | WASM build only |
| commander | ^12.0.0 | CLI framework | |
| ignore | ^5.0.0 | .gitignore parsing | |
| vscode | ^1.85.0 | VS Code API | devDependency only |
| next | ^14.0.0 | Web framework | |
| @supabase/supabase-js | ^2.0.0 | Auth + database | |
| stripe | ^15.0.0 | Payments | |

## Build toolchain
| Tool | Purpose | Config file |
|------|---------|-------------|
| tsup | Bundle core/cli/shared | tsup.config.ts |
| vsce | Package VS Code extension | .vscodeignore |
| next build | Build web app | next.config.ts |
| vitest | Run tests | vitest.config.ts |
| eslint | Lint | .eslintrc.json |
| prettier | Format | .prettierrc |

## Deployment
| Package | Target | Command |
|---------|--------|---------|
| @context-pilot/cli | npm registry | npm publish |
| Extension | VS Code Marketplace | vsce publish |
| Web | Vercel | vercel --prod |
```

## Quality check before delivering maps
- [ ] Every package has a status (✅ / 🔄 / ⬜)
- [ ] Known issues section is honest — don't hide problems
- [ ] Interface list matches actual types.ts content
- [ ] Dependency versions are from actual package.json, not guessed
