import { IntegrationError } from "./errors.js";
import type { TokenSet } from "./types.js";

export function requireKeys(values: Record<string, string | null>): void {
  const missing = Object.entries(values)
    .filter((entry) => entry[1] == null)
    .map((entry) => entry[0]);
  if (missing.length > 0) throw new IntegrationError("not_configured", missing);
}

export async function postForm(url: string, body: Record<string, string>): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!response.ok) throw new IntegrationError("provider_rejected");
  return response.json() as Promise<unknown>;
}

export async function getJson(url: string, accessToken: string): Promise<unknown> {
  const response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new IntegrationError("provider_rejected");
  return response.json() as Promise<unknown>;
}

export function asToken(value: unknown, externalUserId: string): TokenSet {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const access = typeof row.access_token === "string" ? row.access_token : null;
  if (!access) throw new IntegrationError("provider_rejected");
  const expiresIn = typeof row.expires_in === "number" ? row.expires_in : null;
  return {
    accessToken: access,
    refreshToken: typeof row.refresh_token === "string" ? row.refresh_token : null,
    expiresAt: expiresIn == null ? null : new Date(Date.now() + expiresIn * 1000).toISOString(),
    externalUserId,
    scopes: typeof row.scope === "string" ? row.scope : null,
  };
}
