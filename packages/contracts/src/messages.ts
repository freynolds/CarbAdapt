/**
 * Text the API writes into a response. Database values are data and stay out of this file.
 * Share one constant when the same text is used in more than one place.
 */

export const ServiceStatus = {
  Ok: "ok",
} as const;

export const FIXTURE_ENGINE_VERSION = "fixture" as const;

export const BreakfastNote = {
  Early:
    "Start is before 08:00 in the athlete zone, so the fixture uses 1.5 g/kg (upper end of the early-start range). Fluid is the low end, 5 ml/kg, all as the demo isotonic. No row is stored.",
  Default:
    "Default race breakfast is 2 g/kg. Fluid is the low end, 5 ml/kg, all as the demo isotonic. No row is stored.",
  MissingStart:
    "This race has no start time, so it is not treated as an early start. Breakfast is 2 g/kg. No row is stored.",
} as const;

export const SWEAT_RATE_FORMULA = "pre − post + fluid − urine, divided by hours" as const;

export const DataProvider = {
  TrainingPeaks: "TRAININGPEAKS",
  Garmin: "GARMIN",
  Strava: "STRAVA",
} as const;

/** Order of the connections list when a provider has no row yet. */
export const CONNECTION_PROVIDER_ORDER = [
  DataProvider.Garmin,
  DataProvider.TrainingPeaks,
  DataProvider.Strava,
] as const;

export const ConnectionStatus = {
  Connected: "CONNECTED",
  Disconnected: "DISCONNECTED",
  Revoked: "REVOKED",
} as const;
