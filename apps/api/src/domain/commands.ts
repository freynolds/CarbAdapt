import type { Prisma, PrismaClient } from "@prisma/client";
import { RecoveryGuidanceText, StrategyNote } from "@carbadapt/contracts";
import {
  ENGINE_VERSION,
  IN_FIELD_VALIDATIONS,
  LADDER_STEP_G,
  MAX_GH,
  SWEAT_TEST_PROTOCOL_MIN,
  adapt,
  gutRaceAllowed,
  agreedSymptom,
  buildLadder,
  calibrateSips,
  carbLoadingBands,
  carbLoadingNotification,
  ghIncrease,
  loadingGrams,
  raceBreakfastNotification,
  recoveryOccasions,
  sessionEligible,
  stageNotification,
  stageRecovery,
  startingPoint,
  sweatRateLPerH,
  sweatTestTimers,
  type AdaptationResult,
  type StageSport,
} from "@carbadapt/engine";
import { HttpError, HttpErrorCode } from "../http/errors.js";
import {
  presentContainer,
  presentProduct,
  presentRace,
  presentRecovery,
  presentSweat,
  presentUser,
  raceInclude,
  workoutInclude,
  containerInclude,
  planInclude,
  presentPlan,
  presentWorkout,
  presentLog,
  presentAchievement,
  presentTodo,
} from "../http/present.js";
import { hashToken, newToken } from "../http/session.js";
import { iso, toNumber } from "../http/values.js";
import { rememberMagicLink } from "./magic.js";
import { buildIntakePrefill } from "./intake-prefill.js";
import { carryPayload, raceCarryList, refreshCarryPlans, saveNotification, scheduleBriefing, writeFuelingPlan } from "./plans.js";
import type { z } from "zod";
import type {
  calibrationBodySchema,
  claimSchema,
  containerBodySchema,
  feedbackBodySchema,
  gutBodySchema,
  magicLinkSchema,
  magicVerifySchema,
  onboardingSchema,
  patchFuelingSchema,
  patchMeSchema,
  patchPhysicalSchema,
  productBodySchema,
  raceBodySchema,
  recoveryPatchSchema,
  resolveConflictSchema,
  startingPointBodySchema,
  sweatCompleteSchema,
  sweatCreateSchema,
  sweatRecordSchema,
  sweatStartSchema,
  todoPatchSchema,
  webhookBodySchema,
  workoutBodySchema,
} from "./schemas.js";

type Db = PrismaClient;
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value))
    return value as Record<string, unknown>;
  return null;
}

function stageSport(type: string): StageSport {
  const value = type.trim().toLowerCase();
  if (value === "trail" || value === "trail_running") return "TRAIL_RUNNING";
  if (value === "running") return "RUNNING";
  if (value === "cycling") return "CYCLING";
  return "OTHER";
}

function guidanceLines(keys: string[]): string[] {
  return keys.map((key) => RecoveryGuidanceText[key as keyof typeof RecoveryGuidanceText] ?? key);
}

function weekKey(date: Date): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - weekday);
  const start = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((copy.getTime() - start.getTime()) / 86_400_000 + 1) / 7);
  return `${copy.getUTCFullYear()}-W${week}`;
}

async function openSession(db: Db, userId: string) {
  const token = newToken();
  await db.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + SESSION_MS) },
  });
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  return { token, user: presentUser(user) };
}

export async function patchMe(db: Db, userId: string, body: z.infer<typeof patchMeSchema>) {
  await db.user.update({ where: { id: userId }, data: body });
  if (body.carbSplit != null || body.fluidPlan != null) await refreshCarryPlans(db, userId);
  return loadMe(db, userId);
}

export async function deleteMe(db: Db, userId: string) {
  await db.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  await db.session.deleteMany({ where: { userId } });
  return { deleted: true as const };
}

export async function loadMe(db: Db, userId: string) {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: { physical: true, subscription: true },
  });
  return {
    user: presentUser(user),
    physical: user.physical
      ? {
          weightKg: toNumber(user.physical.weightKg),
          ftpW: user.physical.ftpW,
          sweatRateLPerH: toNumber(user.physical.sweatRateLPerH),
          sweatRateSource: user.physical.sweatRateSource,
          ghTolerance: user.physical.ghTolerance,
          maxHr: user.physical.maxHr,
          hrZones: user.physical.hrZones,
          age: user.physical.age,
          sex: user.physical.sex,
          heightCm: user.physical.heightCm,
          fieldSources: user.physical.fieldSources,
          updatedAt: iso(user.physical.updatedAt),
        }
      : null,
    subscription: user.subscription ? { status: user.subscription.status } : null,
  };
}

export async function patchPhysical(
  db: Db,
  userId: string,
  body: z.infer<typeof patchPhysicalSchema>,
) {
  const physical = {
    ...body,
    hrZones: body.hrZones as Prisma.InputJsonValue | undefined,
  };
  await db.physicalData.upsert({
    where: { userId },
    create: { userId, ...physical },
    update: physical,
  });
  const workouts = await db.workout.findMany({ where: { userId, status: "PLANNED" } });
  for (const workout of workouts) await writeFuelingPlan(db, userId, workout, null);
  const row = await db.physicalData.findUnique({ where: { userId } });
  return {
    physical: row
      ? {
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
        }
      : null,
  };
}

export async function resolveConflict(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof resolveConflictSchema>,
) {
  const row = await db.physicalDataConflict.findFirst({ where: { id, userId } });
  if (!row) throw new HttpError(HttpErrorCode.ConflictNotFound);
  if (row.resolvedAt) throw new HttpError(HttpErrorCode.ConflictAlreadyResolved);
  await db.physicalDataConflict.update({
    where: { id },
    data: { resolvedWith: body.resolvedWith, resolvedAt: new Date() },
  });
  if (
    body.resolvedWith === "synced" &&
    row.field === "ftp" &&
    typeof row.syncedValue === "number"
  ) {
    await db.physicalData.upsert({
      where: { userId },
      create: { userId, ftpW: row.syncedValue },
      update: { ftpW: row.syncedValue },
    });
  }
  await db.todoItem.updateMany({
    where: { userId, type: "DATA_CONFLICT", refId: id, status: "OPEN" },
    data: { status: "DONE", closedAt: new Date() },
  });
  return { resolved: true as const };
}

export async function createContainer(
  db: Db,
  userId: string,
  body: z.infer<typeof containerBodySchema>,
) {
  const row = await db.container.create({ data: { userId, ...body }, include: containerInclude });
  return { container: presentContainer(row) };
}

