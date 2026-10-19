import type { Prisma, PrismaClient } from "@prisma/client";
import {
  ENGINE_VERSION,
  dailyBriefing,
  fuelingPlan,
  type EngineSport,
  type NotificationDraft,
} from "@carbadapt/engine";
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

function productFuel(product: {
  id: string;
  type: "DRINK_MIX" | "GEL" | "SOLID";
  name: string;
  carbsG: { toString(): string } | number;
  sodiumMg: number | null;
  scoopG: { toString(): string } | number | null;
}) {
  return {
    id: product.id,
    type: product.type,
    name: product.name,
    carbsG: Number(product.carbsG),
    sodiumMg: product.sodiumMg,
    scoopG: product.scoopG == null ? null : Number(product.scoopG),
  };
}

export async function writeFuelingPlan(
  db: Db,
  userId: string,
  workout: {
    id: string;
    sport: "CYCLING" | "RUNNING" | "TRAIL_RUNNING" | "OTHER";
    durationMin: number | null;
    stageId?: string | null;
  },
  chosenGPerH: number | null,
) {
  const ctx = await athleteFuelingContext(db, userId);
  const raceDay = Boolean(workout.stageId);
  const result = fuelingPlan({
    durationMin: workout.durationMin,
    sport: workout.sport,
    mode: raceDay ? "FUEL_MY_WORKOUTS" : ctx.user.mode,
    currentStepGh: raceDay ? null : ctx.currentGh,
    chosenGPerH,
    sweatRateLPerH: ctx.user.physical?.sweatRateLPerH == null ? null : Number(ctx.user.physical.sweatRateLPerH),
    products: favoriteFirst(ctx.products).map(productFuel),
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

export function raceSport(type: string): EngineSport {
  const value = type.toLowerCase();
  if (value.includes("trail")) return "TRAIL_RUNNING";
  if (value.includes("run")) return "RUNNING";
  if (value === "other") return "OTHER";
  return "CYCLING";
}

/** Race strategy uses fuel mode. A single g/h inside the band stays unset. */
export async function raceCarryList(
  db: Db,
  userId: string,
  race: { estimatedDurationMin: number; type: string },
) {
  const ctx = await athleteFuelingContext(db, userId);
  return fuelingPlan({
    durationMin: race.estimatedDurationMin,
    sport: raceSport(race.type),
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: null,
    chosenGPerH: null,
    sweatRateLPerH:
      ctx.user.physical?.sweatRateLPerH == null ? null : Number(ctx.user.physical.sweatRateLPerH),
    products: favoriteFirst(ctx.products).map(productFuel),
    containers: ctx.containers.map((container) => ({
      id: container.id,
      name: container.name,
      capacityMl: container.capacityMl,
      usualContent: container.usualContent,
    })),
  });
}

function favoriteFirst<T extends { favorite: boolean }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => Number(right.favorite) - Number(left.favorite));
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
