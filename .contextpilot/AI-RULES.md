# AI Coding Rules — Context Pilot Workflow

> These rules are automatically loaded by AI tools (Continue.dev, Aider, Cursor, Claude Code).
> Edit them to match your project's conventions. Context Pilot will keep them in sync.

## General Principles

1. **Never break existing functionality.** Run tests before committing.
2. **Prefer small, focused changes.** One PR = one concern.
3. **Always read CONTEXT.md first** — it contains the most important files in the project.
4. **Follow the existing code style** — don't introduce new patterns without discussion.
5. **Write self-documenting code.** Only add comments for *why*, not *what*.

## TypeScript / JavaScript Rules

- Use `const` by default, `let` only when mutation is required.
- Prefer `async/await` over raw Promises.
- Use strict TypeScript — no `any` unless absolutely necessary.
- Export types separately from implementations.
- Use barrel exports (`index.ts`) for public APIs.

## File Organization

- Feature code goes in `src/` directories.
- Tests live next to the code they test (`*.test.ts`).
- Configuration files stay at the project root.
- Shared types and constants go in the `shared` package.

## Git Conventions

- Commit messages: `type(scope): description` (e.g., `feat(core): add knapsack selector`)
- Branch naming: `feat/description`, `fix/description`, `chore/description`
- Squash merge feature branches.

## AI-Specific Instructions

- **Always check CONTEXT.md** before making changes to understand file relationships.
- **Check ARCHITECTURE.md** to understand the system design.
- **Read AI-TASK.md** to understand the current objective.
- **Append to AI-MEMORY.md** when you discover something important.
- **Never modify files outside the project root** unless explicitly asked.
- **Prefer editing existing files** over creating new ones.
