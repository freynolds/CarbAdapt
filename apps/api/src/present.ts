import type { Prisma } from "@carbadapt/db";
import { day, iso, num } from "./http.js";

type UserRow = Prisma.UserGetPayload<{ include: { physical: true } }>;

export function presentUser(user: Prisma.UserGetPayload<object>) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    locale: user.locale,
    theme: user.theme,
    timezone: user.timezone,
    mode: user.mode,
    briefingTimeLocal: user.briefingTimeLocal,
    briefingDayBefore: user.briefingDayBefore,
    deletedAt: iso(user.deletedAt),
  };
}

export function presentPhysical(row: NonNullable<UserRow["physical"]> | null) {
  if (!row) return null;
  return {
    weightKg: num(row.weightKg),
    ftpW: row.ftpW,
    sweatRateLPerH: num(row.sweatRateLPerH),
    sweatRateSource: row.sweatRateSource,
    ghTolerance: row.ghTolerance,
    maxHr: row.maxHr,
    hrZones: row.hrZones,
    age: row.age,
    sex: row.sex,
    heightCm: row.heightCm,
    fieldSources: row.fieldSources,
    updatedAt: iso(row.updatedAt),
  };
}

export function presentTodo(row: Prisma.TodoItemGetPayload<object>) {
  return {
    id: row.id,
    type: row.type,
    tier: row.tier,
    status: row.status,
    refType: row.refType,
    refId: row.refId,
    payload: row.payload,
    createdAt: iso(row.createdAt),
    closedAt: iso(row.closedAt),
  };
}

export function presentWorkout(row: Prisma.WorkoutGetPayload<{ include: { fuelingPlans: true; feedback: true; activity: true } }>) {
  const plan = row.fuelingPlans.find((item) => item.isCurrent) ?? row.fuelingPlans[0] ?? null;
  return {
    id: row.id,
    source: row.source,
    externalId: row.externalId,
    sport: row.sport,
    kind: row.kind,
    workoutType: row.workoutType,
    name: row.name,
    plannedStart: iso(row.plannedStart),
    plannedDate: day(row.plannedDate),
    durationMin: row.durationMin,
    structure: row.structure,
    status: row.status,
    stageId: row.stageId,
    needsIntake: row.status === "COMPLETED" && !row.feedback,
    activity: row.activity
      ? {
          id: row.activity.id,
          provider: row.activity.provider,
          externalId: row.activity.externalId,
          dedupeGroup: row.activity.dedupeGroup,
          summary: row.activity.summary,
          startAt: iso(row.activity.startAt),
          durationMin: row.activity.durationMin,
        }
      : null,
    fuelingPlan: plan ? presentFueling(plan) : null,
  };
}

export function presentFueling(row: Prisma.FuelingPlanGetPayload<object>) {
  return {
    id: row.id,
    workoutId: row.workoutId,
    engineVersion: row.engineVersion,
    targetGPerH: row.targetGPerH,
    totalCarbsG: row.totalCarbsG,
    totalFluidMl: row.totalFluidMl,
    totalSodiumMg: row.totalSodiumMg,
    schedule: row.schedule,
    carryList: row.carryList,
    userAdjusted: row.userAdjusted,
    isCurrent: row.isCurrent,
    weather: row.weather,
    createdAt: iso(row.createdAt),
  };
}

export function presentProduct(row: Prisma.ProductGetPayload<object>) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    brand: row.brand,
    servingG: num(row.servingG),
    scoopG: num(row.scoopG),
    carbsG: num(row.carbsG),
    sodiumMg: row.sodiumMg,
    caffeineMg: row.caffeineMg,
    label: row.label,
    favorite: row.favorite,
    source: row.source,
    createdAt: iso(row.createdAt),
    deletedAt: iso(row.deletedAt),
  };
}

export function presentContainer(
  row: Prisma.ContainerGetPayload<{ include: { calibrations: true } }>,
) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    colorHex: row.colorHex,
    capacityMl: row.capacityMl,
    usualContent: row.usualContent,
    createdAt: iso(row.createdAt),
    calibrations: row.calibrations.map((item) => ({
      id: item.id,
      weightsG: item.weightsG,
      mlPerSip: num(item.mlPerSip),
      gPerSqueeze: num(item.gPerSqueeze),
      validationsLeft: item.validationsLeft,
      createdAt: iso(item.createdAt),
    })),
  };
}

export function presentSweat(row: Prisma.SweatTestGetPayload<object>) {
  return {
    id: row.id,
    workoutId: row.workoutId,
    status: row.status,
    scheduledFor: day(row.scheduledFor),
    movedFrom: day(row.movedFrom),
    preWeightKg: num(row.preWeightKg),
    postWeightKg: num(row.postWeightKg),
    fluidMl: row.fluidMl,
    urineMl: row.urineMl,
    startedAt: iso(row.startedAt),
    endedAt: iso(row.endedAt),
    temperatureC: num(row.temperatureC),
    humidityPct: row.humidityPct,
    sweatRateLPerH: num(row.sweatRateLPerH),
    formula: "pre − post + fluid − urine, divided by hours",
  };
}

export function presentFood(
  row: Prisma.FoodItemGetPayload<object>,
  precision: "full" | "abridged" | null,
) {
  return {
    id: row.id,
    fdcId: row.fdcId,
    name: row.name,
    category: row.category,
    carbsPer100g: num(row.carbsPer100g),
    proteinPer100g: num(row.proteinPer100g),
    fatPer100g: num(row.fatPer100g),
    fiberPer100g: num(row.fiberPer100g),
    sodiumMgPer100g: row.sodiumMgPer100g,
    portionG: num(row.portionG),
    portionLabel: row.portionLabel,
    fodmap: row.fodmap,
    precision,
  };
}

export { day, iso, num };
