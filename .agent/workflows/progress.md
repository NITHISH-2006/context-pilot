# /progress
> Show current project status at a glance.

## Steps

1. Read .gsd/ROADMAP.md
2. Read .gsd/STATE.md
3. Read each .gsd/phases/*/PLAN.md for checkbox status
4. Run: `git log --oneline --since="7 days ago"` for recent activity

## Output format

```
## Context Pilot — Progress Report
Generated: {date}

### Milestone 1 — MVP Ship
Overall: N/4 phases complete | Week N of 8

### Phase Status
✅ Phase 1 — Core + CLI       [VERIFIED]    Week 1-2
🔄 Phase 2 — VS Code Ext      [IN PROGRESS] Week 3-4  ← YOU ARE HERE
⬜ Phase 3 — Web Dashboard    [NOT STARTED] Week 5-6
⬜ Phase 4 — Polish + Growth  [NOT STARTED] Week 7-8

### Current Phase: 2 — VS Code Extension
Tasks complete: 3 / 6
Last commit: feat(vscode): add file watcher (2 hours ago)
Blocked: No
Next: Task 3.1 — Register commands and settings

### This Week's Commits
{output of git log --oneline --since="7 days ago"}

### Must-haves remaining (Phase 2)
- [x] Extension installs without errors
- [x] Status bar shows token count
- [ ] Sidebar panel shows file list
- [ ] File watcher triggers rescan
- [ ] CONTEXT.md auto-written
- [ ] Published to Marketplace
```
