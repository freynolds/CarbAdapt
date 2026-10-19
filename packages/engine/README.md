# @carbadapt/engine

Pure TypeScript calculations shared by the API and, later, the worker. No I/O.

## What goes here

One module per rule set from the build plan: `fueling`, `ladder`, `adaptation`, `startingPoint`, `carbLoading`, `stageRecovery`, `sweatRate`, `achievements`, `schedule`, `sweatScheduling`. Each function takes plain values and returns plain values plus `engineVersion`. Unit tests and golden tests live next to the module.

## What must NOT go here

- Prisma, SQL, or fixture stories.
- HTTP, env vars, or the current time (`Date.now()`). A caller that needs "today" passes a date in.
- React components or copy catalogs.
- Provider-specific payload shapes (`packages/integrations`).

## Status

The pure functions and `src/engine.test.ts` are in place. Seeded fixture rows still use `engineVersion = "fixture"`. Rows written by the API use `ENGINE_VERSION` from `src/version.ts`. Anything the product docs do not specify is a `TBD` null in `src/tbd.ts`, and the caller shows "not set".
