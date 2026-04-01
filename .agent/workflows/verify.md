# /verify [phase_number]
> Validate that a phase meets all must-haves with empirical evidence.

## When to use
After /execute completes a phase. Before moving to the next phase.

## Pre-flight
1. Read .gsd/phases/{N}-*/PLAN.md — the must-haves list at the bottom
2. Read .gsd/phases/{N}-*/SUMMARY.md — what was done
3. Read PROJECT_RULES.md Rule 4: empirical validation only

## Verification process

For each must-have in the PLAN.md "Phase N Complete When" checklist:

1. **State what you're checking**: "Checking: [must-have text]"
2. **Run the verification**: execute the actual command or check
3. **Show the evidence**: paste the output, screenshot description, or test result
4. **Mark pass or fail**: ✅ PASS or ❌ FAIL with reason

## Evidence types required by change type

| What changed | Evidence required |
|---|---|
| npm package published | `npm view @context-pilot/core version` output |
| VS Code extension installs | Screenshot of Extensions panel showing it installed |
| CLI command works | Full terminal output of running the command |
| Tests pass | `pnpm test --run` output showing all green |
| Web page renders | Screenshot or curl response |
| API endpoint works | curl command + response body |
| Stripe payment works | Stripe Dashboard test payment event |
| Database write | Supabase table row or query result |

"It should work" is NOT evidence. Run it. Show the output.

## Write VERIFICATION.md

Create .gsd/phases/{N}-*/VERIFICATION.md:

```markdown
# VERIFICATION.md — Phase N
Date: {date}
Status: PASSED | FAILED | PARTIAL

## Must-have checks

### ✅/❌ {must-have text}
Evidence:
{paste actual output or describe screenshot}

### ✅/❌ {must-have text}
Evidence:
{paste actual output}

## Overall result
All must-haves: PASSED / N of M passed

## Issues found (if any)
{describe any failures and whether they block moving to next phase}
```

## After verification

### If ALL must-haves pass:
1. Update .gsd/ROADMAP.md: mark phase as ✅ VERIFIED
2. Update .gsd/STATE.md: phase = N complete, next = phase N+1
3. Update .gsd/JOURNAL.md: log milestone
4. Tell user: "Phase N verified. ✅ All must-haves pass. Run /plan {N+1} to continue."

### If ANY must-have fails:
1. Document failures in VERIFICATION.md
2. Update STATE.md: phase = N BLOCKED on {issue}
3. Tell user which must-haves failed and ask: "Fix now and re-run /verify {N}, or run /plan-milestone-gaps to create a gap closure plan?"
