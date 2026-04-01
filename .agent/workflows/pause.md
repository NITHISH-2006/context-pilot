# /pause
> Save session state before ending a work session.

## Steps

1. Read .gsd/STATE.md
2. Update STATE.md with:
   - Last updated: {now}
   - Session: PAUSED
   - Current position: Phase N, Task X.X
   - What's done: {completed tasks this session}
   - What's in progress: {incomplete task if any}
   - Exact next step: {the very next command/action to run when resuming}
   - Blockers: {anything blocking progress}

3. Append to .gsd/JOURNAL.md:
   ```
   ## Session {date}
   Duration: {approximate}
   Completed: {tasks done}
   Stopped at: {where}
   Next: {what to do on resume}
   ```

4. Run git status. If any uncommitted changes:
   - If work is complete: commit it with appropriate message
   - If work is incomplete: stash it: `git stash push -m "wip: task {id}"`

5. Tell user: "Session saved. To resume: open a new session and run /resume"
