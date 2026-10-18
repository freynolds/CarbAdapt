# Agent instructions

## HTTP errors

Client-visible API failures go through the typed HTTP error helper. Do not send an error with `res.status(...).json(...)`, and do not `throw new Error` for a failure the client should see.

- Error codes are the `HttpErrorCode` enum in `packages/contracts` (`src/http-errors.ts`). Each code maps to one status in `HTTP_STATUS_BY_CODE` and one message in `HTTP_ERROR_MESSAGE`.
- Throw `HttpError` from `apps/api/src/http/errors.ts`, or call `httpError()`. The constructor takes a code and optional `details`. Status and message come from those maps.
- `notFoundHandler` and `errorHandler` serialize every failure with `sendHttpError` / `httpErrorBody`: `{ error, message, details? }`. A JSON parse failure becomes `HttpErrorCode.InvalidJson`. Any other unknown error becomes `HttpErrorCode.InternalError`. Both use that same serializer.
- Request validation uses `parseInput`, which throws `HttpErrorCode.InvalidRequest` and puts the flattened Zod error in `details`.
- Staging and production call `unimplemented()`, which throws `HttpErrorCode.NotImplemented`.

## Response text

The API must not return a hardcoded text string. Every user-facing or response string, including error messages, comes from a constant or an enum in `packages/contracts` (`src/messages.ts` for response text, `src/http-errors.ts` for error text). Web imports the same values.

When the same text is used in more than one place, share one constant. Do not copy the sentence.
