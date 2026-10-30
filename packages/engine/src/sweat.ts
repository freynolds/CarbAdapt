import { hours, round2 } from "./numbers.js";

/**
 * Handoff B4: sweat rate (L/h) = pre − post + fluid − urine.
 * Weights are kilograms. Fluid and urine are milliliters.
 * The written sum is a volume. Dividing by the test duration yields L/h.
 * The protocol duration is 60 minutes.
 */
export const SWEAT_TEST_PROTOCOL_MIN = 60;

/** MVP plan assumption: in-field validation uses the upper end of "3–4" workouts. */
export const IN_FIELD_VALIDATIONS = 4;

export function sweatRateLPerH(input: {
  preWeightKg: number;
  postWeightKg: number;
  fluidMl: number;
  urineMl: number;
  durationMin: number;
}): number | null {
  if (input.durationMin <= 0) return null;
  const liters = input.preWeightKg - input.postWeightKg + input.fluidMl / 1000 - input.urineMl / 1000;
  return round2(liters / hours(input.durationMin));
}

export type SipCalibration = {
  gramsPerSip: number;
  /** Set only for water, where 1 g = 1 ml. Other densities are not set. */
  mlPerSip: number | null;
  gPerSqueeze: number | null;
  density: "water" | "not_set";
};

/** Weights are [start, after 1 sip, after 2, after 3]. */
export function calibrateSips(
  weightsG: number[],
  content: "WATER" | "ISOTONIC" | "GEL_CONCENTRATE",
): SipCalibration | null {
  if (weightsG.length !== 4) return null;
  const first = weightsG[0];
  const second = weightsG[1];
  const third = weightsG[2];
  const fourth = weightsG[3];
  if (first == null || second == null || third == null || fourth == null) return null;
  const drops = [first - second, second - third, third - fourth];
  if (drops.some((drop) => !Number.isFinite(drop))) return null;
  const grams = round2(drops.reduce((sum, drop) => sum + drop, 0) / drops.length);
  if (content === "GEL_CONCENTRATE") {
    return { gramsPerSip: grams, mlPerSip: null, gPerSqueeze: grams, density: "not_set" };
  }
  if (content === "WATER") {
    return { gramsPerSip: grams, mlPerSip: grams, gPerSqueeze: null, density: "water" };
  }
  return { gramsPerSip: grams, mlPerSip: null, gPerSqueeze: null, density: "not_set" };
}
