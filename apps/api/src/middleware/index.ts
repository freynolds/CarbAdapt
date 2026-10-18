import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../http/errors.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "not_found", message: "Not found." });
};

function isJsonParseError(err: unknown): boolean {
  return (
    err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400
  );
}

/** Last middleware. Known HTTP errors keep their status. Everything else is a JSON 500. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.code,
      message: err.message,
      ...(err.details === undefined ? {} : { details: err.details }),
    });
    return;
  }
  if (isJsonParseError(err)) {
    res.status(400).json({ error: "invalid_request", message: "Request body is not valid JSON." });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "internal_error" });
};
