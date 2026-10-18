/**
 * Where the web app will call apps/api.
 * No client, no fetch, and no domain types in this step.
 *
 * Next.js does not load the repo-root .env (that file holds DATABASE_URL).
 * Set NEXT_PUBLIC_API_URL in apps/web/.env.local when a screen needs it.
 */
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export const healthUrl = `${apiBaseUrl}/health`;
