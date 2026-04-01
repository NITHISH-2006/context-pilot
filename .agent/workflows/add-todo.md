# /add-todo [description]
> Quick-capture a task, idea, or concern without interrupting current work.

## Steps
1. Read .gsd/TODO.md (create if missing)
2. Append to TODO.md:
   ```
   - [ ] {description} (added: {date})
   ```
3. Confirm: "Added to TODO.md: {description}"

## Categories (auto-detect from description)
- bug: → prefix with 🐛
- idea: → prefix with 💡
- question: → prefix with ❓
- blocked: → prefix with 🚫
- docs: → prefix with 📝
