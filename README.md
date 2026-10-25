# Jeovely

Jeovely is a SaaS workflow-automation platform: users build workflows that connect a
**trigger** to a chain of **actions** — for example *new form submission → score lead →
notify the sales team*.

This repository currently contains the **marketing website** and the **full-stack
foundation** (API, database schema, tooling). The product itself is not built yet — see
[Implementation status](#implementation-status).

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, `@paper-design/shaders-react` |
| Backend | Node.js (22+), Express 5, TypeScript, zod (validation), helmet, cors |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Tooling | npm workspaces, concurrently, tsx |

## Project structure

```
.
├── index.html                 Vite entry → src/main.tsx
├── src/                       React frontend (marketing site)
│   ├── App.tsx                page composition
│   ├── components/            sections + shared pieces
│   │   └── ui/                shadcn primitives, Liquid Metal hero
│   ├── lib/api.ts             API client (fetch wrapper)
│   └── lib/utils.ts           cn() helper
├── server/                    Express API (npm workspace "@flowly/server")
│   ├── prisma/schema.prisma   database schema
│   ├── prisma.config.ts       Prisma CLI config (reads DATABASE_URL)
│   └── src/
│       ├── server.ts          process entry (listen, graceful shutdown)
│       ├── app.ts             Express app: middleware, routes, error handling
│       ├── config/env.ts      validated environment variables
│       ├── controllers/       request handlers
│       ├── middleware/        validation, 404, errors, logging, 501 placeholder
│       ├── routes/            /api/* routers
│       ├── schemas/           zod request schemas
│       ├── services/          database access (Prisma client)
│       ├── utils/             response + error helpers
│       └── generated/         Prisma client (generated, git-ignored)
├── design-system/jeovely/     design source of truth (MASTER.md, pages/)
└── .env.example               documented environment variables
```

## Setup

### 1. Install dependencies

```bash
npm install
```

One install covers both apps (npm workspaces). It also runs `prisma generate` for the
server, which doesn't need a database.

### 2. Configure environment variables

```bash
cp .env.example .env
```

A single root `.env` serves both apps. The API reads all of it; Vite only exposes
variables prefixed with `VITE_` to the browser. `.env` is git-ignored — never commit it.

| Variable | Used by | Purpose |
|---|---|---|
| `NODE_ENV` | API | `development` / `test` / `production`. Production hides error details from responses. |
| `PORT` | API | Port the API listens on (default `4000`). |
| `API_URL` | API, Vite dev proxy | Public base URL of the API, without `/api`. |
| `FRONTEND_URL` | API (CORS) | Comma-separated browser origins allowed to call the API. |
| `JSON_BODY_LIMIT` | API | Max JSON body size (default `100kb`). |
| `DATABASE_URL` | API, Prisma CLI | PostgreSQL connection string. Optional until you need the database. |
| `AUTH_SECRET` | — | Reserved for the auth module (not implemented). Min 32 chars when set. |
| `VITE_API_URL` | Frontend | API base URL for the browser. Empty → same-origin `/api` (proxied in dev). |

### 3. Database (PostgreSQL + Prisma)

The schema lives in `server/prisma/schema.prisma` and models:
`User`, `Workspace`, `WorkspaceMember` (user ↔ workspace with a role), `Workflow`
(belongs to a workspace, ordered `WorkflowStep`s), and `WorkflowExecution` (one run of a
workflow).

To create the tables you need a PostgreSQL database:

1. Create a database and set `DATABASE_URL` in `.env`,
   e.g. `postgresql://USER:PASSWORD@localhost:5432/flowly?schema=public`.
2. Run `npm run db:migrate` (creates and applies the first migration).
3. Check the connection: `GET /api/health` reports `"database": "connected"`.

Without `DATABASE_URL` the API still runs and reports `"database": "not_configured"`.

## Commands

All commands run from the repository root.

| Command | What it does |
|---|---|
| `npm run dev` | Frontend dev server (Vite, http://localhost:5173) — unchanged |
| `npm run dev:web` | Same as `dev` |
| `npm run dev:api` | API dev server with reload (http://localhost:4000) |
| `npm run dev:full` | Frontend + API together |
| `npm run build` | Type-check + build the frontend to `dist/` |
| `npm run build:api` | Compile the API to `server/dist/` |
| `npm run build:all` | Both builds |
| `npm run start:api` | Run the compiled API |
| `npm run preview` | Serve the frontend production build |
| `npm run typecheck` | Type-check frontend and API (`typecheck:web`, `typecheck:api`) |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:validate` | Validate the Prisma schema |
| `npm run db:migrate` | Create/apply migrations in development (needs `DATABASE_URL`) |
| `npm run db:deploy` | Apply existing migrations (production/CI; needs `DATABASE_URL`) |
| `npm run db:studio` | Open Prisma Studio (needs `DATABASE_URL`) |

In development the frontend calls `/api/...` and Vite proxies it to `API_URL`, so no CORS
setup is needed locally.

## API

Base path `/api`. Every response uses one shape:

```jsonc
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "details": ... } }
```

| Route | Status |
|---|---|
| `GET /api/health` | Implemented: API status, uptime and database status |
| `/api/auth` | Placeholder: responds `501 NOT_IMPLEMENTED` |
| `/api/workflows` | Placeholder (501). `POST /` already validates its body (`400 VALIDATION_ERROR`) |
| `/api/executions`, `/api/integrations`, `/api/users`, `/api/workspaces` | Placeholder (501) |
| Anything else | `404 NOT_FOUND` |

Other handled errors: invalid JSON (`400 INVALID_JSON`), oversized body
(`413 PAYLOAD_TOO_LARGE`), disallowed browser origin (`403 CORS_ORIGIN_DENIED`), unexpected
errors (`500 INTERNAL_SERVER_ERROR`, with stack traces only outside production).

The frontend calls the API through `src/lib/api.ts`:

```ts
import { api, ApiError } from "@/lib/api"

const health = await api.get<{ status: string }>("/health")
// api.post / api.put / api.patch / api.delete; failures throw ApiError (status, code, details)
```

## Implementation status

### Implemented
- Marketing website: Liquid Metal hero, navbar with mobile menu, features, how it works,
  testimonial, pricing, final CTA, footer; light/dark mode; reduced-motion support;
  accessibility work (skip link, focus states, labelled landmarks, contrast-checked colours).
- Express API foundation: environment validation, helmet, CORS allow-list, JSON body limit,
  request logging, consistent response/error format, 404 handling, zod request validation,
  graceful shutdown.
- `GET /api/health`, including a database connectivity check.
- Route structure for auth, workflows, executions, integrations, users and workspaces.
  These return 501 for now.
- Prisma schema for users, workspaces, members, workflows, steps and executions; Prisma
  client generation.
- Frontend API client with typed errors and an environment-based base URL.

### Planned (not implemented)
- Authentication (provider not chosen yet) and sessions.
- Dashboard and app UI, workflow builder.
- Workflow CRUD, triggers, actions and the execution engine; execution history.
- Integrations and credential storage.
- Analytics, team/workspace management, settings.
- AI-assisted workflow creation.
- Database migrations: none exist yet. They're created with `npm run db:migrate` once a
  PostgreSQL database is configured.
