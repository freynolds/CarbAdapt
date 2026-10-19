import {
  achievementListSchema,
  breakfastResponseSchema,
  conflictListSchema,
  connectionListSchema,
  containerListSchema,
  containerResponseSchema,
  devAthleteListSchema,
  devLoginResponseSchema,
  feedbackResponseSchema,
  gutPlanResponseSchema,
  homeResponseSchema,
  loadingDayResponseSchema,
  meResponseSchema,
  productListSchema,
  productResponseSchema,
  progressResponseSchema,
  raceListSchema,
  raceResponseSchema,
  stageRecoveryResponseSchema,
  sweatTestListSchema,
  sweatTestResponseSchema,
  workoutListSchema,
  workoutResponseSchema,
} from "@carbadapt/contracts";

export const parseAthletes = (value: unknown) => devAthleteListSchema.parse(value);
export const parseLogin = (value: unknown) => devLoginResponseSchema.parse(value);
export const parseMe = (value: unknown) => meResponseSchema.parse(value);
export const parseHome = (value: unknown) => homeResponseSchema.parse(value);
export const parseWorkouts = (value: unknown) => workoutListSchema.parse(value);
export const parseWorkout = (value: unknown) => workoutResponseSchema.parse(value);
export const parseGut = (value: unknown) => gutPlanResponseSchema.parse(value);
export const parseProgress = (value: unknown) => progressResponseSchema.parse(value);
export const parseConflicts = (value: unknown) => conflictListSchema.parse(value);
export const parseContainers = (value: unknown) => containerListSchema.parse(value);
export const parseContainer = (value: unknown) => containerResponseSchema.parse(value);
export const parseProducts = (value: unknown) => productListSchema.parse(value);
export const parseProduct = (value: unknown) => productResponseSchema.parse(value);
export const parseConnections = (value: unknown) => connectionListSchema.parse(value);
export const parseSweatTests = (value: unknown) => sweatTestListSchema.parse(value);
export const parseSweatTest = (value: unknown) => sweatTestResponseSchema.parse(value);
export const parseRaces = (value: unknown) => raceListSchema.parse(value);
export const parseRace = (value: unknown) => raceResponseSchema.parse(value);
export const parseRecovery = (value: unknown) => stageRecoveryResponseSchema.parse(value);
export const parseLoading = (value: unknown) => loadingDayResponseSchema.parse(value);
export const parseBreakfast = (value: unknown) => breakfastResponseSchema.parse(value);
export const parseFeedback = (value: unknown) => feedbackResponseSchema.parse(value);
export const parseAchievements = (value: unknown) => achievementListSchema.parse(value);
