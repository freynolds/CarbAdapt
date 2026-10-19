import type { EngineSport } from "./fueling.js";
import { LADDER_STEP_G, SESSIONS_PER_STEP, ABOVE_GH_WEEKLY_CAP } from "./ladder.js";

export type SymptomLevel = "NONE" | "MILD" | "MODERATE" | "SEVERE";

const RANK: Record<SymptomLevel, number> = { NONE: 0, MILD: 1, MODERATE: 2, SEVERE: 3 };

export type SymptomGroups = {
  upper: SymptomLevel | null;
  lower: SymptomLevel | null;
  systemic: SymptomLevel | null;
};

/**
 * Aggregation across the three groups is not specified.
 * When the reported groups disagree, no advance or step-back is taken.
 * When they agree, that level is used. Mild counts as symptom-free (#114).
 */
export function agreedSymptom(groups: SymptomGroups): SymptomLevel | "MIXED" | "MISSING" {
  const present = [groups.upper, groups.lower, groups.systemic].filter(
    (item): item is SymptomLevel => item != null,
  );
  if (present.length === 0) return "MISSING";
  const first = present[0];
  if (!first) return "MISSING";
  if (present.some((item) => item !== first)) return "MIXED";
  return first;
}

export function isSymptomFree(level: SymptomLevel): boolean {
  return level === "NONE" || level === "MILD";
}

/** Cycling counts above 2 h. Running and trail count above 60 min. */
export function sessionEligible(sport: EngineSport, durationMin: number | null): boolean {
  if (durationMin == null) return false;
  if (sport === "CYCLING") return durationMin > 120;
  if (sport === "RUNNING" || sport === "TRAIL_RUNNING") return durationMin > 60;
  return false;
}

export type AdaptationInputLog = {
  id: string;
  gh: number;
  symptom: SymptomLevel | "MIXED" | "MISSING";
  eligible: boolean;
  countsForPlan: boolean;
  /** ISO week key supplied by the caller. The engine does not read the clock. */
  weekKey: string;
};

export type AdaptationResult = {
  outcome: "ADVANCE" | "HOLD" | "STEP_BACK" | "NONE";
  fromGh: number;
  toGh: number;
  inputLogIds: string[];
  reason:
    | "two_symptom_free"
    | "moderate"
    | "severe"
    | "mixed_symptoms"
    | "missing_symptoms"
    | "weekly_cap"
    | "no_eligible_pair"
    | "not_eligible";
};

/**
 * R1: advance +10 g/h after 2 symptom-free sessions at the current step.
 * Moderate holds. Severe steps back one step.
 * Above 90 g/h, at most one advance per week.
 */
export function adapt(input: {
  currentGh: number;
  logsNewestFirst: AdaptationInputLog[];
  advancesThisWeek: number;
  weekKey: string;
  /** Size of the current ladder step. Defaults to 10 g/h. */
  stepG?: number;
}): AdaptationResult {
  const stepG = input.stepG ?? LADDER_STEP_G;
  const hold = (reason: AdaptationResult["reason"], ids: string[]): AdaptationResult => ({
    outcome: reason === "no_eligible_pair" || reason === "not_eligible" ? "NONE" : "HOLD",
    fromGh: input.currentGh,
    toGh: input.currentGh,
    inputLogIds: ids,
    reason,
  });

  const usable = input.logsNewestFirst.filter((log) => log.eligible && log.countsForPlan && log.gh === input.currentGh);
  const latest = usable[0];
  if (!latest) return hold("not_eligible", []);
  if (latest.symptom === "MISSING") return hold("missing_symptoms", [latest.id]);
  if (latest.symptom === "MIXED") return hold("mixed_symptoms", [latest.id]);
  if (latest.symptom === "SEVERE") {
    return {
      outcome: "STEP_BACK",
      fromGh: input.currentGh,
      toGh: Math.max(0, input.currentGh - stepG),
      inputLogIds: [latest.id],
      reason: "severe",
    };
  }
  if (latest.symptom === "MODERATE") return hold("moderate", [latest.id]);
  if (!isSymptomFree(latest.symptom)) return hold("no_eligible_pair", [latest.id]);

  const free = usable.filter((log) => log.symptom !== "MIXED" && log.symptom !== "MISSING" && isSymptomFree(log.symptom));
  const pair = free.slice(0, SESSIONS_PER_STEP);
  if (pair.length < SESSIONS_PER_STEP) return hold("no_eligible_pair", pair.map((log) => log.id));

  const next = input.currentGh + stepG;
  if (next > ABOVE_GH_WEEKLY_CAP && input.advancesThisWeek >= 1) {
    return hold("weekly_cap", pair.map((log) => log.id));
  }
  return {
    outcome: "ADVANCE",
    fromGh: input.currentGh,
    toGh: next,
    inputLogIds: pair.map((log) => log.id),
    reason: "two_symptom_free",
  };
}

export function worstRank(level: SymptomLevel): number {
  return RANK[level];
}
