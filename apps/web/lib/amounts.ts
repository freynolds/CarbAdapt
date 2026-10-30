import type { Locale } from "@carbadapt/i18n";
import { formatNumber } from "./format";
import { asRecord, asString } from "./json";

export function labeledAmount(
  carryList: unknown,
  statusKey: "carbStatus" | "fluidStatus" | "sodiumStatus",
  value: number | null | undefined,
  locale: Locale,
  notSet: string,
): string {
  const status = asString(asRecord(carryList)?.[statusKey]);
  if (status === "not_set" || value == null) return notSet;
  return formatNumber(value, locale);
}

export function durationMinutes(value: string): number | null {
  const clock = /^(\d+):(\d{2})$/.exec(value.trim());
  if (clock) {
    const hours = Number(clock[1]);
    const minutes = Number(clock[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59) return null;
    const total = hours * 60 + minutes;
    return total > 0 ? total : null;
  }
  const plain = Number(value);
  if (!Number.isFinite(plain) || plain <= 0) return null;
  return Math.round(plain);
}

/** Interprets a local calendar day and HH:mm in the athlete's timezone as UTC. */
export function zonedLocalToIso(day: string, hm: string, timeZone: string): string | null {
  const dayParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  const timeParts = /^(\d{2}):(\d{2})$/.exec(hm);
  if (!dayParts || !timeParts) return null;
  const year = Number(dayParts[1]);
  const month = Number(dayParts[2]);
  const date = Number(dayParts[3]);
  const hour = Number(timeParts[1]);
  const minute = Number(timeParts[2]);
  const utcGuess = Date.UTC(year, month - 1, date, hour, minute, 0);
  const offset = zoneOffsetMs(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset).toISOString();
}

function zoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(
    pick("year"),
    pick("month") - 1,
    pick("day"),
    pick("hour"),
    pick("minute"),
    pick("second"),
  );
  return asUtc - instant.getTime();
}
