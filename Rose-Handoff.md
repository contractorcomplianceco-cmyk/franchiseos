# Rose's Architecture & Intent Handoff

> Companion to `HANDOFF.md` (full engineering spec). This document captures **intent,
> UI, and flows** so Carmen's Cursor AI can replicate and safely extend the app.

## 1. Project Overview & Core Intent

- **What this project does:** FranchiseIntelligenceOS is an AI-powered franchise
  operations platform. It tracks franchise **locations, licenses, compliance
  scores, tasks, audits, and documents**, surfaces portfolio risk, scores US
  states for **expansion readiness**, and provides an **AI assistant** that answers
  questions grounded in the live portfolio data (with citations like `[Location #3]`).
- **Target Audience / Core Flow:** Franchise operators, compliance managers, and
  franchise-development teams. Core flow: a user signs in (Clerk) → lands on the
  **Dashboard** (portfolio KPIs + risk alerts + recent activity) → drills into a
  **Location** to review its licenses/compliance/audits/documents → works the
  **Tasks** queue (including auto-created remediation tasks) → reviews **Compliance**
  charts → checks **Expansion** readiness by state → uploads/searches **Documents**
  → asks the **AI Assistant** questions about the portfolio. The **first user to
  sign up becomes admin**; roles are `admin` / `manager` / `user`.

## 2. Key Pages & Frontend Routes

Routing: `wouter`, defined in `artifacts/franchise-os/src/App.tsx`. Signed-out users
see only the landing page; all app routes below require authentication. Base path is
provided by Vite (`import.meta.env.BASE_URL`).

- **`/` (Dashboard — signed in):** Portfolio KPIs including a "Risk Alerts" KPI
  (count of expiring/expired licenses + overdue open tasks), plus a recent activity
  feed. Data-only page (no create actions). Components: KPI cards, activity list.
- **`/` (Landing — signed out):** Marketing page. Premium hero, **decorative CSS
  dashboard/AI-chat mockups**, modules grid, testimonials, CTA, and an embedded
  `/demo/` video iframe with an intro overlay. No live data — purely presentational.
- **`/locations`:** List of all locations with computed compliance scores. Actions:
  create / edit / delete a location (create+edit gated to manager/admin server-side).
- **`/locations/:id` (Location detail):** Per-location view aggregating its licenses,
  compliance checks, audits, and documents. Actions: add/edit licenses, checks,
  audits; view documents.
- **`/compliance`:** 0–100 compliance scoring dashboard with recharts visualizations
  (status pie, avg-score bar, trend area, location×category risk heatmap). Filters by
  location/category. Read + create compliance checks.
- **`/tasks`:** Task board (`todo` / `in_progress` / `done`) with manual and
  auto-created compliance-remediation tasks. Actions: create / update status / delete;
  filter by location.
- **`/expansion`:** Per-US-state expansion-readiness score and recommendation,
  computed server-side from location count, avg compliance, and open-task load.
- **`/documents`:** Searchable SOP/policy/note library with **real file uploads**
  (Uppy → presigned PUT → object storage). Actions: upload, search, open documents.
- **`/assistant`:** Multi-conversation AI chat grounded in live DB data with
  citations. Actions: send message, create/select/delete conversations.
- **`*` (NotFound):** Fallback 404 route.

Auth routes: `/sign-in/*` and `/sign-up/*` (Clerk-hosted components).

## 3. Component & State Breakdown

> **Important for Carmen:** This build is **already wired to a live backend.** Every
> data-driven page consumes generated TanStack Query hooks that hit the Express API
> (`/api`) backed by PostgreSQL + Drizzle. There are **no mock-data arrays or fake
> state variables to replace** in the app pages — the wiring is real. Carmen's job is
> to **provision the backend environment** (DB, Clerk, object storage, AI key — see
> `HANDOFF.md` §4/§7/§11), not to swap out placeholder data.

Main interactive components and the **live** hooks that feed them (from
`@workspace/api-client-react`, generated from the OpenAPI spec — do not hand-edit):

- **Dashboard:** `useGetDashboardSummary`, `useGetRecentActivity`.
- **Locations:** `useListLocations` (+ create/update/delete location mutations).
- **Location detail:** `useGetLocation`, `useListLicenses`, `useListComplianceChecks`,
  `useListAudits`, `useListTasks`.
- **Compliance:** `useListComplianceChecks`, `useListLocations` (recharts inputs).
- **Tasks:** `useListTasks`, `useListLocations`, `useCreateTask`, `useUpdateTask`,
  `useDeleteTask`.
- **Expansion:** `useGetExpansionReadiness`.
- **Documents:** `useListDocuments`, `useCreateDocument`, plus the Uppy
  `<ObjectUploader>` for presigned uploads.
- **Assistant:** `useListConversations`, `useListConversationMessages`,
  `useDeleteConversation`, and the non-streaming `POST /api/ai/chat` call.
- **Notifications:** socket.io client in `src/hooks/use-notifications.ts` powers the
  top-bar bell (REST seed → live pushes).

**Placeholder/mock variables to replace:** **None in app pages.** The only
`placeholder=` usages are input hint text (e.g. "Search documents…", "Ask anything
about your franchise operations…"), and the **only mock UI is the landing page's
decorative CSS dashboard/chat mockups** (`landing.tsx`), which are intentionally
static marketing visuals — not real data and not meant to be wired up.

**What Carmen must actually supply (env, not code):** `DATABASE_URL`, Clerk keys
(`CLERK_*`, `VITE_CLERK_*`), object-storage config (`PRIVATE_OBJECT_DIR`,
`PUBLIC_OBJECT_SEARCH_PATHS`), and the OpenAI/AI proxy vars
(`AI_INTEGRATIONS_OPENAI_*`). Then run `pnpm --filter @workspace/db run push` to
create tables. Full checklist in `HANDOFF.md` §11.

## 4. UI Safeguards for Carmen

**Do Not Touch** (leave completely untouched — these are finished, intentional, and
easy to break):

- **Landing page (`src/pages/landing.tsx`):** The premium hero, the **CSS
  dashboard/AI-chat mockups**, the framer-motion **intro overlay** (autoplay demo,
  Skip/Esc/backdrop dismiss, body-scroll lock), and the deferred `/demo/` iframe
  mount logic. This is bespoke marketing UI with delicate animation timing — do not
  refactor, "wire up", or restyle it.
- **The `demo` artifact (`artifacts/demo`, video-js):** A ~81s narrated video with
  pre-mixed composite audio and custom play/pause/scene/mute controls and
  audio-sync logic. Never deploy it; never modify its player timing.
- **Generated API layer (`lib/api-client-react`, `lib/api-zod`):** Auto-generated
  from `lib/api-spec/openapi.yaml` via Orval. **Never hand-edit.** To change the API,
  edit the OpenAPI spec and run `pnpm --filter @workspace/api-spec run codegen`. Do
  not change `info.title` in the spec (it drives generated filenames).
- **shadcn/ui primitives (`src/components/ui/*`) & Tailwind v4 theme tokens:** Keep
  the existing component library and design tokens intact; build on them rather than
  replacing them.
- **Server-side computed fields & business rules:** compliance score = avg of check
  scores; license status derived from expiry (expiring = within 30 days); fail/warn
  compliance checks auto-create remediation tasks; expansion readiness formula. These
  live in the API (`artifacts/api-server/src/lib/`) — keep the UI reading them, don't
  reimplement them client-side.
- **Date handling:** UI expects ISO strings; the server serializes `Date → ISO` via
  `serialize.ts` before Zod parsing. Don't change response shapes without regenerating
  the client.
