# @carbadapt/api

The HTTP API. One Express process, shared later by the web app, iOS, and Garmin. Domain code lives in modules. Each module has a mock, a staging, and a production implementation, chosen at startup from `APP_ENV`.

`src/index.ts` binds `API_HOST` and `API_PORT` from the root `.env`. The Zod defaults are `127.0.0.1` and `4050`. There is no CORS allowlist and no cookie origin list.

## Layout

| Path                  | Role                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `src/index.ts`        | Reads config and listens.                                                              |
| `src/config/env.ts`   | Zod-validated config. `APP_ENV` is `mock`, `staging`, or `production`. Default `mock`. |
| `src/compose.ts`      | Composition root. Builds every service from its factory and mounts every router.       |
| `src/app.ts`          | Express shell: JSON, composed routes, 404, error handler.                              |
| `src/http/health.ts`  | `GET /health`. Liveness only. Not a domain module.                                     |
| `src/modules/<name>/` | One domain. See the table below.                                                       |
| `src/middleware/`     | 404 and the JSON error handler.                                                        |
| `src/http/session.ts` | Mock session cookie and `Authorization: Bearer`. Real magic-link auth is later.        |

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

Mock services read MySQL through Prisma for the signed-in athlete. Response bodies are checked with the Zod schemas in `packages/contracts` before they are sent. Failures throw `HttpError` with an `HttpErrorCode`. Staging and production call `unimplemented()`, which throws `HttpErrorCode.NotImplemented`, so the process does not finish booting in those environments.

`GET /health` returns `{ "status": "ok" }`. It does not check MySQL. `auth` (magic link) and `notifications` still have no routes.

Signed-in routes need the `carbadapt_session` cookie or `Authorization: Bearer <token>`. Both come from `POST /dev/login-as`. `GET /foods` is the shared USDA list and does not need a session.

## Endpoints

Dev routes are mounted only when `APP_ENV=mock`.

| Method | Path                              | Module          | Body                                                                    |
| ------ | --------------------------------- | --------------- | ----------------------------------------------------------------------- |
| POST   | `/dev/login-as`                   | `dev`           | `{ token, user }` and a session cookie. Body is `{ "athleteId" }`.      |
| GET    | `/dev/athletes`                   | `dev`           | `{ athletes: [{ athleteId, email, name, mode, timezone, deletedAt }] }` |
| POST   | `/dev/reset`                      | `dev`           | `{ ok: true, seededAt }`. Truncates and runs `insertSeed`.              |
| GET    | `/me`                             | `profile`       | `{ user, physical, subscription }`                                      |
| GET    | `/me/physical-data`               | `profile`       | `{ physical }`                                                          |
| GET    | `/me/conflicts`                   | `profile`       | `{ conflicts }`                                                         |
| GET    | `/connections`                    | `connections`   | Garmin, TrainingPeaks, and Strava. Tokens are omitted.                  |
| GET    | `/containers`                     | `gear`          | `{ containers }`, each with calibrations                                |
| GET    | `/containers/:id`                 | `gear`          | `{ container }`                                                         |
| GET    | `/products`                       | `products`      | `{ products }` for this athlete, excluding deleted rows                 |
| GET    | `/products/:id`                   | `products`      | `{ product }`                                                           |
| GET    | `/foods?query=`                   | `foods`         | `{ foods }`. No session. Precision is not on the row.                   |
| GET    | `/workouts?from=&to=`             | `workouts`      | `{ workouts }` on the calendar range. Dates are `YYYY-MM-DD`.           |
| GET    | `/workouts/:id`                   | `workouts`      | `{ workout }`, including the current fueling plan when one exists       |
| GET    | `/workouts/:id/fueling-plan`      | `fueling`       | `{ fuelingPlan }` or null                                               |
| GET    | `/workouts/:id/feedback`          | `questionnaire` | `{ log }` or null                                                       |
| GET    | `/gut-plan`                       | `gut-training`  | `{ plan }` with ladder steps, or null                                   |
| GET    | `/achievements`                   | `achievements`  | `{ achievements }`                                                      |
| GET    | `/achievements/pending`           | `achievements`  | Achievements with no `celebratedAt`                                     |
| GET    | `/achievements/progress`          | `achievements`  | Tolerated g/h, streak, achievements, and logged sessions                |
| GET    | `/sweat-tests`                    | `sweat-tests`   | `{ sweatTests }`                                                        |
| GET    | `/sweat-tests/:id`                | `sweat-tests`   | `{ sweatTest }`                                                         |
| GET    | `/races`                          | `races`         | `{ races }`, each with stages                                           |
| GET    | `/races/:id`                      | `races`         | `{ race }`                                                              |
| GET    | `/races/stages/:stageId/recovery` | `races`         | `{ recovery }` or null                                                  |
| GET    | `/races/:raceId/loading/:day`     | `carb-loading`  | Stored loading day. `:day` is `d-2` or `d-1`.                           |
| GET    | `/races/:raceId/breakfast`        | `carb-loading`  | Derived breakfast. Needs a weight. Not stored.                          |
| GET    | `/todos?status=`                  | `todos`         | `{ todos }`, highest tier first. `status` is optional.                  |
| GET    | `/home`                           | `home`          | User, hero workout, next sweat test, open to-dos, and counts            |

