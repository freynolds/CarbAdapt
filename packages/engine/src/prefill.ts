import { hours, roundInt } from "./numbers.js";

/** Where a questionnaire starting value came from. Machine code, not copy. */
export type PrefillSource = "plan" | "working_rate" | "not_set";

export type IntakePrefill = {
  carbsG: number | null;
  fluidMl: number | null;
  carbSource: PrefillSource;
  fluidSource: PrefillSource;
};

/**
 * Starting grams and milliliters for the post-workout questions.
 * Pass a planned total only when that fueling plan actually set the amount.
 * A null rate, including a TBD estimate, stays unset.
 */
export function intakePrefill(input: {
  durationMin: number | null;
  plannedCarbsG: number | null;
  plannedFluidMl: number | null;
  /** Current gut-training step, or a fuel-mode target the athlete chose. */
  workingGPerH: number | null;
  /** Known sweat rate in L/h. Not the unspecified 10 mL/kg/h estimate. */
  fluidLPerH: number | null;
}): IntakePrefill {
  const carbs = fromPlanOrRate(
    input.plannedCarbsG,
    input.workingGPerH,
    input.durationMin,
    (rate, minutes) => roundInt(rate * hours(minutes)),
  );
  const fluid = fromPlanOrRate(
    input.plannedFluidMl,
    input.fluidLPerH,
    input.durationMin,
    (rate, minutes) => roundInt(rate * hours(minutes) * 1000),
  );
  return {
    carbsG: carbs.value,
    fluidMl: fluid.value,
    carbSource: carbs.source,
    fluidSource: fluid.source,
  };
}

function fromPlanOrRate(
  planned: number | null,
  rate: number | null,
  durationMin: number | null,
  fromRate: (rate: number, durationMin: number) => number,
): { value: number | null; source: PrefillSource } {
  if (planned != null) return { value: planned, source: "plan" };
  if (rate != null && durationMin != null)
    return { value: fromRate(rate, durationMin), source: "working_rate" };
  return { value: null, source: "not_set" };
}
