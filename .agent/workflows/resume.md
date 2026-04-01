# /resume
> Restore full context at the start of a new session.

## Steps (run ALL of these before doing anything else)

1. Read PROJECT_RULES.md — refresh all rules
2. Read .gsd/SPEC.md — refresh vision and constraints
3. Read .gsd/STATE.md — find exact position and next action
4. Read .gsd/ROADMAP.md — see overall progress
5. Read .gsd/phases/{current-phase}/PLAN.md — read current task list
6. Read .gsd/JOURNAL.md (last 20 lines) — see recent history
7. Check git log: `git log --oneline -10` — see recent commits

## Report to user

After reading all files, tell the user:

```
## Session Resumed ✅

**Where we are:** Phase N — {phase name}
**Last completed:** {task from STATE.md}
**Next action:** {exact next step from STATE.md}

**Remaining in this phase:**
- [ ] Task X.X: {title}
- [ ] Task X.X: {title}

**To continue:** Run /execute {N} or tell me to proceed with task {id}
```

## Handle stashed work
If git stash list shows a stash from last session:
Tell user: "There's stashed work from last session. Should I restore it? (git stash pop)"
Wait for confirmation before running git stash pop.
