# @carbadapt/db

Prisma schema, the generated client, and migrations. MySQL 8.4 runs in Docker from the repo-root `docker-compose.yml`. The client is re-exported from `src/index.ts` so the rest of the repo has one import path.

## What goes here

- `prisma/schema.prisma`. The models from [PR #2](https://github.com/freynolds/CarbAdapt/pull/2), on Prisma 6.19.
- `prisma/migrations/`. The first migration is `init`.
- `prisma/seed.ts` and `src/insert-seed.ts`. They load `packages/fixtures` into MySQL. The seed replaces application rows, so running it again is safe and refreshes dates from the new run. It does not touch `_prisma_migrations`.
- A thin client wrapper around `PrismaClient` when the first caller needs a shared connection. Today the export is the class plus `insertSeed`. `package.json` `exports` points at `src/index.ts` so other workspaces can import `@carbadapt/db`.

`scripts/run-prisma.mjs` loads the repo-root `.env` and then runs the Prisma CLI. `generate` and `validate` do not connect to MySQL. They need `DATABASE_URL` to be set, and fall back to the value in `.env.example` when `.env` is absent. `npm run db:migrate` runs `prisma migrate dev`. `npm run db:seed` inserts Ana and the USDA foods. `npm run db:reset` drops the database, applies migrations, and seeds. Both can be run twice.

## What must NOT go here

- Fueling formulas or other calc rules (`packages/engine`).
- The text of demo scenarios (`packages/fixtures`). The seed may import those files; it does not author them.
- HTTP routes (`apps/api`).
- Screen copy (`packages/i18n`).

## Schema compared with the build plan

The plan's §3 schema is the base. [PR #2](https://github.com/freynolds/CarbAdapt/pull/2) added or relaxed these fields so the approved seed cases fit. This step keeps those changes. The seed currently inserts Ana only.

1. `User.mode` is optional and has no default. The plan defaulted it to `FUEL_MY_WORKOUTS`. An athlete who has not chosen a mode needs the null.
2. `SweatTest.movedFrom` stores the calendar date a test was moved off a loading day.
3. `PostWorkoutLog.ladderEligible` marks a logged session that is too short to move a ladder. `countsForPlan` stays the late-entry flag.
4. `Workout.stageId` is an optional unique link to the stage whose fueling plan lives on that workout. `Stage.workout` is the back-relation.
5. `FoodItem.sodiumMgPer100g` stores USDA nutrient 307 so recovery sodium can name a broth.
6. `Race.startAt` stores the start instant. Breakfast guidance needs it. The add-race form in the screen spec does not.
7. `Activity.workout`, `SweatTest.workout`, and `GutTrainingPlan.race` set `onDelete: SetNull`. The plan left the action off. Prisma's default for an optional relation is `SetNull`, so this writes that default into the schema and the migration.

## Changes from PR #2's schema

PR #2 used Prisma 5.22 and generated the client into `packages/db/src/generated/client`. This repo stays on Prisma 6.19, which still keeps `url = env("DATABASE_URL")` in the schema. The generator has no custom `output`, so `src/index.ts` keeps importing `PrismaClient` from `@prisma/client`. The initial migration is regenerated with Prisma 6.19. The seed uses that same client. It does not use the generated folder from PR #2.

`docker/mysql-init.sql` grants the local MySQL user privileges beyond its own database so `prisma migrate dev` can create a shadow database. The image stays `mysql:8.4`, bound to `127.0.0.1`. The grant applies only when the data volume is created.

## Milestone

| When      | What lands                                   |
| --------- | -------------------------------------------- |
| Step 1    | Datasource, generator, client export         |
| Step 2    | Models and the first migration               |
| This step | Seed and reset. Ana and the USDA food sample |
| Later     | The other demo athletes                      |