export async function updateContainer(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof containerBodySchema>,
) {
  const existing = await db.container.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.ContainerNotFound);
  const row = await db.container.update({ where: { id }, data: body, include: containerInclude });
  return { container: presentContainer(row) };
}

export async function deleteContainer(db: Db, userId: string, id: string) {
  const existing = await db.container.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.ContainerNotFound);
  await db.container.delete({ where: { id } });
  return { deleted: true as const };
}

export async function calibrateContainer(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof calibrationBodySchema>,
) {
  const container = await db.container.findFirst({ where: { id, userId } });
  if (!container) throw new HttpError(HttpErrorCode.ContainerNotFound);
  const result = calibrateSips(body.weightsG, container.usualContent);
  if (!result) throw new HttpError(HttpErrorCode.CalibrationInvalid);
  await db.containerCalibration.create({
    data: {
      containerId: id,
      weightsG: body.weightsG,
      mlPerSip: result.mlPerSip,
      gPerSqueeze: result.gPerSqueeze,
      validationsLeft: IN_FIELD_VALIDATIONS,
    },
  });
  const row = await db.container.findUniqueOrThrow({ where: { id }, include: containerInclude });
  return { container: presentContainer(row) };
}

export async function createProduct(
  db: Db,
  userId: string,
  body: z.infer<typeof productBodySchema>,
) {
  const row = await db.product.create({
    data: {
      userId,
      ...body,
      label: body.label as Prisma.InputJsonValue | undefined,
      source: "MANUAL",
      favorite: body.favorite ?? false,
    },
  });
  return { product: presentProduct(row) };
}

export async function updateProduct(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof productBodySchema>,
) {
  const existing = await db.product.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new HttpError(HttpErrorCode.ProductNotFound);
  const row = await db.product.update({
    where: { id },
    data: { ...body, label: body.label as Prisma.InputJsonValue | undefined },
  });
  return { product: presentProduct(row) };
}

function planUsesProduct(value: unknown, productId: string): boolean {
  const record = asRecord(value);
  const items = Array.isArray(record?.items) ? record.items : [];
  return items.some((item) => asRecord(item)?.productId === productId);
}

export async function deleteProduct(db: Db, userId: string, id: string, replacementId?: string) {
  const existing = await db.product.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) throw new HttpError(HttpErrorCode.ProductNotFound);
  const plans = await db.fuelingPlan.findMany({
    where: { isCurrent: true, workout: { userId, status: "PLANNED" } },
    include: { workout: true },
  });
  const used = plans.filter((plan) => planUsesProduct(plan.carryList, id));
  if (used.length > 0 && !replacementId) {
    throw new HttpError(HttpErrorCode.ProductInUse, {
      workoutIds: used.map((plan) => plan.workoutId),
    });
  }
  if (replacementId) {
    const replacement = await db.product.findFirst({
      where: { id: replacementId, userId, deletedAt: null },
    });
    if (!replacement) throw new HttpError(HttpErrorCode.ProductNotFound);
  }
  await db.product.update({ where: { id }, data: { deletedAt: new Date() } });
  for (const plan of used) await writeFuelingPlan(db, userId, plan.workout, null);
  return { deleted: true as const };
}

export async function createWorkout(
  db: Db,
  userId: string,
  body: z.infer<typeof workoutBodySchema>,
) {
  const row = await db.workout.create({
    data: {
      userId,
      source: "MANUAL",
      sport: body.sport,
      kind: body.kind ?? "STANDARD",
      workoutType: body.workoutType ?? null,
      name: body.name,
      plannedDate: new Date(`${body.plannedDate}T00:00:00.000Z`),
      plannedStart: body.plannedStart ? new Date(body.plannedStart) : null,
      durationMin: body.durationMin ?? null,
      status: "PLANNED",
    },
  });
  await writeFuelingPlan(db, userId, row, null);
  await scheduleBriefing(db, userId, row.plannedDate);
  const full = await db.workout.findUniqueOrThrow({
    where: { id: row.id },
    include: workoutInclude,
  });
  return { workout: presentWorkout(full) };
}

export async function updateWorkout(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof workoutBodySchema>,
) {
  const existing = await db.workout.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.WorkoutNotFound);
  await db.workout.update({
    where: { id },
    data: {
      name: body.name,
      sport: body.sport,
      workoutType: body.workoutType ?? null,
      plannedDate: new Date(`${body.plannedDate}T00:00:00.000Z`),
      durationMin: body.durationMin ?? null,
      plannedStart: body.plannedStart ? new Date(body.plannedStart) : null,
      kind: body.kind ?? existing.kind,
    },
  });
  const row = await db.workout.findUniqueOrThrow({ where: { id } });
  await writeFuelingPlan(db, userId, row, null);
  const full = await db.workout.findUniqueOrThrow({ where: { id }, include: workoutInclude });
  return { workout: presentWorkout(full) };
}

export async function deleteWorkout(db: Db, userId: string, id: string) {
  const existing = await db.workout.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.WorkoutNotFound);
  await db.workout.delete({ where: { id } });
  return { deleted: true as const };
}

export async function adjustFueling(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof patchFuelingSchema>,
) {
  const workout = await db.workout.findFirst({ where: { id, userId } });
  if (!workout) throw new HttpError(HttpErrorCode.WorkoutNotFound);
  await writeFuelingPlan(db, userId, workout, body.targetGPerH);
  const full = await db.workout.findUniqueOrThrow({ where: { id }, include: workoutInclude });
  return { fuelingPlan: presentWorkout(full).fuelingPlan };
}

function feedbackData(body: z.infer<typeof feedbackBodySchema>, eligible: boolean) {
  return {
    intakeCarbsG: body.intakeCarbsG ?? null,
    fluidMl: body.fluidMl ?? null,
    symptomUpper: body.symptomUpper ?? null,
    symptomLower: body.symptomLower ?? null,
    symptomSystemic: body.symptomSystemic ?? null,
    feeling: body.feeling ?? null,
    followedPrompts: body.followedPrompts ?? null,
    countsForPlan: body.countsForPlan ?? true,
    intakeItems: (body.intakeItems ?? null) as Prisma.InputJsonValue,
    intakeTiming: (body.intakeTiming ?? null) as Prisma.InputJsonValue,
    containerWeighIns: (body.containerWeighIns ?? null) as Prisma.InputJsonValue,
    sipProposal: (body.sipProposal ?? null) as Prisma.InputJsonValue,
    sweatPostWeightKg: body.sweatPostWeightKg ?? null,
    ladderEligible: eligible,
  };
}

