# @carbadapt/fixtures

Demo athletes and scenarios, as TypeScript, loaded into MySQL by the Prisma seed.

## What goes here

Typed fixture modules. Dates are offsets from the day the seed runs, so a later calendar stays current. Computed outputs (fueling plans, ladders, loading days, recovery plans) are hand-made and marked `engineVersion: "fixture"` until `packages/engine` exists.

Ana, Bruno, and Carla are seeded. Eli and Dani stay out until a later step.

| File              | Role                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| `src/clock.ts`    | Seed-run clock. Buenos Aires calendar, UTC−3, no daylight saving.             |
| `src/domain.ts`   | Hand-made arithmetic used to fill computed rows. Not the M3 engine.           |
| `src/foods.ts`    | Static USDA FoodData Central sample. FDC ids are kept.                        |
| `src/bag.ts`      | The in-memory seed graph and the builders for fueling, loading, and recovery. |
| `src/athletes.ts` | Ana, Bruno, and Carla. `seedAthletes` is the only entry.                      |
| `src/index.ts`    | `buildSeed(now)` returns the graph.                                           |

## What must NOT go here

- The Prisma schema or the seed runner (`packages/db` owns `npm run db:seed`; it imports this package).
- Calc functions (`packages/engine`).
- HTTP responses. The API reads MySQL after the seed; it does not import fixtures on a production path.
- Screen components.

## Milestone

| When      | What lands                                            |
| --------- | ----------------------------------------------------- |
| Step 1    | Empty package, so demo data would not land in the API |
| Step 3    | Fixture format, Ana, and the USDA sample              |
| This step | Bruno and Carla                                       |
| Later     | Eli and Dani                                          |
