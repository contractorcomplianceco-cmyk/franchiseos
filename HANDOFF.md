# FranchiseIntelligenceOS — Engineering Handoff (Cursor)

AI-powered franchise operations platform. Track locations, licenses, compliance
scores, tasks, audits, and documents; an AI assistant answers questions from live
portfolio data; an expansion-readiness view scores US states.

This document is the single source of truth for picking the project up in Cursor
outside of Replit. Read it top to bottom before making changes.

---

## 1. Tech stack

| Layer      | Choice |
|------------|--------|
| Runtime    | Node.js **24** (`node -v` → v24.x), pnpm **10** (`corepack enable` to get it) |
| Language   | TypeScript 5.9 (strict), ESM |
| Monorepo   | pnpm workspaces + TypeScript project references |
| Frontend   | React 19 + Vite 7 + wouter (routing) + TanStack Query + shadcn/ui + Tailwind v4 + framer-motion |
| API        | Express 5 |
| DB         | PostgreSQL + Drizzle ORM (`drizzle-kit` for schema push) |
| Validation | Zod (v3 in catalog) + `drizzle-zod` |
| API codegen| OpenAPI 3.1 spec → Orval → React Query hooks + Zod schemas |
| Realtime   | socket.io (notifications) |
| Auth       | Clerk (whitelabel; on Replit it is auto-provisioned — see §7) |
| AI         | OpenAI-compatible client via an integration proxy (model `gpt-5.4`) |
| Storage    | S3-style object storage for document uploads (presigned PUT) |

> **Important:** This project was built on Replit, which auto-provisions several
> services (Postgres, Clerk keys, object storage, an OpenAI proxy). Running it in
> Cursor/locally means you must supply those yourself — see §4 and §7.

---

## 2. Repository layout

pnpm monorepo. Two kinds of packages: **`lib/*`** (shared, composite, emit
declarations) and **`artifacts/*`** (deployable leaf apps, typechecked with
`--noEmit`). Artifacts must never import each other — share via a `lib/*`.

```
artifacts/
  api-server/        Express 5 API (all routes under /api)
  franchise-os/      React + Vite web app (the product UI)
  demo/              video-js marketing demo (~81s). NOT deployable — present only
  mockup-sandbox/    component preview server (design tooling; ignore for product work)
lib/
  api-spec/          openapi.yaml (source of truth) + Orval codegen config
  api-client-react/  GENERATED TanStack Query hooks (do not hand-edit)
  api-zod/           GENERATED Zod request/response schemas (do not hand-edit)
  db/                Drizzle schema + drizzle.config.ts + `push` script
  object-storage-web/ Uppy <ObjectUploader> React component (imported as source)
  integrations-openai-ai-server/ server-side OpenAI client wrapper
scripts/             shared utility scripts (@workspace/scripts)
pnpm-workspace.yaml  workspace globs, dependency catalog, platform overrides
tsconfig.base.json   shared strict TS defaults
tsconfig.json        solution file — references lib/* only (NOT artifacts)
```

### Database schemas (`lib/db/src/schema/`)
`locations`, `licenses`, `complianceChecks`, `tasks`, `audits`, `documents`,
`conversations`, `messages`, `users` (barrelled through `index.ts`).

### API routers (`artifacts/api-server/src/routes/`, mounted in `index.ts`, all under `/api`)
`health`, `locations`, `licenses`, `compliance`, `tasks`, `audits`, `documents`,
`ai`, `dashboard`, `expansion`, `me`, `notifications`, `storage`.

---

## 3. Commands

Run from the repo root.

```bash
corepack enable                 # provides pnpm 10
pnpm install                    # install all workspace deps

pnpm run typecheck              # CANONICAL check: builds libs, then typechecks artifacts
pnpm run typecheck:libs         # tsc --build for composite libs only
pnpm run build                  # typecheck + build every package

# Per-package (preferred while iterating):
pnpm --filter @workspace/api-server run dev        # API server (needs PORT + DATABASE_URL etc.)
pnpm --filter @workspace/franchise-os run dev      # web frontend (Vite)
pnpm --filter @workspace/api-spec run codegen      # regenerate hooks + Zod from openapi.yaml
pnpm --filter @workspace/db run push               # push Drizzle schema to DB (dev only)
```

