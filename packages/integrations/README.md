# @carbadapt/integrations

Outbound clients for training platforms. One interface, one folder per provider.

## What goes here

Adapters for TrainingPeaks, Strava, and Garmin: list planned workouts, fetch a completed activity, subscribe to webhooks, refresh a token. Weather, when it is a real provider call, can live here too. Garmin stays behind a flag until the Connect Developer Program approves the app.

## What must NOT go here

- Webhook HTTP endpoints (`apps/api` receives them, then the worker calls this package).
- Fueling rules, dedupe policy, or notification copy. Matching an activity to a workout is product logic in the API or worker; this package only speaks the provider's protocol.
- Tokens stored in source. Provider secrets come from the environment.

## Status

`createAdapters("mock")` works with no keys. `createAdapters("live")` reads the environment and throws `IntegrationError` with `not_configured` when a required key is missing. It does not call the network until the keys are present. Garmin throws `provider_disabled` unless `GARMIN_ENABLED=true`.

Key names and where to create each app are in the root `.env.example`.