export async function submitFeedback(
  db: Db,
  userId: string,
  workoutId: string,
  body: z.infer<typeof feedbackBodySchema>,
) {
  const workout = await db.workout.findFirst({
    where: { id: workoutId, userId },
    include: { fuelingPlans: true },
  });
  if (!workout) throw new HttpError(HttpErrorCode.WorkoutNotFound);
  const existing = await db.postWorkoutLog.findUnique({ where: { workoutId } });
  const eligible = sessionEligible(workout.sport, workout.durationMin);
  const data = feedbackData(body, eligible);
  const log = existing
    ? await db.postWorkoutLog.update({ where: { id: existing.id }, data })
    : await db.postWorkoutLog.create({ data: { workoutId, ...data } });
  if (existing) await reapplyAdaptation(db, userId, workout);
  else await applyAdaptation(db, userId, workout);
  if (workout.stageId) await recomputeStage(db, userId, workout.stageId);
  const prefill = await buildIntakePrefill(db, userId, workout);
  return { created: !existing, body: { log: presentLog(log), prefill } };
}

type LadderStepRow = {
  id: string;
  index: number;
  gh: number;
  status: "DONE" | "CURRENT" | "UPCOMING";
};

type PreservedAchievement = {
  workoutId: string | null;
  valueGh: number;
  celebratedAt: Date | null;
};

function decisionLogIds(inputLogIds: Prisma.JsonValue): string[] {
  return Array.isArray(inputLogIds)
    ? inputLogIds.filter((item): item is string => typeof item === "string")
    : [];
}

async function commitDecision(
  db: Db,
  userId: string,
  planId: string,
  steps: LadderStepRow[],
  current: LadderStepRow | undefined,
  result: AdaptationResult,
  triggeringWorkoutId: string,
  preserved: PreservedAchievement[],
): Promise<LadderStepRow | undefined> {
  if (result.outcome === "NONE") return current;
  await db.adaptationDecision.create({
    data: {
      planId,
      outcome: result.outcome,
      fromGh: result.fromGh,
      toGh: result.toGh,
      inputLogIds: result.inputLogIds,
      reason: result.reason,
      engineVersion: ENGINE_VERSION,
    },
  });
  if (!current) return current;
  if (result.outcome === "ADVANCE") {
    const next = steps.find((step) => step.index === current.index + 1);
    await db.ladderStep.update({ where: { id: current.id }, data: { status: "DONE" } });
    current.status = "DONE";
    if (next) {
      await db.ladderStep.update({ where: { id: next.id }, data: { status: "CURRENT" } });
      next.status = "CURRENT";
    }
    const previous = await db.achievement.aggregate({ where: { userId }, _max: { valueGh: true } });
    const achievement = ghIncrease({
      previousMaxGh: previous._max.valueGh,
      toleratedGh: result.toGh,
    });
    if (achievement) {
      const match = preserved.find(
        (item) => item.workoutId === triggeringWorkoutId && item.valueGh === achievement.valueGh,
      );
      await db.achievement.create({
        data: {
          userId,
          type: "GH_INCREASE",
          valueGh: achievement.valueGh,
          workoutId: triggeringWorkoutId,
          celebratedAt: match?.celebratedAt ?? null,
        },
      });
    }
    await db.physicalData.upsert({
      where: { userId },
      create: { userId, ghTolerance: result.toGh },
      update: { ghTolerance: result.toGh },
    });
    return next ?? current;
  }
  if (result.outcome === "STEP_BACK" && current.index > 0) {
    const previous = steps.find((step) => step.index === current.index - 1);
    await db.ladderStep.update({ where: { id: current.id }, data: { status: "UPCOMING" } });
    current.status = "UPCOMING";
    if (previous) {
      await db.ladderStep.update({ where: { id: previous.id }, data: { status: "CURRENT" } });
      previous.status = "CURRENT";
      return previous;
    }
  }
  return current;
}

function stepDelta(steps: { gh: number }[], currentGh: number): number {
  const ordered = [...steps].map((step) => step.gh).sort((left, right) => left - right);
  const index = ordered.indexOf(currentGh);
  if (index > 0) return currentGh - (ordered[index - 1] ?? currentGh);
  const next = ordered[index + 1];
  if (index === 0 && next != null) return next - currentGh;
  return LADDER_STEP_G;
}

async function applyAdaptation(
  db: Db,
  userId: string,
  workout: { id: string; plannedDate: Date; durationMin: number | null; sport: StageSport },
) {
  const plan = await db.gutTrainingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { steps: true, decisions: true },
    orderBy: { createdAt: "desc" },
  });
  if (!plan) return;
  const steps: LadderStepRow[] = plan.steps.map((step) => ({
    id: step.id,
    index: step.index,
    gh: step.gh,
    status: step.status,
  }));
  const current = steps.find((step) => step.status === "CURRENT");
  const currentGh = current?.gh ?? plan.startGh;
  const week = weekKey(workout.plannedDate);
  const advancesThisWeek = plan.decisions.filter(
    (decision) => decision.outcome === "ADVANCE" && weekKey(decision.createdAt) === week,
  ).length;
  const history = await db.postWorkoutLog.findMany({
    where: { workout: { userId } },
    include: { workout: { select: { plannedDate: true } } },
    orderBy: { submittedAt: "desc" },
  });
  const consumed = new Set(
    plan.decisions.flatMap((decision) => decisionLogIds(decision.inputLogIds)),
  );
  const delta = stepDelta(steps, currentGh);
  const result = adapt({
    currentGh,
    advancesThisWeek,
    weekKey: week,
    stepG: delta,
    logsNewestFirst: history.map((row) => ({
      id: row.id,
      // An eligible session counts at the step that was current when it was logged.
      // Sessions already used for an advance are not counted again at the new step.
      gh: consumed.has(row.id) ? currentGh - delta : currentGh,
      symptom: agreedSymptom({
        upper: row.symptomUpper,
        lower: row.symptomLower,
        systemic: row.symptomSystemic,
      }),
      eligible: row.ladderEligible,
      countsForPlan: row.countsForPlan,
      weekKey: weekKey(row.workout.plannedDate),
    })),
  });
  await commitDecision(db, userId, plan.id, steps, current, result, workout.id, []);
}

/**
 * An edited log may already sit inside a ladder decision. Incremental adapt would
 * leave that decision in place, so the edit would not move the step. Roll the plan
 * back to just before the earliest decision that used this log, then replay every
 * later session. A first save stays incremental so a fixture ladder is left as seeded.
 */
