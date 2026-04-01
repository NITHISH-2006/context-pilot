# PLAN.md — Phase 2: VS Code Extension
Phase: 2
Status: READY (start after Phase 1 verified)
Created: 2026-03-14

---

## Objective
Build and publish the Context Pilot VS Code extension to the Marketplace.
The extension is a thin shell around @context-pilot/core.

## Pre-flight Checklist
- [ ] Phase 1 complete and verified
- [ ] @context-pilot/core published and importable
- [ ] VS Code Extension publisher account created at marketplace.visualstudio.com/manage
- [ ] vsce installed: `npm install -g @vscode/vsce`
- [ ] Node 20 (required for VS Code extension build)

---

## Wave 1 — Extension scaffold + status bar

<task id="1.1">
  <title>Initialise VS Code extension package</title>
  <file>packages/vscode/package.json, packages/vscode/src/extension.ts</file>
  <steps>
    1. Install yo and generator-code: npm install -g yo generator-code
    2. Run yo code inside packages/vscode to scaffold the extension structure
    3. Configure package.json:
       - name: context-pilot
       - publisher: YOUR_PUBLISHER_ID
       - engines.vscode: ^1.85.0
       - activationEvents: ["onStartupFinished"]
       - categories: ["Other"]
    4. Add @context-pilot/core as a dependency (workspace:*)
    5. Configure webpack/tsup to bundle core into the extension (vscode extensions need bundled deps)
    6. Write extension.ts: export activate(ctx) and deactivate()
  </steps>
  <verification>
    Run: vsce package
    Expected: .vsix file created with no errors
    Install locally: code --install-extension context-pilot-0.0.1.vsix
    Expected: Extension appears in VS Code Extensions panel
  </verification>
  <commit>chore(vscode): scaffold extension package with correct manifest</commit>
</task>

<task id="1.2">
  <title>Add status bar item with live token count</title>
  <file>packages/vscode/src/statusBar.ts</file>
  <steps>
    1. Write StatusBarManager class:
       - Creates vscode.StatusBarItem with priority 100 (right side)
       - Text format: "$(circuit-board) CP: 38,210 / 40,000"
       - Tooltip: "Context Pilot — click to open panel"
       - Command: contextpilot.openPanel
    2. Write update(included, budget): void — updates text + colour
       - < 70% budget: normal colour
       - 70–90%: warning colour
       - > 90%: error colour (amber, not red — this isn't an error, it's info)
    3. Wire into activate(): create instance, call initial scan, show item
    4. Register disposable on ctx.subscriptions
  </steps>
  <verification>
    Open a TypeScript workspace in VS Code
    Expected: Status bar shows "CP: XXXXX / 40,000" within 5 seconds of opening
    Expected: Numbers are real token counts, not placeholders
  </verification>
  <commit>feat(vscode): add status bar with live token count and colour coding</commit>
</task>

---

## Wave 2 — Sidebar panel + file watcher

<task id="2.1">
  <title>Add sidebar TreeView panel</title>
  <file>packages/vscode/src/treeProvider.ts, packages/vscode/package.json (views config)</file>
  <steps>
    1. Add to package.json contributes:
       - viewsContainers.activitybar: id=context-pilot, icon=media/icon.svg
       - views.context-pilot: id=contextPilotFiles, name="Context Files"
    2. Create media/icon.svg (simple circuit board icon, 24x24)
    3. Write ContextPilotTreeItem extends vscode.TreeItem:
       - Label: filename
       - Description: "score: 0.82 | 1,240 tok"
       - Collapsible: None (flat list)
       - iconPath based on included vs excluded status
    4. Write ContextPilotProvider implements vscode.TreeDataProvider<ContextPilotTreeItem>:
       - getTreeItem(): returns item
       - getChildren(): returns included files, then separator, then top 5 excluded
       - refresh(selectionResult): triggers _onDidChangeTreeData event
    5. Register in activate(): vscode.window.registerTreeDataProvider(...)
  </steps>
  <verification>
    Open Context Pilot panel in activity bar
    Expected: List of files with scores and token counts
    Expected: Files match what's in CONTEXT.md
  </verification>
  <commit>feat(vscode): add sidebar TreeView panel showing scored file list</commit>
</task>

