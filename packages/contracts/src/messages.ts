/**
 * Text the API writes into a response. Database values are data and stay out of this file.
 * Share one constant when the same text is used in more than one place.
 */

export const ServiceStatus = {
  Ok: "ok",
} as const;

export const FIXTURE_ENGINE_VERSION = "fixture" as const;

export const BreakfastNote = {
  Standard:
    "Race-morning breakfast is about 2 g/kg, 2 to 3 hours before the start. Pre-race fluid and sodium are not set. No cutoff hour is specified, so the start is not classified as early.",
} as const;

export const NOT_SET_LABEL = "not set" as const;

export const StrategyNote = {
  Unspecified:
    "How multiple pre-race plans should differ is not set, so one plan is listed. Choose it yourself.",
} as const;

/** Keys stored on recovery meals. The screen prints these sentences. */
export const RecoveryGuidanceText = {
  low_intake: "Off-bike carbs include +1 g/kg because in-stage intake was under 75% of the g/h target.",
  low_intake_not_set: "The +1 g/kg low-intake rule was not applied because the in-stage g/h target is not set.",
  liquids_only: "The gap is under 1.5 hours, so the between-stage intake is liquids and gels only.",
  sensitive: "Sensitive stomach uses 0.8 g/kg/h of carbs and 0.3 to 0.4 g/kg/h of protein.",
  hourly_window:
    "Carbs are 1 to 1.2 g/kg/h from arrival until 30 to 45 minutes before the next start. A single rate inside that range is not set.",
  first_four_hours:
    "The first 4 hours are 1 to 1.2 g/kg/h, then a pre-start meal of 1 to 2 g/kg. A single rate inside those ranges is not set.",
  trail_band: "Trail does not use the lowest overnight band. The target is at least 6 to 8 g/kg.",
  overnight_low_end: "The stored carb target is the low end of the overnight band.",
  fluid_range:
    "Replace 125 to 150% of the fluid deficit. A single percentage is not set. The deficit is not carried to the next stage.",
  sodium_range:
    "Sodium is 50 to 80 mmol/L of recovery fluid, from the isotonic drink plus broth or salty food. A single concentration is not set.",
  no_carryover: "Unreplaced fluid is not carried to the next stage.",
  meal_split_not_set: "Meal split is not set.",
  example_foods_tbd: "example foods TBD",
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
