import type { Prisma } from "@prisma/client";
import type {
  FuelingPlan,
  Physical,
  StageRecovery,
  SweatTest,
  Todo,
  User,
  Workout,
} from "@carbadapt/contracts";
import { day, iso, toNumber } from "./values.js";

type UserRow = Prisma.UserGetPayload<object>;
type PhysicalRow = Prisma.PhysicalDataGetPayload<object>;
type FuelingRow = Prisma.FuelingPlanGetPayload<object>;
type WorkoutRow = Prisma.WorkoutGetPayload<{
  include: { fuelingPlans: true; feedback: true; activity: true };
}>;
type ContainerRow = Prisma.ContainerGetPayload<{ include: { calibrations: true } }>;
type SweatRow = Prisma.SweatTestGetPayload<object>;
type FoodRow = Prisma.FoodItemGetPayload<object>;
type ProductRow = Prisma.ProductGetPayload<object>;
type TodoRow = Prisma.TodoItemGetPayload<object>;
type LogRow = Prisma.PostWorkoutLogGetPayload<object>;
type AchievementRow = Prisma.AchievementGetPayload<object>;
type GutRow = Prisma.GutTrainingPlanGetPayload<{ include: { steps: true; decisions: true } }>;
type RaceRow = Prisma.RaceGetPayload<{
  include: {
    stages: { include: { aidStations: true; recovery: true } };
    aidStations: true;
    strategies: true;
    loadingDays: true;
    rehearsal: true;
  };
}>;
type AidRow = {
  id: string;
  kmMark: Prisma.Decimal;
  hasWater: boolean;
  hasIsotonic: boolean;
  hasGels: boolean;
  stageId: string | null;
};
type RecoveryRow = Prisma.StageRecoveryPlanGetPayload<object>;

export const SWEAT_FORMULA = "pre − post + fluid − urine, divided by hours";

export const workoutInclude = {
  fuelingPlans: true,
  feedback: true,
  activity: true,
} as const;

export const containerInclude = { calibrations: true } as const;

export const raceInclude = {
  stages: { include: { aidStations: true, recovery: true }, orderBy: { index: "asc" as const } },
  aidStations: true,
  strategies: true,
  loadingDays: true,
  rehearsal: true,
} as const;

export const planInclude = { steps: true, decisions: true } as const;

export function presentUser(user: UserRow): User {
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

export function presentPhysical(row: PhysicalRow | null): Physical | null {
  if (!row) return null;
  return {
    weightKg: toNumber(row.weightKg),
    ftpW: row.ftpW,
    sweatRateLPerH: toNumber(row.sweatRateLPerH),
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

export function presentTodo(row: TodoRow): Todo {
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

export function presentFueling(row: FuelingRow): FuelingPlan {
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

export function presentWorkout(row: WorkoutRow): Workout {
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

export function presentProduct(row: ProductRow) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    brand: row.brand,
    servingG: toNumber(row.servingG),
    scoopG: toNumber(row.scoopG),
    carbsG: toNumber(row.carbsG) ?? 0,
    sodiumMg: row.sodiumMg,
    caffeineMg: row.caffeineMg,
    label: row.label,
    favorite: row.favorite,
    source: row.source,
    createdAt: iso(row.createdAt),
    deletedAt: iso(row.deletedAt),
  };
}

export function presentContainer(row: ContainerRow) {
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
      mlPerSip: toNumber(item.mlPerSip),
      gPerSqueeze: toNumber(item.gPerSqueeze),
      validationsLeft: item.validationsLeft,
      createdAt: iso(item.createdAt),
    })),
  };
}

export function presentSweat(row: SweatRow): SweatTest {
  return {
    id: row.id,
    workoutId: row.workoutId,
    status: row.status,
    scheduledFor: day(row.scheduledFor),
    movedFrom: day(row.movedFrom),
    preWeightKg: toNumber(row.preWeightKg),
    postWeightKg: toNumber(row.postWeightKg),
    fluidMl: row.fluidMl,
    urineMl: row.urineMl,
    startedAt: iso(row.startedAt),
    endedAt: iso(row.endedAt),
    temperatureC: toNumber(row.temperatureC),
    humidityPct: row.humidityPct,
    sweatRateLPerH: toNumber(row.sweatRateLPerH),
    formula: SWEAT_FORMULA,
  };
}

export function presentFood(row: FoodRow) {
  return {
    id: row.id,
    fdcId: row.fdcId,
    name: row.name,
    category: row.category,
    carbsPer100g: toNumber(row.carbsPer100g) ?? 0,
    proteinPer100g: toNumber(row.proteinPer100g),
    fatPer100g: toNumber(row.fatPer100g),
    fiberPer100g: toNumber(row.fiberPer100g),
    sodiumMgPer100g: row.sodiumMgPer100g,
    portionG: toNumber(row.portionG),
    portionLabel: row.portionLabel,
    fodmap: row.fodmap,
  };
}

