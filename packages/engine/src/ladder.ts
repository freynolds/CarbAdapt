import { daysBetween, formatDay, parseDay } from "./numbers.js";

export const LADDER_STEP_G = 10;
export const SESSIONS_PER_STEP = 2;
export const MAX_GH = 200;
export const WARN_ABOVE_GH = 120;
export const ABOVE_GH_WEEKLY_CAP = 90;
export const LONG_RIDES_BEFORE_RACE = 4;

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
  const values: number[] = [];
  let gh = startGh;
  while (gh + LADDER_STEP_G <= goalGh) {
    gh += LADDER_STEP_G;
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
