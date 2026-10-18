# @carbadapt/engine

Pure TypeScript calculations shared by the API and, later, the worker. No I/O.

## What goes here

One module per rule set from the build plan: `fueling`, `ladder`, `adaptation`, `startingPoint`, `carbLoading`, `stageRecovery`, `sweatRate`, `achievements`, `schedule`, `sweatScheduling`. Each function takes plain values and returns plain values plus `engineVersion`. Unit tests and golden tests live next to the module.

## What must NOT go here

- Prisma, SQL, or fixture stories.
- HTTP, env vars, or the current time (`Date.now()`). A caller that needs "today" passes a date in.
- React components or copy catalogs.
- Provider-specific payload shapes (`packages/integrations`).

## Milestone

M3. Until then, fueling plans, ladders, loading days, and recovery plans are hand-made rows with `engineVersion = "fixture"`. Do not start the formulas in this package before the mock screens exist, unless a PR is explicitly the engine milestone.
