import { readIntegrationEnv, type IntegrationEnv } from "./env.js";
import { createGarminAdapter } from "./garmin.js";
import { createMockAdapter } from "./mock.js";
import { createStravaAdapter } from "./strava.js";
import { createTrainingPeaksAdapter } from "./trainingpeaks.js";
import type { ProviderAdapter, ProviderName } from "./types.js";

export { IntegrationError } from "./errors.js";
export { readIntegrationEnv } from "./env.js";
export type { IntegrationEnv } from "./env.js";
export type { ProviderAdapter, ProviderName, TokenSet, PlannedWorkout, CompletedActivity } from "./types.js";

export function createAdapters(
  kind: "mock" | "live",
  env: IntegrationEnv = readIntegrationEnv(),
  apiBase = "http://127.0.0.1:4050",
): Record<ProviderName, ProviderAdapter> {
  if (kind === "mock") {
    return {
      STRAVA: createMockAdapter("STRAVA", apiBase),
      TRAININGPEAKS: createMockAdapter("TRAININGPEAKS", apiBase),
      GARMIN: createMockAdapter("GARMIN", apiBase),
    };
  }
  return {
    STRAVA: createStravaAdapter(env),
    TRAININGPEAKS: createTrainingPeaksAdapter(env),
    GARMIN: createGarminAdapter(env),
  };
}
