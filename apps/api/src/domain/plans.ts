import type { Prisma, PrismaClient } from "@prisma/client";
import { ENGINE_VERSION, dailyBriefing, fuelingPlan, type NotificationDraft } from "@carbadapt/engine";
import { day } from "../http/values.js";

type Db = PrismaClient | Prisma.TransactionClient;

export async function athleteFuelingContext(db: Db, userId: string) {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: { physical: true },
  });
  const gut = await db.gutTrainingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { steps: true },
    orderBy: { createdAt: "desc" },
  });
  const current = gut?.steps.find((step) => step.status === "CURRENT") ?? null;
  const products = await db.product.findMany({ where: { userId, deletedAt: null } });
  const containers = await db.container.findMany({ where: { userId } });
  return { user, currentGh: current?.gh ?? null, products, containers };
}

export async function writeFuelingPlan(
  db: Db,
  userId: string,
  workout: { id: string; sport: "CYCLING" | "RUNNING" | "TRAIL_RUNNING" | "OTHER"; durationMin: number | null },
  chosenGPerH: number | null,
) {
  const ctx = await athleteFuelingContext(db, userId);
  const result = fuelingPlan({
    durationMin: workout.durationMin,
    sport: workout.sport,
    mode: ctx.user.mode,
    currentStepGh: ctx.currentGh,
    chosenGPerH,
    sweatRateLPerH: ctx.user.physical?.sweatRateLPerH == null ? null : Number(ctx.user.physical.sweatRateLPerH),
    products: ctx.products.map((product) => ({
      id: product.id,
      type: product.type,
      name: product.name,
      carbsG: Number(product.carbsG),
      sodiumMg: product.sodiumMg,
    })),
    containers: ctx.containers.map((container) => ({
      id: container.id,
      name: container.name,
      capacityMl: container.capacityMl,
      usualContent: container.usualContent,
    })),
  });
  await db.fuelingPlan.updateMany({
    where: { workoutId: workout.id, isCurrent: true },
    data: { isCurrent: false },
  });
  return db.fuelingPlan.create({
    data: {
      workoutId: workout.id,
      engineVersion: ENGINE_VERSION,
      targetGPerH: result.targetGPerH,
      totalCarbsG: result.totalCarbsG,
      totalFluidMl: result.totalFluidMl,
      totalSodiumMg: result.totalSodiumMg,
      schedule: result.schedule as Prisma.InputJsonValue,
      carryList: {
        items: result.items,
        carbStatus: result.carbStatus,
        fluidStatus: result.fluidStatus,
        sodiumStatus: result.sodiumStatus,
        scheduleStatus: result.scheduleStatus,
        targetBandGPerH: result.band,
        drinkMixGPerMl: result.drinkMixGPerMl,
      } as Prisma.InputJsonValue,
      userAdjusted: chosenGPerH != null,
      isCurrent: true,
    },
  });
}

export async function saveNotification(db: Db, userId: string, draft: NotificationDraft) {
  if (!draft.scheduledAt || draft.reason !== "scheduled") return;
  const existing = await db.notification.findUnique({ where: { dedupeKey: draft.dedupeKey } });
  if (existing) return;
  await db.notification.create({
    data: {
      userId,
      type: draft.type as Prisma.NotificationCreateInput["type"],
      channel: "IN_APP",
      scheduledAt: draft.scheduledAt,
      copyKey: draft.copyKey,
      dedupeKey: draft.dedupeKey,
      refType: draft.refType,
      refId: draft.refId,
      status: "SCHEDULED",
    },
  });
  await db.job.create({
    data: {
      type: "DELIVER_NOTIFICATION",
      payload: { dedupeKey: draft.dedupeKey },
      runAt: draft.scheduledAt,
      dedupeKey: `job:${draft.dedupeKey}`,
    },
  });
}

export async function scheduleBriefing(db: Db, userId: string, plannedDate: Date) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const draft = dailyBriefing({
    userId,
    day: day(plannedDate) ?? plannedDate.toISOString().slice(0, 10),
    briefingTimeLocal: user.briefingTimeLocal,
    dayBefore: user.briefingDayBefore,
    timeZone: user.timezone,
  });
  await saveNotification(db, userId, draft);
}
