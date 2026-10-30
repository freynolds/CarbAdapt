export type ProviderName = "STRAVA" | "TRAININGPEAKS" | "GARMIN";

export type TokenSet = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  externalUserId: string;
  scopes: string | null;
};

export type PlannedWorkout = {
  externalId: string;
  name: string;
  sport: "CYCLING" | "RUNNING" | "TRAIL_RUNNING" | "OTHER";
  plannedStart: string | null;
  plannedDate: string;
  durationMin: number | null;
};

export type CompletedActivity = {
  externalId: string;
  startAt: string;
  durationMin: number;
  summary: Record<string, unknown> | null;
};

export interface ProviderAdapter {
  readonly provider: ProviderName;
  startUrl(input: { redirectUri: string; state: string }): Promise<{ url: string }>;
  exchangeCode(input: { code: string; redirectUri: string }): Promise<TokenSet>;
  refresh(refreshToken: string): Promise<TokenSet>;
  listPlannedWorkouts(accessToken: string): Promise<PlannedWorkout[]>;
  getCompletedActivity(accessToken: string, externalId: string): Promise<CompletedActivity>;
  subscribeWebhooks(input: { accessToken: string; callbackUrl: string }): Promise<{ id: string }>;
  verifyWebhook(input: { headers: Record<string, string | undefined>; body: unknown }): boolean;
}
