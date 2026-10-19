import { roundInt } from "./numbers.js";
import type { SymptomLevel } from "./adaptation.js";
import { isSymptomFree } from "./adaptation.js";

export const STARTING_FALLBACK_GH = 60;

export type StartingWorkout = {
  gh: number | null;
  symptom: SymptomLevel | null;
};

/**
 * Highest g/h with none or mild symptoms.
 * If nothing qualifies, min(60 g/h, 1 g/kg). Weight is required for 1 g/kg.
 */
export function startingPoint(input: {
  workouts: StartingWorkout[];
  weightKg: number | null;
}): { gh: number | null; source: "history" | "fallback" | "not_set" } {
  const known = input.workouts.filter(
    (item): item is { gh: number; symptom: SymptomLevel } =>
      item.gh != null && item.symptom != null && isSymptomFree(item.symptom),
  );
  if (known.length > 0) {
    return { gh: Math.max(...known.map((item) => item.gh)), source: "history" };
  }
  if (input.weightKg == null || input.weightKg <= 0) return { gh: null, source: "not_set" };
  return { gh: Math.min(STARTING_FALLBACK_GH, roundInt(input.weightKg)), source: "fallback" };
}
