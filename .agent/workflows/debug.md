# /debug [description]
> Structured debugging when you're stuck. Enforces the 3-strike rule.

## When to use
- /execute hit 3 failures on the same task
- Something worked before and now it doesn't
- Error message that doesn't make sense
- Build/test failing with no obvious cause

## Pre-flight: read DEBUG.md first
If .gsd/DEBUG.md exists, read it.
- Has this exact error appeared before? Use what was learned.
- How many strikes on this problem? If 3+, require fresh session.

## Diagnosis protocol

### Step 1: Isolate
State the problem in ONE sentence: "X is doing Y but should do Z."
If you can't state it in one sentence, you don't understand it yet.

### Step 2: Read the actual error
Do not guess. Read:
- Full error message + stack trace
- The exact line that fails
- TypeScript error code if applicable

### Step 3: Minimal reproduction
Can you reproduce the failure with the smallest possible input?
```bash
# For TypeScript errors:
npx tsc --noEmit packages/core/src/tokenizer.ts

# For test failures:
pnpm vitest run packages/core/src/tokenizer.test.ts

# For VS Code extension errors:
# Open Output panel > Context Pilot channel
```

### Step 4: Check common causes for this project

**tiktoken WASM issues:**
- Did you import from 'tiktoken' not 'tiktoken/lite'?
- Is the WASM file being bundled? (check tsup config: `noExternal: ['tiktoken']`)
- Is this running in a context where WASM is blocked? (some test runners block WASM)
  Fix: `vi.mock('tiktoken', ...)` in tests

**pnpm workspace issues:**
- Did you run `pnpm install` at the ROOT, not inside a package?
- Is the inter-package import using workspace:* protocol?
- Did you rebuild after changing a dependency? `pnpm --filter @context-pilot/core build`

**VS Code extension not activating:**
- Check activationEvents in package.json
- Check Output panel > Extension Host for errors
- Is the extension in the right state? Try: Developer: Reload Window

**Next.js build failures:**
- Is @context-pilot/core ESM-compatible? (Next.js has ESM issues with some CJS modules)
  Fix: add to next.config.ts: `transpilePackages: ['@context-pilot/core']`

### Step 5: Fix attempt
Make ONE specific change. Re-run the verification command.
Do not make multiple changes at once — you won't know what fixed it.

## Write to DEBUG.md
Always update .gsd/DEBUG.md:

```markdown
# DEBUG.md
Last updated: {date}

## Issue: {one-sentence description}
Strike count: N
Status: OPEN / RESOLVED

### What I tried
1. {attempt 1} → {result}
2. {attempt 2} → {result}

### Root cause (when resolved)
{explanation}

### Fix
{what actually worked}
```

## 3-strike protocol
If strikes = 3:
1. Write full state to DEBUG.md
2. Run /pause to save session state
3. Tell user: "Hit 3 strikes. The current context may be polluted. Recommend: start a fresh session and run /resume to reload state. Fresh context fixes most stuck loops."
