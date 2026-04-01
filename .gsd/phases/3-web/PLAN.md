# PLAN.md — Phase 3: Web Dashboard MVP
Phase: 3
Status: READY (start after Phase 2 verified)
Created: 2026-03-14

---

## Objective
Ship a Next.js 14 web dashboard with auth, project management, GitHub App PR comments, and Stripe payments.

## Pre-flight Checklist
- [ ] Phase 2 complete and verified
- [ ] Supabase project created (free tier): supabase.com
- [ ] Stripe account created (test mode): stripe.com
- [ ] GitHub App created: github.com/settings/apps
- [ ] Vercel account created: vercel.com
- [ ] Domain configured (or use *.vercel.app for MVP)

---

## Wave 1 — Next.js scaffold + auth

<task id="1.1">
  <title>Scaffold Next.js 14 app with Supabase auth</title>
  <file>packages/web/* (full Next.js app)</file>
  <steps>
    1. Create Next.js app: pnpm create next-app packages/web --typescript --app --tailwind --src-dir
    2. Install: pnpm --filter web add @supabase/supabase-js @supabase/ssr
    3. Create Supabase project, copy ANON_KEY and URL to .env.local
    4. Write packages/web/src/lib/supabase/server.ts and client.ts (SSR-compatible clients)
    5. Write /app/auth/page.tsx: email input + "Send magic link" button
    6. Write /app/auth/confirm/route.ts: handle magic link redirect, set session cookie
    7. Write middleware.ts: protect /dashboard/* routes, redirect to /auth if no session
    8. Run schema migration on Supabase:
       CREATE TABLE users (id uuid PRIMARY KEY, email text, plan text DEFAULT 'free', created_at timestamptz DEFAULT now());
       CREATE TABLE projects (id uuid PRIMARY KEY REFERENCES users(id), name text, repo_url text, config jsonb, created_at timestamptz DEFAULT now());
  </steps>
  <verification>
    Run: pnpm --filter web dev
    Go to: http://localhost:3000/auth
    Enter email, click Send
    Expected: Email received with magic link
    Click link
    Expected: Redirected to /dashboard, session cookie set
    Go to: http://localhost:3000/dashboard without cookie
    Expected: Redirected to /auth
  </verification>
  <commit>feat(web): add Next.js 14 app with Supabase magic link auth</commit>
</task>

---

## Wave 2 — Dashboard UI + GitHub App

<task id="2.1">
  <title>Build project dashboard and context health view</title>
  <file>packages/web/src/app/dashboard/*, packages/web/src/components/*</file>
  <steps>
    1. Write /dashboard/page.tsx: lists user's projects, "Add project" button
    2. Write /dashboard/projects/new/page.tsx: form for project name + GitHub repo URL
    3. Write /dashboard/projects/[id]/page.tsx: file tree with score bars, token budget ring chart
    4. Write API route /api/projects/scan/route.ts:
       - Receives project ID
       - Clones/fetches repo (use GitHub API for file tree, not full clone — API only)
       - Runs @context-pilot/core scanFiles on fetched files
       - Saves snapshot to context_snapshots table
       - Returns SelectionResult as JSON
    5. Use Tailwind for all styling. No component libraries — keep bundle small.
    6. Score visualisation: simple coloured bar (green > 0.6, amber > 0.3, red < 0.3)
  </steps>
  <verification>
    Log in, create a project with a real GitHub repo URL
    Expected: File list appears with scores within 10 seconds
    Expected: Token budget ring shows used/total
    Expected: Snapshot saved to Supabase (verify in Supabase dashboard)
  </verification>
  <commit>feat(web): add project dashboard with context health visualisation</commit>
</task>

<task id="2.2">
  <title>GitHub App webhook for PR context comments</title>
  <file>packages/web/src/app/api/github/webhook/route.ts</file>
  <steps>
    1. In GitHub App settings: set webhook URL to https://your-domain.com/api/github/webhook
    2. Subscribe to events: pull_request (opened, synchronize)
    3. Install: pnpm --filter web add @octokit/webhooks @octokit/rest
    4. Write webhook route:
       - Verify webhook signature (GITHUB_WEBHOOK_SECRET env var)
       - On pull_request.opened or .synchronize:
         a. Get changed files from PR (GitHub API: GET /repos/:owner/:repo/pulls/:number/files)
         b. Run core scanner on changed files
         c. Compare context coverage before vs after (fetch last snapshot from DB)
         d. Format comment markdown (see template below)
         e. Post comment: POST /repos/:owner/:repo/issues/:number/comments
    5. Comment template:
       ## Context Pilot Analysis
       | Metric | Value |
       |--------|-------|
       | Files changed | N |
       | Context coverage delta | +2.3% |
       | New high-importance files | auth/middleware.ts (score: 0.91) |
       | Token budget impact | +1,240 tokens |
       [View full context →](https://contextpilot.dev/projects/ID)
  </steps>
  <verification>
    Open a PR on a connected GitHub repo
    Expected: Context Pilot bot posts comment within 30 seconds
    Comment shows correct file count and token delta
  </verification>
  <commit>feat(web): add GitHub App webhook with PR context analysis comments</commit>
</task>

---

## Wave 3 — Stripe payments + Vercel deploy

<task id="3.1">
  <title>Add Stripe subscription payments</title>
  <file>packages/web/src/app/api/stripe/*, packages/web/src/app/upgrade/*</file>
  <steps>
    1. Install: pnpm --filter web add stripe @stripe/stripe-js
    2. Create Stripe products in dashboard:
       - Free: no product (default)
       - Pro: $9/month recurring, product ID to env var STRIPE_PRO_PRICE_ID
    3. Write /api/stripe/checkout/route.ts:
       - Creates Stripe Checkout session for Pro plan
       - success_url: /dashboard?upgraded=true
       - cancel_url: /upgrade
       - customer_email: from Supabase session
    4. Write /api/stripe/webhook/route.ts:
       - Verify Stripe signature (STRIPE_WEBHOOK_SECRET)
       - On checkout.session.completed: UPDATE users SET plan='pro' WHERE email=...
       - On customer.subscription.deleted: UPDATE users SET plan='free' WHERE ...
    5. Write /upgrade/page.tsx: pricing table (Free vs Pro), "Upgrade" button
    6. Write feature gate middleware: check users.plan before returning GitHub App data
    7. Add "Upgrade to Pro" banner on dashboard for free users
  </steps>
  <verification>
    Click "Upgrade to Pro" button
    Expected: Redirected to Stripe Checkout page
    Use test card: 4242 4242 4242 4242, any future date, any CVC
    Expected: Redirected back to /dashboard?upgraded=true
    Check Supabase: users.plan = 'pro'
    Check: GitHub App PR comments now work for this user
  </verification>
  <commit>feat(web): add Stripe checkout and subscription lifecycle management</commit>
</task>

<task id="3.2">
  <title>Deploy to Vercel with environment variables</title>
  <file>vercel.json, packages/web/.env.production</file>
  <steps>
    1. Install Vercel CLI: npm install -g vercel
    2. Run: vercel --cwd packages/web (interactive setup)
    3. Set all env vars in Vercel dashboard:
       - NEXT_PUBLIC_SUPABASE_URL
       - NEXT_PUBLIC_SUPABASE_ANON_KEY
       - SUPABASE_SERVICE_ROLE_KEY
       - STRIPE_SECRET_KEY (use live key for production)
       - STRIPE_WEBHOOK_SECRET
       - STRIPE_PRO_PRICE_ID
       - GITHUB_APP_ID
       - GITHUB_APP_PRIVATE_KEY
       - GITHUB_WEBHOOK_SECRET
    4. Run: vercel --prod
    5. Configure custom domain in Vercel dashboard if available
    6. Update GitHub App webhook URL to production URL
    7. Update Stripe webhook endpoint to production URL
  </steps>
  <verification>
    Go to: https://contextpilot.dev (or *.vercel.app URL)
    Expected: Auth page loads
    Complete full flow: signup → create project → upgrade to Pro
    Expected: Works identically to local development
    Open a PR on connected repo
    Expected: Bot comment appears with production URL
  </verification>
  <commit>chore(web): deploy v0.1.0 to Vercel production</commit>
</task>

---

## Phase 3 Complete When
- [ ] https://contextpilot.dev is live and accessible
- [ ] Sign up → project → PR comment works end-to-end
- [ ] Stripe payment completes and unlocks Pro features
- [ ] At least 1 real user (not you) has signed up
