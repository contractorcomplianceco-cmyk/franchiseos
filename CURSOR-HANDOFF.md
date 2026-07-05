# CURSOR-HANDOFF.md

Migration handoff for Carmen (Replit → Cursor/AWS). Prepared per Rose's migration
prompt. **No secrets are included — variable NAMES only.** Companion docs in repo
root: `HANDOFF.md` (full engineering spec) and `Rose-Handoff.md` (architecture &
intent).

---

## Project name
**FranchiseIntelligenceOS**

## Purpose of the app
AI-powered franchise operations platform: track franchise **locations, licenses,
compliance scores, tasks, audits, and documents**; surface portfolio risk; score US
states for **expansion readiness**; and provide an **AI assistant** that answers
questions grounded in live portfolio data (with citations). Auth via Clerk; first
user to sign up becomes admin.

## Current build status
- **Product code: PASSES.** `pnpm run typecheck:libs`, `@workspace/franchise-os`,
  and `@workspace/api-server` all typecheck cleanly (exit 0).
- **Full `pnpm run build`: FAILS** — but only because of `artifacts/demo` (the
  non-deployed marketing video), see "Known broken" below. The deployable product
  (web app + API + shared libs) is clean.

## GitHub repo URL
`https://github.com/contractorcomplianceco-cmyk/franchiseos.git`

## Exact branch Carmen should clone
`main`

## Exact commit hash Carmen should verify
- Local `main` HEAD at time of writing: `9cd6d0dbf567b381720c55661f853efde8529fd8`
- `origin/main` (last pushed): `90521cbc...` — **local is AHEAD of origin by 3
  commits that are not yet pushed** (the two handoff docs + a deploy checkpoint), and
  this `CURSOR-HANDOFF.md` commit will add one more.
- **UNKNOWN until push completes:** the final hash Carmen verifies will be the tip
  after Rose pushes these pending commits. After pushing, run `git rev-parse HEAD`
  in Replit and share that value. **Carmen: do not clone until Rose confirms the
  pushed commit hash matches.**

## Commands

> ⚠️ **This is a pnpm monorepo, NOT npm.** A `preinstall` hook **blocks `npm`/`yarn`**
> and deletes their lockfiles. The migration checklist's `npm install` / `npm run
> build` will FAIL here. Use the pnpm commands below. Requires **Node.js 24** and
> **pnpm 10** (`corepack enable` provides pnpm).

- **Install:** `pnpm install`
- **Dev (run each in its own terminal):**
  - API: `pnpm --filter @workspace/api-server run dev` (needs `PORT` + `DATABASE_URL`)
  - Web: `pnpm --filter @workspace/franchise-os run dev`
- **Build:** `pnpm run build` (typecheck + build all packages) — currently fails on
  `artifacts/demo` only. To verify the **product** instead, use `pnpm run typecheck`
  (or filter: `pnpm --filter @workspace/franchise-os --filter @workspace/api-server
  run typecheck`).
- **Preview/start:** On Replit these run as workflows. Locally there is no combined
  "start" — run the two dev commands above. DB schema push (dev): `pnpm --filter
  @workspace/db run push`. API codegen: `pnpm --filter @workspace/api-spec run codegen`.

## Required environment variable NAMES ONLY (no values)
Server (`artifacts/api-server`):
- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `LOG_LEVEL`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `PRIVATE_OBJECT_DIR`
- `PUBLIC_OBJECT_SEARCH_PATHS`
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- `SESSION_SECRET`

Frontend (`artifacts/franchise-os`):
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_PROXY_URL`

> On Replit these are auto-provisioned. Off Replit, Carmen must supply real values
> for each (Postgres, a Clerk app, object storage, and an OpenAI-compatible key).
> Do NOT commit `.env`.

## Known working pages/routes (product, signed in)
All wired to the live API/DB and typecheck clean:
- `/` — Dashboard (KPIs incl. Risk Alerts, recent activity)
- `/locations` — list + CRUD
- `/locations/:id` — location detail (licenses, checks, audits, documents)
- `/compliance` — scoring + recharts visualizations
- `/tasks` — task board (todo/in_progress/done, incl. auto-created remediation tasks)
- `/expansion` — per-state expansion readiness
- `/documents` — searchable library with real file uploads
- `/assistant` — multi-conversation AI chat with citations
- `/` (signed out) — marketing landing page
- `/sign-in/*`, `/sign-up/*` — Clerk auth

