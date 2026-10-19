export type IntegrationErrorCode = "not_configured" | "provider_disabled" | "provider_rejected";

/** Thrown by provider adapters. The API maps this to HttpErrorCode. The message is not shown to clients. */
export class IntegrationError extends Error {
  readonly code: IntegrationErrorCode;
  readonly missing: string[];

  constructor(code: IntegrationErrorCode, missing: string[] = []) {
    super(code);
    this.name = "IntegrationError";
    this.code = code;
    this.missing = missing;
  }
}
