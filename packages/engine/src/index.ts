export { ENGINE_VERSION } from "./version.js";
export { TBD, NOT_SET, type SetStatus } from "./tbd.js";
export {
  roundInt,
  round2,
  hours,
  addMinutes,
  parseDay,
  formatDay,
  daysBetween,
  shiftDay,
  zonedLocalToUtc,
} from "./numbers.js";
export {
  carbBand,
  fuelingPlan,
  type EngineSport,
  type CarbBand,
  type FuelProduct,
  type FuelContainer,
  type CarryItem,
  type FuelingResult,
} from "./fueling.js";
export {
  buildLadder,
  stepTargets,
  LADDER_STEP_G,
  SESSIONS_PER_STEP,
  MAX_GH,
  WARN_ABOVE_GH,
  ABOVE_GH_WEEKLY_CAP,
  LONG_RIDES_BEFORE_RACE,
  type LadderResult,
  type LadderStepDraft,
} from "./ladder.js";
export {
  adapt,
  agreedSymptom,
  isSymptomFree,
  sessionEligible,
  type SymptomLevel,
  type SymptomGroups,
  type AdaptationResult,
  type AdaptationInputLog,
} from "./adaptation.js";
export { startingPoint, STARTING_FALLBACK_GH, type StartingWorkout } from "./starting-point.js";
export {
  sweatRateLPerH,
  calibrateSips,
  SWEAT_TEST_PROTOCOL_MIN,
  IN_FIELD_VALIDATIONS,
  type SipCalibration,
} from "./sweat.js";
export {
  carbLoadingBands,
  loadingGrams,
  raceBreakfast,
  RACE_BREAKFAST_G_PER_KG,
  type LoadingChoice,
  type LoadingBand,
  type BreakfastResult,
} from "./carb-loading.js";
export {
  stageRecovery,
  gapCase,
  type GapCase,
  type StageSport,
  type StageRecoveryResult,
  type Range,
} from "./stage-recovery.js";
export { ghIncrease } from "./achievements.js";
export {
  stageFallbackAt,
  stageNotification,
  carbLoadingNotification,
  raceBreakfastNotification,
  rehearsalNotification,
  postWorkoutNotification,
  postWorkoutReminder,
  sweatTestTimers,
  dailyBriefing,
  type NotificationDraft,
} from "./schedule.js";
