# @carbadapt/fixtures

Demo athletes and scenarios, as TypeScript, loaded into MySQL by the Prisma seed. The build plan proposes Ana, Bruno, Carla, Dani, and Eli so every screen has a state to show. That list is still a proposal.

## What goes here

Typed fixture modules (one per athlete, plus shared foods). Dates are offsets from the day the seed runs, so Home and the calendar stay current. Computed outputs (plans, ladders, loading days) are hand-made and marked `engineVersion: "fixture"` until M3.

## What must NOT go here

- The Prisma schema or the seed runner (`packages/db` owns `prisma db seed`; it imports this package).
- Calc functions (`packages/engine`).
- HTTP responses. The API reads MySQL after the seed; it does not import fixtures in production paths.
- Screen components.

## Milestone

M1, after Francisco reviews the proposed seed cases. This step adds the folder so fixture data does not end up inside the API or the schema file. No rows are authored yet.

This package is in the workspace even though the short step-1 list did not name it. The agreed layout puts mock data here, separate from `packages/db`.
