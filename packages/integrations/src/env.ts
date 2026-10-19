export type IntegrationEnv = {
  stravaClientId: string | null;
  stravaClientSecret: string | null;
  stravaVerifyToken: string | null;
  stravaRedirectUri: string | null;
  stravaAuthorizeUrl: string;
  stravaTokenUrl: string;
  stravaApiBase: string;
  trainingPeaksClientId: string | null;
  trainingPeaksClientSecret: string | null;
  trainingPeaksRedirectUri: string | null;
  trainingPeaksAuthorizeUrl: string;
  trainingPeaksTokenUrl: string;
  trainingPeaksApiBase: string;
  garminEnabled: boolean;
  garminConsumerKey: string | null;
  garminConsumerSecret: string | null;
  garminRedirectUri: string | null;
  garminAuthorizeUrl: string;
  garminTokenUrl: string;
  garminApiBase: string;
};

function blank(value: string | undefined): string | null {
  if (value === undefined || value.trim() === "") return null;
  return value.trim();
}

/** Reads provider keys. Empty values stay null so missing keys do not crash at import. */
export function readIntegrationEnv(source: NodeJS.ProcessEnv = process.env): IntegrationEnv {
  return {
    stravaClientId: blank(source.STRAVA_CLIENT_ID),
    stravaClientSecret: blank(source.STRAVA_CLIENT_SECRET),
    stravaVerifyToken: blank(source.STRAVA_WEBHOOK_VERIFY_TOKEN),
    stravaRedirectUri: blank(source.STRAVA_REDIRECT_URI),
    stravaAuthorizeUrl: blank(source.STRAVA_AUTHORIZE_URL) ?? "https://www.strava.com/oauth/authorize",
    stravaTokenUrl: blank(source.STRAVA_TOKEN_URL) ?? "https://www.strava.com/oauth/token",
    stravaApiBase: blank(source.STRAVA_API_BASE) ?? "https://www.strava.com/api/v3",
    trainingPeaksClientId: blank(source.TRAININGPEAKS_CLIENT_ID),
    trainingPeaksClientSecret: blank(source.TRAININGPEAKS_CLIENT_SECRET),
    trainingPeaksRedirectUri: blank(source.TRAININGPEAKS_REDIRECT_URI),
    trainingPeaksAuthorizeUrl:
      blank(source.TRAININGPEAKS_AUTHORIZE_URL) ?? "https://oauth.trainingpeaks.com/OAuth/Authorize",
    trainingPeaksTokenUrl:
      blank(source.TRAININGPEAKS_TOKEN_URL) ?? "https://oauth.trainingpeaks.com/oauth/token",
    trainingPeaksApiBase: blank(source.TRAININGPEAKS_API_BASE) ?? "https://api.trainingpeaks.com",
    garminEnabled: blank(source.GARMIN_ENABLED) === "true",
    garminConsumerKey: blank(source.GARMIN_CONSUMER_KEY),
    garminConsumerSecret: blank(source.GARMIN_CONSUMER_SECRET),
    garminRedirectUri: blank(source.GARMIN_REDIRECT_URI),
    garminAuthorizeUrl: blank(source.GARMIN_AUTHORIZE_URL) ?? "https://connect.garmin.com/oauth2Confirm",
    garminTokenUrl:
      blank(source.GARMIN_TOKEN_URL) ?? "https://diauth.garmin.com/di-oauth2-service/oauth/token",
    garminApiBase: blank(source.GARMIN_API_BASE) ?? "https://apis.garmin.com",
  };
}
