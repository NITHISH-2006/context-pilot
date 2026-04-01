# DECISIONS.md — Context Pilot
Architectural and product decisions with reasoning.
Read this before changing anything that feels "obvious to improve."

---

## Technical decisions

### Decision: pnpm workspaces (not Nx, not Turborepo)
**Date:** 2026-03-14
**Question:** Which monorepo tool to use?
**Decision:** pnpm workspaces only, no additional build orchestration layer
**Reason:** Nx and Turborepo add significant config complexity for a solo project.
pnpm workspaces with `--filter` flags handles everything needed at this scale.
Revisit at 5+ packages or if build times exceed 30 seconds.

### Decision: tiktoken WASM, not native bindings
**Date:** 2026-03-14
**Question:** tiktoken has both a WASM and a native (N-API) build. Which to use?
**Decision:** WASM only, everywhere
**Reason:** VS Code extension packaging (vsce) does not support native .node bindings
cross-platform. WASM runs identically on Windows/Mac/Linux without recompilation.
Performance difference is negligible for files up to 100k lines.

### Decision: cl100k_base tokenizer encoding
**Date:** 2026-03-14
**Question:** Which encoding to use? (cl100k_base vs p50k_base vs r50k_base)
**Decision:** cl100k_base
**Reason:** cl100k_base is used by GPT-4, GPT-4o, text-embedding-ada-002.
Claude and Gemini are not identical but are within ~5% for most code files.
It is the de-facto standard for production LLM context estimation.

### Decision: greedy knapsack (not exact DP solution)
**Date:** 2026-03-14
**Question:** The file selection problem is 0/1 knapsack. Use exact or greedy?
**Decision:** Greedy (sort by score/tokenCount ratio, include in order until budget exhausted)
**Reason:** Exact DP solution is O(n × W) where W = token budget (up to 200,000).
For n=500 files and W=100,000: 50 million operations per scan — too slow for real-time UI.
Greedy runs in O(n log n) and is within 5% of optimal in empirical testing on codebases.
Re-evaluate if users report the wrong files being selected.

### Decision: scoring weights (40/25/20/15)
**Date:** 2026-03-14
**Question:** What weights for the four scoring components?
**Decision:** centrality=0.40, recency=0.25, fileType=0.20, pins=0.15
**Reason:** Graph centrality is the strongest signal for "this file matters architecturally."
Recency matters for the current task context. File type is a coarse prior.
Pins are an override mechanism, not a primary signal.
These weights are configurable in .contextpilot.json — this is just the default.

### Decision: Supabase (not PlanetScale, not Neon, not Railway Postgres)
**Date:** 2026-03-14
**Question:** Which managed Postgres provider for the web dashboard?
**Decision:** Supabase
**Reason:** Free tier is generous (500MB, 2 projects), includes auth (saves 1-2 weeks),
has row-level security built in, and has a TypeScript client with codegen.
No credit card required for free tier — removes friction for testing.

### Decision: magic link auth (not OAuth, not password)
**Date:** 2026-03-14
**Question:** What auth method for the web dashboard?
**Decision:** Supabase magic link (email only)
**Reason:** Target users are developers — they are comfortable with email links.
Removes the need to store/manage passwords. GitHub OAuth would be nice but adds
complexity (token refresh, scope management) that isn't worth it for MVP.
Add GitHub OAuth in v2 when users ask for it.

---

## Product decisions

### Decision: Free tier = CLI + extension only (1 web project)
**Date:** 2026-03-14
**Question:** What features are free vs paid?
**Decision:** CLI and VS Code extension are fully free forever. Web dashboard: 1 project free, unlimited paid.
**Reason:** The CLI and extension create the most value for solo devs and drive adoption.
Limiting them would hurt growth. The web dashboard is where teams find value — that's the paywall.
GitHub App PR comments require the web dashboard — natural Pro gating.

### Decision: $9/month for Pro (not $5, not $15, not $20)
**Date:** 2026-03-14
**Question:** What price for the Pro plan?
**Decision:** $9/month
**Reason:** $5 feels like a toy. $15+ requires a longer sales conversation.
$9 is below the "do I need to expense this" threshold for most developers.
Adjust based on feedback after first 10 paying users.
