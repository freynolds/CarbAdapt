import { HTTP_ERROR_MESSAGE, HttpErrorCode, type HttpErrorBody } from "@carbadapt/contracts";

/**
 * Browser calls go to `/backend`, which Next rewrites to apps/api.
 * The token from POST /dev/login-as is sent as Authorization: Bearer.
 */
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

const CODES = new Set<string>(Object.values(HttpErrorCode));

export class ApiError extends Error {
  readonly code: HttpErrorCode;
  readonly details?: unknown;

  constructor(code: HttpErrorCode, details?: unknown) {
    super(HTTP_ERROR_MESSAGE[code]);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

function isCode(value: unknown): value is HttpErrorCode {
  return typeof value === "string" && CODES.has(value);
}

export async function apiSend<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    parse: (value: unknown) => T;
  },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/backend${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(HttpErrorCode.InternalError);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(HttpErrorCode.InvalidJson);
  }

  if (!response.ok) {
    const body = payload as Partial<HttpErrorBody>;
    throw new ApiError(isCode(body.error) ? body.error : HttpErrorCode.InternalError, body.details);
  }

  try {
    return options.parse(payload);
  } catch {
    throw new ApiError(HttpErrorCode.InternalError);
  }
}
