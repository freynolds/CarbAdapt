# CarbAdapt

CarbAdapt is an app for endurance fueling and gut training. This repository is the MVP: a Next.js web app and a separate Node API first, with iOS and Garmin Connect IQ later. Everything here runs on localhost. There is no deploy in this phase.

The scaffold shows where each kind of code will live. The database schema, its first migration, and a seed for one demo athlete (Ana) are in `packages/db`. The mock API reads that MySQL data for the signed-in athlete. There is no product screen and no fueling engine yet.

## Architecture

Two processes and MySQL:

| Process    | Role                                                                               | Port             |
| ---------- | ---------------------------------------------------------------------------------- | ---------------- |
| `apps/web` | Next.js UI. Renders screens and calls the API.                                     | `127.0.0.1:3000` |
| `apps/api` | Express API, one module per domain. Zod validates config and JSON.                 | `127.0.0.1:4000` |
| MySQL 8.4  | Application data, via Prisma in `packages/db`. Docker Compose, bound to localhost. | `127.0.0.1:3306` |

The API is separate from Next.js so the same server can later hold sessions, webhooks, and the device API without living inside the web deploy. A worker process is added in M4 for queues and timers. It is not running now.

Mock data, when it arrives, is authored in `packages/fixtures` and loaded into MySQL by a Prisma seed. The first screens read that data through the API. External accounts (Strava, TrainingPeaks, email) are not connected in the mock phase.

## Folder map

```
apps/
  web/            Next.js App Router. Placeholder page only.
  api/            Express modules. Mock reads from MySQL, plus local dev login.
  worker/         Placeholder. Job runner in M4. Not a workspace package yet.
  ios/            Placeholder. SwiftUI in M5. Not a workspace package yet.
  garmin-ciq/     Placeholder. Connect IQ data field after M5. Not a workspace package yet.
packages/
  config/         Base tsconfig and Prettier. ESLint flat config is the repo-root file.
  db/             Prisma schema, the first migration, the client export, and the seed.
  fixtures/       Demo data for the seed. Ana and the USDA food sample.
  engine/         Pure calc functions. Empty until M3.
  contracts/      OpenAPI and generated clients. Empty until the mock API settles.
  integrations/   Strava, TrainingPeaks, Garmin adapters. Empty until M4.
  i18n/           en / es / pt catalogs. Locale codes only, no strings yet.
  design-tokens/  Brand tokens. Pointer to the design file, no values copied yet.
design/
  carbadapt-screens.html   Screen source. See apps/web/README.md for the extraction plan.
docs/             ADRs and runbooks. Empty.
```

Each app and package README says what belongs there, what must stay out, and which milestone fills it in.

## API modules

`apps/api/src/modules/` has one folder per domain (auth, profile, workouts, fueling, gear, products, foods, races, carb loading, gut training, sweat tests, questionnaire, achievements, notifications, connections). Each folder has a router, a service interface, Zod schemas, and a factory. The factory picks `impl/mock`, `impl/staging`, or `impl/production` from `APP_ENV`.

`src/compose.ts` is the composition root: it builds every service from its factory and mounts every router. `GET /health` stays outside the modules. In mock mode the domain routes read MySQL for the signed-in athlete. `POST /dev/login-as`, `GET /dev/athletes`, and `POST /dev/reset` are mounted only when `APP_ENV=mock`. Staging and production throw `not implemented` while the services are built, so only `mock` finishes booting.

To add a module, copy `src/modules/products/`, then register its factory and router in `src/compose.ts`. Mount paths, and which plan areas share a prefix, are listed in `apps/api/README.md`.

Switch environment with `APP_ENV` in the root `.env`: `mock` (the default), `staging`, or `production`. Restart the API after changing it. `npm test` hits the mock routes against MySQL and checks that staging and production throw. The endpoint list is in `apps/api/README.md`.

## Local setup

