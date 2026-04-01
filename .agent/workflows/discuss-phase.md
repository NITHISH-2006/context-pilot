# /discuss-phase [phase_number]
> Clarify scope, surface assumptions, and resolve ambiguity before planning a phase.

## When to use
- Before /plan when a phase feels unclear or too large
- When the ROADMAP phase description is vague
- When you're unsure if something is in or out of scope
- Before changing scope of an already-planned phase

## Steps

### 1. Load context
Read:
- .gsd/SPEC.md
- .gsd/ROADMAP.md (the specific phase)
- .gsd/STATE.md
- Previous phase SUMMARY.md (if exists)

### 2. Surface assumptions
List every assumption you're making about this phase. Example:
```
Assumptions I'm making about Phase 2:
1. The VS Code extension bundles @context-pilot/core (not a separate extension)
2. File watcher only watches the active workspace, not all open folders
3. CONTEXT.md is written to workspace root, not the .gsd/ folder
4. The status bar is always visible (not hidden behind a command)
5. Extension works offline (no network calls during scan)
```
Ask the user: "Are any of these wrong?"

### 3. Ask clarifying questions
For each unclear aspect, ask ONE specific question. Example:
- "Should the file watcher watch ALL file types or just TypeScript/JavaScript?"
- "What should happen if the workspace has no .contextpilot.json — use defaults or prompt?"
- "Should excluded files be visible in the sidebar or hidden entirely?"

### 4. Document decisions
Write to .gsd/DECISIONS.md:
```markdown
# DECISIONS.md
Last updated: {date}

## Phase N — {name}
### Decision: {topic}
**Question:** {what was unclear}
**Decision:** {what was decided}
**Reason:** {why}
**Date:** {date}
```

### 5. Ready signal
Once all ambiguity is resolved, tell user:
"All assumptions clarified and documented. Ready to plan. Run /plan {N}."