`GET /home` calls the other mock services. It does not query their tables itself. The hero is today's planned workout that has a current fueling plan: the first one in Fuel my workouts, or the long ride or run in Gut training.

## Modules

| Module          | Mount            | What it owns                                                 |
| --------------- | ---------------- | ------------------------------------------------------------ |
| `dev`           | `/dev`           | Local login, athlete list, and seed reset. Mock only.        |
| `auth`          | `/auth`          | Magic link, provider login, sessions, logout. No routes yet. |
| `profile`       | `/me`            | Account, locale, theme, physical data, conflicts             |
| `workouts`      | `/workouts`      | Planned and manual workouts                                  |
| `fueling`       | `/workouts`      | Fueling plan for a workout. Math stays in `packages/engine`  |
| `gear`          | `/containers`    | Bottles, flasks, bladders, sip calibration                   |
| `products`      | `/products`      | Product library                                              |
| `foods`         | `/foods`         | Static food list                                             |
| `races`         | `/races`         | Races, stages, aid stations, stage recovery                  |
| `carb-loading`  | `/races`         | Loading days and the derived race breakfast                  |
| `gut-training`  | `/gut-plan`      | Active plan, or the newest plan, and its ladder              |
| `sweat-tests`   | `/sweat-tests`   | Protocol rows. The rate is not recomputed on read.           |
| `questionnaire` | `/workouts`      | Post-workout log                                             |
| `achievements`  | `/achievements`  | g/h achievements and the progress summary                    |
| `notifications` | `/notifications` | Scheduled rows. No routes yet. Nothing is sent.              |
| `connections`   | `/connections`   | TrainingPeaks, Strava, and Garmin status                     |
| `todos`         | `/todos`         | To-do rows                                                   |
| `home`          | `/home`          | Composed home payload. No table of its own.                  |

Fueling and questionnaire share `/workouts` with workouts, and carb loading shares `/races` with races. Stages stay inside `races`. Webhooks land in `connections` in M4. The HTTP module is not `packages/integrations`; that package remains the provider adapters.

## Add a module

1. Copy `src/modules/products/` to `src/modules/<name>/` and rename the files and types.
2. Put the service methods in `<name>.service.ts`. Re-export response schemas from `packages/contracts` in `<name>.schema.ts`. Keep request schemas next to the route.
3. Implement `impl/mock`. Leave `impl/staging` and `impl/production` on `unimplemented()` until that environment is real.
4. Register the factory and mount the router in `src/compose.ts`.
5. Add a `node:test` next to the router if the module has a route.

## Switch environment

Set `APP_ENV` in the root `.env` (`mock`, `staging`, or `production`) and restart the API. The dev script loads that file. Unset means `mock`.

```bash
APP_ENV=mock npm run dev:api
npm test
```

`staging` and `production` throw `HttpErrorCode.NotImplemented` while composing services, so the listener never starts. `mock` is the only environment that serves traffic today. `POST /dev/reset` replaces application rows. `npm run db:reset` drops the database.

## What must NOT go here

- Fueling, ladder, loading, or sweat-rate math (`packages/engine`).
- The Prisma schema, migrations, or seed (`packages/db`). Fixture stories (`packages/fixtures`).
- Provider HTTP clients (`packages/integrations`, M4). This process calls them later; it does not reimplement them.
- Screen markup or user-facing copy catalogs (`apps/web`, `packages/i18n`). Copy in responses uses US English (`fueling`, `liter`, `diarrhea`).
- OpenAPI documents. Response Zod schemas live in `packages/contracts`. This package imports them.
- Background jobs (`apps/worker`, M4). No Redis and no queue in the mock phase.

## Milestone

| When      | What lands                                                           |
| --------- | -------------------------------------------------------------------- |
| Step 1    | Module boundaries, env switch, `GET /health`                         |
| This step | Mock reads from MySQL, dev login, and `GET /home`                    |
| Later     | Simple writes, then real sessions and magic link                     |
| M3        | Engine-backed plans                                                  |
| M4        | OAuth, webhooks, notification dispatch, staging and production impls |

CORS is not enabled yet. Add it when the web app starts calling this process from the browser.
