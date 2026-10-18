/** UTC midnight of the calendar date in `timeZone`. Matches how seed dates are stored. */
export function calendarToday(now: Date, timeZone: string): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
}

export function calendarDate(now: Date, timeZone: string): string {
  return calendarToday(now, timeZone).toISOString().slice(0, 10);
}

/** Hour 0–23 in `timeZone`. Midnight reported as 24 is folded back to 0. */
export function hourInZone(date: Date, timeZone: string): number {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((item) => item.type === "hour");
  const hour = Number(part?.value ?? "0");
  return hour === 24 ? 0 : hour;
}

export function parseDay(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
