/** Demo athletes share this zone so "today" is one calendar (assumption; see README). */
export const DEMO_TIMEZONE = "America/Argentina/Buenos_Aires";

/** Argentina does not observe DST. Offset used to turn a wall-clock time into UTC. */
export const DEMO_UTC_OFFSET_HOURS = -3;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type Clock = {
  timeZone: string;
  /** UTC midnight of the calendar date in `timeZone`. */
  today: Date;
  day(offset: number): Date;
  /** UTC instant for a wall-clock time on `today + offset` in the demo zone. */
  at(offset: number, hour?: number, minute?: number): Date;
  weekday(offset: number): number;
  /** 0–6 days until the next `target` weekday (0 = Sunday). 0 if today matches. */
  nextWeekday(target: number): number;
};

export function zonedYmd(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number; weekday: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  const weekday = WEEKDAYS.indexOf(parts.weekday as (typeof WEEKDAYS)[number]);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday,
  };
}

export function makeClock(now: Date = new Date(), timeZone = DEMO_TIMEZONE): Clock {
  const zoned = zonedYmd(now, timeZone);
  const today = new Date(Date.UTC(zoned.year, zoned.month - 1, zoned.day));

  const day = (offset: number) => {
    const next = new Date(today);
    next.setUTCDate(next.getUTCDate() + offset);
    return next;
  };

  const at = (offset: number, hour = 0, minute = 0) => {
    const date = day(offset);
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hour - DEMO_UTC_OFFSET_HOURS,
        minute,
      ),
    );
  };

  return {
    timeZone,
    today,
    day,
    at,
    weekday: (offset) => day(offset).getUTCDay(),
    nextWeekday(target: number) {
      return (target - today.getUTCDay() + 7) % 7;
    },
  };
}
