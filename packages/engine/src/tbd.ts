/**
 * Values the product docs leave open.
 * `null` means the feature shows "not set" and must not use a guessed number.
 * Each field names the source of the gap.
 */
export const TBD = {
  /** MVP §7 item 5. A single recommended g/h inside a §7.1 band is not specified. */
  fuelingModeRecommendedGh: null,
  /** Build Plan §11. The 10 mL/kg/h sweat estimate is an unspecified heuristic. */
  sweatEstimateMlPerKgH: null,
  /** Build Plan §11. The 900 mg/L sodium estimate is an unspecified heuristic. */
  sodiumEstimateMgPerL: null,
  /** Handoff B11 states 125–150%. It does not pick one factor. */
  fluidReplacementFactor: null,
  /** Loading and recovery meal fractions are not specified. */
  mealSplit: null,
  /** MVP §7 item 9. Clock time for these pushes is not specified. */
  carbLoadingPushTimeLocal: null as string | null,
  raceBreakfastPushTimeLocal: null as string | null,
  rehearsalPushTimeLocal: null as string | null,
  sweatNightBeforePushTimeLocal: null as string | null,
  /** Handoff B10. The smaller early-start breakfast has no gram amount. */
  earlyBreakfastGPerKg: null,
  /** Handoff B10. No cutoff hour defines an early start. The 06:30 example is not a rule. */
  earlyStartHourLocal: null as number | null,
  /** Handoff #133. Pre-race fluid is isotonic plus water, with no volume. */
  preRaceFluidMlPerKg: null,
  /** Master §7.2. First feeding is "15–30 min" and the repeat is "15–20 min". */
  firstFeedingMin: null as number | null,
  intakeIntervalMin: null as number | null,
  /** "About 1 week before" is not a day count, so rehearsal is not auto-dated. */
  rehearsalDaysBeforeRace: null as number | null,
  /** Flows §10. "Remind once later" has no delay. */
  postWorkoutReminderDelayMin: null as number | null,
  /** MVP §1.5. Inbox vs Web Push vs server-only is not chosen. */
  webPushChannel: null as string | null,
  /** §2.4 does not set a session or magic-link lifetime. */
  magicLinkTtlMs: null as number | null,
  sessionTtlMs: null as number | null,
  /** Build Plan §11. Gel density and the in-field correction formula are unspecified. */
  drinkDensityGPerMl: null,
  /** How to combine upper, lower, and systemic symptoms is not specified. */
  symptomAggregate: null as "worst" | null,
  /** Master §7.2 intensity guidance has no numeric factor. */
  intensityFactor: null,
  /** Race and stage type enumerations are not specified (MVP §7 item 6). */
  raceTypes: null as readonly string[] | null,
} as const;

export const NOT_SET = "not_set" as const;

export type SetStatus = "computed" | typeof NOT_SET;
