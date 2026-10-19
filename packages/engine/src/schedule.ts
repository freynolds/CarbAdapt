import { addMinutes, shiftDay, zonedLocalToUtc } from "./numbers.js";

export type NotificationDraft = {
  type: string;
  scheduledAt: Date | null;
  dedupeKey: string;
  copyKey: string;
  refType: string | null;
  refId: string | null;
  reason: "scheduled" | "time_not_set" | "missing_input";
};

export function stageFallbackAt(start: Date, estimatedDurationMin: number): Date {
  return addMinutes(start, estimatedDurationMin * 1.5);
}

export function stageNotification(input: {
  stageId: string;
  start: Date | null;
  estimatedDurationMin: number;
  arrivedAt: Date | null;
}): NotificationDraft {
  const scheduledAt = input.arrivedAt ?? (input.start ? stageFallbackAt(input.start, input.estimatedDurationMin) : null);
  return {
    type: "STAGE_COMPLETE",
    scheduledAt,
    dedupeKey: `STAGE_COMPLETE:${input.stageId}`,
    copyKey: "rec.push",
    refType: "Stage",
    refId: input.stageId,
    reason: scheduledAt ? "scheduled" : "missing_input",
  };
}

export function carbLoadingNotification(input: {
  raceId: string;
  day: "D_MINUS_2" | "D_MINUS_1";
}): NotificationDraft {
  return {
    type: input.day === "D_MINUS_2" ? "CARB_LOADING_D2" : "CARB_LOADING_D1",
    scheduledAt: null,
    dedupeKey: `CARB_LOADING:${input.raceId}:${input.day}`,
    copyKey: input.day === "D_MINUS_2" ? "load.copy.d2" : "load.copy.d1",
    refType: "Race",
    refId: input.raceId,
    reason: "time_not_set",
  };
}

export function raceBreakfastNotification(raceId: string): NotificationDraft {
  return {
    type: "RACE_BREAKFAST",
    scheduledAt: null,
    dedupeKey: `RACE_BREAKFAST:${raceId}`,
    copyKey: "brk.alarm",
    refType: "Race",
    refId: raceId,
    reason: "time_not_set",
  };
}

export function rehearsalNotification(raceId: string): NotificationDraft {
  return {
    type: "LOADING_REHEARSAL",
    scheduledAt: null,
    dedupeKey: `LOADING_REHEARSAL:${raceId}`,
    copyKey: "load.copy.rehearsal",
    refType: "Race",
    refId: raceId,
    reason: "time_not_set",
  };
}

export function postWorkoutNotification(input: {
  workoutId: string;
  arrivedAt: Date;
}): NotificationDraft {
  return {
    type: "POST_WORKOUT",
    scheduledAt: input.arrivedAt,
    dedupeKey: `POST_WORKOUT:${input.workoutId}`,
    copyKey: "q.kicker",
    refType: "Workout",
    refId: input.workoutId,
    reason: "scheduled",
  };
}

export function postWorkoutReminder(workoutId: string): NotificationDraft {
  return {
    type: "POST_WORKOUT_REMINDER",
    scheduledAt: null,
    dedupeKey: `POST_WORKOUT_REMINDER:${workoutId}`,
    copyKey: "q.kicker",
    refType: "Workout",
    refId: workoutId,
    reason: "time_not_set",
  };
}

/** 1 hour before a known start, at a 60-minute test end, and 2 hours after that end. */
export function sweatTestTimers(input: {
  sweatTestId: string;
  startedAt: Date | null;
}): NotificationDraft[] {
  if (!input.startedAt) return [];
  const end = addMinutes(input.startedAt, 60);
  return [
    {
      type: "SWEAT_TEST_END",
      scheduledAt: end,
      dedupeKey: `SWEAT_TEST_END:${input.sweatTestId}`,
      copyKey: "sweat.push.end",
      refType: "SweatTest",
      refId: input.sweatTestId,
      reason: "scheduled",
    },
    {
      type: "SWEAT_TEST_INCOMPLETE",
      scheduledAt: addMinutes(end, 120),
      dedupeKey: `SWEAT_TEST_INCOMPLETE:${input.sweatTestId}`,
      copyKey: "sweat.push.incomplete",
      refType: "SweatTest",
      refId: input.sweatTestId,
      reason: "scheduled",
    },
  ];
}

export function dailyBriefing(input: {
  userId: string;
  day: string;
  briefingTimeLocal: string | null;
  dayBefore: boolean;
  timeZone: string;
}): NotificationDraft {
  const day = input.dayBefore ? shiftDay(input.day, -1) : input.day;
  const scheduledAt = input.briefingTimeLocal
    ? zonedLocalToUtc(day, input.briefingTimeLocal, input.timeZone)
    : null;
  return {
    type: "DAILY_BRIEFING",
    scheduledAt,
    dedupeKey: `DAILY_BRIEFING:${input.userId}:${input.day}`,
    copyKey: "brief.sample",
    refType: "User",
    refId: input.userId,
    reason: scheduledAt ? "scheduled" : "missing_input",
  };
}
