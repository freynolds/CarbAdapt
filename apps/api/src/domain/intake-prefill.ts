import type { Prisma, PrismaClient } from "@prisma/client";
import { intakePrefill, type IntakePrefill } from "@carbadapt/engine";
import { athleteFuelingContext } from "./plans.js";

type Db = PrismaClient | Prisma.TransactionClient;

type PlanRow = {
  isCurrent: boolean;
  carryList: Prisma.JsonValue;
  totalCarbsG: number;
  totalFluidMl: number;
  targetGPerH: number | null;
  userAdjusted: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value))
    return value as Record<string, unknown>;
  return null;
}

/** A stored total counts only when the plan did not mark that amount unset. Fixtures omit the flag. */
function plannedTotal(
  plan: PlanRow | null,
  statusKey: "carbStatus" | "fluidStatus",
  total: number | null,
): number | null {
  if (!plan || total == null) return null;
  if (asRecord(plan.carryList)?.[statusKey] === "not_set") return null;
  return total;
}

export async function buildIntakePrefill(
  db: Db,
  userId: string,
  workout: { durationMin: number | null; fuelingPlans: PlanRow[] },
): Promise<IntakePrefill> {
  const plan =
    workout.fuelingPlans.find((item) => item.isCurrent) ?? workout.fuelingPlans[0] ?? null;
  const ctx = await athleteFuelingContext(db, userId);
  const workingGPerH =
    ctx.user.mode === "GUT_TRAINING" ? ctx.currentGh : plan?.userAdjusted ? plan.targetGPerH : null;
  const sweat = ctx.user.physical?.sweatRateLPerH;
  return intakePrefill({
    durationMin: workout.durationMin,
    plannedCarbsG: plannedTotal(plan, "carbStatus", plan?.totalCarbsG ?? null),
    plannedFluidMl: plannedTotal(plan, "fluidStatus", plan?.totalFluidMl ?? null),
    workingGPerH,
    fluidLPerH: sweat == null ? null : Number(sweat),
  });
}
