import type { IntegrationEnv } from "./env.js";
import { IntegrationError } from "./errors.js";
import { asToken, getJson, postForm, requireKeys } from "./http.js";
import type { CompletedActivity, PlannedWorkout, ProviderAdapter } from "./types.js";

export function createTrainingPeaksAdapter(env: IntegrationEnv): ProviderAdapter {
  const keys = () =>
    requireKeys({
      TRAININGPEAKS_CLIENT_ID: env.trainingPeaksClientId,
      TRAININGPEAKS_CLIENT_SECRET: env.trainingPeaksClientSecret,
    });

  return {
    provider: "TRAININGPEAKS",
    async startUrl({ redirectUri, state }) {
      keys();
      const url = new URL(env.trainingPeaksAuthorizeUrl);
      url.searchParams.set("client_id", env.trainingPeaksClientId ?? "");
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", "workouts:read");
      url.searchParams.set("state", state);
      return { url: url.toString() };
    },
    async exchangeCode({ code, redirectUri }) {
      keys();
      const body = await postForm(env.trainingPeaksTokenUrl, {
        client_id: env.trainingPeaksClientId ?? "",
        client_secret: env.trainingPeaksClientSecret ?? "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });
      return asToken(body, "trainingpeaks");
    },
    async refresh(refreshToken) {
      keys();
      const body = await postForm(env.trainingPeaksTokenUrl, {
        client_id: env.trainingPeaksClientId ?? "",
        client_secret: env.trainingPeaksClientSecret ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });
      return asToken(body, "trainingpeaks");
    },
    async listPlannedWorkouts(accessToken): Promise<PlannedWorkout[]> {
      keys();
      const body = await getJson(`${env.trainingPeaksApiBase}/v1/workouts`, accessToken);
      if (!Array.isArray(body)) return [];
      return body.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const externalId = row.id == null ? null : String(row.id);
        const name = typeof row.name === "string" ? row.name : null;
        const date = typeof row.workoutDay === "string" ? row.workoutDay.slice(0, 10) : null;
        if (!externalId || !name || !date) return [];
        return [
          {
            externalId,
            name,
            sport: "OTHER" as const,
            plannedStart: null,
            plannedDate: date,
            durationMin: typeof row.totalTimePlanned === "number" ? Math.round(row.totalTimePlanned * 60) : null,
          },
        ];
      });
    },
    async getCompletedActivity(accessToken, externalId): Promise<CompletedActivity> {
      keys();
      const body = (await getJson(
        `${env.trainingPeaksApiBase}/v1/workouts/${externalId}`,
        accessToken,
      )) as Record<string, unknown>;
      const start = typeof body.workoutDay === "string" ? body.workoutDay : null;
      if (!start) throw new IntegrationError("provider_rejected");
      return {
        externalId,
        startAt: start,
        durationMin: typeof body.totalTime === "number" ? Math.round(body.totalTime * 60) : 0,
        summary: body,
      };
    },
    async subscribeWebhooks() {
      keys();
      throw new IntegrationError("not_configured", ["TRAININGPEAKS_WEBHOOK"]);
    },
    verifyWebhook() {
      keys();
      return false;
    },
  };
}
