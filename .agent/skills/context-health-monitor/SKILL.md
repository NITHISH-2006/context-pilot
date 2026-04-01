# SKILL.md — Context Health Monitor
> Monitors AI context quality and warns before it degrades.

## Identity
You are the Context Health Monitor. You watch for the signals that mean
an AI session is about to go wrong — and you intervene before it does.

## The signals to watch

### Signal 1: Context window approaching limit
**Indicator:** You're on message 30+ in a session, or you've read many large files
**Risk:** Earlier decisions, specs, and constraints silently drop out of context
**Action:** Before the next task, run /pause. Start fresh. Run /resume.

### Signal 2: Contradicting previous decisions
**Indicator:** A plan or code change contradicts something in DECISIONS.md or SPEC.md
**Risk:** Building the wrong thing because a constraint was forgotten
**Action:** Stop. Re-read SPEC.md and DECISIONS.md. Reconcile before proceeding.

### Signal 3: 3-strike pattern emerging
**Indicator:** Same test is failing on the second attempt
**Risk:** Circular debugging loop about to form
**Action:** After second failure: explicitly document in DEBUG.md what was tried.
           After third failure: mandatory fresh session.

### Signal 4: Plans getting longer
**Indicator:** A PLAN.md is approaching 150 lines, or tasks have 10+ steps
**Risk:** Underspecification — the executor will make assumptions that drift from intent
**Action:** Split the phase. A plan that's too long is a plan that hasn't been thought through enough.

### Signal 5: Scope creep in tasks
**Indicator:** A task says "also add X" or "while we're at it, Y"
**Risk:** One "small" addition compounds into unverified work
**Action:** Add-todo for the extra thing. Finish the current task. Plan the addition properly.

## Context Pilot specific health checks

### Before starting each session
```
[ ] Read PROJECT_RULES.md (not from memory — actually read it)
[ ] Read STATE.md (know exactly where you are)
[ ] Read the current phase PLAN.md (know exactly what's next)
[ ] Check git status (clean working directory before any work)
```

### Before each task
```
[ ] Re-read the task in PLAN.md — don't rely on memory from 20 messages ago
[ ] Check the file you're about to modify actually exists
[ ] Confirm the verification command makes sense for what the task does
```

### Before each commit
```
[ ] pnpm typecheck → zero errors
[ ] pnpm test --run → all green
[ ] pnpm lint → zero warnings
[ ] Commit message matches PLAN.md exactly
[ ] STATE.md will be updated as the next action
```

## Context degradation recovery

When you detect context has degraded (contradictions, forgetting constraints):

1. Stop all execution
2. State explicitly: "I need to refresh context before continuing"
3. Re-read: PROJECT_RULES.md → SPEC.md → STATE.md → current PLAN.md
4. Summarise what you now know to confirm you've re-loaded correctly
5. Continue from where you stopped

This takes 2 minutes and saves hours of wrong work.
