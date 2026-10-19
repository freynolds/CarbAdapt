# @carbadapt/worker

Long-running job process. It is an npm workspace. `npm run dev` starts it with the web app and the API.

## What goes here

A MySQL poll of the `Job` table. Due rows deliver in-app notifications (the mock logs the copy key) and apply webhook imports. It calls `runDueJobs` from `@carbadapt/api/runner`. It is not an HTTP server. `POST /dev/jobs/tick` runs the same function once.

`WORKER_POLL_MS` is how often the process asks MySQL. Empty uses 5000. That interval is an operations knob, not a product push time.

## What must NOT go here

- Request handlers the web app or iOS call (`apps/api`). Webhooks are accepted by the API and then queued.
- Screen rendering.
- Fueling formulas copied out of `packages/engine`.

## Local

```bash
npm run dev -w @carbadapt/worker
```

The process needs `DATABASE_URL` and a migrated database, including the `Job` table.
