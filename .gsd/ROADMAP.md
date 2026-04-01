# ROADMAP.md — Context Pilot
Last Updated: 2026-03-14

---

## Milestone 1 — MVP Ship (8 weeks)

### Phase 1 — Core Package + CLI (Week 1–2)
Status: [ ] NOT STARTED
Must-haves:
- [ ] All core package modules written and unit-tested (scanner, tokenizer, scorer, selector, exporter)
- [ ] CLI commands working: scan, budget, init
- [ ] @context-pilot/core published to npm as 0.1.0
- [ ] @context-pilot/cli published to npm as 0.1.0
- [ ] 80% test coverage on core package

Verification gate: `npx context-pilot scan .` in a real TypeScript project produces a valid CONTEXT.md

### Phase 2 — VS Code Extension (Week 3–4)
Status: [ ] NOT STARTED
Must-haves:
- [ ] Extension installs from .vsix file without errors
- [ ] Status bar shows live token count
- [ ] Sidebar panel shows file list with scores
- [ ] File watcher triggers rescan on save
- [ ] CONTEXT.md auto-written to workspace root
- [ ] Published to VS Code Marketplace (any version number)

Verification gate: Install extension, open a TypeScript project, status bar shows token count within 3 seconds

### Phase 3 — Web Dashboard MVP (Week 5–6)
Status: [ ] NOT STARTED
Must-haves:
- [ ] User can sign up with email (magic link)
- [ ] User can create a project and see file scores
- [ ] GitHub App posts PR comment with context diff
- [ ] Stripe checkout works for Pro plan upgrade
- [ ] Deployed on Vercel with custom domain

Verification gate: Create account, connect GitHub repo, open a PR, see context-pilot comment appear

### Phase 4 — Polish + Growth (Week 7–8)
Status: [ ] NOT STARTED
Must-haves:
- [ ] README with GIF demo for Marketplace listing
- [ ] Error handling and user-facing error messages throughout
- [ ] VS Code settings UI (not just JSON)
- [ ] Web dashboard mobile-responsive
- [ ] 10 real users using the tool (not just installs)

Verification gate: 100 Marketplace installs, 10 paying users, 4.0+ rating

---

## Milestone 2 — Growth (Months 3–4, planned)
- Team plan ($29/mo)
- Python support (import graph for .py files)
- Context diff in PR reviews
- JetBrains plugin research

---

## Phase Numbering Convention
Phases are numbered 1–N within a milestone.
When referencing in commands: /plan 1, /execute 1, /verify 1
Phase files live at: .gsd/phases/1-core-cli/, .gsd/phases/2-vscode/, etc.
