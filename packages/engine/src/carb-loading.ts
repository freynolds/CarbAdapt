import { roundInt } from "./numbers.js";

export type LoadingChoice = "NONE" | "TWO_DAY" | "ONE_DAY";

export type LoadingBand = {
  day: "D_MINUS_2" | "D_MINUS_1";
  minGPerKg: number;
  maxGPerKg: number;
  /** Low end. The seed cases use the low end of each cited band. */
  usedGPerKg: number;
};

/**
 * The only numeric B/C bands in the product files are the MVP §5.2 proposal
 * rows (cited there as #124). #124 itself is not in the uploaded decisions.
 * Combinations that are not in that table are not set.
 * `usedGPerKg` is the low end, which those rows describe as the seeded default.
 */
export function carbLoadingBands(input: {
  choice: LoadingChoice;
  durationMin: number;
}): { source: "mvp-5.2-proposal"; days: LoadingBand[] } | { source: "not_set"; days: [] } {
  if (input.choice === "NONE") return { source: "not_set", days: [] };
  if (input.choice === "TWO_DAY" && input.durationMin >= 240) {
    return {
      source: "mvp-5.2-proposal",
      days: [
        { day: "D_MINUS_2", minGPerKg: 10, maxGPerKg: 10, usedGPerKg: 10 },
        { day: "D_MINUS_1", minGPerKg: 10, maxGPerKg: 12, usedGPerKg: 10 },
      ],
    };
  }
  if (input.choice === "TWO_DAY" && input.durationMin >= 90 && input.durationMin <= 150) {
    return {
      source: "mvp-5.2-proposal",
      days: [
        { day: "D_MINUS_2", minGPerKg: 5, maxGPerKg: 7, usedGPerKg: 5 },
        { day: "D_MINUS_1", minGPerKg: 7, maxGPerKg: 8, usedGPerKg: 7 },
      ],
    };
  }
  if (input.choice === "ONE_DAY" && input.durationMin > 150 && input.durationMin <= 240) {
    return {
      source: "mvp-5.2-proposal",
      days: [{ day: "D_MINUS_1", minGPerKg: 10, maxGPerKg: 10, usedGPerKg: 10 }],
    };
  }
  return { source: "not_set", days: [] };
}

export function loadingGrams(gPerKg: number, weightKg: number): number {
  return roundInt(gPerKg * weightKg);
}

/** Handoff B10. About 2 g/kg. Fluid and the early-start cutoff are not set. */
export const RACE_BREAKFAST_G_PER_KG = 2;

export type BreakfastResult = {
  gPerKg: number;
  carbsG: number;
  earlyStart: null;
  fluidMl: null;
  isotonicMl: null;
  waterMl: null;
  sodiumMg: null;
  drinkSodiumMgPerL: null;
};

export function raceBreakfast(weightKg: number): BreakfastResult {
  return {
    gPerKg: RACE_BREAKFAST_G_PER_KG,
    carbsG: roundInt(RACE_BREAKFAST_G_PER_KG * weightKg),
    earlyStart: null,
    fluidMl: null,
    isotonicMl: null,
    waterMl: null,
    sodiumMg: null,
    drinkSodiumMgPerL: null,
  };
}
