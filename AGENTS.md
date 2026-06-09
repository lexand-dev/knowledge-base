# AI Knowledge Base - Agent Instructions

## Project Overview

SaaS for mid-market companies — document upload, RAG chat with citations, multi-tenant with RLS.
Stack: Next.js 16 + Hono RPC + Neon Postgres + Better Auth + Trigger.dev + Vercel AI SDK

## Architecture

```
src/
├── server/           # Hono API (deployed as Vercel serverless)
│   ├── index.ts      # Main app with CORS, routes, exports ApiRoutes type
│   ├── client.ts     # RPC client (hc) for frontend
│   ├── types.ts      # API DTOs
│   └── routes/       # auth, documents, chat handlers
├── app/              # Next.js App Router
│   └── api/[[...route]]/  # Catches requests → delegates to Hono
├── db/               # Drizzle schema + migrations
├── lib/              # Auth config, db pool (use @neondatabase/serverless Pool)
├── modules/          # Service layer (documents, chat)
└── components/       # shadcn/ui components
```

## Key Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Next.js production build
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check (use --skipLibCheck)
npm run db:generate  # Drizzle: generate migrations
npm run db:migrate   # Drizzle: apply migrations
npm run db:push      # Drizzle: push schema to DB
npm run db:studio    # Drizzle: visual schema editor
```

## Path Aliases

Use `@/` prefix for all imports (configured in tsconfig.json):
- `@/server/*` → `src/server/*`
- `@/app/*` → `src/app/*`
- `@/db/*` → `src/db/*`
- `@/lib/*` → `src/lib/*`
- `@/modules/*` → `src/modules/*`
- `@/components/*` → `src/components/*`

**Never use relative paths like `../../db/` — always use `@/db/`**

## Database

- **Drizzle** ORM with `neon-http` driver from `@neondatabase/serverless`
- **Pool** for transactions (BetterAuth) also from `@neondatabase/serverless` (NOT `pg` package)
- **pgvector** for embeddings — embedding column stored as `text`, vector type applied via manual migration
- **RLS** enforced at DB level — always filter by `tenant_id`

## Auth

- **Better Auth** with magic link + email/password
- Magic link handler configured, email sending is stubbed (logs to console)
- Session cookie forwarded via `Set-Cookie` header in proxy route

## Service Layer Pattern

Business logic lives in `@/modules/*`, not in route handlers:

```typescript
// Route handler (thin)
import { createDocumentService } from "@/modules/documents";
import { createDocumentDbAdapter } from "@/modules/documents/adapter";

const adapter = createDocumentDbAdapter();
const service = createDocumentService(adapter);
const doc = await service.createDocumentRecord(tenantId, data);

// Service (business logic)
export function createDocumentService(deps: DocumentServiceDeps) {
  return {
    generatePresignedUrl: async (req) => { ... },
    processDocument: async (id) => { ... },
    // ...
  };
}
```

## Validation

- Use `@hono/zod-validator` for request validation
- Zod schemas defined inline in route handlers

## Skills

Load relevant skills before working on features:
- `better-auth-best-practices` — auth setup, plugins, hooks
- `hono` — Hono routing, middleware, streaming, RPC client
- `neon-postgres` — Neon connection pooling, branching, scale-to-zero
- `vercel-react-best-practices` — React performance patterns
- `frontend-design` — UI/UX patterns

## Critical Notes

1. **Do NOT use `pg` package** — use `@neondatabase/serverless` for all DB connections
2. **All routes need tenant isolation** — extract tenant ID from session, not from request params
3. **Auth middleware not yet on documents/chat routes** — must be added (Candidate #3 from architecture review)
4. **RAG pipeline not implemented** — embedding generation and vector search are stubs
5. **Trigger.dev MCP configured** — use `trigger_*` tools for job management

## Issues

8 GitHub issues tracking vertical slices:
- #1 ✅ Database Schema + RLS
- #2 ✅ Project Scaffolding
- #3 ⏳ Better Auth Integration (in progress)
- #4-#8 ⏳ Document Upload, Processing, Chat API, UI

Run `gh issue list` to see status.