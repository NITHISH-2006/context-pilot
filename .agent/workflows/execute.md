# /execute [phase_number]
> Execute tasks from a PLAN.md wave by wave with atomic commits.

## When to use
After /plan has created a PLAN.md and you're ready to write code.

## Pre-flight checks (STOP if any fail)
1. Read PROJECT_RULES.md — know the rules before touching code
2. Read .gsd/SPEC.md — confirm Status: FINALIZED
3. Read .gsd/phases/{N}-*/PLAN.md — this is your single source of truth
4. Read .gsd/STATE.md — know exactly where you are
5. Confirm no uncommitted changes: `git status` must be clean

## Execution loop

For each wave in the PLAN.md:

### Step 1: Announce the wave
"Starting Wave N: {description}. Tasks: {task IDs}"

### Step 2: Execute each task in the wave
For each <task>:

1. **Read** the task fully before writing any code
2. **Check if file exists** — never blindly overwrite existing work
3. **Write the code** exactly as specified in <steps>
4. **Run the verification command** from <verification>
   - If verification PASSES: proceed to commit
   - If verification FAILS: see Failure Handling below
5. **Commit** with the exact message from <commit>:
   ```bash
   git add {files from <file>}
   git commit -m "{commit message}"
   ```
6. **Update STATE.md**: mark task complete, update "What's Done"

### Step 3: After all tasks in a wave
- Confirm all tasks committed: `git log --oneline -5`
- Only then move to next wave

## Failure handling (3-strike rule)
If a verification step fails:
- Strike 1: Read the error carefully. Fix the specific issue. Re-run.
- Strike 2: Search the codebase for similar patterns. Try again.
- Strike 3: STOP. Write to DEBUG.md. Tell user: "Hit 3 strikes on task {id}. Running /debug."

Never proceed to the next task with a failing verification.

## Code quality requirements (check before every commit)
```bash
pnpm typecheck           # Zero TypeScript errors
pnpm lint                # Zero lint errors  
pnpm test --run          # All tests pass
```
If any of these fail, fix before committing.

## After all waves complete
1. Update .gsd/STATE.md: mark phase as EXECUTED (not yet VERIFIED)
2. Write .gsd/phases/{N}-*/SUMMARY.md:
   ```
   # SUMMARY.md — Phase N
   Completed: {date}
   Tasks completed: {list}
   Files created: {list}
   Files modified: {list}
   Git commits: {run git log --oneline since phase start}
   Known issues: {anything that didn't go perfectly}
   ```
3. Tell user: "Phase N execution complete. Run /verify {N} to validate must-haves."
