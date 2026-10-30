import type { CompletedActivity, PlannedWorkout, ProviderAdapter, ProviderName, TokenSet } from "./types.js";

function token(provider: ProviderName, code: string): TokenSet {
  return {
    accessToken: `mock-${provider.toLowerCase()}-${code}`,
    refreshToken: `mock-refresh-${code}`,
    expiresAt: null,
    externalUserId: `mock-${provider.toLowerCase()}-athlete`,
    scopes: "mock",
  };
}

export function createMockAdapter(provider: ProviderName, apiBase: string): ProviderAdapter {
  return {
    provider,
    async startUrl({ redirectUri, state }) {
      const url = new URL(`${apiBase}/auth/${provider.toLowerCase()}/callback`);
      url.searchParams.set("code", "mock");
      url.searchParams.set("state", state);
      url.searchParams.set("redirect_uri", redirectUri);
      return { url: url.toString() };
    },
    async exchangeCode({ code }) {
      return token(provider, code);
    },
    async refresh(refreshToken) {
      return token(provider, refreshToken);
    },
    async listPlannedWorkouts(): Promise<PlannedWorkout[]> {
      return [];
    },
    async getCompletedActivity(_accessToken, externalId): Promise<CompletedActivity> {
      return {
        externalId,
        startAt: new Date().toISOString(),
        durationMin: 60,
        summary: { source: "mock" },
      };
    },
    async subscribeWebhooks() {
      return { id: `mock-subscription-${provider.toLowerCase()}` };
    },
    verifyWebhook() {
      return true;
    },
  };
}