## Known broken pages/routes
- **None in the product web app or API.**
- **`artifacts/demo` (video-js marketing video) fails `tsc` typecheck**, which makes
  the repo-wide `pnpm run build` fail. This artifact is **not deployed** (it is
  "present only"). Exact errors + likely files:
  - `artifacts/demo/tsconfig.json` — no DOM lib in scope → `Cannot find name 'window'`
    / `document` in `src/hooks/use-mobile.tsx`, `src/lib/video/hooks.ts`, `src/main.tsx`.
  - `artifacts/demo/src/lib/video/animations.ts` — framer-motion `Easing` / `Variant`
    type mismatches (framer-motion version drift).
  - This is a pre-existing type-config issue, not a runtime break. Left untouched
    intentionally (see UI safeguards). Fixable separately if a clean repo-wide build
    is required.

## Known missing features
- No automated test suite.
- Role changes are done via direct DB update (no admin UI for role management).
- No local combined "start"/preview script (dev servers are run per-artifact; Replit
  uses workflows).

## What Rose expects this project to become
A production franchise-operations intelligence platform for franchise operators and
compliance/development teams — the live app already covers locations, licenses,
compliance scoring, tasks, audits, documents, expansion readiness, realtime alerts,
and a data-grounded AI assistant. Next-stage intent: harden for AWS deployment with
externally provisioned Postgres, Clerk, object storage, and AI provider.

## Replit-only assumptions Carmen must know
- **Auto-provisioned services on Replit:** Postgres (`DATABASE_URL`), Clerk keys +
  proxy URL, object storage config, and the OpenAI proxy (`AI_INTEGRATIONS_OPENAI_*`).
  Off Replit, all must be supplied manually.
- **Path-based reverse proxy:** On Replit a proxy routes by path (API owns `/api`,
  paths are not rewritten). Off Replit, run the API and point the web app at it,
  respecting the app base path (`import.meta.env.BASE_URL`); do not use bare
  root-relative `/api/...`.
- **Clerk whitelabel + proxy URL** (`VITE_CLERK_PROXY_URL`) is Replit-specific;
  standard Clerk wiring can replace it off-platform.
- Object storage uses Replit's bucket env vars; substitute an S3-compatible bucket
  off-platform (or stub `artifacts/api-server/src/routes/storage.ts` if uploads
  aren't needed initially).

## Integrations: real vs placeholder/demo only
- **REAL / live in code:**
  - **Auth:** Clerk (sign-in/up, roles, JIT user provisioning) — real.
  - **Database:** PostgreSQL + Drizzle — real; all product pages read/write live data.
  - **AI:** OpenAI-compatible chat (`POST /api/ai/chat`, non-streaming, model
    `gpt-5.4` via proxy) — real, grounded in live DB data.
  - **File storage:** object storage with presigned uploads (documents) — real.
  - **Realtime:** socket.io notifications (license-expiring / task-overdue) — real.
- **PLACEHOLDER / demo only (not wired to data):**
  - **Landing page CSS mockups** (`franchise-os/src/pages/landing.tsx`) — decorative
    static dashboard/chat visuals, intentionally not real.
  - **`artifacts/demo`** — a pre-rendered marketing video, not a functional feature.
- **NOT present:** no CRM, no Supabase, no Zoho, no payment, and no email integration
  exist in this project. Do not assume any of these are live.

---

## Final summary (for Rose/Carmen)
- **Repo URL:** `https://github.com/contractorcomplianceco-cmyk/franchiseos.git`
- **Branch to clone:** `main`
- **Commit hash:** confirm after push — local HEAD `9cd6d0d...` is ahead of
  `origin/main` (`90521cb...`) and NOT yet pushed; run `git rev-parse HEAD` after
  pushing and verify Carmen's clone matches.
- **Install:** `pnpm install` (Node 24 + pnpm 10; npm is blocked)
- **Build:** `pnpm run build` (product is clean; fails only on `artifacts/demo`) —
  verify product with `pnpm run typecheck`
- **Dev/start:** `pnpm --filter @workspace/api-server run dev` +
  `pnpm --filter @workspace/franchise-os run dev`
- **Env var names:** see list above (values NOT included)
- **Build passed?** Product: **YES**. Full repo build: **NO** (demo artifact only).
- **What Carmen should do first in Cursor:** clone the confirmed branch+commit into a
  new folder under `/home/ubuntu/projects`; `corepack enable`; `pnpm install`; create
  `.env` from the variable names above with approved values; run
  `pnpm --filter @workspace/db run push`; verify with `pnpm run typecheck`; start the
  two dev servers.
- **What must NOT be touched yet:** `artifacts/demo` (video timing/animations),
  the landing page's CSS mockups + intro animation, and the generated API layer
  (`lib/api-client-react`, `lib/api-zod` — regenerate via codegen, never hand-edit).
  Do not connect production integrations until Rose/Carmen approve scope.
