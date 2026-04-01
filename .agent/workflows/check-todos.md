# /check-todos
> Review and triage the TODO list.

## Steps
1. Read .gsd/TODO.md
2. Display all items grouped by status:
   ```
   ## Open TODOs (N items)
   🐛 [ ] {bug item}
   💡 [ ] {idea item}
   ❓ [ ] {question item}

   ## Completed (N items)
   ✅ [x] {done item}
   ```
3. Ask: "Want to work through any of these now, or just reviewing?"
4. If user wants to address an item: treat it as a task and follow execute workflow
5. If user marks items done: update TODO.md checkboxes