async function reapplyAdaptation(
  db: Db,
  userId: string,
  workout: { id: string; plannedDate: Date; durationMin: number | null; sport: StageSport },
) {
  const plan = await db.gutTrainingPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { steps: true, decisions: true },
    orderBy: { createdAt: "desc" },
  });
  if (!plan) return;
  const edited = await db.postWorkoutLog.findUnique({ where: { workoutId: workout.id } });
  if (!edited) return;
  const involved = plan.decisions.filter((decision) =>
    decisionLogIds(decision.inputLogIds).includes(edited.id),
  );
  if (involved.length === 0) {
    await applyAdaptation(db, userId, workout);
    return;
  }
  const earliest = involved.reduce((left, right) =>
    left.createdAt <= right.createdAt ? left : right,
  );
  const drop = plan.decisions.filter((decision) => decision.createdAt >= earliest.createdAt);
  const keep = plan.decisions.filter((decision) => decision.createdAt < earliest.createdAt);
  const steps: LadderStepRow[] = plan.steps.map((step) => ({
    id: step.id,
    index: step.index,
    gh: step.gh,
    status: step.status,
  }));
  const restored = steps.find((step) => step.gh === earliest.fromGh);
  if (!restored) {
    await applyAdaptation(db, userId, workout);
    return;
  }
  for (const step of steps) {
    const status: LadderStepRow["status"] =
      step.index < restored.index ? "DONE" : step.index === restored.index ? "CURRENT" : "UPCOMING";
    if (step.status !== status) {
      await db.ladderStep.update({ where: { id: step.id }, data: { status } });
      step.status = status;
    }
  }
  await db.adaptationDecision.deleteMany({
    where: { id: { in: drop.map((decision) => decision.id) } },
  });
  await db.physicalData.upsert({
    where: { userId },
    create: { userId, ghTolerance: restored.gh },
    update: { ghTolerance: restored.gh },
  });
  const logs = await db.postWorkoutLog.findMany({
    where: { workout: { userId } },
    include: { workout: { select: { id: true, plannedDate: true } } },
    orderBy: { submittedAt: "asc" },
  });
  const droppedIds = new Set(drop.flatMap((decision) => decisionLogIds(decision.inputLogIds)));
  const droppedWorkouts = logs.filter((log) => droppedIds.has(log.id)).map((log) => log.workoutId);
  const preserved =
    droppedWorkouts.length === 0
      ? []
      : await db.achievement.findMany({
          where: { userId, type: "GH_INCREASE", workoutId: { in: droppedWorkouts } },
        });
  if (preserved.length > 0) {
    await db.achievement.deleteMany({ where: { id: { in: preserved.map((item) => item.id) } } });
  }
  let current: LadderStepRow | undefined = restored;
  let currentGh = restored.gh;
  const consumed = new Set(keep.flatMap((decision) => decisionLogIds(decision.inputLogIds)));
  const advancesByWeek = new Map<string, number>();
  for (const decision of keep) {
    if (decision.outcome !== "ADVANCE") continue;
    const week = weekKey(decision.createdAt);
    advancesByWeek.set(week, (advancesByWeek.get(week) ?? 0) + 1);
  }
  for (const log of logs) {
    const week = weekKey(log.workout.plannedDate);
    const through = logs.filter((row) => row.submittedAt.getTime() <= log.submittedAt.getTime());
    const delta = stepDelta(steps, currentGh);
    const result = adapt({
      currentGh,
      advancesThisWeek: advancesByWeek.get(week) ?? 0,
      weekKey: week,
      stepG: delta,
      logsNewestFirst: [...through].reverse().map((row) => ({
        id: row.id,
        gh: consumed.has(row.id) ? currentGh - delta : currentGh,
        symptom: agreedSymptom({
          upper: row.symptomUpper,
          lower: row.symptomLower,
          systemic: row.symptomSystemic,
        }),
        eligible: row.ladderEligible,
        countsForPlan: row.countsForPlan,
        weekKey: weekKey(row.workout.plannedDate),
      })),
    });
    if (result.outcome === "ADVANCE") advancesByWeek.set(week, (advancesByWeek.get(week) ?? 0) + 1);
    current = await commitDecision(
      db,
      userId,
      plan.id,
      steps,
      current,
      result,
      log.workout.id,
      preserved,
    );
    if (result.outcome !== "NONE") {
      for (const id of result.inputLogIds) consumed.add(id);
    }
    currentGh = current?.gh ?? currentGh;
  }
}

export async function putGutPlan(db: Db, userId: string, body: z.infer<typeof gutBodySchema>) {
  if (body.goalGh > MAX_GH) throw new HttpError(HttpErrorCode.GoalAboveMax);
  const today = new Date().toISOString().slice(0, 10);
  if (body.targetKind === "RACE") {
    if (!body.raceId) throw new HttpError(HttpErrorCode.InvalidRequest);
    const race = await db.race.findFirst({ where: { id: body.raceId, userId } });
    if (!race) throw new HttpError(HttpErrorCode.RaceNotFound);
    const allowed = gutRaceAllowed(today, race.date.toISOString().slice(0, 10));
    if (!allowed.ok) throw new HttpError(HttpErrorCode.RaceTooSoon);
  }
  const ladder = buildLadder({
    startGh: body.startGh,
    goalGh: body.goalGh,
    today,
    targetDate: body.targetDate,
    sessionsPerWeek: body.sessionsPerWeek ?? null,
  });
  await db.gutTrainingPlan.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });
  const plan = await db.gutTrainingPlan.create({
    data: {
      userId,
      targetKind: body.targetKind,
      raceId: body.raceId ?? null,
      targetDate: new Date(`${body.targetDate}T00:00:00.000Z`),
      startGh: body.startGh,
      goalGh: body.goalGh,
      defaultGh: ladder.defaultGh,
      tooFast: ladder.tooFast,
      status: "ACTIVE",
      engineVersion: ENGINE_VERSION,
      steps: {
        create: ladder.steps.map((step) => ({
          index: step.index,
          gh: step.gh,
          approxDate: step.approxDate ? new Date(`${step.approxDate}T00:00:00.000Z`) : null,
          status: step.status,
        })),
      },
    },
    include: planInclude,
  });
  const workouts = await db.workout.findMany({ where: { userId, status: "PLANNED" } });
  for (const workout of workouts) await writeFuelingPlan(db, userId, workout, null);
  return { plan: presentPlan(plan) };
}