Requires Node.js 22 or newer, npm 10 (the `packageManager` field pins 10.9.9), and Docker.

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:reset
npm run dev:web
npm run dev:api
```

`npm install` also generates the Prisma client (`npm run db:generate`). `npm run db:validate` checks the schema without migrating. `npm run db:migrate` applies migrations with `prisma migrate dev` and does not insert rows. `npm run db:seed` replaces application rows with Ana and the USDA foods, using dates relative to the run. `npm run db:reset` drops the database, migrates, and seeds. Both seed and reset can be run twice.

Open the web placeholder at [http://127.0.0.1:3000](http://127.0.0.1:3000). The API liveness check is [http://127.0.0.1:4000/health](http://127.0.0.1:4000/health) and returns `{"status":"ok"}`.

`npm run dev` runs web and api together. `npm run db:down` stops MySQL. `npm run lint`, `npm run typecheck`, `npm test`, and `npm run format:check` cover the workspace.

`.env.example` matches the Compose defaults (`carbadapt` / `carbadapt` on database `carbadapt`). Those passwords are for this local database only. Compose reads `.env` for variable substitution. Prisma commands load the same file. Next.js does not: the root `.env` holds `DATABASE_URL`, which must not be bundled into the browser. The placeholder uses `http://127.0.0.1:4000` unless `apps/web/.env.local` sets `NEXT_PUBLIC_API_URL`.

## Copy

User-visible English uses US spelling. Write `fueling`, `liter`, `diarrhea`, and the US form of every other word. Spanish and Portuguese are translated from that source. British spellings in `design/carbadapt-screens.html` are normalized to US English when strings are extracted. The catalog rules are in `packages/i18n/README.md`.

## Choices to confirm

- **npm workspaces, without Turborepo.** The build plan names pnpm workspaces and Turborepo. This repo uses npm. The `workspaces` array is `apps/web`, `apps/api`, and `packages/*`. `apps/worker`, `apps/ios`, and `apps/garmin-ciq` stay out even if a `package.json` is added there later. Turborepo is left out until there is a task graph worth caching. `npm run dev` starts web and api together.
- **Extra folders.** `packages/fixtures`, `packages/config`, and `docs/` are in the agreed layout and were not in the shortest step-1 list. Fixtures exist so demo data does not land in the API. Config holds the shared tsconfig and Prettier file.
- **Schema deltas from the plan.** `packages/db/README.md` lists the seven differences kept from PR #2 (`User.mode` optional, `SweatTest.movedFrom`, `PostWorkoutLog.ladderEligible`, `Workout.stageId`, `FoodItem.sodiumMgPer100g`, `Race.startAt`, and explicit `onDelete: SetNull` on three optional relations). The client stays on the default `@prisma/client` path.
- **Seed is Ana only.** Bruno, Carla, Eli, and Dani are still not in the database. Computed fixture rows use `engineVersion = "fixture"`.
- **Prisma 6.19, not 7 and not the 5.22 cited in the plan.** The schema still uses `url = env("DATABASE_URL")` inside the datasource block, which is the shape the plan's schema uses. Prisma 7 moves that URL out of the schema file. Prisma 8 is a release candidate. Stay on 6 until a schema PR chooses otherwise.
- **TypeScript 5.9.** TypeScript 6 and 7 are published. `typescript-eslint` 8.71 does not accept TypeScript 7 (`<6.1`), so the repo is pinned to 5.9.
- **Next.js 16, React 19, Express 5, Zod 4.** Current stable lines. Zod 4 is the validation library named in the plan.
- **MySQL image `mysql:8.4`**, localhost only, utf8mb4. `GET /health` does not ping the database.
- **No Tailwind yet.** Tokens will land as CSS variables first. See `packages/design-tokens/README.md` and the extraction steps in `apps/web/README.md`.
- **Board 4 of the design file is marked "earlier draft"** inside the gallery. The extraction notes treat it as non-canonical.

- **Mock reads, not the PR #2 writes.** This step serves the mock-phase reads (profile, physical data, connections, containers, products, foods, workouts, fueling plans, post-workout logs, gut plan, achievements, sweat tests, races, carb loading, stage recovery, to-dos, and `GET /home`). Creates, patches, and deletes from draft PR #2 are not ported.
- **Dev login takes `athleteId`.** `POST /dev/login-as` expects `{ "athleteId" }` (the user id, `usr_ana` after the seed), sets the `carbadapt_session` cookie, and also accepts `Authorization: Bearer`. `POST /dev/reset` calls `insertSeed`, which truncates and reseeds. It does not drop the database.
- **A few paths differ from PR #2** so they stay on the module mounts: progress is `GET /achievements/progress`, and stage recovery is `GET /races/stages/:stageId/recovery`.
- **Food responses omit USDA precision.** That flag lives only in `packages/fixtures`. The API does not import fixture stories on the read path.
- **Race breakfast is a mock derivation** in the carb-loading module (1.5 g/kg before 08:00 local, otherwise 2 g/kg, 5 ml/kg of the demo isotonic). It is not stored and it is not the M3 engine.

Still open from the build plan, and not decided here: a centered 390px column on desktop versus new desktop layouts, and the other proposed seed athletes.
