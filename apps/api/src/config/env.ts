import { z } from "zod";

export const appEnvSchema = z.enum(["mock", "staging", "production"]);

export type AppEnv = z.infer<typeof appEnvSchema>;

const configSchema = z.object({
  APP_ENV: appEnvSchema.default("mock"),
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
});

export type AppConfig = z.infer<typeof configSchema>;

function blankToUndefined(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return value;
}

/** Reads process env. `APP_ENV` defaults to `mock` when it is unset. */
export function readConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse({
    APP_ENV: blankToUndefined(source.APP_ENV),
    API_HOST: blankToUndefined(source.API_HOST),
    API_PORT: blankToUndefined(source.API_PORT),
  });
}
