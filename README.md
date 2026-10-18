# CarbAdapt

CarbAdapt is an app for endurance fueling and gut training. This repository is the MVP: a Next.js web app and a separate Node API first, with iOS and Garmin Connect IQ later. Everything here runs on localhost. There is no deploy in this phase.

This step is the scaffold only. It shows where each kind of code will live. There is no product screen, no database model, no seed, and no fueling logic yet.

## Architecture

Two processes and MySQL:

| Process    | Role                                                                                         | Port             |
| ---------- | -------------------------------------------------------------------------------------------- | ---------------- |
| `apps/web` | Next.js UI. Renders screens and calls the API.                                               | `127.0.0.1:3000` |
| `apps/api` | Express API. The only HTTP server iOS and Garmin will share. Zod validates input and output. | `127.0.0.1:4000` |
| MySQL 8.4  | Application data, via Prisma in `packages/db`. Docker Compose, bound to localhost.           | `127.0.0.1:3306` |

The API is separate from Next.js so the same server can later hold sessions, webhooks, and the device API without living inside the web deploy. A worker process is added in M4 for queues and timers. It is not running now.

Mock data, when it arrives, is authored in `packages/fixtures` and loaded into MySQL by a Prisma seed. The first screens read that data through the API. External accounts (Strava, TrainingPeaks, email) are not connected in the mock phase.

## Folder map

```
apps/
  web/            Next.js App Router. Placeholder page only.
  api/            Express. GET /health only.
  worker/         Placeholder. Job runner in M4. Not a workspace package yet.
  ios/            Placeholder. SwiftUI in M5. Not a workspace package yet.
  garmin-ciq/     Placeholder. Connect IQ data field after M5. Not a workspace package yet.
packages/
  config/         Base tsconfig and Prettier. ESLint flat config is the repo-root file.
  db/             Prisma schema (datasource + generator only) and the client export.
  fixtures/       Demo data for the seed. Empty until M1.
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

## Local setup

Requires Node.js 22 or newer, pnpm 10 (the `packageManager` field pins 10.33.4; Corepack will use it), and Docker.

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:validate
pnpm dev:web
pnpm dev:api
```

`pnpm install` also generates the Prisma client (`pnpm db:generate`). The schema has no models, so the client exposes no tables.

Open the web placeholder at [http://127.0.0.1:3000](http://127.0.0.1:3000). The API liveness check is [http://127.0.0.1:4000/health](http://127.0.0.1:4000/health) and returns `{"status":"ok"}`.

`pnpm dev` runs web and api together. `pnpm db:down` stops MySQL. `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` cover the workspace.

`.env.example` matches the Compose defaults (`carbadapt` / `carbadapt` on database `carbadapt`). Those passwords are for this local database only. Compose reads `.env` for variable substitution. Prisma commands load the same file. Next.js does not: the root `.env` holds `DATABASE_URL`, which must not be bundled into the browser. The placeholder uses `http://127.0.0.1:4000` unless `apps/web/.env.local` sets `NEXT_PUBLIC_API_URL`.

## Choices to confirm

- **pnpm, without Turborepo.** The build plan names pnpm workspaces and Turborepo. pnpm is already the package manager in that plan, and it is stricter about which package can import what. Turborepo is left out until there is a task graph worth caching. `pnpm dev` runs the two processes with pnpm's own parallel filters.
- **Extra folders.** `packages/fixtures`, `packages/config`, and `docs/` are in the agreed layout and were not in the shortest step-1 list. Fixtures exist so demo data does not land in the API. Config holds the shared tsconfig and Prettier file. `apps/worker`, `apps/ios`, and `apps/garmin-ciq` have a README only, so pnpm does not try to install them.
- **Prisma 6.19, not 7 and not the 5.22 cited in the plan.** The schema still uses `url = env("DATABASE_URL")` inside the datasource block, which is the shape the plan's schema uses. Prisma 7 moves that URL out of the schema file. Prisma 8 is a release candidate. Stay on 6 until a schema PR chooses otherwise.
- **TypeScript 5.9.** TypeScript 6 and 7 are published. `typescript-eslint` 8.71 does not accept TypeScript 7 (`<6.1`), so the repo is pinned to 5.9.
- **Next.js 16, React 19, Express 5, Zod 4.** Current stable lines. Zod 4 is the validation library named in the plan.
- **MySQL image `mysql:8.4`**, localhost only, utf8mb4. `GET /health` does not ping the database.
- **No Tailwind yet.** Tokens will land as CSS variables first. See `packages/design-tokens/README.md` and the extraction steps in `apps/web/README.md`.
- **Board 4 of the design file is marked "earlier draft"** inside the gallery. The extraction notes treat it as non-canonical.

Still open from the build plan, and not decided here: a centered 390px column on desktop versus new desktop layouts, and the proposed seed athletes.
