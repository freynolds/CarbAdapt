import type { IntegrationEnv } from "./env.js";
import { IntegrationError } from "./errors.js";
import { asToken, getJson, postForm, requireKeys } from "./http.js";
import type { CompletedActivity, PlannedWorkout, ProviderAdapter } from "./types.js";

export function createGarminAdapter(env: IntegrationEnv): ProviderAdapter {
  const enabled = () => {
    if (!env.garminEnabled) throw new IntegrationError("provider_disabled");
    requireKeys({
      GARMIN_CONSUMER_KEY: env.garminConsumerKey,
      GARMIN_CONSUMER_SECRET: env.garminConsumerSecret,
    });
  };

  return {
    provider: "GARMIN",
    async startUrl({ redirectUri, state }) {
      enabled();
      const url = new URL(env.garminAuthorizeUrl);
      url.searchParams.set("client_id", env.garminConsumerKey ?? "");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("state", state);
      return { url: url.toString() };
    },
    async exchangeCode({ code, redirectUri }) {
      enabled();
      const body = await postForm(env.garminTokenUrl, {
        client_id: env.garminConsumerKey ?? "",
        client_secret: env.garminConsumerSecret ?? "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });
      return asToken(body, "garmin");
    },
    async refresh(refreshToken) {
      enabled();
      const body = await postForm(env.garminTokenUrl, {
        client_id: env.garminConsumerKey ?? "",
        client_secret: env.garminConsumerSecret ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });
      return asToken(body, "garmin");
    },
    async listPlannedWorkouts(accessToken): Promise<PlannedWorkout[]> {
      enabled();
      await getJson(`${env.garminApiBase}/wellness-api/rest/workouts`, accessToken);
      return [];
    },
    async getCompletedActivity(accessToken, externalId): Promise<CompletedActivity> {
      enabled();
      const body = (await getJson(
        `${env.garminApiBase}/wellness-api/rest/activities/${externalId}`,
        accessToken,
      )) as Record<string, unknown>;
      const start = typeof body.startTimeInSeconds === "number" ? new Date(body.startTimeInSeconds * 1000).toISOString() : null;
      if (!start) throw new IntegrationError("provider_rejected");
      const duration = typeof body.durationInSeconds === "number" ? Math.round(body.durationInSeconds / 60) : 0;
      return { externalId, startAt: start, durationMin: duration, summary: body };
    },
    async subscribeWebhooks() {
      enabled();
      throw new IntegrationError("not_configured", ["GARMIN_WEBHOOK"]);
    },
    verifyWebhook() {
      enabled();
      return false;
    },
  };
}
