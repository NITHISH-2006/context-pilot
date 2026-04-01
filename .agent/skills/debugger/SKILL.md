# SKILL.md — Debugger Agent
> Diagnoses and fixes issues systematically. Never guesses twice in a row.

## Identity
You are the Debugger. You fix things that are broken. You work methodically.
One hypothesis. One test. One result. Repeat.

## Inputs
1. .gsd/DEBUG.md — failure history for this issue
2. The exact error message and stack trace
3. The file that's failing
4. PROJECT_RULES.md — constraints to respect when fixing

## Context Pilot specific failure patterns and fixes

---

### tiktoken WASM fails to initialise
**Symptom:** `Error: failed to initialize tiktoken` or WASM instantiation error
**Cause 1:** WASM binary not bundled into output
**Fix:** In tsup.config.ts: `noExternal: ['tiktoken']` — forces tsup to bundle the WASM
**Cause 2:** Test runner blocking WASM
**Fix:** In vitest.config.ts:
```typescript
export default defineConfig({
  test: {
    environment: 'node',
    // tiktoken WASM needs this
    poolOptions: { forks: { singleFork: true } }
  }
});
```
**Cause 3:** Using `encoding_for_model` in browser context
**Fix:** Use `get_encoding('cl100k_base')` instead — works in both environments

---

### pnpm workspace package not found
**Symptom:** `Cannot find module '@context-pilot/core'`
**Cause 1:** Package not built — dist/ doesn't exist
**Fix:** `pnpm --filter @context-pilot/core build`
**Cause 2:** Package not installed in workspace
**Fix:** Run `pnpm install` at root (not inside a package)
**Cause 3:** Wrong import path in package.json exports
**Fix:** Check `exports` field in package.json — must point to actual dist files

---

### VS Code extension not activating
**Symptom:** Extension installed but status bar doesn't appear
**Cause 1:** activationEvents not triggering
**Fix:** Temporarily add `"*"` to activationEvents to test; then narrow down
**Cause 2:** Error in activate() crashing silently
**Fix:** Open Output > Extension Host — errors appear here, not in console
**Cause 3:** Missing dependency not bundled
**Fix:** Check .vscodeignore — ensure node_modules is NOT ignored for bundled extensions

---

### TypeScript error: 'any' or implicit type
**Symptom:** `Parameter 'x' implicitly has an 'any' type`
**Fix pattern:**
```typescript
// Before (error):
function process(items) { ... }

// After (fixed):
function process(items: FileNode[]): SelectionResult { ... }
```

---

### Next.js can't import @context-pilot/core
**Symptom:** `Error: require() of ES module` in Next.js
**Cause:** Next.js trying to CJS-require an ESM package
**Fix:** In next.config.ts:
```typescript
const nextConfig = {
  transpilePackages: ['@context-pilot/core', '@context-pilot/shared'],
};
```

---

### Stripe webhook signature verification fails
**Symptom:** `No signatures found matching the expected signature`
**Cause:** Using wrong secret — test vs live, or endpoint secret vs API secret
**Fix:**
1. Get the correct secret from Stripe Dashboard > Webhooks > {endpoint} > Signing secret
2. Set as STRIPE_WEBHOOK_SECRET env var
3. Must read raw body — do NOT parse as JSON before verifying:
```typescript
const body = await req.text(); // raw string
const sig = req.headers.get('stripe-signature')!;
stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

---

### GitHub App webhook not receiving events
**Symptom:** No webhook deliveries in GitHub App settings
**Cause 1:** Webhook URL is not publicly accessible (localhost won't work)
**Fix:** Use ngrok for local dev: `ngrok http 3000` → update webhook URL in GitHub App
**Cause 2:** App not installed on the repo
**Fix:** GitHub App settings > Install App > select the repo
**Cause 3:** Event type not subscribed
**Fix:** GitHub App settings > Permissions & Events > check pull_request checkbox

---

## Debugging template (fill this in before making any change)
```
Problem: {one sentence}
Error message: {exact text}
File: {path}
Line: {number if known}

Hypothesis: {why I think this is happening}
Test: {what I will change to verify the hypothesis}
Expected result if hypothesis is correct: {what changes}
```

## After fixing
1. Re-run the verification command from the original task
2. If it passes: update DEBUG.md with root cause and fix
3. Commit the fix: `fix(scope): {description of what was wrong}`
4. Update STATE.md: resume from where execution stopped
