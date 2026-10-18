# @carbadapt/contracts

The API contract: the document clients generate from, not the Express implementation.

## What goes here

- Zod schemas for the mock API's response bodies. `apps/api` imports them and parses every JSON response.
- `HttpErrorCode`, the status and message maps, and `httpErrorBody` in `src/http-errors.ts`. Response strings the API writes live in `src/messages.ts`. Web imports the same codes and text.
- OpenAPI 3.1 for the REST API, generated from those schemas once the shapes settle.
- A generated TypeScript client for `apps/web` (and, in M5, the source for the Swift client).
- The device protocol JSON schema.
- Webhook payload fixtures replayed in CI.

Zod schemas that validate a single request stay next to the route in `apps/api`. Response shapes live here so the API and a later client share one definition.

## What must NOT go here

- Express routers, Prisma models, or calc functions.
- Live provider calls.

## Milestone

| When      | What lands                                                     |
| --------- | -------------------------------------------------------------- |
| Step 1    | Empty package                                                  |
| This step | Zod response schemas for the mock reads                        |
| Later     | OpenAPI generated from those schemas, then a TypeScript client |
| M4        | Webhook fixtures                                               |
| M5        | Freeze the spec and generate the Swift client                  |
