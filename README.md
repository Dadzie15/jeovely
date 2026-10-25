# Jeovely

Jeovely is a SaaS workflow-automation platform: users build workflows that connect a
**trigger** to a chain of **actions** — for example *new form submission → score lead →
notify the sales team*.

This repository currently contains the **marketing website** and the **full-stack
foundation** (API, database schema, tooling) with **backend authentication** (stage 1).
The product itself is not built yet — see
[Implementation status](#implementation-status).

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, `@paper-design/shaders-react` |
| Backend | Node.js (22+), Express 5, TypeScript, zod (validation), helmet, cors, express-rate-limit |
| Auth | Server-side sessions in PostgreSQL, HttpOnly cookie, Argon2id (`@node-rs/argon2`) |
| Database | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Tooling | npm workspaces, concurrently, tsx, Node's built-in test runner (`node:test`) |

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
| `SESSION_TTL_DAYS` | API | Sign-in session lifetime in days (default `7`, 1–90). |
| `TRUST_PROXY` | API | Reverse-proxy hops in front of the API in production (default `0`). Needed for correct per-IP rate limits. |
| `TEST_DATABASE_URL` | Tests | Optional. Test database; name must end in `_test`. Default: `DATABASE_URL` with `_test` appended. |
| `VITE_API_URL` | Frontend | API base URL for the browser. Empty → same-origin `/api` (proxied in dev). |

### 3. Database (PostgreSQL + Prisma)

The schema lives in `server/prisma/schema.prisma` and models:
`User` (with an optional `passwordHash`), `Session` (sign-in sessions), `Workspace`,
`WorkspaceMember` (user ↔ workspace with a role), `Workflow` (belongs to a workspace,
ordered `WorkflowStep`s), and `WorkflowExecution` (one run of a workflow).

Migrations (in `server/prisma/migrations/`):

| Migration | Adds |
|---|---|
| `20261025005604` | Initial schema: users, workspaces, members, workflows, steps, executions |
| `20261025020516_add_auth_sessions` | `users.passwordHash` (nullable) and the `sessions` table |

To set up or update a database:

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env`,
   e.g. `postgresql://USER:PASSWORD@localhost:5432/flowly?schema=public`.
2. Apply migrations: `npm run db:migrate` (development) or `npm run db:deploy`
   (production/CI — applies existing migrations only).
3. Start the API (`npm run dev:api`) and check `GET /api/health` reports
   `"database": "connected"`.

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
| `npm run test:api` | API integration tests against a PostgreSQL test database (see [Tests](#tests)) |
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
| `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | Implemented, see [Authentication](#authentication) |
| `/api/workflows` | Placeholder (501). `POST /` already validates its body (`400 VALIDATION_ERROR`) |
| `/api/executions`, `/api/integrations`, `/api/users`, `/api/workspaces` | Placeholder (501) |
| Anything else | `404 NOT_FOUND` |

Other handled errors: invalid JSON (`400 INVALID_JSON`), oversized body
(`413 PAYLOAD_TOO_LARGE`), disallowed browser origin (`403 CORS_ORIGIN_DENIED`), too many
attempts (`429 RATE_LIMITED`), unexpected
errors (`500 INTERNAL_SERVER_ERROR`, with stack traces only outside production).

The frontend calls the API through `src/lib/api.ts`:

```ts
import { api, ApiError } from "@/lib/api"

const health = await api.get<{ status: string }>("/health")
// api.post / api.put / api.patch / api.delete; failures throw ApiError (status, code, details)
```

## Authentication

### Strategy

Server-side sessions with an HttpOnly cookie:

- On sign-in the API creates a random 256-bit token, sends it in the cookie and stores only
  its **SHA-256 hash** in the `sessions` table. A database leak doesn't expose usable
  sessions, and sign-out or revocation is just deleting the row.
- Chosen over JWTs because sessions can be revoked immediately and no token is ever readable
  by JavaScript. The frontend reaches the API on the same origin (Vite proxy in development,
  reverse proxy in production), so cookies fit naturally. No signing secret is needed.
- Passwords are hashed with **Argon2id** (19 MiB, 2 iterations, 1 lane — the OWASP minimum).
  Plaintext passwords are never stored or logged.

Cookie (`jeovely_session` in development, `__Host-jeovely_session` in production):
`HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` = `SESSION_TTL_DAYS`, and `Secure` in
production (the `__Host-` prefix makes browsers enforce that).

CSRF protection is layered: `SameSite=Lax` keeps the cookie off cross-site requests; the
API rejects any request whose `Origin` isn't in `FRONTEND_URL` (`403`) before it reaches a
handler; and request bodies are JSON-only.

### Endpoints

| Endpoint | Body | Success | Errors |
|---|---|---|---|
| `POST /api/auth/register` | `{ name, email, password }` | `201 { user }` and session cookie (signs the user in) | `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`, `429 RATE_LIMITED` |
| `POST /api/auth/login` | `{ email, password }` | `200 { user }` and a new session cookie | `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED` |
| `GET /api/auth/me` | — | `200 { user }` | `401 UNAUTHENTICATED` |
| `POST /api/auth/logout` | — | `200 { signedOut: true }`, cookie cleared, session deleted | — (idempotent) |

`user` is always `{ id, email, name, avatarUrl, createdAt }`, never a password or hash.

Rules:
- Emails are trimmed and lower-cased; uniqueness is enforced by the database.
- Passwords: 10–128 characters, at least one letter and one number. Every failed rule is
  reported in `error.details`.
- Login returns the same `401 Invalid email or password` for an unknown email and a wrong
  password, with similar timing (a dummy hash is verified for unknown emails).
- Rate limits per IP: 10 registrations per hour; 10 **failed** sign-ins per 15 minutes
  (successful sign-ins don't count).

From the frontend, use the existing client. The cookie is sent automatically:

```ts
await api.post("/auth/login", { email, password })
const { user } = await api.get<{ user: User }>("/auth/me")
```

### Tests

```bash
npm run test:api
```

Runs the `node:test` suites in `server/src/**/*.test.ts` against a **real PostgreSQL test
database**. The runner (`server/src/test/run-tests.ts`) uses `TEST_DATABASE_URL`, or
`DATABASE_URL` with `_test` appended to the database name. It creates that database if
missing (the role needs `CREATEDB`; otherwise create it yourself), applies migrations with
`prisma migrate deploy`, and runs the tests. It refuses any database whose name doesn't
end in `_test`, because tests delete all rows between cases.

Covered: registration (success, duplicate email, invalid input, weak passwords, rate limit),
login (success, generic invalid-credentials error, session rotation, rate limit), `/me`
(no session, forged token, valid session, expired session), logout (session deleted, cookie
cleared, idempotent, cross-origin request rejected), plus health, 404 and 501 routes.

### Known limitations

- Rate-limit counters are in memory, per API process. Running several API instances needs a
  shared store (for example Redis).
- `409 EMAIL_TAKEN` on registration reveals that an email has an account (login doesn't).
  Hiding this properly needs email verification, which is planned.
- Not yet implemented: email verification, password reset, "sign out everywhere",
  account lockout beyond rate limiting, and the frontend sign-in UI.

## Implementation status

### Implemented
- Marketing website: Liquid Metal hero, navbar with mobile menu, features, how it works,
  testimonial, pricing, final CTA, footer; light/dark mode; reduced-motion support;
  accessibility work (skip link, focus states, labelled landmarks, contrast-checked colours).
- Express API foundation: environment validation, helmet, CORS allow-list, JSON body limit,
  request logging, consistent response/error format, 404 handling, zod request validation,
  graceful shutdown.
- `GET /api/health`, including a database connectivity check.
- Authentication backend (stage 1): register, login, current user and logout with
  database-backed sessions, Argon2id hashing, rate limiting and integration tests.
- Route structure for workflows, executions, integrations, users and workspaces.
  These return 501 for now.
- Prisma schema and migrations for users, sessions, workspaces, members, workflows, steps
  and executions.
- Frontend API client with typed errors and an environment-based base URL.

### Planned (not implemented)
- Authentication stage 2: sign-in/sign-up UI, email verification, password reset,
  OAuth providers.
- Dashboard and app UI, workflow builder.
- Workflow CRUD, triggers, actions and the execution engine; execution history.
- Integrations and credential storage.
- Analytics, team/workspace management, settings.
- AI-assisted workflow creation.
