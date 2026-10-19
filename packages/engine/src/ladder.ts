import { daysBetween, formatDay, parseDay } from "./numbers.js";

export const LADDER_STEP_G = 10;
export const LADDER_SMALL_STEP_G = 5;
/** A gap of this many g/h or more uses 10 g/h steps, which is at least three steps. */
export const LADDER_LARGE_GAP_G = 30;
export const SESSIONS_PER_STEP = 2;
export const MAX_GH = 200;
export const WARN_ABOVE_GH = 120;
export const ABOVE_GH_WEEKLY_CAP = 90;
export const LONG_RIDES_BEFORE_RACE = 4;
/** Gut training needs a race at least four weeks out. */
export const GUT_RACE_LEAD_DAYS = 28;

/** 10 g/h when the gap is 30 or more. 5 g/h when the gap is smaller and still positive. */
export function ladderStepG(startGh: number, goalGh: number): number {
  const gap = goalGh - startGh;
  if (gap >= LADDER_LARGE_GAP_G) return LADDER_STEP_G;
  if (gap > 0) return LADDER_SMALL_STEP_G;
  return LADDER_STEP_G;
}

export function gutRaceAllowed(
  today: string,
  raceDate: string,
): { ok: boolean; reason: "past" | "too_soon" | null } {
  const days = daysBetween(today, raceDate);
  if (days < 0) return { ok: false, reason: "past" };
  if (days < GUT_RACE_LEAD_DAYS) return { ok: false, reason: "too_soon" };
  return { ok: true, reason: null };
}

export type LadderStepDraft = {
  index: number;
  gh: number;
  approxDate: string | null;
  status: "DONE" | "CURRENT" | "UPCOMING";
};

export type LadderResult = {
  steps: LadderStepDraft[];
  tooFast: boolean;
  tooFastKnown: boolean;
  defaultGh: number | null;
  warnsAbove120: boolean;
  overMax: boolean;
  /** Fewer than 2 long rides a week slows the ladder. No extra multiplier is specified. */
  slowerBecauseUnderTwoPerWeek: boolean;
};

export function stepTargets(startGh: number, goalGh: number): number[] {
  const step = ladderStepG(startGh, goalGh);
  const values: number[] = [];
  let gh = startGh;
  while (gh + step <= goalGh) {
    gh += step;
    values.push(gh);
  }
  return values;
}

/**
 * +10 g/h after 2 symptom-free sessions.
 * Above 90 g/h, at most one step per week.
 * Dates stay empty when sessions per week are unknown.
 * Too-fast means the goal cannot be reached with 4 long rides still left
 * before the target date (handoff B9, #117).
 */
export function buildLadder(input: {
  startGh: number;
  goalGh: number;
  today: string;
  targetDate: string;
  sessionsPerWeek: number | null;
}): LadderResult {
  const overMax = input.goalGh > MAX_GH;
  const warnsAbove120 = input.goalGh > WARN_ABOVE_GH;
  const targets = stepTargets(input.startGh, input.goalGh);
  const slower = input.sessionsPerWeek != null && input.sessionsPerWeek < 2;
  if (input.sessionsPerWeek == null || input.sessionsPerWeek < 1 || targets.length === 0) {
    return {
      steps: targets.map((gh, index) => ({
        index,
        gh,
        approxDate: null,
        status: index === 0 ? "CURRENT" : "UPCOMING",
      })),
      tooFast: false,
      tooFastKnown: input.sessionsPerWeek != null && targets.length === 0,
      defaultGh: targets.length === 0 ? input.startGh : null,
      warnsAbove120,
      overMax,
      slowerBecauseUnderTwoPerWeek: slower,
    };
  }

  const perWeek = input.sessionsPerWeek;
  let week = 0;
  let left = perWeek;
  let stepsThisWeek = 0;
  const dated: { gh: number; date: string }[] = [];
  for (const gh of targets) {
    let needed = SESSIONS_PER_STEP;
    while (needed > 0) {
      const capped = gh > ABOVE_GH_WEEKLY_CAP && stepsThisWeek >= 1;
      if (left <= 0 || capped) {
        week += 1;
        left = perWeek;
        stepsThisWeek = 0;
        continue;
      }
      const take = Math.min(needed, left);
      needed -= take;
      left -= take;
    }
    stepsThisWeek += 1;
    const date = formatDay(new Date(parseDay(input.today).getTime() + week * 7 * 86_400_000));
    dated.push({ gh, date });
  }

  const steps: LadderStepDraft[] = dated.map((step, index) => ({
    index,
    gh: step.gh,
    approxDate: step.date,
    status: index === 0 ? "CURRENT" : "UPCOMING",
  }));

  const goal = dated[dated.length - 1];
  const daysAfterGoal = goal ? daysBetween(goal.date, input.targetDate) : 0;
  const sessionsAfter = Math.max(0, Math.floor((daysAfterGoal / 7) * perWeek));
  const tooFast = !goal || goal.date > input.targetDate || sessionsAfter < LONG_RIDES_BEFORE_RACE;

  let defaultGh: number | null = input.startGh;
  for (const step of dated) {
    const after = Math.max(0, Math.floor((daysBetween(step.date, input.targetDate) / 7) * perWeek));
    if (step.date <= input.targetDate && after >= LONG_RIDES_BEFORE_RACE) defaultGh = step.gh;
  }

  return {
    steps,
    tooFast,
    tooFastKnown: true,
    defaultGh,
    warnsAbove120,
    overMax,
    slowerBecauseUnderTwoPerWeek: slower,
  };
}