export function previewGut(body: z.infer<typeof gutBodySchema>) {
  if (body.goalGh > MAX_GH) throw new HttpError(HttpErrorCode.GoalAboveMax);
  const today = new Date().toISOString().slice(0, 10);
  const ladder = buildLadder({
    startGh: body.startGh,
    goalGh: body.goalGh,
    today,
    targetDate: body.targetDate,
    sessionsPerWeek: body.sessionsPerWeek ?? null,
  });
  return {
    tooFast: ladder.tooFast,
    tooFastKnown: ladder.tooFastKnown,
    defaultGh: ladder.defaultGh,
    warnsAbove120: ladder.warnsAbove120,
    overMax: ladder.overMax,
    slowerBecauseUnderTwoPerWeek: ladder.slowerBecauseUnderTwoPerWeek,
    steps: ladder.steps.map((step) => ({
      index: step.index,
      gh: step.gh,
      approxDate: step.approxDate,
    })),
  };
}

export async function startingPointFor(
  db: Db,
  userId: string,
  body: z.infer<typeof startingPointBodySchema>,
) {
  const physical = await db.physicalData.findUnique({ where: { userId } });
  return startingPoint({
    weightKg: toNumber(physical?.weightKg),
    workouts: body.entries.map((entry) => ({
      gh: Math.round(entry.carbsG / (entry.durationMin / 60)),
      symptom: entry.symptom,
    })),
  });
}

export async function createSweat(db: Db, userId: string, body: z.infer<typeof sweatCreateSchema>) {
  const row = await db.sweatTest.create({
    data: {
      userId,
      workoutId: body.workoutId,
      scheduledFor: new Date(`${body.scheduledFor}T00:00:00.000Z`),
      status: "SCHEDULED",
    },
  });
  return { sweatTest: presentSweat(row) };
}

export async function startSweat(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof sweatStartSchema>,
) {
  const existing = await db.sweatTest.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.SweatTestNotFound);
  const startedAt = new Date();
  const row = await db.sweatTest.update({
    where: { id },
    data: { preWeightKg: body.preWeightKg, startedAt, status: "IN_PROGRESS" },
  });
  for (const draft of sweatTestTimers({ sweatTestId: id, startedAt })) {
    await saveNotification(db, userId, draft);
  }
  return { sweatTest: presentSweat(row) };
}

export async function completeSweat(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof sweatCompleteSchema>,
) {
  const existing = await db.sweatTest.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.SweatTestNotFound);
  if (existing.preWeightKg == null || !existing.startedAt)
    throw new HttpError(HttpErrorCode.InvalidRequest);
  const endedAt = new Date();
  const durationMin = Math.max(
    1,
    Math.round((endedAt.getTime() - existing.startedAt.getTime()) / 60_000),
  );
  const rate = sweatRateLPerH({
    preWeightKg: Number(existing.preWeightKg),
    postWeightKg: body.postWeightKg,
    fluidMl: body.fluidMl,
    urineMl: body.urineMl ?? 0,
    durationMin,
  });
  const row = await db.sweatTest.update({
    where: { id },
    data: {
      postWeightKg: body.postWeightKg,
      fluidMl: body.fluidMl,
      urineMl: body.urineMl ?? 0,
      temperatureC: body.temperatureC ?? null,
      humidityPct: body.humidityPct ?? null,
      endedAt,
      sweatRateLPerH: rate,
      status: "COMPLETED",
    },
  });
  if (rate != null) {
    await db.physicalData.upsert({
      where: { userId },
      create: { userId, sweatRateLPerH: rate, sweatRateSource: "sweat_test" },
      update: { sweatRateLPerH: rate, sweatRateSource: "sweat_test" },
    });
    const workouts = await db.workout.findMany({ where: { userId, status: "PLANNED" } });
    for (const workout of workouts) await writeFuelingPlan(db, userId, workout, null);
  }
  await db.notification.updateMany({
    where: { userId, dedupeKey: `SWEAT_TEST_INCOMPLETE:${id}`, status: "SCHEDULED" },
    data: { status: "CANCELLED" },
  });
  return { sweatTest: presentSweat(row) };
}

export async function recordSweat(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof sweatRecordSchema>,
) {
  const existing = await db.sweatTest.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.SweatTestNotFound);
  const durationMin = body.durationMin ?? SWEAT_TEST_PROTOCOL_MIN;
  const endedAt = new Date();
  const startedAt = existing.startedAt ?? new Date(endedAt.getTime() - durationMin * 60_000);
  const rate = sweatRateLPerH({
    preWeightKg: body.preWeightKg,
    postWeightKg: body.postWeightKg,
    fluidMl: body.fluidMl,
    urineMl: body.urineMl ?? 0,
    durationMin,
  });
  const row = await db.sweatTest.update({
    where: { id },
    data: {
      preWeightKg: body.preWeightKg,
      postWeightKg: body.postWeightKg,
      fluidMl: body.fluidMl,
      urineMl: body.urineMl ?? 0,
      temperatureC: body.temperatureC ?? null,
      humidityPct: body.humidityPct ?? null,
      startedAt,
      endedAt,
      sweatRateLPerH: rate,
      status: "COMPLETED",
    },
  });
  if (rate != null) {
    await db.physicalData.upsert({
      where: { userId },
      create: { userId, sweatRateLPerH: rate, sweatRateSource: "sweat_test" },
      update: { sweatRateLPerH: rate, sweatRateSource: "sweat_test" },
    });
    const workouts = await db.workout.findMany({ where: { userId, status: "PLANNED" } });
    for (const workout of workouts) await writeFuelingPlan(db, userId, workout, null);
  }
  return { sweatTest: presentSweat(row) };
}

export async function markSweatNotCompleted(db: Db, userId: string, id: string) {
  const existing = await db.sweatTest.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.SweatTestNotFound);
  const row = await db.sweatTest.update({
    where: { id },
    data: { status: "NOT_COMPLETED" },
  });
  return { sweatTest: presentSweat(row) };
}

