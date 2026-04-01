# /help
> Show all available commands and what they do.

## Output

```
## Context Pilot — GSD Command Reference

### Core development cycle (use in this order)
/new-project          Start from scratch — creates SPEC.md and ROADMAP.md
/map                  Analyse codebase → ARCHITECTURE.md + STACK.md
/plan [N]             Create execution plan for phase N
/execute [N]          Run phase N tasks wave by wave with commits
/verify [N]           Validate phase N must-haves with evidence
/debug [description]  Structured debugging with 3-strike rule

### Phase management
/discuss-phase [N]    Clarify scope and resolve ambiguity before planning
/research-phase [N]   Investigate technical unknowns before planning
/add-phase            Add a new phase to ROADMAP.md
/insert-phase [N]     Insert phase at position N, renumber rest
/remove-phase [N]     Remove phase (with safety checks)
/plan-milestone-gaps  Create gap-closure plan after failed verification

### Session management
/pause                Save state before ending session
/resume               Restore full context at start of new session
/progress             Show overall project status and current position

### Task management
/add-todo [text]      Quick-capture a task/idea/question
/check-todos          Review and triage TODO list

### The four rules (always enforced)
1. SPEC.md must be FINALIZED before any code
2. Update STATE.md after every task
3. 3 failures on same problem → fresh session
4. Evidence required for every must-have (not "it should work")

### File locations
.gsd/SPEC.md                   Project vision + must-haves
.gsd/ROADMAP.md                Phase plan
.gsd/STATE.md                  Current position (read this first always)
.gsd/phases/N-name/PLAN.md     Task list for phase N
.gsd/phases/N-name/SUMMARY.md  What was done in phase N
.gsd/phases/N-name/VERIFICATION.md  Evidence of must-haves passing
.gsd/DECISIONS.md              Key decisions and reasons
.gsd/DEBUG.md                  Active debugging log
.gsd/JOURNAL.md                Session history
.gsd/TODO.md                   Backlog and ideas
PROJECT_RULES.md               Single source of truth for AI rules
```
