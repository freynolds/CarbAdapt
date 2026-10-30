import { roundInt } from "./numbers.js";

export type RaceFluidKind = "start" | "sample" | "refill" | "run_out" | "finish";

export type RaceFluidPoint = {
  km: number;
  minute: number;
  remainingMl: number;
  kind: RaceFluidKind;
};

export type RaceFluidRefill = {
  km: number;
  /** Water added to bring the bottles back to full. Plain water, 0 g carbs. */
  addedMl: number;
};

export type RaceFluidTimeline = {
  enough: boolean;
  carriedMl: number;
  neededMl: number;
  missingMl: number;
  runOutKm: number | null;
  runOutMin: number | null;
  points: RaceFluidPoint[];
  stationsReached: number[];
  stationsMissed: number[];
  refills: RaceFluidRefill[];
};

const EPS = 1e-6;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Fluid left along a race at a steady sweat rate.
 * Bottles start full. A stop that is reached before they run out tops them back up
 * to that same full amount. A stop at empty still counts. Stops after they run out do not.
 * Kilometers at or before 0, or at or past the finish, are ignored.
 */
export function raceFluidTimeline(input: {
  distanceKm: number;
  durationMin: number;
  sweatLPerH: number;
  carriedMl: number;
  refillKm: number[];
}): RaceFluidTimeline {
  const carriedMl = Math.max(0, input.carriedMl);
  const sweatLPerH = Math.max(0, input.sweatLPerH);
  const neededMl = Math.max(0, roundInt(sweatLPerH * (input.durationMin / 60) * 1000));
  const distanceKm = input.distanceKm;
  const durationMin = input.durationMin;
  const blank = (): RaceFluidTimeline => ({
    enough: carriedMl + EPS >= neededMl,
    carriedMl: roundInt(carriedMl),
    neededMl,
    missingMl: Math.max(0, neededMl - roundInt(carriedMl)),
    runOutKm: null,
    runOutMin: null,
    points: [],
    stationsReached: [],
    stationsMissed: [],
    refills: [],
  });
  if (!(distanceKm > 0) || !(durationMin > 0)) return blank();

  const mlPerKm = neededMl / distanceKm;
  const minPerKm = durationMin / distanceKm;
  const stations = normalizeStations(input.refillKm, distanceKm);
  const marks = new Set<number>();
  for (let km = 1; km < distanceKm; km += 1) marks.add(km);
  for (const km of stations) marks.add(km);
  marks.add(distanceKm);
  const ordered = [...marks].sort((left, right) => left - right);

  let km = 0;
  let remaining = carriedMl;
  let runOutAt: number | null = null;
  let addedTotal = 0;
  const points: RaceFluidPoint[] = [point(0, remaining, "start", minPerKm)];
  const reached: number[] = [];
  const missed: number[] = [];
  const refills: RaceFluidRefill[] = [];

  for (const target of ordered) {
    const station = stations.find((stop) => Math.abs(stop - target) < EPS) ?? null;
    if (runOutAt != null) {
      if (station != null) missed.push(round1(station));
      continue;
    }
    const need = (target - km) * mlPerKm;
    if (need > remaining + EPS) {
      const kmLeft = mlPerKm > EPS ? remaining / mlPerKm : 0;
      runOutAt = km + kmLeft;
      points.push(point(runOutAt, 0, "run_out", minPerKm));
      if (station != null) missed.push(round1(station));
      continue;
    }
    remaining -= need;
    km = target;
    if (station != null) {
      const added = Math.max(0, carriedMl - remaining);
      points.push(point(km, remaining, "sample", minPerKm));
      addedTotal += added;
      remaining = carriedMl;
      reached.push(round1(station));
      refills.push({ km: round1(station), addedMl: roundInt(added) });
      points.push(point(km, remaining, "refill", minPerKm));
      continue;
    }
    const kind = Math.abs(target - distanceKm) < EPS ? "finish" : "sample";
    points.push(point(km, remaining, kind, minPerKm));
  }

  const enough = runOutAt == null;
  return {
    enough,
    carriedMl: roundInt(carriedMl),
    neededMl,
    missingMl: enough ? 0 : Math.max(0, roundInt(neededMl - (carriedMl + addedTotal))),
    runOutKm: runOutAt == null ? null : round1(runOutAt),
    runOutMin: runOutAt == null ? null : roundInt(runOutAt * minPerKm),
    points,
    stationsReached: reached,
    stationsMissed: missed,
    refills,
  };
}

function point(km: number, remainingMl: number, kind: RaceFluidKind, minPerKm: number): RaceFluidPoint {
  return {
    km: round1(km),
    minute: roundInt(km * minPerKm),
    remainingMl: Math.max(0, roundInt(remainingMl)),
    kind,
  };
}

function normalizeStations(km: number[], distanceKm: number): number[] {
  const sorted = km.filter((value) => value > 0 && value < distanceKm).sort((left, right) => left - right);
  const out: number[] = [];
  for (const value of sorted) {
    const last = out[out.length - 1];
    if (last != null && Math.abs(last - value) < EPS) continue;
    out.push(value);
  }
  return out;
}