async function writeLoadingAndRecovery(
  db: Prisma.TransactionClient | PrismaClient,
  userId: string,
  raceId: string,
) {
  const race = await db.race.findUniqueOrThrow({
    where: { id: raceId },
    include: { stages: { orderBy: { index: "asc" } } },
  });
  const physical = await db.physicalData.findUnique({ where: { userId } });
  const weight = toNumber(physical?.weightKg);
  if (weight != null) {
    const bands = carbLoadingBands({
      choice: race.carbLoading,
      durationMin: race.estimatedDurationMin,
    });
    for (const band of bands.days) {
      const offset = band.day === "D_MINUS_2" ? -2 : -1;
      const date = new Date(race.date);
      date.setUTCDate(date.getUTCDate() + offset);
      await db.carbLoadingDay.create({
        data: {
          raceId,
          day: band.day,
          date,
          gPerKg: band.usedGPerKg,
          targetCarbsG: loadingGrams(band.usedGPerKg, weight),
          meals: {
            source: bands.source,
            bandGPerKg: { min: band.minGPerKg, max: band.maxGPerKg },
            usedGPerKg: band.usedGPerKg,
            mealSplit: "not_set",
            exampleFoods: RecoveryGuidanceText.example_foods_tbd,
            meals: [],
          },
        },
      });
      await saveNotification(db, userId, carbLoadingNotification({ raceId, day: band.day }));
    }
  }
  await saveNotification(db, userId, raceBreakfastNotification(raceId));
  for (let index = 0; index < race.stages.length - 1; index += 1) {
    const stage = race.stages[index];
    const next = race.stages[index + 1];
    if (!stage || !next) continue;
    await recomputeStage(db, userId, stage.id);
    await saveNotification(
      db,
      userId,
      stageNotification({
        stageId: stage.id,
        start: stage.startAt,
        estimatedDurationMin: stage.estimatedDurationMin,
        arrivedAt: null,
      }),
    );
  }
}

export async function recomputeStage(
  db: Prisma.TransactionClient | PrismaClient,
  userId: string,
  stageId: string,
) {
  const stage = await db.stage.findFirst({
    where: { id: stageId, race: { userId } },
    include: {
      race: { include: { stages: { orderBy: { index: "asc" } } } },
      workout: { include: { feedback: true, fuelingPlans: true } },
    },
  });
  if (!stage) return;
  const next = stage.race.stages.find((item) => item.index === stage.index + 1);
  const gapMin =
    next == null
      ? null
      : Math.round(
          (next.startAt.getTime() -
            (stage.startAt.getTime() + stage.estimatedDurationMin * 60_000)) /
            60_000,
        );
  const physical = await db.physicalData.findUnique({ where: { userId } });
  const plan = stage.workout?.fuelingPlans.find((item) => item.isCurrent) ?? null;
  const existing = await db.stageRecoveryPlan.findUnique({ where: { stageId } });
  const computed = stageRecovery({
    gapMin,
    restDay: false,
    stageDurationMin: stage.estimatedDurationMin,
    sport: stageSport(stage.type),
    weightKg: toNumber(physical?.weightKg),
    sensitiveStomach: existing?.sensitiveStomach ?? false,
    intakeCarbsG: stage.workout?.feedback?.intakeCarbsG ?? null,
    targetGPerH: plan?.targetGPerH ?? null,
    sweatRateLPerH: toNumber(physical?.sweatRateLPerH),
    fluidDrunkMl: stage.workout?.feedback?.fluidMl ?? null,
  });
  const meals = {
    liquidsAndGelsOnly: computed.liquidsAndGelsOnly,
    carbChoice: computed.carbChoice,
    carbsHighG: computed.carbsHighG,
    proteinLowG: computed.proteinLowG,
    proteinHighG: computed.proteinHighG,
    proteinChoice: computed.proteinChoice,
    fluidTargetRangeMl: computed.fluidTargetRangeMl,
    deficitMl: computed.deficitMl,
    sodiumMmolPerL: computed.sodiumMmolPerL,
    sodiumMgPerL: computed.sodiumMgPerL,
    lowIntakeBonusGPerKg: computed.lowIntakeBonusGPerKg,
    trailRaised: computed.trailRaised,
    guidance: guidanceLines(computed.guidance),
    meals: [],
    occasions: recoveryOccasions({
      gap: computed.gapCase,
      gapMin: computed.gapMin,
      liquidsAndGelsOnly: computed.liquidsAndGelsOnly,
    }).map((occasion) => ({
      key: occasion.key,
      offsetMin: occasion.offsetMin,
      form: occasion.form,
      carbsG: occasion.carbShare == null ? null : computed.carbsLowG,
      proteinG: occasion.carbShare == null ? null : computed.proteinLowG,
    })),
    exampleFoods: RecoveryGuidanceText.example_foods_tbd,
  };
  if (!computed.gapCase) return;
  await db.stageRecoveryPlan.upsert({
    where: { stageId },
    create: {
      stageId,
      gapCase: computed.gapCase,
      gapMin: computed.gapMin,
      carbsTargetG: computed.carbsLowG,
      proteinTargetG: computed.proteinChoice === "serving" ? computed.proteinLowG : null,
      fluidTargetMl: null,
      sodiumTargetMg: null,
      sensitiveStomach: computed.sensitiveStomach,
      meals,
      engineVersion: ENGINE_VERSION,
    },
    update: {
      gapCase: computed.gapCase,
      gapMin: computed.gapMin,
      carbsTargetG: computed.carbsLowG,
      proteinTargetG: computed.proteinChoice === "serving" ? computed.proteinLowG : null,
      fluidTargetMl: null,
      sodiumTargetMg: null,
      meals,
      engineVersion: ENGINE_VERSION,
    },
  });
}

export async function createRace(db: Db, userId: string, body: z.infer<typeof raceBodySchema>) {
  const race = await db.$transaction(async (tx) => {
    const created = await tx.race.create({
      data: {
        userId,
        name: body.name,
        date: new Date(`${body.date}T00:00:00.000Z`),
        startAt: body.startAt ? new Date(body.startAt) : null,
        estimatedDurationMin: body.estimatedDurationMin,
        type: body.type,
        distanceKm: body.distanceKm ?? null,
        elevationGainM: body.elevationGainM ?? null,
        carbLoading: body.carbLoading ?? "NONE",
        isMultiStage: body.isMultiStage ?? false,
        stages: {
          create: (body.stages ?? []).map((stage, index) => ({
            index,
            date: new Date(`${stage.date}T00:00:00.000Z`),
            startAt: new Date(stage.startAt),
            estimatedDurationMin: stage.estimatedDurationMin,
            type: stage.type,
            distanceKm: stage.distanceKm ?? null,
            elevationGainM: stage.elevationGainM ?? null,
            aidStations: {
              create: (stage.aidStations ?? []).map((aid) => ({
                kmMark: aid.kmMark,
                hasWater: aid.hasWater ?? false,
                hasIsotonic: aid.hasIsotonic ?? false,
                hasGels: aid.hasGels ?? false,
              })),
            },
          })),
        },
        aidStations: {
          create: (body.aidStations ?? []).map((aid) => ({
            kmMark: aid.kmMark,
            hasWater: aid.hasWater ?? false,
            hasIsotonic: aid.hasIsotonic ?? false,
            hasGels: aid.hasGels ?? false,
          })),
        },
      },
    });
    return created;
  });
  await writeLoadingAndRecovery(db, userId, race.id);
  const full = await db.race.findUniqueOrThrow({ where: { id: race.id }, include: raceInclude });
  return { race: presentRace(full) };
}

