import { roundInt } from "./numbers.js";

export type GapCase = "UNDER_4H" | "H4_TO_12H" | "OVERNIGHT" | "REST_DAY";
export type StageSport = "CYCLING" | "RUNNING" | "TRAIL_RUNNING" | "OTHER";

export type Range = { min: number; max: number };

const UNDER_4H_MIN = 4 * 60;
const H4_TO_12H_MAX = 12 * 60;
const SHORT_GAP_MIN = 90;
const LOW_INTAKE = 0.75;

/**
 * Gap above 12 h is overnight because the named middle case stops at 12 h.
 * That boundary is the case label, not a separate sentence in the handoff.
 */
export function gapCase(input: { gapMin: number | null; restDay: boolean }): GapCase | null {
  if (input.restDay) return "REST_DAY";
  if (input.gapMin == null) return null;
  if (input.gapMin < UNDER_4H_MIN) return "UNDER_4H";
  if (input.gapMin <= H4_TO_12H_MAX) return "H4_TO_12H";
  return "OVERNIGHT";
}

function overnightBand(durationMin: number, sport: StageSport): Range & { trailRaised: boolean } {
  let band: Range;
  if (durationMin < 150) band = { min: 5, max: 6 };
  else if (durationMin <= 240) band = { min: 6, max: 8 };
  else band = { min: 7, max: 9 };
  if (sport === "TRAIL_RUNNING" && band.min < 6) {
    return { min: 6, max: 8, trailRaised: true };
  }
  return { ...band, trailRaised: false };
}

export type RecoveryOccasion = {
  key: "middle" | "first" | "pre_start" | "day";
  /** Minutes after the stage ends. The middle of a short gap is this value. */
  offsetMin: number | null;
  form: "meal" | "snack" | "drink";
  /** 1 means this occasion carries the whole carb target. Null means the split is not set. */
  carbShare: number | null;
};

/**
 * Between-stage eating is meals, snacks, and drinks.
 * A gap under 4 hours is one occasion in the middle of the gap.
 * Under 90 minutes that occasion is a drink (liquids and gels only).
 * Longer gaps name the occasions the handoff already describes. Their gram
 * split stays unset.
 */
export function recoveryOccasions(input: {
  gap: GapCase | null;
  gapMin: number | null;
  liquidsAndGelsOnly: boolean;
}): RecoveryOccasion[] {
  if (input.gap === "UNDER_4H") {
    return [
      {
        key: "middle",
        offsetMin: input.gapMin == null ? null : Math.round(input.gapMin / 2),
        form: input.liquidsAndGelsOnly ? "drink" : "snack",
        carbShare: 1,
      },
    ];
  }
  if (input.gap === "H4_TO_12H") {
    return [
      { key: "first", offsetMin: null, form: "meal", carbShare: null },
      { key: "pre_start", offsetMin: null, form: "meal", carbShare: null },
    ];
  }
  if (input.gap === "OVERNIGHT" || input.gap === "REST_DAY") {
    return [{ key: "day", offsetMin: null, form: "meal", carbShare: null }];
  }
  return [];
}

export type StageRecoveryResult = {
  gapCase: GapCase | null;
  gapMin: number | null;
  liquidsAndGelsOnly: boolean;
  carbChoice: "range" | "low_end_default" | "not_set";
  carbsLowG: number;
  carbsHighG: number | null;
  proteinLowG: number | null;
  proteinHighG: number | null;
  proteinChoice: "serving" | "range" | "not_set";
  fluidTargetMl: null;
  fluidTargetRangeMl: Range | null;
  deficitMl: number | null;
  sodiumTargetMg: null;
  sodiumMmolPerL: Range;
  sodiumMgPerL: Range;
  lowIntakeBonusGPerKg: number;
  trailRaised: boolean;
  sensitiveStomach: boolean;
  guidance: string[];
};

const SODIUM_MMOL: Range = { min: 50, max: 80 };
const SODIUM_MG_PER_L: Range = { min: 1150, max: 1840 };

/**
 * Between-stage targets from handoff B11.
 * Hourly 1–1.2 and the 30–45 min stop are kept as a range.
 * Overnight uses the low end of the duration band, which the plan states as the default.
 * Fluid replacement stays a 125–150% range. Sodium stays 50–80 mmol/L.
 * A deficit is not an input from a previous stage.
 */
