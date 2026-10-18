import { z } from "zod";

const apiEnvSchema = z.object({
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function readApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  return apiEnvSchema.parse({
    API_HOST: source.API_HOST,
    API_PORT: source.API_PORT,
  });
}
