export function roundInt(value: number): number {
  return Math.round(value);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function hours(durationMin: number): number {
  return durationMin / 60;
}

export function addMinutes(from: Date, minutes: number): Date {
  return new Date(from.getTime() + minutes * 60_000);
}

export function parseDay(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

export function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromDay: string, toDay: string): number {
  const ms = parseDay(toDay).getTime() - parseDay(fromDay).getTime();
  return Math.round(ms / 86_400_000);
}

export function shiftDay(day: string, days: number): string {
  return formatDay(new Date(parseDay(day).getTime() + days * 86_400_000));
}

/** UTC instant for a YYYY-MM-DD and HH:mm clock reading in an IANA zone. */
export function zonedLocalToUtc(day: string, time: string, timeZone: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const utcGuess = new Date(`${day}T${time}:00.000Z`);
  if (Number.isNaN(utcGuess.getTime())) return null;
  const zoneClock = new Date(utcGuess.toLocaleString("en-US", { timeZone }));
  const utcClock = new Date(utcGuess.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(utcGuess.getTime() + (utcClock.getTime() - zoneClock.getTime()));
}