<task id="2.2">
  <title>Add file watcher and auto-export</title>
  <file>packages/vscode/src/watcher.ts, packages/vscode/src/scanner.ts</file>
  <steps>
    1. Write WorkspaceScanner class:
       - getWorkspaceRoot(): returns first workspace folder path
       - readConfig(): reads .contextpilot.json if exists, else defaults
       - runScan(): calls core.scanFiles, core.selectFiles, core.exportContext
       - Returns SelectionResult
    2. Write FileWatcher class:
       - Creates vscode.workspace.createFileSystemWatcher for **/*.{ts,tsx,js,jsx,py}
       - Debounce: 2000ms (use setTimeout, clear on rapid changes)
       - On change/create/delete: call WorkspaceScanner.runScan(), update StatusBar + TreeView
    3. Wire everything in activate():
       - Initial scan on startup
       - Create FileWatcher
       - On scan complete: statusBar.update(), treeProvider.refresh()
    4. Add setting: contextPilot.autoExport (default: true) — skip exportContext if false
  </steps>
  <verification>
    Open TypeScript project
    Expected: CONTEXT.md written to workspace root within 5 seconds
    Edit any .ts file and save
    Expected: Status bar updates within 3 seconds
    Expected: CONTEXT.md is rewritten with updated content
  </verification>
  <commit>feat(vscode): add file watcher with 2s debounce and auto CONTEXT.md export</commit>
</task>

---

## Wave 3 — Settings, commands, and publish

<task id="3.1">
  <title>Register commands and VS Code settings</title>
  <file>packages/vscode/package.json, packages/vscode/src/commands.ts</file>
  <steps>
    1. Register commands in package.json contributes.commands:
       - contextpilot.scan: "Context Pilot: Scan Project Now"
       - contextpilot.showBudget: "Context Pilot: Show Token Budget"
       - contextpilot.openPanel: "Context Pilot: Open Panel"
    2. Register settings in package.json contributes.configuration:
       - contextPilot.tokenBudget: number, default 40000, description "Token budget for context selection"
       - contextPilot.ignorePaths: array of strings, default []
       - contextPilot.autoExport: boolean, default true
    3. Implement command handlers in activate():
       - contextpilot.scan: force immediate scan regardless of debounce
       - contextpilot.showBudget: show information message with breakdown
       - contextpilot.openPanel: vscode.commands.executeCommand('workbench.view.extension.context-pilot')
  </steps>
  <verification>
    Open Command Palette (Cmd+Shift+P)
    Expected: All 3 commands appear when typing "Context Pilot"
    Open Settings (Cmd+,), search "context pilot"
    Expected: All 3 settings appear with descriptions
  </verification>
  <commit>feat(vscode): add commands and settings UI integration</commit>
</task>

<task id="3.2">
  <title>Write README and publish to Marketplace</title>
  <file>packages/vscode/README.md, packages/vscode/CHANGELOG.md</file>
  <steps>
    1. Write README.md:
       - Hero line: "Stop letting your AI agent forget your codebase"
       - GIF/screenshot showing status bar + sidebar panel (record with VS Code screen capture)
       - Installation section (from Marketplace)
       - Features list (5 bullet points max)
       - Configuration table
       - How it works (3-step explanation)
    2. Write CHANGELOG.md: 0.1.0 initial release
    3. Create .vscodeignore: exclude test files, src/, node_modules, *.ts (not *.js)
    4. Run: vsce package — verify .vsix size < 5MB
    5. Run: vsce publish — enters interactive publisher auth flow
    6. Verify: search "context pilot" on marketplace.visualstudio.com
  </steps>
  <verification>
    Go to: https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER.context-pilot
    Expected: Extension page visible with name, description, install button
    Run: code --install-extension YOUR_PUBLISHER.context-pilot (from fresh machine or container)
    Expected: Extension installs and activates without errors
  </verification>
  <commit>feat(vscode): publish v0.1.0 to VS Code Marketplace</commit>
</task>

---

## Phase 2 Complete When
- [ ] Extension listed on VS Code Marketplace
- [ ] Status bar shows live token count in any TypeScript workspace
- [ ] CONTEXT.md auto-written and updates on file save
- [ ] Sidebar panel shows file list with scores
- [ ] Zero crashes in VS Code Output > Context Pilot channel
