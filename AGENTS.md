# AI Knowledge Base - Agent Instructions

## Project Overview

SaaS — document upload, RAG chat with citations, user-scoped.
Stack: Next.js 16 + Hono RPC + Neon Postgres + Better Auth + Vercel AI SDK

## Key Commands

Use `bun` for all package management and scripts:

```bash
bun run dev          # Next.js dev server
bun run build        # Next.js production build
bun run lint         # ESLint (flat config using eslint-config-next)
bun run test         # Run all tests (vitest)
bun run test:watch   # Vitest in watch mode
bunx tsc --noEmit    # TypeScript type-check
bun run db:generate  # Drizzle: generate migrations from schema
bun run db:migrate   # Drizzle: apply pending migrations
bun run db:push      # Drizzle: push schema directly to DB (no migration file)
bun run db:studio    # Drizzle: visual schema editor
bun add <pkg>        # Add a dependency
bun remove <pkg>     # Remove a dependency
```

## Architecture

```
src/
├── server/              # Hono API (deployed as Vercel serverless)
│   ├── index.ts         # Main app: CORS, authMiddleware, Better Auth handler, document/chat routes. Exports AppType
│   ├── client.ts        # RPC client (hc) for frontend — uses AppType
│   ├── types.ts         # API DTOs
│   └── routes/          # auth.ts, documents.ts, chat.ts
├── middleware/           # Hono middleware: authMiddleware, requireAuth
├── app/                 # Next.js App Router
│   └── api/[[...route]]/route.ts  # Catch-all: delegates all /api/* to Hono via hono/vercel handle()
├── db/                  # Drizzle schema (schema.ts) + migrations/
├── lib/                 # auth.ts (Better Auth server), hn-client.ts (React auth client), utils.ts
├── modules/             # Service layer: documents/, chat/ (each has adapter.ts, service.ts, types.ts, index.ts)
└── components/          # shadcn/ui components
```

**Entry points:**
- Frontend: Next.js App Router — `src/app/`
- API: All `/api/*` requests hit Next.js → `hono/vercel` handler → Hono (`src/server/index.ts`)
- The Next.js API route explicitly sets `runtime = "nodejs"` (not Edge)

## Path Aliases

Use `@/` prefix for all imports (configured in tsconfig.json paths):
- `@/server/*` → `src/server/*`
- `@/app/*` → `src/app/*`
- `@/db/*` → `src/db/*`
- `@/lib/*` → `src/lib/*`
- `@/modules/*` → `src/modules/*`
- `@/middleware/*` → `src/middleware/*`
- `@/components/*` → `src/components/*`

**Never use relative paths — always use `@/` prefixed imports.**

## Database

- **Drizzle** ORM — `drizzle-orm/neon-http` driver via `@neondatabase/serverless` `neon()`
- The Drizzle `db` instance (`src/db/index.ts`) is the single DB interface used by both adapters and auth — no separate Pool needed
- **pgvector** — embedding column is `text` in schema; raw SQL casts `::jsonb` for vector operations (`<=>`, `<#>`)
- Drizzle config reads `DATABASE_URL` from `.env`, dialect `postgresql`, schema at `src/db/schema.ts`
- **Do NOT use the `pg` package** — use `@neondatabase/serverless` for all DB connections. `pg` has been removed from dependencies.

## Auth

- **Better Auth** with `emailAndPassword` (no magic link — only email/password is enabled)
- `emailAndPassword.requireEmailVerification` is `false`
- Session: 7-day expiry, 24hr update age, 5-min cookie cache
- `better-auth` handler mounted on Hono at `POST,GET /api/auth/*`
- Better Auth React client in `src/lib/hn-client.ts` (configured via `createAuthClient`)
- Auth middleware (`src/middleware/auth.ts`):
  - `authMiddleware` — applied globally in `server/index.ts`, populates `user` and `session` from cookie
  - `requireAuth` — applied on all document/chat routes, returns 401 if not authenticated

## Testing

- **Vitest** with `vitest.config.ts` — `environment: "node"`, `globals: true`
- Setup file `vitest.setup.ts` sets env vars (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN, BLOB_STORE_ID)
- Path alias `@/` is configured for vitest via the config alias field
- Tests use `vi.mock("@/lib/auth")` to mock Better Auth's `api.getSession` and `handler`
- Pattern: mock the auth, create a Hono app, simulate requests with `app.request(path)`
- Test file: `src/__tests__/auth.test.ts`

## Service Layer Pattern

Business logic lives in `@/modules/*`, route handlers are thin:

- Each module has: `adapter.ts` (DB access), `service.ts` (business logic), `types.ts`, `index.ts` (re-exports)
- Adapters use `drizzle` from `@/db/index` for queries, receive `userId` as parameter (never from globals)
- Services receive a typed dependency interface, making them testable with mock adapters
- Route handlers create adapters and services at module level, then call service methods

## Known Gaps & Gotchas

1. **Vector search** — implemented via raw SQL (`dc.embedding::jsonb <=> $embedding::jsonb`). Depends on pgvector extension being manually enabled.
2. **Trigger.dev** — MCP is configured in `opencode.json` but there is no `trigger.config.ts` or jobs directory. Not yet integrated.
3. **`.env` file** — gitignored via `.env*` pattern, but contains real credentials. Do NOT commit additional secrets.
4. **Drizzle migrations** — existing migrations reference old `tenants` table and `role` enum which have been removed. Run `bun run db:push` to sync directly.
5. **All IDs are text** — using `crypto.randomUUID()` for application records, Better Auth CUID2 for user/account/session IDs. Never use `parseInt()` on route params.

## Skills

Load these skills when relevant:
- `better-auth-best-practices` — auth setup, plugins, hooks
- `hono` — Hono routing, middleware, streaming, RPC client
- `neon-postgres` — Neon connection pooling, branching, scale-to-zero
- `neon-drizzle` — Drizzle ORM with Neon
- `vercel-react-best-practices` — React performance patterns
- `frontend-design` — UI/UX patterns
- `ui-ux-pro-max` — shadcn/ui component design
