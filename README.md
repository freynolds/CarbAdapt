# CarbAdapt

Web app and API for endurance fueling and gut training. This tree is the mock-data phase (milestones M0 and M1): a Next.js shell, an Express API, and MySQL seeded from typed fixtures. Nothing here calls Strava, TrainingPeaks, Garmin, Redis, or a worker.

iOS is not in this phase.

## Run locally

Requirements: Node 20+, pnpm 10, and Docker (MySQL 8).

```bash
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/health

`pnpm db:up` starts MySQL from `docker-compose.yml` (`carbadapt` / `carbadapt` on port 3306). The first boot grants that user enough rights to drop and recreate the database, which `pnpm db:reset` needs. If the volume already existed before that grant, recreate it with `docker compose down -v && pnpm db:up`.

Other commands:

| Command | What it does |
| --- | --- |
| `pnpm db:validate` | `prisma validate` |
| `pnpm db:migrate` | `prisma migrate deploy` |
| `pnpm db:seed` | Insert the fixture graph. Fails if those ids already exist. |
| `pnpm db:reset` | Drop the database, migrate, and seed. Safe to run twice. |
| `pnpm db:down` | Stop MySQL |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Workspace checks |

`POST /dev/reset` truncates application tables and reseeds without dropping the schema. It is local only (`NODE_ENV` must not be `production`).

Demo sign-in is `POST /dev/login-as` with `{ "athlete": "ana" | "bruno" | "carla" | "eli" | "dani" }`. The response token is also set as the `carbadapt_session` cookie. Send `Authorization: Bearer <token>` on later calls.

## Layout

```
apps/web            Next.js shell (health, theme, athlete switch). Screens are a later milestone.
apps/api            Express + Zod. Mock reads and the simple writes listed in the plan.
apps/worker         Stub. M4.
apps/ios            Stub.
apps/garmin-ciq     Stub.
packages/db         Prisma schema, migration, seed.
packages/fixtures   Typed demo data. Dates roll from the seed-run clock.
packages/i18n       EN source, plus draft ES and PT.
packages/design-tokens
packages/engine     Stub. M3.
packages/contracts  Stub. OpenAPI 3.1 later.
packages/integrations  Stub. M4.
```

Hand-made fueling plans, gut plans, adaptation decisions, and stage-recovery plans are tagged `engineVersion = "fixture"`.

## Schema changes from the plan

The plan schema is the base. These fields were added or relaxed so the approved seed cases fit. `prisma validate` covers the result.

1. `User.mode` is optional and has no default. Dani has not chosen a mode.
2. `SweatTest.movedFrom` stores the calendar date a test was moved off a loading day.
3. `PostWorkoutLog.ladderEligible` marks a logged session that is too short to move a ladder. `countsForPlan` stays the late-entry flag.
4. `Workout.stageId` is an optional unique link to the stage whose fueling plan lives on that workout.
5. `FoodItem.sodiumMgPer100g` stores USDA nutrient 307 so recovery sodium can name a broth.
6. `Race.startAt` stores the start instant. Breakfast guidance needs it; the add-race form in the screen spec does not.

`Activity.workout`, `SweatTest.workout`, and `GutTrainingPlan.race` use `onDelete: SetNull`. That matches Prisma's optional-relation default; it is written out so the migration states it.

## Assumptions

These are fixture and mock-API choices, not new product rules.

- Every demo athlete uses `America/Argentina/Buenos_Aires` (fixed UTC−3). "Today" is that zone's calendar date, stored as UTC midnight.
- Race type strings are placeholders: `gran_fondo`, `road_race`, `half_marathon`, `trail_stage`, `road_stage`.
- Sweat-test workouts use workout type `BASE` (the closest of the five types to an easy effort) and kind `SWEAT_TEST`.
- The last stage of a race has no recovery plan.
- In-stage fluid drunk is a scenario choice, not a recommendation.
- During-exercise fluid in a fixture fueling plan replaces sweat 1:1. That is not an ACSM prescription.
- Fuel-mode grams per hour, which the plan leaves open, are 60 g/h up to 150 minutes and 90 g/h after that (top of the cited bands).
- Loading meal splits use the research example 22/13/27/15/18/5 percent. Lunch absorbs rounding drift.
- Protocol grams per kilo use the low end of the band named in the plan. A gran fondo of at least 4 hours is two days at 10 g/kg. A road race of 2.5–4 hours is one day at about 10 g/kg and has no D−2 row. A 90 min–2.5 h effort is two days at 5 then 7 g/kg.
- Race breakfast is derived when the API is read. It is not a stored row. A start before 08:00 in the athlete's zone uses 1.5 g/kg (upper end of the early/sensitive range). Any other start, including a missing start time, uses 2 g/kg. Fluid is 5 ml/kg, all of it the demo isotonic (800 mg sodium per litre). Water remainder is 0. Grams are rounded to the nearest gram.
- Recovery stops feeding 30 minutes before the next start. Short-gap carbs are 1.0 g/kg/h. A sensitive stomach uses 0.8 g/kg/h carbs and 0.3 g/kg/h protein. The first protein intake is 0.3 g/kg. A 4–12 hour gap feeds the first 4 hours at 1.0 g/kg/h plus a 1 g/kg pre-start meal, and two protein servings of 0.3 g/kg. Hours in the middle are "normal meals" with no extra grams. Overnight and rest-day protein targets are null because a serving count is not specified. Hydration replaces 125% of the deficit and does not carry to the next stage. Sodium is 1150 mg/L; the demo drink covers 800 mg/L and the rest is broth or salty food.
- Carla's stage 1 to stage 2 is a 75-minute same-morning gap. The morning/afternoon pair is stages 3 and 4 the next day.
- Bruno's in-race fueling uses his tolerated 100 g/h.
- Eli's date-target gut plan stays active while her mode is Fuel my workouts, so the plan endpoint still returns it. `GET /gut-plan` returns the active plan, or the newest plan when none is active, so Bruno's completed ladder is still readable.
- Carla has a connected Strava row so a later stage webhook has somewhere to land. Dani has Strava workout and activity rows and no provider connection: those rows are a starting-point fixture, not a live link.
- Duplicate providers are one Strava activity whose summary names the other provider's external id. `Activity.workoutId` stays unique.
- Symptom charts store the same rating on upper, lower, and systemic so the three series do not disagree.
- To-do tiers are an assumption: calibration covers sip calibration, sip validation, and sweat test; highest covers feedback, strategy, conflict, rehearsal, and estimate g/h; lower covers profile, bottle, race, and calendar.
- Provider tokens in the seed are the placeholder `fixture-not-a-real-token`. `GET /connections` always returns Garmin, TrainingPeaks, and Strava, and never returns tokens.
- Simple creates store what the client sends. They do not build fueling plans, loading days, or ladders. Manual workouts created by the API set `externalId` to the row id so the unique `(source, externalId)` index stays usable. Seeded manual workouts leave `externalId` null; MySQL allows many nulls.
- `POST /dev/reset` truncates and reseeds. `pnpm db:reset` drops the database.
- Signing in as a deleted demo athlete clears `deletedAt`.
- Resolving a conflict as "synced" copies the number onto physical data only when the field is `ftp`.
- Completing a sweat test writes the computed rate onto physical data and sets the source to `sweat_test`.
- A gut-plan preview only flags the documented 60 → 120 g/h within 14 days case. The later date is 35 days out. No lower goal in grams is returned. Other ladders wait for M3. A goal above 200 g/h is rejected. A goal above 120 g/h is saved and flagged.
- The unknown starting point is 1 g/kg, capped at 60, and is not stored. A known starting point is the highest g/h among the none or mild sessions the client sends, rounded to the nearest gram, and is not stored.
- Replacing a race's stages deletes recovery plans that belonged to the old stages.
- Progress streak counts recent logs that have a current plan, an intake, and none or mild on all three symptom fields, and whose intake is at least the plan's carbs. A log with no plan is skipped. The first log that misses the intake or the symptom bar ends the streak.
- Product delete looks only at current fueling plans whose workout is today or later.
- Demo product macros are illustrative and marked `label.illustrative`. They are not commercial labels.
- USDA rows are FoodData Central SR Legacy. FODMAP is not a USDA field. Tags exist only where the carb-loading note names the food, plus chocolate milk (milk/lactose), firm-banana for the generic raw banana row, and oats in moderate portions. Cornmeal is the dry degermed yellow row. Eight foods are marked `precision: "abridged"` because the abridged endpoint rounds some figures; the rest were read from the full food endpoint. Portion grams are the first portion the API returned, including odd ones such as "1 tbsp" of egg and "1 cup lasagne" of pasta. Missing portions stay null.
- Spanish and Portuguese catalogs, including push lines, are draft translations of the English source.
- Notifications are not seeded.
- The web shell is not the screen map. It only proves the API, the theme, and athlete switching.

## Not in this phase

Magic-link auth, OAuth, webhooks, notifications, admin, product scan, and the calculation engine.
