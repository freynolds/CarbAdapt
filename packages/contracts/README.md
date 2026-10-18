# @carbadapt/contracts

The API contract: the document clients generate from, not the Express implementation.

## What goes here

- OpenAPI 3.1 for the REST API.
- A generated TypeScript client for `apps/web` (and, in M5, the source for the Swift client).
- The device protocol JSON schema.
- Webhook payload fixtures replayed in CI.

Zod schemas that validate a single request stay next to the route in `apps/api`. When a schema is the public contract, it is generated from or checked against this package, not hand-copied.

## What must NOT go here

- Express routers, Prisma models, or calc functions.
- Live provider calls.

## Milestone

The first spec is written when the mock endpoints in M1 have a stable response shape. It is frozen at M5, when iOS generates a Swift client. Webhook fixtures arrive in M4.
