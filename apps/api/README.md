# @carbadapt/api

The HTTP API. One Express process, shared later by the web app, iOS, and Garmin. Domain code lives in modules. Each module has a mock, a staging, and a production implementation, chosen at startup from `APP_ENV`.

## Layout

| Path                  | Role                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `src/index.ts`        | Reads config and listens.                                                              |
| `src/config/env.ts`   | Zod-validated config. `APP_ENV` is `mock`, `staging`, or `production`. Default `mock`. |
| `src/compose.ts`      | Composition root. Builds every service from its factory and mounts every router.       |
| `src/app.ts`          | Express shell: JSON, composed routes, 404, error handler.                              |
| `src/http/health.ts`  | `GET /health`. Liveness only. Not a domain module.                                     |
| `src/modules/<name>/` | One domain. See the table below.                                                       |
| `src/middleware/`     | 404 and the JSON error handler. Auth middleware arrives with real sessions.            |

A module folder looks like this:

```
src/modules/products/
  products.router.ts
  products.controller.ts
  products.service.ts          interface
  products.schema.ts           Zod
  products.factory.ts          picks an impl from APP_ENV
  impl/mock/products.service.ts
  impl/staging/products.service.ts
  impl/production/products.service.ts
```

`GET /products` is the one wired route. Its mock returns two hard-coded rows. Staging and production call `unimplemented()`, which throws `not implemented`, so the process does not finish booting in those environments. The other modules have the same shape with no routes. Their mock is an empty service. Their staging and production throw the same way.

`GET /health` returns `{ "status": "ok" }`. It does not check MySQL.

## Modules

| Module          | Mount            | What it will own                                            |
| --------------- | ---------------- | ----------------------------------------------------------- |
| `auth`          | `/auth`          | Magic link, provider login, sessions, logout                |
| `profile`       | `/me`            | Account, locale, theme, physical data                       |
| `workouts`      | `/workouts`      | Planned and manual workouts                                 |
| `fueling`       | `/workouts`      | Fueling plan for a workout. Math stays in `packages/engine` |
| `gear`          | `/containers`    | Bottles, flasks, bladders, sip calibration                  |
| `products`      | `/products`      | Product library. **Mock `GET /products` is implemented**    |
| `foods`         | `/foods`         | Static food list                                            |
| `races`         | `/races`         | Races, stages, aid stations, pre-race strategy              |
| `carb-loading`  | `/races`         | Loading days, race breakfast, rehearsal                     |
| `gut-training`  | `/gut-plan`      | Mode, g/h goal, ladder, starting-point estimate             |
| `sweat-tests`   | `/sweat-tests`   | Protocol, weights, result                                   |
| `questionnaire` | `/workouts`      | Post-workout feedback, add intake, last-session feedback    |
| `achievements`  | `/achievements`  | g/h achievements and the progress summary                   |
| `notifications` | `/notifications` | Scheduled rows. Nothing is sent in the mock phase           |
| `connections`   | `/connections`   | Connect and disconnect TrainingPeaks, Strava, later Garmin  |

Fueling and questionnaire share `/workouts` with workouts, and carb loading shares `/races` with races, because those are the URLs in the plan. The routers are empty, so nothing overlaps yet.

Stages stay inside `races`. Home and to-dos are not modules: they will compose other modules when those screens need an endpoint. Webhooks land in `connections` in M4. The HTTP module is not `packages/integrations`; that package remains the provider adapters.

## Add a module

1. Copy `src/modules/products/` to `src/modules/<name>/` and rename the files and types.
2. Put the contract in `<name>.service.ts` and the Zod shapes in `<name>.schema.ts`.
3. Implement `impl/mock`. Leave `impl/staging` and `impl/production` on `unimplemented()` until that environment is real.
4. Register the factory and mount the router in `src/compose.ts`.
5. Add a `node:test` next to the router if the module has a route.

## Switch environment

Set `APP_ENV` in the root `.env` (`mock`, `staging`, or `production`) and restart the API. The dev script loads that file. Unset means `mock`.

```bash
APP_ENV=mock pnpm dev:api
pnpm --filter @carbadapt/api test
```

`staging` and `production` throw `not implemented` while composing services, so the listener never starts. `mock` is the only environment that serves traffic today.

## What must NOT go here

- Fueling, ladder, loading, or sweat-rate math (`packages/engine`).
- The Prisma schema, migrations, or seed (`packages/db`). Fixture stories (`packages/fixtures`).
- Provider HTTP clients (`packages/integrations`, M4). This process calls them later; it does not reimplement them.
- Screen markup or user-facing copy catalogs (`apps/web`, `packages/i18n`). Copy in responses uses US English (`fueling`, `liter`, `diarrhea`).
- OpenAPI documents (`packages/contracts`).
- Background jobs (`apps/worker`, M4). No Redis and no queue in the mock phase.

## Milestone

| When      | What lands                                                           |
| --------- | -------------------------------------------------------------------- |
| This step | Module boundaries, env switch, mock `GET /products`, `GET /health`   |
| M1        | Mock reads and the simple writes on these modules                    |
| M3        | Real validation, sessions, magic link, engine-backed plans           |
| M4        | OAuth, webhooks, notification dispatch, staging and production impls |

CORS is not enabled yet. Add it when the web app starts calling this process from the browser.