export function stageRecovery(input: {
  gapMin: number | null;
  restDay: boolean;
  stageDurationMin: number;
  sport: StageSport;
  weightKg: number | null;
  sensitiveStomach: boolean;
  intakeCarbsG: number | null;
  targetGPerH: number | null;
  sweatRateLPerH: number | null;
  fluidDrunkMl: number | null;
}): StageRecoveryResult {
  const gap = gapCase({ gapMin: input.gapMin, restDay: input.restDay });
  const weight = input.weightKg;
  const guidance: string[] = [];
  let lowIntake = 0;
  if (
    input.intakeCarbsG != null &&
    input.targetGPerH != null &&
    input.targetGPerH > 0 &&
    input.stageDurationMin > 0
  ) {
    const target = input.targetGPerH * (input.stageDurationMin / 60);
    if (input.intakeCarbsG / target < LOW_INTAKE) {
      lowIntake = 1;
      guidance.push("low_intake");
    }
  } else if (input.intakeCarbsG != null) {
    guidance.push("low_intake_not_set");
  }

  const liquids = gap === "UNDER_4H" && input.gapMin != null && input.gapMin < SHORT_GAP_MIN;
  if (liquids) guidance.push("liquids_only");

  let carbChoice: StageRecoveryResult["carbChoice"] = "not_set";
  let carbsLowG = 0;
  let carbsHighG: number | null = null;
  let trailRaised = false;

  if (weight != null && weight > 0 && gap != null) {
    if (input.sensitiveStomach && (gap === "UNDER_4H" || gap === "H4_TO_12H")) {
      const window = hourlyWindow(gap, input.gapMin);
      carbsLowG = roundInt(0.8 * weight * window.min);
      carbsHighG = roundInt(0.8 * weight * window.max);
      carbChoice = "range";
      guidance.push("sensitive");
    } else if (gap === "UNDER_4H") {
      const window = hourlyWindow(gap, input.gapMin);
      carbsLowG = roundInt(1 * weight * window.min) + roundInt(lowIntake * weight);
      carbsHighG = roundInt(1.2 * weight * window.max) + roundInt(lowIntake * weight);
      carbChoice = "range";
      guidance.push("hourly_window");
    } else if (gap === "H4_TO_12H") {
      const firstLow = 1 * weight * 4;
      const firstHigh = 1.2 * weight * 4;
      const preLow = 1 * weight;
      const preHigh = 2 * weight;
      carbsLowG = roundInt(firstLow + preLow + lowIntake * weight);
      carbsHighG = roundInt(firstHigh + preHigh + lowIntake * weight);
      carbChoice = "range";
      guidance.push("first_four_hours");
    } else {
      const band = overnightBand(input.stageDurationMin, input.sport);
      trailRaised = band.trailRaised;
      if (trailRaised) guidance.push("trail_band");
      const low = band.min + lowIntake;
      const high = band.max + lowIntake;
      carbsLowG = roundInt(low * weight);
      carbsHighG = roundInt(high * weight);
      carbChoice = "low_end_default";
      guidance.push("overnight_low_end");
    }
  }

  let proteinLowG: number | null = null;
  let proteinHighG: number | null = null;
  let proteinChoice: StageRecoveryResult["proteinChoice"] = "not_set";
  if (weight != null && weight > 0 && gap != null) {
    if (input.sensitiveStomach && (gap === "UNDER_4H" || gap === "H4_TO_12H")) {
      const window = hourlyWindow(gap, input.gapMin);
      proteinLowG = roundInt(0.3 * weight * window.min);
      proteinHighG = roundInt(0.4 * weight * window.max);
      proteinChoice = "range";
    } else {
      proteinLowG = roundInt(0.3 * weight);
      proteinHighG = proteinLowG;
      proteinChoice = "serving";
    }
  }

  let deficitMl: number | null = null;
  let fluidTargetRangeMl: Range | null = null;
  if (input.sweatRateLPerH != null && input.fluidDrunkMl != null) {
    deficitMl = roundInt(input.sweatRateLPerH * (input.stageDurationMin / 60) * 1000 - input.fluidDrunkMl);
    const positive = Math.max(0, deficitMl);
    fluidTargetRangeMl = { min: roundInt(positive * 1.25), max: roundInt(positive * 1.5) };
    guidance.push("fluid_range");
  }
  guidance.push("sodium_range");
  guidance.push("no_carryover");
  guidance.push("meal_split_not_set");
  guidance.push("example_foods_tbd");

  return {
    gapCase: gap,
    gapMin: input.gapMin,
    liquidsAndGelsOnly: liquids,
    carbChoice,
    carbsLowG,
    carbsHighG,
    proteinLowG,
    proteinHighG,
    proteinChoice,
    fluidTargetMl: null,
    fluidTargetRangeMl,
    deficitMl,
    sodiumTargetMg: null,
    sodiumMmolPerL: SODIUM_MMOL,
    sodiumMgPerL: SODIUM_MG_PER_L,
    lowIntakeBonusGPerKg: lowIntake,
    trailRaised,
    sensitiveStomach: input.sensitiveStomach,
    guidance,
  };
}

function hourlyWindow(gap: GapCase, gapMin: number | null): Range {
  if (gap !== "UNDER_4H" || gapMin == null) return { min: 4, max: 4 };
  const lowHours = Math.max(0, gapMin - 45) / 60;
  const highHours = Math.max(0, gapMin - 30) / 60;
  return { min: lowHours, max: highHours };
}
