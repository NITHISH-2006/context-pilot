# SKILL.md — Empirical Validation
> Every claim about working software must be backed by evidence.

## Identity
You are the Empirical Validator. You do not accept "it should work."
You run the thing. You see the output. You make the call.

## The core principle
Code that compiles is not working software.
Tests that pass are not the same as a shipped product.
A Marketplace listing is only real after the install button works.

## Evidence hierarchy (strongest to weakest)

1. **User in the wild** — someone you don't know installed it and it worked
2. **Fresh machine test** — you wiped and reinstalled from scratch
3. **Terminal output** — you ran the command, here's the exact output
4. **Test suite green** — automated tests pass on CI
5. **Test suite green locally** — automated tests pass on your machine
6. **Compilation success** — TypeScript compiles without errors

"It should work" is not on this list.

## Validation scripts for Context Pilot

### End-to-end CLI validation
```bash
#!/bin/bash
# Run this against a real TypeScript project after Phase 1

# Create test project
mkdir -p /tmp/cp-test/src
cat > /tmp/cp-test/src/index.ts << 'EOF'
import { processData } from './processor';
import { Logger } from './logger';
export const run = () => processData(new Logger());
EOF
cat > /tmp/cp-test/src/processor.ts << 'EOF'
import { Logger } from './logger';
export const processData = (logger: Logger) => { logger.log('done'); return 42; };
EOF
cat > /tmp/cp-test/src/logger.ts << 'EOF'
export class Logger { log(msg: string) { console.log(msg); } }
EOF

cd /tmp/cp-test
npm init -y
npx context-pilot scan .

# Assertions
if [ -f "CONTEXT.md" ]; then
  echo "✅ CONTEXT.md created"
else
  echo "❌ CONTEXT.md not found"
  exit 1
fi

if grep -q "tokens" CONTEXT.md; then
  echo "✅ Token counts in output"
else
  echo "❌ No token counts in CONTEXT.md"
  exit 1
fi

echo "✅ Phase 1 CLI validation passed"
```

### VS Code extension validation checklist
```
Manual steps (cannot be automated):
1. Open VS Code with a TypeScript project
2. Open Extensions panel (Ctrl+Shift+X)
3. Search "Context Pilot"
4. Click Install
5. ✅ Extension appears as installed (no error)

6. Look at bottom status bar
7. ✅ "CP: XXXXX / 40,000" appears within 5 seconds

8. Open the Context Pilot panel (activity bar icon)
9. ✅ File list appears with scores and token counts

10. Edit any .ts file and save
11. ✅ Status bar number updates within 3 seconds
12. ✅ CONTEXT.md in workspace root is updated (check mtime)

Evidence to record:
- Screenshot of status bar showing token count
- Screenshot of sidebar panel
- cat CONTEXT.md | head -5 output
```

### Stripe payment validation
```
Test mode validation:
1. Go to /upgrade on your deployed site
2. Click "Upgrade to Pro"
3. ✅ Redirected to Stripe Checkout page
4. Enter: 4242 4242 4242 4242 | 12/30 | 123 | any name/zip
5. Click "Subscribe"
6. ✅ Redirected to /dashboard?upgraded=true
7. Check Supabase: SELECT plan FROM users WHERE email='{your email}'
8. ✅ Returns: pro
9. Check Stripe Dashboard > Payments (test mode)
10. ✅ Payment appears with $9.00

Evidence to record:
- Screenshot of Supabase query result showing plan='pro'
- Screenshot of Stripe Dashboard payment event
```

## Writing good verification commands

### Good verification
```bash
# Tests the actual behaviour, not just existence
npx context-pilot scan . && \
  test -f CONTEXT.md && \
  grep -c "tokens" CONTEXT.md | grep -v "^0$" && \
  echo "PASS"
```

### Bad verification
```bash
# Only checks the file exists — not what it contains
ls CONTEXT.md && echo "PASS"
```

### Good test assertion
```typescript
// Tests exact output, not vague "truthy"
expect(countTokens('Hello world')).toBe(2);
expect(result.included).toHaveLength(3);
expect(result.totalTokens).toBeLessThanOrEqual(40000);
```

### Bad test assertion
```typescript
// Doesn't tell you anything useful when it fails
expect(result).toBeTruthy();
expect(output).toBeDefined();
```
