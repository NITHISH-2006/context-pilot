# /plan [phase_number]
> Generate a detailed PLAN.md for a specific phase with XML-formatted tasks.

## When to use
After SPEC.md is FINALIZED and you're ready to start a phase.
Run before /execute. Never execute without a plan.

## Pre-flight checks (STOP if any fail)
1. Read PROJECT_RULES.md
2. Read .gsd/SPEC.md — must say `Status: FINALIZED`. If DRAFT, stop and tell user to finalize first.
3. Read .gsd/ROADMAP.md — find the phase being planned
4. Read .gsd/STATE.md — understand current position
5. Check .gsd/phases/{N}-*/PLAN.md does not already exist (don't overwrite completed work)

## Research step (do this before writing the plan)
Before writing tasks, answer these questions internally:
- What files need to be created or modified?
- What dependencies need to be installed?
- What are the tasks that have no dependencies on each other? (Wave 1)
- What tasks depend on Wave 1? (Wave 2)
- What depends on Wave 2? (Wave 3)
- What commands verify each task worked?

## Plan structure rules (from PROJECT_RULES.md)
- Max 150 lines per PLAN.md
- Max 3 waves
- Max 3 tasks per wave (9 tasks total max per phase — if more, split the phase)
- Every task has: id, title, file, steps (numbered), verification (actual command), commit message
- Verification must be a real command you can run, not "check that it works"
- Commit messages must follow: type(scope): description

## Write the PLAN.md

Create file at: .gsd/phases/{N}-{name}/PLAN.md

Header:
```
# PLAN.md — Phase N: {Name}
Phase: N
Status: READY
Created: {date}
```

For each wave:
```
## Wave N — {description}

<task id="N.N">
  <title>{short action title}</title>
  <file>{file(s) being created/modified}</file>
  <steps>
    1. {specific step}
    2. {specific step}
    ...
  </steps>
  <verification>
    Run: {actual command}
    Expected: {exact output or behaviour}
  </verification>
  <commit>{type(scope): description}</commit>
</task>
```

Footer:
```
## Phase N Complete When
- [ ] {must-have 1}
- [ ] {must-have 2}
- [ ] {must-have 3}
```

## After writing
1. Update .gsd/STATE.md: current phase = N, status = PLANNED
2. Tell the user: "Phase N plan created. Review it at .gsd/phases/{N}-{name}/PLAN.md. Run /execute {N} when ready."
