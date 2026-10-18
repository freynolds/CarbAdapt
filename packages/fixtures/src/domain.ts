/**
 * Hand-made fixture arithmetic. Every consumer tags engineVersion = "fixture".
 * These are the cited product rules, not the M3 engine.
 */

export const ENGINE_VERSION = "fixture";

export const FIXTURE_WEATHER = {
  tempC: 22,
  humidityPct: 55,
  source: "fixture",
  note: "Hand-made snapshot. Live weather arrives in M4.",
};

/** Low end of the 1.0–1.2 g/kg/h speedy-refuel band. */
export const SPEEDY_G_PER_KG_H = 1.0;
/** Sensitive-stomach carbs (handoff B11). */
export const SENSITIVE_CARB_G_PER_KG_H = 0.8;
/** Low end of the 0.3–0.4 g/kg/h sensitive-stomach protein rate. */
export const SENSITIVE_PROTEIN_G_PER_KG_H = 0.3;
export const PROTEIN_SERVING_G_PER_KG = 0.3;
/** Stop feeding this many minutes before the next start (low end of the 30–45 min window). */
export const STOP_BEFORE_NEXT_START_MIN = 30;
/** Low end of 125–150% fluid replacement. */
export const FLUID_REPLACEMENT = 1.25;
/** 50 mmol/L sodium = 1150 mg/L, low end of the 50–80 mmol/L band. */
export const SODIUM_MG_PER_L = 1150;
/** Low end of the 1–2 g/kg pre-start meal. */
export const PRE_START_MEAL_G_PER_KG = 1;
/** Research template §3.5 meal split. Sums to 1. */
export const MEAL_SPLIT = [
  { key: "breakfast", label: "Breakfast", pct: 0.22 },
  { key: "midMorning", label: "Mid-morning", pct: 0.13 },
  { key: "lunch", label: "Lunch", pct: 0.27 },
  { key: "afternoon", label: "Afternoon", pct: 0.15 },
  { key: "dinner", label: "Dinner", pct: 0.18 },
  { key: "eveningSnack", label: "Evening snack", pct: 0.05 },
] as const;

export const FODMAP_NOTE =
  "FODMAP are fermentable carbohydrates. Low-FODMAP foods are listed first. High-FODMAP staples (pasta, bread, honey) are still included.";

export const EXAMPLE_FOODS_PLACEHOLDER = "example foods TBD";

/**
 * Fixture fuel-mode g/h. The product rule is an open decision (plan §7 item 5).
 * This uses the top of the bands cited in the master plan (Jeukendrup 2014 / ACSM):
 * 60 g/h up to 2.5 h, 90 g/h above that.
 */
export function fixtureFuelingGh(durationMin: number): number {
  return durationMin > 150 ? 90 : 60;
}

/** Sweat rate in L/h. #86: pre − post + fluid − urine. */
export function sweatRateLPerH(input: {
  preWeightKg: number;
  postWeightKg: number;
  fluidMl: number;
  urineMl: number;
  durationMin: number;
}): number {
  const liters =
    input.preWeightKg - input.postWeightKg + input.fluidMl / 1000 - input.urineMl / 1000;
  const hours = input.durationMin / 60;
  return round2(liters / hours);
}

export function loadingTargetG(gPerKg: number, weightKg: number): number {
  return Math.round((gPerKg * weightKg) / 10) * 10;
}

export function splitMeals(totalCarbsG: number): { key: string; label: string; carbsG: number }[] {
  const raw = MEAL_SPLIT.map((meal) => ({
    key: meal.key,
    label: meal.label,
    carbsG: Math.round(totalCarbsG * meal.pct),
  }));
  const drift = totalCarbsG - raw.reduce((sum, meal) => sum + meal.carbsG, 0);
  const lunch = raw.find((meal) => meal.key === "lunch");
  if (lunch) lunch.carbsG += drift;
  return raw;
}

/** Overnight / rest-day carb target at an explicit g/kg (already the low end, plus any +1). */
export function perKgCarbs(gPerKg: number, weightKg: number): number {
  return Math.round(gPerKg * weightKg);
}

export function rateCarbs(gPerKgH: number, weightKg: number, windowMin: number): number {
  return Math.round(gPerKgH * weightKg * (windowMin / 60));
}

export function proteinServingG(weightKg: number): number {
  return Math.round(PROTEIN_SERVING_G_PER_KG * weightKg);
}

export function hydration(input: {
  sweatLPerH: number;
  durationMin: number;
  fluidDrunkMl: number;
  drinkSodiumMgPerL: number;
}): {
  deficitMl: number;
  fluidTargetMl: number;
  sodiumTargetMg: number;
  isotonicSodiumMg: number;
  remainderSodiumMg: number;
} {
  const deficitMl = Math.round(input.sweatLPerH * (input.durationMin / 60) * 1000 - input.fluidDrunkMl);
  const fluidTargetMl = Math.max(0, Math.round(deficitMl * FLUID_REPLACEMENT));
  const sodiumTargetMg = Math.round((SODIUM_MG_PER_L * fluidTargetMl) / 1000);
  const isotonicSodiumMg = Math.round((input.drinkSodiumMgPerL * fluidTargetMl) / 1000);
  return {
    deficitMl,
    fluidTargetMl,
    sodiumTargetMg,
    isotonicSodiumMg,
    remainderSodiumMg: Math.max(0, sodiumTargetMg - isotonicSodiumMg),
  };
}

/**
 * Documented too-fast example only: 60 → 120 g/h inside 14 days.
 * Later date is +35 days, the ~5 week R1 minimum in ramp-rate-evidence for this example.
 * A numeric lower goal is not specified, so none is returned.
 */
export function tooFastPreview(input: {
  startGh: number;
  goalGh: number;
  today: Date;
  targetDate: Date;
}): {
  tooFast: boolean;
  suggestedLaterDate: string | null;
  suggestedGoalGh: number | null;
  note: string;
} {
  const days = Math.round((input.targetDate.getTime() - input.today.getTime()) / 86_400_000);
  const documented = input.startGh === 60 && input.goalGh === 120 && days <= 14;
  if (!documented) {
    return {
      tooFast: false,
      suggestedLaterDate: null,
      suggestedGoalGh: null,
      note: "Mock preview only flags the documented 60 → 120 g/h within 14 days case. Other ladders are not computed until M3.",
    };
  }
  const later = new Date(input.today);
  later.setUTCDate(later.getUTCDate() + 35);
  return {
    tooFast: true,
    suggestedLaterDate: later.toISOString().slice(0, 10),
    suggestedGoalGh: null,
    note: "Too fast for the timeframe. A later date about 5 weeks out is the R1 minimum cited for 60 → 120 g/h. No lower goal in grams is specified in the docs, so none is invented. Saving the entered goal is still allowed.",
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
