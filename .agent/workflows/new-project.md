# /new-project
> Initialise a new Context Pilot feature or sub-project from scratch.

## When to use
Run this when starting a brand new phase or feature that has no SPEC yet.
If SPEC.md already exists and is FINALIZED, use /discuss-phase instead.

## Steps

### 1. Read project context
Read these files before asking anything:
- PROJECT_RULES.md
- .gsd/SPEC.md (if it exists)
- .gsd/ROADMAP.md (if it exists)
- .gsd/STATE.md (if it exists)

### 2. Ask the user these questions (one at a time, wait for answer)
1. What are you building? (one sentence)
2. Who is the user and what problem does this solve for them?
3. What does "done" look like for v1? List the 3 most critical features.
4. What must this NOT do in v1? (scope boundaries)
5. What technology constraints exist? (language, framework, deployment target)
6. What's your timeline? (days/weeks)

### 3. Create SPEC.md
Write .gsd/SPEC.md with:
- Status: DRAFT
- Vision (1 paragraph)
- The Problem (what breaks without this)
- Target User (specific, not "everyone")
- Core Features v1 (checkbox list, max 15 items)
- Non-Goals v1 (what you're explicitly NOT building)
- Success Metrics (3 measurable things)
- Constraints (technical, time, resource)

### 4. Review loop
Show SPEC.md to user. Ask: "Does this capture everything? Any changes before I finalize?"
Iterate until user confirms.

### 5. Finalize
Change Status: DRAFT → Status: FINALIZED
Write .gsd/ROADMAP.md with phases (use 2-week phase chunks)
Update .gsd/STATE.md with current position

### 6. Create directory structure
**Bash:**
```bash
mkdir -p .gsd/phases .gsd/templates
touch .gsd/JOURNAL.md .gsd/TODO.md
```
**PowerShell:**
```powershell
New-Item -ItemType Directory -Force .gsd/phases, .gsd/templates
New-Item -ItemType File -Force .gsd/JOURNAL.md, .gsd/TODO.md
```

### 7. Tell the user
"SPEC.md is finalized. Next step: run /plan 1 to create the Phase 1 execution plan."