export async function updateRace(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof raceBodySchema>,
) {
  const existing = await db.race.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.RaceNotFound);
  await db.race.update({
    where: { id },
    data: {
      name: body.name,
      date: new Date(`${body.date}T00:00:00.000Z`),
      startAt: body.startAt ? new Date(body.startAt) : null,
      estimatedDurationMin: body.estimatedDurationMin,
      type: body.type,
      distanceKm: body.distanceKm ?? null,
      elevationGainM: body.elevationGainM ?? null,
      carbLoading: body.carbLoading ?? existing.carbLoading,
      isMultiStage: body.isMultiStage ?? existing.isMultiStage,
    },
  });
  const full = await db.race.findUniqueOrThrow({ where: { id }, include: raceInclude });
  return { race: presentRace(full) };
}

export async function deleteRace(db: Db, userId: string, id: string) {
  const existing = await db.race.findFirst({ where: { id, userId } });
  if (!existing) throw new HttpError(HttpErrorCode.RaceNotFound);
  await db.race.delete({ where: { id } });
  return { deleted: true as const };
}

export async function generateStrategy(db: Db, userId: string, raceId: string) {
  const race = await db.race.findFirst({
    where: { id: raceId, userId },
    include: { aidStations: true },
  });
  if (!race) throw new HttpError(HttpErrorCode.RaceNotFound);
  const result = await raceCarryList(db, userId, race, race.aidStations.length);
  await db.raceStrategy.create({
    data: {
      raceId,
      refillPoints: [],
      description: StrategyNote.Unspecified,
      carryList: {
        ...carryPayload(result),
        status: result.carbStatus,
      },
      chosen: false,
    },
  });
  const full = await db.race.findUniqueOrThrow({ where: { id: raceId }, include: raceInclude });
  return { race: presentRace(full) };
}

export async function chooseStrategy(db: Db, userId: string, raceId: string, strategyId: string) {
  const strategy = await db.raceStrategy.findFirst({
    where: { id: strategyId, race: { id: raceId, userId } },
  });
  if (!strategy) throw new HttpError(HttpErrorCode.StrategyNotFound);
  await db.raceStrategy.updateMany({ where: { raceId }, data: { chosen: false } });
  await db.raceStrategy.update({ where: { id: strategyId }, data: { chosen: true } });
  const full = await db.race.findUniqueOrThrow({ where: { id: raceId }, include: raceInclude });
  return { race: presentRace(full) };
}

export async function dismissRehearsal(db: Db, userId: string, raceId: string) {
  const race = await db.race.findFirst({
    where: { id: raceId, userId },
    include: { rehearsal: true },
  });
  if (!race) throw new HttpError(HttpErrorCode.RaceNotFound);
  if (race.rehearsal) {
    await db.loadingRehearsal.update({
      where: { id: race.rehearsal.id },
      data: { status: "DISMISSED", dismissedAt: new Date() },
    });
  }
  await db.todoItem.updateMany({
    where: { userId, type: "LOADING_REHEARSAL", status: "OPEN", refId: raceId },
    data: { status: "DISMISSED", closedAt: new Date() },
  });
  const full = await db.race.findUniqueOrThrow({ where: { id: raceId }, include: raceInclude });
  return { race: presentRace(full) };
}

export async function restoreRehearsal(db: Db, userId: string, raceId: string) {
  const race = await db.race.findFirst({
    where: { id: raceId, userId },
    include: { rehearsal: true },
  });
  if (!race) throw new HttpError(HttpErrorCode.RaceNotFound);
  if (race.rehearsal) {
    await db.loadingRehearsal.update({
      where: { id: race.rehearsal.id },
      data: { status: "SUGGESTED", dismissedAt: null },
    });
  }
  await db.todoItem.updateMany({
    where: { userId, type: "LOADING_REHEARSAL", refId: raceId, status: "DISMISSED" },
    data: { status: "OPEN", closedAt: null },
  });
  const full = await db.race.findUniqueOrThrow({ where: { id: raceId }, include: raceInclude });
  return { race: presentRace(full) };
}

export async function patchRecovery(
  db: Db,
  userId: string,
  stageId: string,
  body: z.infer<typeof recoveryPatchSchema>,
) {
  const stage = await db.stage.findFirst({ where: { id: stageId, race: { userId } } });
  if (!stage) throw new HttpError(HttpErrorCode.StageNotFound);
  await db.stageRecoveryPlan.upsert({
    where: { stageId },
    create: {
      stageId,
      gapCase: "UNDER_4H",
      carbsTargetG: 0,
      sensitiveStomach: body.sensitiveStomach,
      meals: {},
      engineVersion: ENGINE_VERSION,
    },
    update: { sensitiveStomach: body.sensitiveStomach },
  });
  await recomputeStage(db, userId, stageId);
  const row = await db.stageRecoveryPlan.findUnique({ where: { stageId } });
  return { recovery: row ? presentRecovery(row) : null };
}

export async function patchTodo(
  db: Db,
  userId: string,
  id: string,
  body: z.infer<typeof todoPatchSchema>,
) {
  const todo = await db.todoItem.findFirst({ where: { id, userId } });
  if (!todo) throw new HttpError(HttpErrorCode.TodoNotFound);
  const row = await db.todoItem.update({
    where: { id },
    data: { status: body.status, closedAt: new Date() },
  });
  return { todo: presentTodo(row) };
}

export async function celebrate(db: Db, userId: string, id: string) {
  const row = await db.achievement.findFirst({ where: { id, userId } });
  if (!row) throw new HttpError(HttpErrorCode.AchievementNotFound);
  const updated = await db.achievement.update({
    where: { id },
    data: { celebratedAt: row.celebratedAt ?? new Date() },
  });
  return { achievement: presentAchievement(updated) };
}

