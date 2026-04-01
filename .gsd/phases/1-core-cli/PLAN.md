# PLAN.md — Phase 1: Core Package + CLI
Phase: 1
Status: READY
Created: 2026-03-14

---

## Objective
Build and publish the @context-pilot/core and @context-pilot/cli npm packages.
All business logic lives in core. CLI is a thin wrapper.

## Pre-flight Checklist
- [ ] Node 20 installed: `node --version`
- [ ] pnpm installed: `pnpm --version`
- [ ] Git repo initialised: `git status`
- [ ] Clean working directory

---

## Wave 1 — Monorepo scaffold + types (no dependencies between these tasks)

<task id="1.1">
  <title>Initialise pnpm monorepo</title>
  <file>pnpm-workspace.yaml, package.json (root), .gitignore, tsconfig.base.json</file>
  <steps>
    1. Create root package.json with private:true and workspaces scripts
    2. Create pnpm-workspace.yaml listing packages/*
    3. Create tsconfig.base.json with strict:true, target:ES2022, moduleResolution:bundler
    4. Create .gitignore (node_modules, dist, .env, *.vsix, .contextpilot/)
    5. Run: pnpm init in each of packages/{core,cli,shared}
  </steps>
  <verification>
    Run: pnpm install
    Expected: node_modules created, no errors
  </verification>
  <commit>chore: initialise pnpm monorepo with workspace config</commit>
</task>

<task id="1.2">
  <title>Write shared types package</title>
  <file>packages/shared/src/types.ts, packages/shared/src/index.ts, packages/shared/package.json</file>
  <steps>
    1. Write FileNode interface (path, relativePath, extension, tokenCount, score, inDegree, mtime, isPinned)
    2. Write ScanResult interface (root, files, importGraph, totalTokens, scannedAt)
    3. Write SelectionResult interface (included, excluded, totalTokens, budget)
    4. Write ContextConfig interface (budget, ignorePaths, pinnedFiles, fileTypePriorities)
    5. Export all from index.ts
    6. Configure package.json: name @context-pilot/shared, main dist/index.js, types dist/index.d.ts
  </steps>
  <verification>
    Run: pnpm --filter @context-pilot/shared build
    Expected: dist/ folder created with .js and .d.ts files
  </verification>
  <commit>feat(shared): add core TypeScript interfaces and types</commit>
</task>

---

## Wave 2 — Core package modules (build in this order, each depends on types)

<task id="2.1">
  <title>Write scanner module</title>
  <file>packages/core/src/scanner.ts</file>
  <steps>
    1. Install: pnpm --filter @context-pilot/core add ignore (for .gitignore parsing)
    2. Write walkDirectory(root, config): recursively collects files, respects ignorePatterns and .gitignore
    3. Write buildImportGraph(files): regex-extracts import/require paths, returns Map<string, string[]>
    4. Write computeInDegree(graph): returns Map<string, number> of how many files import each file
    5. Export scanFiles(root, config): ScanResult — calls walk + buildImportGraph + computeInDegree
    6. Handle cycle detection in import graph (DFS with visited set + recursion stack)
  </steps>
  <verification>
    Write test: scan the packages/core directory itself
    Expected: finds .ts files, import graph contains at least 1 edge, no crash on circular imports
    Run: pnpm --filter @context-pilot/core test
  </verification>
  <commit>feat(core): add repository scanner with import graph builder</commit>
</task>

<task id="2.2">
  <title>Write tokenizer module</title>
  <file>packages/core/src/tokenizer.ts</file>
  <steps>
    1. Install: pnpm --filter @context-pilot/core add tiktoken
    2. Write singleton pattern: let encoder: Tiktoken | null = null
    3. Write getEncoder(): initialises cl100k_base encoding once, returns cached instance
    4. Write countTokens(text: string): number — calls encoder.encode(text).length
    5. Write countFileTokens(filePath: string): number — reads file, calls countTokens
    6. Write countAllFiles(files: string[]): Map<string, number> — batches all files
    7. Handle file read errors gracefully (return 0, log warning)
  </steps>
  <verification>
    Write test: countTokens("Hello world") === 2
    Write test: countTokens("") === 0
    Write test: countFileTokens on a known file returns consistent result
    Run: pnpm --filter @context-pilot/core test
  </verification>
  <commit>feat(core): add tiktoken WASM tokenizer with singleton cache</commit>
</task>

<task id="2.3">
  <title>Write scorer module</title>
  <file>packages/core/src/scorer.ts</file>
  <steps>
    1. Write scoreByInDegree(inDegree, maxInDegree): number — normalised 0–1
    2. Write scoreByRecency(mtime): number — exponential decay, 1.0=today, 0.2=90days ago
    3. Write scoreByFileType(extension, entryPatterns): number — map: index.ts=1.0, *.test.ts=0.2, etc.
    4. Write scoreByPin(isPinned): number — 1.0 if pinned, 0.0 if not
    5. Write compositeScore(file, maxInDegree, weights): number — weighted sum of above 4 components
    6. Default weights: { centrality: 0.40, recency: 0.25, fileType: 0.20, pin: 0.15 }
    7. Weights must sum to 1.0 — validate and throw if not
  </steps>
  <verification>
    Write test: a pinned index.ts with 10 in-degree scores higher than an unpinned test file
    Write test: a file modified today scores higher than same file modified 90 days ago
    Run: pnpm --filter @context-pilot/core test
  </verification>
  <commit>feat(core): add composite file scorer with 4-component weighting</commit>
</task>

<task id="2.4">
  <title>Write selector and exporter modules</title>
  <file>packages/core/src/selector.ts, packages/core/src/exporter.ts</file>
  <steps>
    SELECTOR:
    1. Write selectFiles(scanResult, budget, weights?): SelectionResult
    2. Sort files by score/tokenCount ratio (value per token) descending
    3. Greedy include: add files until budget exceeded
    4. Always include pinned files first regardless of score (they pre-consume budget)
    5. Return SelectionResult with included, excluded, totalTokens, budget

    EXPORTER:
    1. Write exportContext(selection, root): Promise<void>
    2. Generates CONTEXT.md: header with stats + one section per included file with path + content
    3. Generates ARCHITECTURE.md: project name, total files, top 10 files by score, import graph summary
    4. Write to {root}/CONTEXT.md and {root}/ARCHITECTURE.md
    5. Add CONTEXT.md and ARCHITECTURE.md to .gitignore automatically
  </steps>
  <verification>
    Write test: selectFiles with budget=1000 returns fewer tokens than budget
    Write test: pinned file always appears in included even if low score
    Write integration test: scan + select + export on packages/core, check CONTEXT.md exists
    Run: pnpm --filter @context-pilot/core test
  </verification>
  <commit>feat(core): add greedy selector and CONTEXT.md exporter</commit>
</task>

---

## Wave 3 — CLI package + publish

<task id="3.1">
  <title>Write CLI package and publish both to npm</title>
  <file>packages/cli/src/index.ts, packages/cli/src/commands/*.ts</file>
  <steps>
    1. Install: pnpm --filter @context-pilot/cli add commander chalk ora
    2. Write scan command: accepts [dir] and --budget, calls core.scanFiles + core.selectFiles + core.exportContext
    3. Write budget command: shows token breakdown table per file, no export
    4. Write init command: creates .contextpilot.json with default config in cwd
    5. Add --json flag: all commands output JSON to stdout when flag is set
    6. Add #!/usr/bin/env node shebang, configure bin in package.json
    7. Build: pnpm --filter @context-pilot/cli build
    8. Test locally: node packages/cli/dist/index.js scan .
    9. Publish: npm publish --access public (both @context-pilot/shared, core, cli)
  </steps>
  <verification>
    Run: npx context-pilot scan . in a test TypeScript project
    Expected: CONTEXT.md created, output shows "Exported N files, X tokens"
    Run: npx context-pilot budget
    Expected: Table showing files and token counts
  </verification>
  <commit>feat(cli): add scan/budget/init commands and publish 0.1.0 to npm</commit>
</task>

---

## Phase 1 Complete When
- [ ] `npx context-pilot scan .` works in any TypeScript project
- [ ] CONTEXT.md is generated correctly
- [ ] Both packages visible on npmjs.com
- [ ] All tests passing: `pnpm test --recursive`
- [ ] Zero TypeScript errors: `pnpm typecheck --recursive`
