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
