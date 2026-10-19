import { z } from "zod";
import { isoDateTimeSchema } from "./common.js";

export const notificationTypeSchema = z.enum([
  "DAILY_BRIEFING",
  "POST_WORKOUT",
  "POST_WORKOUT_REMINDER",
  "SWEAT_TEST_NIGHT_BEFORE",
  "SWEAT_TEST_DAY",
  "SWEAT_TEST_END",
  "SWEAT_TEST_INCOMPLETE",
  "SWEAT_TEST_QUARTERLY",
  "CARB_LOADING_D2",
  "CARB_LOADING_D1",
  "RACE_BREAKFAST",
  "LOADING_REHEARSAL",
  "STAGE_COMPLETE",
]);

export const notificationChannelSchema = z.enum(["APNS", "IN_APP"]);
export const notificationStatusSchema = z.enum(["SCHEDULED", "SENT", "CANCELLED", "FAILED"]);

export const notificationSchema = z
  .object({
    id: z.string(),
    type: notificationTypeSchema,
    channel: notificationChannelSchema,
    scheduledAt: isoDateTimeSchema,
    sentAt: isoDateTimeSchema.nullable(),
    readAt: isoDateTimeSchema.nullable(),
    copyKey: z.string(),
    deepLink: z.string().nullable(),
    status: notificationStatusSchema,
    dedupeKey: z.string(),
  })
  .strict();

export const notificationListSchema = z
  .object({
    notifications: z.array(notificationSchema),
  })
  .strict();

export const webhookAckSchema = z
  .object({
    accepted: z.literal(true),
  })
  .strict();

export type NotificationList = z.infer<typeof notificationListSchema>;
export type WebhookAck = z.infer<typeof webhookAckSchema>;
