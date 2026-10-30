import type { Prisma, PrismaClient } from "@prisma/client";
import { HttpErrorCode, type RacePlan } from "@carbadapt/contracts";
import { raceFluidTimeline } from "@carbadapt/engine";
import { HttpError } from "../http/errors.js";
import { writeFuelingPlan } from "./plans.js";

type Db = PrismaClient | Prisma.TransactionClient;

export async function getRacePlan(db: Db, userId: string, workoutId: string) {
  return { racePlan: await presentRacePlan(db, userId, workoutId) };
}

export async function saveRacePlan(
  db: Db,
  userId: string,
  workoutId: string,
  body: {
    extraBottlesMl: number[];
    refillKm: number[];
    distanceKm?: number;
    durationMin?: number;
  },
) {
  const workout = await loadStageWorkout(db, userId, workoutId);
  const stage = workout.stage;
  if (!stage) throw new HttpError(HttpErrorCode.InvalidRequest);
  const distance = body.distanceKm ?? decimal(stage.distanceKm);
  if (body.refillKm.length > 0 && (distance == null || !(distance > 0))) {
    throw new HttpError(HttpErrorCode.InvalidRequest, { field: "refillKm" });
  }
  if (distance != null) {
    for (const km of body.refillKm) {
      if (!(km > 0) || km >= distance) throw new HttpError(HttpErrorCode.InvalidRequest, { field: "refillKm" });
    }
  }
  if (body.distanceKm != null) {
    await db.stage.update({ where: { id: stage.id }, data: { distanceKm: body.distanceKm } });
  }
  if (body.durationMin != null) {
    await db.stage.update({ where: { id: stage.id }, data: { estimatedDurationMin: body.durationMin } });
    await db.workout.update({ where: { id: workout.id }, data: { durationMin: body.durationMin } });
    await writeFuelingPlan(
      db,
      userId,
      { id: workout.id, sport: workout.sport, durationMin: body.durationMin, stageId: stage.id },
      null,
    );
  }
  await db.racePlan.upsert({
    where: { stageId: stage.id },
    create: {
      userId,
      stageId: stage.id,
      extraBottlesMl: body.extraBottlesMl,
      refillKm: body.refillKm,
    },
    update: {
      extraBottlesMl: body.extraBottlesMl,
      refillKm: body.refillKm,
    },
  });
  return { racePlan: await presentRacePlan(db, userId, workoutId) };
}

async function presentRacePlan(db: Db, userId: string, workoutId: string): Promise<RacePlan> {
  const workout = await loadStageWorkout(db, userId, workoutId);
  const stage = workout.stage;
  if (!stage) throw new HttpError(HttpErrorCode.InvalidRequest);
  const [containers, physical] = await Promise.all([
    db.container.findMany({ where: { userId } }),
    db.physicalData.findUnique({ where: { userId } }),
  ]);
  const ownedFluidMl = containers
    .filter((row) => row.usualContent !== "GEL_CONCENTRATE")
    .reduce((sum, row) => sum + row.capacityMl, 0);
  const extraBottlesMl = integers(stage.racePlan?.extraBottlesMl);
  const refillKm = numbers(stage.racePlan?.refillKm);
  const carried = ownedFluidMl + extraBottlesMl.reduce((sum, ml) => sum + ml, 0);
  const distanceKm = decimal(stage.distanceKm);
  const durationMin = stage.estimatedDurationMin;
  const sweatRateLPerH = physical?.sweatRateLPerH == null ? null : Number(physical.sweatRateLPerH);
  const courseAidKm = stage.aidStations
    .map((row) => Number(row.kmMark))
    .filter((km) => Number.isFinite(km))
    .sort((left, right) => left - right);
  const computable = sweatRateLPerH != null && distanceKm != null && distanceKm > 0 && durationMin > 0;
  const line =
    computable && sweatRateLPerH != null && distanceKm != null
      ? raceFluidTimeline({
          distanceKm,
          durationMin,
          sweatLPerH: sweatRateLPerH,
          carriedMl: carried,
          refillKm,
        })
      : null;
  return {
    workoutId: workout.id,
    stageId: stage.id,
    saved: stage.racePlan != null,
    distanceKm,
    durationMin,
    sweatRateLPerH,
    ownedFluidMl,
    extraBottlesMl,
    refillKm,
    courseAidKm,
    carriedMl: line?.carriedMl ?? Math.round(carried),
    neededMl: line?.neededMl ?? null,
    missingMl: line?.missingMl ?? null,
    enough: line?.enough ?? null,
    computable,
    runOutKm: line?.runOutKm ?? null,
    runOutMin: line?.runOutMin ?? null,
    stationsReachedKm: line?.stationsReached ?? [],
    stationsMissedKm: line?.stationsMissed ?? [],
    refills: line?.refills ?? [],
    points: line?.points ?? [],
  };
}

async function loadStageWorkout(db: Db, userId: string, workoutId: string) {
  const workout = await db.workout.findFirst({
    where: { id: workoutId, userId },
    include: { stage: { include: { aidStations: true, racePlan: true } } },
  });
  if (!workout) throw new HttpError(HttpErrorCode.WorkoutNotFound);
  if (!workout.stage) throw new HttpError(HttpErrorCode.InvalidRequest);
  return workout;
}

function decimal(value: { toString(): string } | number | null | undefined): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function numbers(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  for (const item of value) {
    if (typeof item === "number" && Number.isFinite(item)) out.push(item);
  }
  return out;
}

function integers(value: unknown): number[] {
  return numbers(value).filter((item) => Number.isInteger(item));
}
