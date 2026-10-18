# @carbadapt/api

The HTTP API. One process, Express, shared later by the web app, iOS, and Garmin. This step serves a liveness check and nothing else.

## What goes here

- `src/index.ts` listens. `src/app.ts` builds the Express app.
- `src/routes/` maps a URL to a controller. One router per area once endpoints exist.
- `src/controllers/` reads the request, calls a service, and writes the response.
- `src/schemas/` holds Zod schemas for params, bodies, and responses.
- `src/services/` holds use-cases. Empty in this step.
- `src/middleware/` holds the 404 and error handlers. Auth middleware arrives with real sessions.

`GET /health` returns `{ "status": "ok" }`. It does not ping MySQL.

## What must NOT go here

- Fueling, ladder, loading, or sweat-rate math (`packages/engine`).
- The Prisma schema, migrations, or seed (`packages/db`). Hand-written fixture stories (`packages/fixtures`).
- Provider HTTP clients (`packages/integrations`, M4).
- Screen markup, CSS, or user-facing copy (`apps/web`, `packages/i18n`).
- OpenAPI documents (`packages/contracts`).
- Background jobs and timers (`apps/worker`, M4). No Redis and no queue in the mock phase.

## Milestone

| When                              | What lands                                                     |
| --------------------------------- | -------------------------------------------------------------- |
| This step (scaffold, slice of M0) | Process, folder boundaries, `GET /health`                      |
| M1                                | Mock read endpoints and the simple writes, plus dev-only login |
| M3                                | Real validation, sessions, magic link                          |
| M4                                | OAuth callbacks, webhooks, notification endpoints              |

CORS is not enabled yet. Add it when the web app starts calling this process from the browser.
