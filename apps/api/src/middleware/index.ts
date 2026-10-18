import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpErrorCode } from "@carbadapt/contracts";
import { HttpError, sendHttpError } from "../http/errors.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  sendHttpError(res, new HttpError(HttpErrorCode.NotFound));
};

function isJsonParseError(err: unknown): boolean {
  return (
    err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400
  );
}

function asHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (isJsonParseError(err)) return new HttpError(HttpErrorCode.InvalidJson);
  return new HttpError(HttpErrorCode.InternalError);
}

/** Last middleware. Every failure is one HttpError body. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const http = asHttpError(err);
  if (!(err instanceof HttpError) && http.code === HttpErrorCode.InternalError) {
    console.error(err);
  }
  sendHttpError(res, http);
};
