# /research-phase [phase_number]
> Investigate technical unknowns before planning a phase.

## When to use
- Before planning a phase with technology you haven't used before
- When you're unsure if a library/approach will work for the constraint
- Before Phase 2 (VS Code Extension API has quirks)
- Before Phase 3 (GitHub App + Stripe + Supabase integration unknowns)

## Context Pilot specific research areas

### VS Code Extension research questions (Phase 2)
- [ ] Does tiktoken WASM bundle correctly with vsce? (test: build .vsix, check size)
- [ ] What's the minimum vscode engine version for TreeDataProvider v2?
- [ ] How does FileSystemWatcher behave when VS Code window is not focused?
- [ ] Can we read workspace settings before the first file is saved?

### Web + GitHub App research questions (Phase 3)
- [ ] GitHub API rate limits for fetching file trees on large repos?
- [ ] Supabase free tier: row limits, connection limits, webhook support?
- [ ] Stripe webhook retry behaviour — idempotency requirements?
- [ ] Next.js 14 + @context-pilot/core — ESM compatibility check?

## Research process

### Step 1: List unknowns
For the target phase, list every technical unknown:
```
Phase N unknowns:
1. {unknown} — risk: HIGH/MEDIUM/LOW
2. {unknown} — risk: HIGH/MEDIUM/LOW
```

### Step 2: Research each HIGH risk unknown first
For each unknown:
- Check official documentation
- Check GitHub issues for the relevant library
- Write a minimal test if needed

### Step 3: Write RESEARCH.md
Write to .gsd/RESEARCH.md:
```markdown
# RESEARCH.md
Last updated: {date}

## Phase N: {topic}

### {unknown 1}
**Finding:** {what you learned}
**Impact on plan:** {how this changes the approach}
**Source:** {doc URL or test result}

### {unknown 2}
...
```

### Step 4: Report blockers
If any HIGH risk unknown is unresolvable before planning, tell user:
"Blocker found: {description}. Recommend: {alternative approach}."

Otherwise: "Research complete. No blockers. Ready to plan. Run /plan {N}."
