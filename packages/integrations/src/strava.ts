import type { IntegrationEnv } from "./env.js";
import { IntegrationError } from "./errors.js";
import { asToken, getJson, postForm, requireKeys } from "./http.js";
import type { CompletedActivity, PlannedWorkout, ProviderAdapter } from "./types.js";

export function createStravaAdapter(env: IntegrationEnv): ProviderAdapter {
  const keys = () =>
    requireKeys({
      STRAVA_CLIENT_ID: env.stravaClientId,
      STRAVA_CLIENT_SECRET: env.stravaClientSecret,
    });

  return {
    provider: "STRAVA",
    async startUrl({ redirectUri, state }) {
      keys();
      const url = new URL(env.stravaAuthorizeUrl);
      url.searchParams.set("client_id", env.stravaClientId ?? "");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "read,activity:read_all");
      url.searchParams.set("state", state);
      return { url: url.toString() };
    },
    async exchangeCode({ code }) {
      keys();
      const body = await postForm(env.stravaTokenUrl, {
        client_id: env.stravaClientId ?? "",
        client_secret: env.stravaClientSecret ?? "",
        code,
        grant_type: "authorization_code",
      });
      const athlete =
        body && typeof body === "object" && "athlete" in body
          ? (body as { athlete?: { id?: number } }).athlete
          : undefined;
      return asToken(body, athlete?.id == null ? "strava" : String(athlete.id));
    },
    async refresh(refreshToken) {
      keys();
      const body = await postForm(env.stravaTokenUrl, {
        client_id: env.stravaClientId ?? "",
        client_secret: env.stravaClientSecret ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });
      return asToken(body, "strava");
    },
    async listPlannedWorkouts(): Promise<PlannedWorkout[]> {
      keys();
      return [];
    },
    async getCompletedActivity(accessToken, externalId): Promise<CompletedActivity> {
      keys();
      const body = (await getJson(`${env.stravaApiBase}/activities/${externalId}`, accessToken)) as {
        id?: number;
        start_date?: string;
        elapsed_time?: number;
      };
      if (!body.start_date || body.elapsed_time == null) throw new IntegrationError("provider_rejected");
      return {
        externalId: String(body.id ?? externalId),
        startAt: body.start_date,
        durationMin: Math.round(body.elapsed_time / 60),
        summary: body as Record<string, unknown>,
      };
    },
    async subscribeWebhooks({ accessToken, callbackUrl }) {
      keys();
      requireKeys({ STRAVA_WEBHOOK_VERIFY_TOKEN: env.stravaVerifyToken });
      const body = (await postForm(`${env.stravaApiBase}/push_subscriptions`, {
        client_id: env.stravaClientId ?? "",
        client_secret: env.stravaClientSecret ?? "",
        callback_url: callbackUrl,
        verify_token: env.stravaVerifyToken ?? "",
      })) as { id?: number };
      void accessToken;
      if (body.id == null) throw new IntegrationError("provider_rejected");
      return { id: String(body.id) };
    },
    verifyWebhook({ body }) {
      requireKeys({ STRAVA_WEBHOOK_VERIFY_TOKEN: env.stravaVerifyToken });
      const row = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
      return row["hub.verify_token"] === env.stravaVerifyToken || row.verify_token === env.stravaVerifyToken;
    },
  };
}