export async function connectProvider(
  db: Db,
  userId: string,
  provider: "STRAVA" | "TRAININGPEAKS" | "GARMIN",
) {
  if (provider === "GARMIN" && process.env.GARMIN_ENABLED !== "true") {
    throw new HttpError(HttpErrorCode.ProviderDisabled);
  }
  await db.providerConnection.upsert({
    where: { userId_provider: { userId, provider } },
    create: {
      userId,
      provider,
      externalUserId: `mock-${provider.toLowerCase()}`,
      accessTokenEnc: "mock:local",
      status: "CONNECTED",
    },
    update: {
      status: "CONNECTED",
      accessTokenEnc: "mock:local",
      externalUserId: `mock-${provider.toLowerCase()}`,
    },
  });
  return { connected: true as const };
}

export async function disconnectProvider(
  db: Db,
  userId: string,
  provider: "STRAVA" | "TRAININGPEAKS" | "GARMIN",
) {
  await db.providerConnection.updateMany({
    where: { userId, provider },
    data: { status: "DISCONNECTED" },
  });
  return { connected: false as const };
}

export async function listNotifications(db: Db, userId: string) {
  const rows = await db.notification.findMany({
    where: { userId },
    orderBy: { scheduledAt: "desc" },
  });
  return {
    notifications: rows.map((row) => ({
      id: row.id,
      type: row.type,
      channel: row.channel,
      scheduledAt: row.scheduledAt.toISOString(),
      sentAt: iso(row.sentAt),
      readAt: iso(row.readAt),
      copyKey: row.copyKey,
      deepLink: row.deepLink,
      status: row.status,
      dedupeKey: row.dedupeKey,
    })),
  };
}

export async function markNotificationRead(db: Db, userId: string, id: string) {
  const row = await db.notification.findFirst({ where: { id, userId } });
  if (!row) throw new HttpError(HttpErrorCode.NotFound);
  await db.notification.update({ where: { id }, data: { readAt: new Date() } });
  return listNotifications(db, userId);
}

export async function requestMagicLink(db: Db, body: z.infer<typeof magicLinkSchema>) {
  const token = newToken();
  const expiresAt = new Date("9999-12-31T00:00:00.000Z");
  await db.magicLinkToken.create({
    data: { email: body.email.toLowerCase(), tokenHash: hashToken(token), expiresAt },
  });
  const base = process.env.MAGIC_LINK_URL_BASE || "http://127.0.0.1:3050/auth/magic";
  rememberMagicLink({
    email: body.email.toLowerCase(),
    url: `${base}?token=${token}`,
    createdAt: new Date().toISOString(),
  });
  return { sent: true as const };
}

export async function verifyMagicLink(db: Db, body: z.infer<typeof magicVerifySchema>) {
  const row = await db.magicLinkToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
  if (!row || row.usedAt) throw new HttpError(HttpErrorCode.MagicLinkInvalid);
  await db.magicLinkToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  let user = await db.user.findUnique({ where: { email: row.email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: row.email,
        emailVerifiedAt: new Date(),
        name: body.name ?? null,
        timezone: body.timezone,
      },
    });
    await db.authIdentity.create({
      data: {
        userId: user.id,
        provider: "EMAIL_MAGIC_LINK",
        providerUserId: row.email,
        email: row.email,
      },
    });
    await db.subscription.create({ data: { userId: user.id, status: "BETA_ALL_ACCESS" } });
  } else {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), deletedAt: null, timezone: body.timezone },
    });
  }
  return openSession(db, user.id);
}

export async function logout(db: Db, token: string | undefined) {
  if (!token) throw new HttpError(HttpErrorCode.Unauthorized);
  await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  return { deleted: true as const };
}

export async function saveOnboarding(db: Db, body: z.infer<typeof onboardingSchema>) {
  await db.onboardingAnswers.upsert({
    where: { anonId: body.anonId },
    create: { anonId: body.anonId, answers: body.answers as Prisma.InputJsonValue },
    update: { answers: body.answers as Prisma.InputJsonValue },
  });
  return { saved: true as const };
}

export async function claimOnboarding(db: Db, userId: string, body: z.infer<typeof claimSchema>) {
  const row = await db.onboardingAnswers.findUnique({ where: { anonId: body.anonId } });
  if (!row) throw new HttpError(HttpErrorCode.NotFound);
  await db.onboardingAnswers.update({ where: { id: row.id }, data: { userId } });
  const answers = asRecord(row.answers);
  const weight = typeof answers?.weight === "string" ? Number(answers.weight) : null;
  const ftp = typeof answers?.ftp === "string" ? Number(answers.ftp) : null;
  const mode =
    answers?.mode === "GUT_TRAINING" || answers?.mode === "FUEL_MY_WORKOUTS"
      ? answers.mode
      : undefined;
  const carbSplit =
    answers?.carbSplit === "BOTTLES_THEN_GELS" ||
    answers?.carbSplit === "MOSTLY_WATER" ||
    answers?.carbSplit === "MORE_MIX"
      ? answers.carbSplit
      : "BOTTLES_THEN_GELS";
  const fluidPlan =
    answers?.fluidPlan === "MORE_BOTTLES" || answers?.fluidPlan === "REFILL"
      ? answers.fluidPlan
      : "MORE_BOTTLES";
  await db.user.update({ where: { id: userId }, data: { ...(mode ? { mode } : {}), carbSplit, fluidPlan } });
  if ((weight != null && Number.isFinite(weight)) || (ftp != null && Number.isFinite(ftp))) {
    await db.physicalData.upsert({
      where: { userId },
      create: {
        userId,
        weightKg: weight != null && Number.isFinite(weight) ? weight : null,
        ftpW: ftp != null && Number.isFinite(ftp) ? Math.round(ftp) : null,
      },
      update: {
        ...(weight != null && Number.isFinite(weight) ? { weightKg: weight } : {}),
        ...(ftp != null && Number.isFinite(ftp) ? { ftpW: Math.round(ftp) } : {}),
      },
    });
  }
  return { claimed: true as const };
}

export async function acceptWebhook(
  db: Db,
  provider: "STRAVA" | "TRAININGPEAKS" | "GARMIN",
  body: z.infer<typeof webhookBodySchema>,
) {
  if (provider === "GARMIN" && process.env.GARMIN_ENABLED !== "true") {
    throw new HttpError(HttpErrorCode.ProviderDisabled);
  }
  try {
    await db.webhookEvent.create({
      data: { provider, externalId: body.externalId, eventType: body.eventType, payload: body },
    });
  } catch {
    return { accepted: true as const };
  }
  await db.job.create({
    data: {
      type: "PROCESS_WEBHOOK",
      payload: { provider, ...body },
      runAt: new Date(),
      dedupeKey: `webhook:${provider}:${body.externalId}:${body.eventType}`,
    },
  });
  return { accepted: true as const };
}
