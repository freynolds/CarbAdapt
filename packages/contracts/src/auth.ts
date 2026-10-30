import { z } from "zod";
import { userSchema } from "./profile.js";

export const magicLinkSentSchema = z
  .object({
    sent: z.literal(true),
  })
  .strict();

export const sessionResponseSchema = z
  .object({
    token: z.string(),
    user: userSchema,
  })
  .strict();

export const oauthStartSchema = z
  .object({
    url: z.string(),
  })
  .strict();

export const deletedResponseSchema = z
  .object({
    deleted: z.literal(true),
  })
  .strict();

export type MagicLinkSent = z.infer<typeof magicLinkSentSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type OauthStart = z.infer<typeof oauthStartSchema>;
