import assert from "node:assert/strict";
import test from "node:test";
import { createAdapters, IntegrationError, readIntegrationEnv } from "./index.js";

test("live adapters refuse to start when keys are empty", async () => {
  const adapters = createAdapters("live", readIntegrationEnv({}));
  await assert.rejects(
    () => adapters.STRAVA.startUrl({ redirectUri: "http://127.0.0.1/cb", state: "s" }),
    (error: unknown) => error instanceof IntegrationError && error.code === "not_configured",
  );
  await assert.rejects(
    () => adapters.TRAININGPEAKS.listPlannedWorkouts("token"),
    (error: unknown) => error instanceof IntegrationError && error.code === "not_configured",
  );
  await assert.rejects(
    () => adapters.GARMIN.startUrl({ redirectUri: "http://127.0.0.1/cb", state: "s" }),
    (error: unknown) => error instanceof IntegrationError && error.code === "provider_disabled",
  );
});

test("mock adapters connect without keys", async () => {
  const adapters = createAdapters("mock", readIntegrationEnv({}), "http://127.0.0.1:4050");
  const start = await adapters.STRAVA.startUrl({ redirectUri: "http://127.0.0.1:3050/auth/strava", state: "abc" });
  assert.match(start.url, /code=mock/);
  const token = await adapters.STRAVA.exchangeCode({ code: "mock", redirectUri: "http://127.0.0.1" });
  assert.equal(token.externalUserId, "mock-strava-athlete");
  assert.equal(adapters.STRAVA.verifyWebhook({ headers: {}, body: {} }), true);
});
