# FranchiseIntelligenceOS

AI-powered franchise operations platform: track locations, licenses, compliance scores, tasks, audits, and documents, with an AI assistant that answers questions from live portfolio data and an expansion-readiness view by state.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/franchise-os run dev` — run the frontend (workflow-managed; use restart_workflow, not bash)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string; `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit OpenAI AI integration (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + wouter + TanStack Query + shadcn/ui (artifacts/franchise-os)
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- AI: OpenAI via `@workspace/integrations-openai-ai-server` (Replit AI integration proxy, model gpt-5.4)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema/` — Drizzle schemas: locations, licenses, complianceChecks, tasks, audits, documents, conversations, messages
- `artifacts/api-server/src/routes/` — one router per domain, mounted in `routes/index.ts` (all under `/api`)
- `artifacts/api-server/src/lib/scores.ts` — computed values: location compliance score (avg of check scores), license status (valid/expiring/expired)
- `artifacts/api-server/src/lib/serialize.ts` — Date→ISO-string serializer for Zod response parsing
- `artifacts/franchise-os/src/pages/` — dashboard, locations, location-detail, compliance, tasks, expansion, documents, assistant

## Architecture decisions

- Computed fields are server-side only: `Location.complianceScore` = avg of its compliance check scores (100 if none); `License.status` derived from expiryDate (expiring = within 30 days)
- Creating a compliance check with status fail/warn auto-creates a remediation task with `source: "compliance"` (high priority for fail, medium for warn)
- AI chat (`POST /api/ai/chat`) is non-streaming; it injects a snapshot of all portfolio data into the system prompt with bracketed IDs and requires the model to cite them (e.g. [Location #3])
- Expansion readiness is computed per state from location count, avg compliance, and open task load — no separate table
- Drizzle `timestamptz` columns return `Date` objects that fail generated Zod response schemas — always wrap with `toIso()` from `src/lib/serialize.ts` before `.parse()`

## Product

- Dashboard: portfolio KPIs + recent activity feed
- Locations: CRUD + detail view with per-location licenses, checks, audits, documents
- Compliance: 0-100 scoring (≥80 green, 50-79 yellow, <50 red)
- Tasks: todo/in_progress/done with manual and auto-created compliance tasks
- Expansion: readiness score and recommendation per US state
- Documents: searchable SOP/policy/note library
- AI Assistant: multi-conversation chat grounded in live DB data with citations

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Restart workflows by their full names: `artifacts/api-server: API Server` and `artifacts/franchise-os: web`
- Always serialize Date fields to ISO strings before Zod response parsing (see serialize.ts)
- Query-param hooks take params as first arg: `useListTasks(undefined, { query: {...} })`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
