# apps/worker

Long-running job process. Not a pnpm workspace member yet: there is no `package.json`, and `pnpm install` ignores this folder.

## What goes here

The BullMQ (or MySQL-polled) runner that syncs providers, processes webhooks, and sends scheduled notifications. It reads and writes through `packages/db` and calls `packages/engine` and `packages/integrations`. It is not an HTTP server.

## What must NOT go here

- Request handlers the web app or iOS call (`apps/api`). Webhooks are accepted by the API and then queued.
- Screen rendering.
- Fueling formulas copied out of `packages/engine`.

## Milestone

M4. The mock phase does not run Redis, a queue, or this process. Do not add it to `docker-compose.yml` before then.
