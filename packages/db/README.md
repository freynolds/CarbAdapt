# @carbadapt/db

Prisma schema, the generated client, migrations, and the seed entrypoint. MySQL 8.4 runs in Docker from the repo-root `docker-compose.yml`. The client is re-exported from `src/index.ts` so the rest of the repo has one import path.

## What goes here

- `prisma/schema.prisma`. This step has the `generator` and the `datasource` only.
- Migrations, once models exist (`prisma/migrations/`).
- The seed command that loads `packages/fixtures` into MySQL. Not written yet.
- A thin client wrapper around `PrismaClient` when the first model needs a connection.

`scripts/run-prisma.mjs` loads the repo-root `.env` and then runs the Prisma CLI. `generate` and `validate` do not connect to MySQL. They need `DATABASE_URL` to be set, and fall back to the value in `.env.example` when `.env` is absent.

## What must NOT go here

- Fueling formulas or other calc rules (`packages/engine`).
- The text of demo scenarios (`packages/fixtures`). The seed may import those files; it does not author them.
- HTTP routes (`apps/api`).
- Screen copy (`packages/i18n`).

## Milestone

| When        | What lands                                         |
| ----------- | -------------------------------------------------- |
| This step   | Empty schema, client generate, `prisma validate`   |
| Later in M0 | Models from the build plan and the first migration |
| M1          | Seed wired to `packages/fixtures`, and `db:reset`  |

Do not add models in a drive-by change. The schema in the build plan is a proposal Francisco reviews on its own.