**Env vars the dev servers need** (Replit's workflows inject these automatically;
locally you must set them — see §4):
- API server requires `PORT` and `DATABASE_URL` at minimum, plus the vars in §4.
- Frontend Vite server reads `VITE_*` vars and `BASE_URL`.

> Trust `pnpm run typecheck` over the editor/LSP when they disagree.

---

## 4. Environment variables

Create `.env` files (or shell exports) for local dev. Keys actually referenced in
code:

**API server (`artifacts/api-server`)**
```
PORT=8080                       # required; server throws if missing/invalid
DATABASE_URL=postgres://...     # required; Postgres connection string
NODE_ENV=development
LOG_LEVEL=info

CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# OpenAI-compatible proxy (Replit AI integration). Point at OpenAI directly if self-hosting.
AI_INTEGRATIONS_OPENAI_BASE_URL=...
AI_INTEGRATIONS_OPENAI_API_KEY=...

# Object storage (document uploads)
PRIVATE_OBJECT_DIR=...
PUBLIC_OBJECT_SEARCH_PATHS=...
```

**Frontend (`artifacts/franchise-os`)**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_CLERK_PROXY_URL=...         # Clerk proxy URL (Replit whitelabel setup)
# BASE_URL is provided by Vite (base path); do not hardcode
```

> On Replit these are auto-provisioned. Off Replit you must create a Clerk app, a
> Postgres DB, an object-storage bucket (or stub uploads), and provide an OpenAI
> key. `SESSION_SECRET` and object-bucket IDs are also present in the Replit
> environment.

---

## 5. Routing & how services talk

- All API routes live under **`/api`** (see `openapi.yaml` `servers: /api`).
- On Replit a reverse proxy routes by path; **paths are not rewritten**, so the
  API server owns its full `/api` prefix. Locally, run the API on `PORT` and point
  the frontend at it (respect the `/api` base — do not use bare `/api/...` that
  escapes the app's base path; use `${BASE_URL}api/...`).
- The frontend base path comes from `import.meta.env.BASE_URL` (has a trailing
  slash). Don't use root-relative `/api/...` URLs.

---

## 6. Contract-first API workflow (important)

The OpenAPI spec is the source of truth. **Do not hand-edit generated code.**

1. Edit `lib/api-spec/openapi.yaml`.
2. Run `pnpm --filter @workspace/api-spec run codegen`.
   - Regenerates React Query hooks in `lib/api-client-react` and Zod schemas in
     `lib/api-zod`.
3. Implement/adjust the Express route in `artifacts/api-server/src/routes/`,
   validating input/output with the generated Zod schemas.
4. Consume the generated hooks in the frontend.

- **Do not change `info.title` in `openapi.yaml`** — it drives generated file
  names; changing it breaks import paths.
- Query-param hooks take params as the **first** arg:
  `useListTasks(undefined, { query: { ... } })`.
- After editing any `lib/*`, run `pnpm run typecheck:libs` before artifact checks.
  Missing `@workspace/db` exports usually mean stale lib declarations, not bad
  imports.

---

## 7. Auth & roles (Clerk)

- Clerk handles authentication. On Replit it's the "Replit-managed whitelabel"
  variant with auto-provisioned keys + a proxy URL. Off Replit, create a normal
  Clerk app and set the keys in §4 (you can drop the proxy URL and use standard
  Clerk wiring).
- Server middleware: `clerkProxyMiddleware` + `clerkMiddleware` in `app.ts`;
  `middlewares/auth.ts` exposes `requireAuth` (JIT-provisions a `users` row),
  `requireRole`, `requireWriter`, `requireAdmin`.
- Roles: `admin` / `manager` / `user`. **The first user to sign up becomes admin**
  (atomic SQL CASE on insert, serialized with a Postgres advisory lock in
  `provisionUser` to prevent a race).
- Gating (`routes/index.ts`): `/api/healthz` public; everything else needs auth;
  AI chat open to any authed user; DELETE → admin; POST/PUT/PATCH → manager/admin.
- Enforcement is **server-side only** — the UI does not hide write actions; 403s
  surface as toast errors.
- `GET /api/me` returns the current user + role (`useGetCurrentUser` hook).
- AI conversations are owner-scoped (`conversations.userId → users.id`); cross-user
  access returns 404.

---

## 8. Domain logic & architecture decisions

- **Computed fields are server-side only.**
  - `Location.complianceScore` = average of its compliance-check scores (100 if
    none). Bands: ≥80 green, 50–79 yellow, <50 red.
  - `License.status` derived from `expiryDate`: `expiring` = within 30 days,
    else `valid` / `expired`.
  - See `artifacts/api-server/src/lib/scores.ts`.
- **Compliance → task automation:** creating a compliance check with status
  `fail`/`warn` auto-creates a remediation task with `source: "compliance"`
  (high priority for fail, medium for warn).
- **AI chat** (`POST /api/ai/chat`) is **non-streaming**. It injects a snapshot of
  all portfolio data into the system prompt with bracketed IDs and requires the
  model to cite them (e.g. `[Location #3]`).
- **Expansion readiness** is computed per state from location count, avg
  compliance, and open-task load — no separate table.
- **Dates:** Drizzle `timestamptz` columns return `Date` objects that fail the
  generated Zod response schemas. Always wrap with `toIso()` from
  `artifacts/api-server/src/lib/serialize.ts` before `.parse()`.
- **Realtime:** socket.io bell in the top bar. Server pushes license-expiring &
  task-overdue alerts on mutation and on a 60s interval
  (`src/lib/realtime.ts`: `computeNotifications()` / `broadcastNotifications()`).
- **Object storage:** presigned upload URLs + object serving/ACL in
  `src/lib/objectStorage.ts` + `objectAcl.ts`; routes in `routes/storage.ts`;
  documents served at `/api/storage{objectPath}`. Frontend uses the Uppy
  `<ObjectUploader>` from `lib/object-storage-web`.

---

## 9. Product surface (frontend pages)

`artifacts/franchise-os/src/pages/`: dashboard, locations, location-detail,
compliance, tasks, expansion, documents, assistant, landing (signed-out only).

- **Dashboard:** portfolio KPIs incl. "Risk Alerts" (count of expiring/expired
  licenses + overdue open tasks) + recent activity feed.
- **Compliance:** recharts viz — status pie, avg-score bar, trend area,
  location×category risk heatmap.
- **Documents:** searchable SOP/policy/note library with real file uploads.
- **AI Assistant:** multi-conversation chat grounded in live DB data with citations.
- **Landing** (`pages/landing.tsx`): premium hero, CSS mockups, modules grid,
  testimonials, CTA, and an embedded `/demo/` iframe intro overlay.

---

## 10. Gotchas

- **Never `console.log` in server code** — use `req.log` in handlers and the
  singleton `logger` elsewhere.
- Always serialize `Date` → ISO before Zod response parsing (see `serialize.ts`).
- Do **not** add `artifacts/*` to the root `tsconfig.json` references (libs only).
- Do **not** make leaf artifacts composite / emit declarations (causes TS2742).
- The `demo` artifact is a video — never deploy it, present only.
- `pnpm-workspace.yaml` enforces a 1-day `minimumReleaseAge` on npm packages
  (supply-chain defense) and strips non-linux-x64 platform binaries via
  `overrides`. If installing off-Replit on macOS/Windows, you may need to relax
  the platform overrides locally, but do not commit that change.
- Verify a package with `pnpm --filter @workspace/<name> run typecheck`, not
  `build` (build needs workflow-injected `PORT`/`BASE_PATH`).

---

## 11. First-run checklist (local / Cursor)

1. `corepack enable && pnpm install`
2. Provision Postgres; set `DATABASE_URL`.
3. `pnpm --filter @workspace/db run push` to create tables.
4. Create a Clerk app; set `CLERK_*` and `VITE_CLERK_*` vars.
5. Provide an OpenAI key (or the integration proxy vars) for the AI assistant.
6. Provide object-storage config, or stub `routes/storage.ts` if you don't need
   uploads yet.
7. `pnpm run typecheck` to confirm a clean tree.
8. Start the API (`pnpm --filter @workspace/api-server run dev`, with `PORT` set)
   and the web app (`pnpm --filter @workspace/franchise-os run dev`).
9. Sign up — the **first** account becomes admin.
