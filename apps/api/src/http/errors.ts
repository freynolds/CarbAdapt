import type { Response } from "express";
import type { ZodType } from "zod";
import {
  HttpErrorCode,
  HTTP_ERROR_MESSAGE,
  HTTP_STATUS_BY_CODE,
  httpErrorBody,
  type HttpErrorBody,
} from "@carbadapt/contracts";

export { HttpErrorCode, httpErrorBody };

export class HttpError extends Error {
  readonly status: number;
  readonly code: HttpErrorCode;
  readonly details?: unknown;

  constructor(code: HttpErrorCode, details?: unknown) {
    super(HTTP_ERROR_MESSAGE[code]);
    this.name = "HttpError";
    this.status = HTTP_STATUS_BY_CODE[code];
    this.code = code;
    this.details = details;
  }

  toBody(): HttpErrorBody {
    return httpErrorBody(this.code, this.details);
  }
}

export function httpError(code: HttpErrorCode, details?: unknown): HttpError {
  return new HttpError(code, details);
}

export function sendHttpError(res: Response, error: HttpError): void {
  res.status(error.status).json(error.toBody());
}

export function parseInput<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new HttpError(HttpErrorCode.InvalidRequest, result.error.flatten());
  }
  return result.data;
}
