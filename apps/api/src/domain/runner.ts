import type { Prisma, PrismaClient } from "@prisma/client";
import { postWorkoutNotification, stageNotification } from "@carbadapt/engine";
import { saveNotification } from "./plans.js";

type Db = PrismaClient;

/**
 * Delivers due notifications and applies webhook jobs.
 * The web delivery channel is still an open decision, so this logs the copy key.
 */
export async function runDueJobs(db: Db, now = new Date()): Promise<{ delivered: number; webhooks: number }> {
  const jobs = await db.job.findMany({
    where: { status: "PENDING", runAt: { lte: now } },
    orderBy: { runAt: "asc" },
    take: 20,
  });
  let delivered = 0;
  let webhooks = 0;
  for (const job of jobs) {
    await db.job.update({
      where: { id: job.id },
      data: { status: "RUNNING", lockedAt: now, attempts: { increment: 1 } },
    });
    try {
      if (job.type === "DELIVER_NOTIFICATION") {
        delivered += await deliver(db, job.payload);
      } else if (job.type === "PROCESS_WEBHOOK") {
        await applyWebhook(db, job.payload, now);
        webhooks += 1;
      }
      await db.job.update({ where: { id: job.id }, data: { status: "DONE" } });
    } catch (error) {
      const message = error instanceof Error ? error.name : "failed";
      await db.job.update({
        where: { id: job.id },
        data: { status: "FAILED", lastError: message },
      });
    }
  }
  return { delivered, webhooks };
}

async function deliver(db: Db, payload: Prisma.JsonValue): Promise<number> {
  const dedupeKey = payload && typeof payload === "object" && !Array.isArray(payload) ? payload.dedupeKey : null;
  if (typeof dedupeKey !== "string") return 0;
  const row = await db.notification.findUnique({ where: { dedupeKey } });
  if (!row || row.status !== "SCHEDULED") return 0;
  console.info(`CarbAdapt notification ${row.type} ${row.copyKey} for ${row.userId}`);
  await db.notification.update({
    where: { id: row.id },
    data: { status: "SENT", sentAt: new Date() },
  });
  return 1;
}

async function applyWebhook(db: Db, payload: Prisma.JsonValue, now: Date) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;
  const provider = payload.provider;
  const externalId = payload.externalId;
  const ownerId = payload.ownerId;
  if (provider !== "STRAVA" && provider !== "TRAININGPEAKS" && provider !== "GARMIN") return;
  if (typeof externalId !== "string") return;
  const connection = typeof ownerId === "string"
    ? await db.providerConnection.findFirst({ where: { externalUserId: ownerId, provider, status: "CONNECTED" } })
    : null;
  const userId = connection?.userId;
  if (!userId) return;
  const startAt = typeof payload.startAt === "string" ? new Date(payload.startAt) : now;
  const durationMin = typeof payload.durationMin === "number" ? payload.durationMin : 60;
  const existing = await db.activity.findUnique({ where: { provider_externalId: { provider, externalId } } });
  const workoutId = typeof payload.workoutId === "string" ? payload.workoutId : null;
  const activity = existing ?? await db.activity.create({
    data: {
      userId,
      provider,
      externalId,
      startAt,
      durationMin,
      workoutId,
      summary: { source: "webhook" },
    },
  });
  if (workoutId) {
    await db.workout.updateMany({ where: { id: workoutId, userId }, data: { status: "COMPLETED" } });
    await saveNotification(db, userId, postWorkoutNotification({ workoutId, arrivedAt: now }));
  }
  const stageId = typeof payload.stageId === "string" ? payload.stageId : null;
  if (stageId) {
    const stage = await db.stage.findFirst({ where: { id: stageId, race: { userId } } });
    if (!stage || stage.arrivalAt) return;
    await db.stage.update({
      where: { id: stageId },
      data: { arrivalAt: now, arrivalSource: "PLATFORM_WEBHOOK", activityId: activity.id },
    });
    const draft = stageNotification({
      stageId,
      start: stage.startAt,
      estimatedDurationMin: stage.estimatedDurationMin,
      arrivedAt: now,
    });
    const note = await db.notification.findUnique({ where: { dedupeKey: draft.dedupeKey } });
    if (note && note.status === "SCHEDULED") {
      console.info(`CarbAdapt notification ${note.type} ${note.copyKey} for ${userId}`);
      await db.notification.update({
        where: { id: note.id },
        data: { status: "SENT", sentAt: now, scheduledAt: now },
      });
    } else if (!note && draft.scheduledAt) {
      await saveNotification(db, userId, draft);
      await deliver(db, { dedupeKey: draft.dedupeKey });
    }
  }
  await db.webhookEvent.updateMany({
    where: { provider, externalId, eventType: typeof payload.eventType === "string" ? payload.eventType : "" },
    data: { processedAt: now },
  });
}
