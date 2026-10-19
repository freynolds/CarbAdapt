/**
 * Typed HTTP errors shared by the API and, later, the web client.
 * Status and message are fixed per code. Callers pass a code, not a sentence.
 */

export enum HttpErrorCode {
  Unauthorized = "unauthorized",
  SessionExpired = "session_expired",
  NotFound = "not_found",
  AthleteNotFound = "athlete_not_found",
  WorkoutNotFound = "workout_not_found",
  ContainerNotFound = "container_not_found",
  ProductNotFound = "product_not_found",
  RaceNotFound = "race_not_found",
  StageNotFound = "stage_not_found",
  SweatTestNotFound = "sweat_test_not_found",
  LoadingDayNotFound = "loading_day_not_found",
  InvalidRequest = "invalid_request",
  InvalidJson = "invalid_json",
  MissingParameter = "missing_parameter",
  InvalidLoadingDay = "invalid_loading_day",
  WeightRequired = "weight_required",
  NotImplemented = "not_implemented",
  InternalError = "internal_error",
  ProductInUse = "product_in_use",
  ConflictNotFound = "conflict_not_found",
  ConflictAlreadyResolved = "conflict_already_resolved",
  TodoNotFound = "todo_not_found",
  AchievementNotFound = "achievement_not_found",
  FeedbackExists = "feedback_exists",
  MagicLinkInvalid = "magic_link_invalid",
  NotConfigured = "not_configured",
  EmailRequired = "email_required",
  StrategyNotFound = "strategy_not_found",
  ProviderDisabled = "provider_disabled",
  WebhookInvalid = "webhook_invalid",
  CalibrationInvalid = "calibration_invalid",
  GoalAboveMax = "goal_above_max",
  RaceTooSoon = "race_too_soon",
}

export const HTTP_STATUS_BY_CODE: Record<HttpErrorCode, number> = {
  [HttpErrorCode.Unauthorized]: 401,
  [HttpErrorCode.SessionExpired]: 401,
  [HttpErrorCode.NotFound]: 404,
  [HttpErrorCode.AthleteNotFound]: 404,
  [HttpErrorCode.WorkoutNotFound]: 404,
  [HttpErrorCode.ContainerNotFound]: 404,
  [HttpErrorCode.ProductNotFound]: 404,
  [HttpErrorCode.RaceNotFound]: 404,
  [HttpErrorCode.StageNotFound]: 404,
  [HttpErrorCode.SweatTestNotFound]: 404,
  [HttpErrorCode.LoadingDayNotFound]: 404,
  [HttpErrorCode.InvalidRequest]: 400,
  [HttpErrorCode.InvalidJson]: 400,
  [HttpErrorCode.MissingParameter]: 400,
  [HttpErrorCode.InvalidLoadingDay]: 400,
  [HttpErrorCode.WeightRequired]: 400,
  [HttpErrorCode.NotImplemented]: 501,
  [HttpErrorCode.InternalError]: 500,
  [HttpErrorCode.ProductInUse]: 409,
  [HttpErrorCode.ConflictNotFound]: 404,
  [HttpErrorCode.ConflictAlreadyResolved]: 409,
  [HttpErrorCode.TodoNotFound]: 404,
  [HttpErrorCode.AchievementNotFound]: 404,
  [HttpErrorCode.FeedbackExists]: 409,
  [HttpErrorCode.MagicLinkInvalid]: 400,
  [HttpErrorCode.NotConfigured]: 503,
  [HttpErrorCode.EmailRequired]: 400,
  [HttpErrorCode.StrategyNotFound]: 404,
  [HttpErrorCode.ProviderDisabled]: 403,
  [HttpErrorCode.WebhookInvalid]: 400,
  [HttpErrorCode.CalibrationInvalid]: 400,
  [HttpErrorCode.GoalAboveMax]: 400,
  [HttpErrorCode.RaceTooSoon]: 400,
};

export const HTTP_ERROR_MESSAGE: Record<HttpErrorCode, string> = {
  [HttpErrorCode.Unauthorized]: "Sign in as a demo athlete first.",
  [HttpErrorCode.SessionExpired]: "Session expired.",
  [HttpErrorCode.NotFound]: "Not found.",
  [HttpErrorCode.AthleteNotFound]: "Athlete not found.",
  [HttpErrorCode.WorkoutNotFound]: "Workout not found.",
  [HttpErrorCode.ContainerNotFound]: "Container not found.",
  [HttpErrorCode.ProductNotFound]: "Product not found.",
  [HttpErrorCode.RaceNotFound]: "Race not found.",
  [HttpErrorCode.StageNotFound]: "Stage not found.",
  [HttpErrorCode.SweatTestNotFound]: "Sweat test not found.",
  [HttpErrorCode.LoadingDayNotFound]: "No loading day is stored for that race.",
  [HttpErrorCode.InvalidRequest]: "Invalid request.",
  [HttpErrorCode.InvalidJson]: "Request body is not valid JSON.",
  [HttpErrorCode.MissingParameter]: "A required parameter is missing.",
  [HttpErrorCode.InvalidLoadingDay]: "Loading day must be d-2 or d-1.",
  [HttpErrorCode.WeightRequired]: "Weight is required to derive breakfast.",
  [HttpErrorCode.NotImplemented]: "Not implemented.",
  [HttpErrorCode.InternalError]: "Internal error.",
  [HttpErrorCode.ProductInUse]: "That product is used by an upcoming workout. Pick a replacement.",
  [HttpErrorCode.ConflictNotFound]: "Conflict not found.",
  [HttpErrorCode.ConflictAlreadyResolved]: "That conflict is already resolved.",
  [HttpErrorCode.TodoNotFound]: "To-do not found.",
  [HttpErrorCode.AchievementNotFound]: "Achievement not found.",
  [HttpErrorCode.FeedbackExists]: "Feedback for that workout is already saved.",
  [HttpErrorCode.MagicLinkInvalid]: "That sign-in link is not valid.",
  [HttpErrorCode.NotConfigured]: "This integration is not configured.",
  [HttpErrorCode.EmailRequired]: "An email address is required.",
  [HttpErrorCode.StrategyNotFound]: "Strategy not found.",
  [HttpErrorCode.ProviderDisabled]: "That provider is turned off.",
  [HttpErrorCode.WebhookInvalid]: "Webhook payload was rejected.",
  [HttpErrorCode.CalibrationInvalid]: "Sip calibration needs four weights.",
  [HttpErrorCode.GoalAboveMax]: "The g/h goal cannot be above 200.",
  [HttpErrorCode.RaceTooSoon]: "That race is not far enough ahead for gut training.",
};

export interface HttpErrorBody {
  error: HttpErrorCode;
  message: string;
  details?: unknown;
}

/** The only JSON shape the API uses for a failure. */
export function httpErrorBody(code: HttpErrorCode, details?: unknown): HttpErrorBody {
  const message = HTTP_ERROR_MESSAGE[code];
  return details === undefined ? { error: code, message } : { error: code, message, details };
}