export function presentLog(row: LogRow) {
  return {
    id: row.id,
    workoutId: row.workoutId,
    intakeCarbsG: row.intakeCarbsG,
    intakeItems: row.intakeItems,
    intakeTiming: row.intakeTiming,
    fluidMl: row.fluidMl,
    symptomUpper: row.symptomUpper,
    symptomLower: row.symptomLower,
    symptomSystemic: row.symptomSystemic,
    feeling: row.feeling,
    containerWeighIns: row.containerWeighIns,
    followedPrompts: row.followedPrompts,
    sipProposal: row.sipProposal,
    sweatPostWeightKg: toNumber(row.sweatPostWeightKg),
    countsForPlan: row.countsForPlan,
    ladderEligible: row.ladderEligible,
    submittedAt: iso(row.submittedAt),
  };
}

export function presentAchievement(row: AchievementRow) {
  return {
    id: row.id,
    type: row.type,
    valueGh: row.valueGh,
    workoutId: row.workoutId,
    achievedAt: iso(row.achievedAt),
    celebratedAt: iso(row.celebratedAt),
  };
}

export function presentPlan(row: GutRow) {
  return {
    id: row.id,
    targetKind: row.targetKind,
    raceId: row.raceId,
    targetDate: day(row.targetDate),
    startGh: row.startGh,
    goalGh: row.goalGh,
    defaultGh: row.defaultGh,
    tooFast: row.tooFast,
    status: row.status,
    engineVersion: row.engineVersion,
    warningAbove120: row.goalGh > 120,
    steps: row.steps
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((step) => ({
        id: step.id,
        index: step.index,
        gh: step.gh,
        approxDate: day(step.approxDate),
        status: step.status,
      })),
    decisions: row.decisions.map((item) => ({
      id: item.id,
      outcome: item.outcome,
      fromGh: item.fromGh,
      toGh: item.toGh,
      inputLogIds: item.inputLogIds,
      reason: item.reason,
      engineVersion: item.engineVersion,
      createdAt: iso(item.createdAt),
    })),
  };
}

export function presentAid(row: AidRow) {
  return {
    id: row.id,
    kmMark: toNumber(row.kmMark) ?? 0,
    hasWater: row.hasWater,
    hasIsotonic: row.hasIsotonic,
    hasGels: row.hasGels,
    stageId: row.stageId,
  };
}

export function presentRecovery(row: RecoveryRow): StageRecovery {
  return {
    id: row.id,
    stageId: row.stageId,
    gapCase: row.gapCase,
    gapMin: row.gapMin,
    carbsTargetG: row.carbsTargetG,
    proteinTargetG: row.proteinTargetG,
    fluidTargetMl: row.fluidTargetMl,
    sodiumTargetMg: row.sodiumTargetMg,
    sensitiveStomach: row.sensitiveStomach,
    meals: row.meals,
    engineVersion: row.engineVersion,
  };
}

export function presentRace(row: RaceRow) {
  return {
    id: row.id,
    name: row.name,
    date: day(row.date),
    startAt: iso(row.startAt),
    estimatedDurationMin: row.estimatedDurationMin,
    type: row.type,
    distanceKm: toNumber(row.distanceKm),
    elevationGainM: row.elevationGainM,
    carbLoading: row.carbLoading,
    isMultiStage: row.isMultiStage,
    stages: row.stages.map((stage) => ({
      id: stage.id,
      index: stage.index,
      date: day(stage.date),
      startAt: iso(stage.startAt),
      estimatedDurationMin: stage.estimatedDurationMin,
      type: stage.type,
      distanceKm: toNumber(stage.distanceKm),
      elevationGainM: stage.elevationGainM,
      activityId: stage.activityId,
      arrivalAt: iso(stage.arrivalAt),
      arrivalSource: stage.arrivalSource,
      aidStations: stage.aidStations.map(presentAid),
      recovery: stage.recovery ? presentRecovery(stage.recovery) : null,
    })),
    aidStations: row.aidStations.map(presentAid),
    strategies: row.strategies.map((strategy) => ({
      id: strategy.id,
      refillPoints: strategy.refillPoints,
      description: strategy.description,
      carryList: strategy.carryList,
      chosen: strategy.chosen,
    })),
    loadingDays: row.loadingDays.map((item) => ({
      id: item.id,
      day: item.day,
      date: day(item.date),
      targetCarbsG: item.targetCarbsG,
      isRehearsal: item.isRehearsal,
    })),
    rehearsal: row.rehearsal
      ? {
          id: row.rehearsal.id,
          date: day(row.rehearsal.date),
          status: row.rehearsal.status,
          longRideWorkoutId: row.rehearsal.longRideWorkoutId,
          dismissedAt: iso(row.rehearsal.dismissedAt),
        }
      : null,
  };
}
