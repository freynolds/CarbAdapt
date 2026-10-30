import assert from "node:assert/strict";
import test from "node:test";
import { fuelingPlan, raceFluidTimeline } from "./index.js";

const carla = {
  distanceKm: 75,
  durationMin: 180,
  sweatLPerH: 0.8,
  carriedMl: 750,
};

test("one bottle runs out before the finish", () => {
  const line = raceFluidTimeline({ ...carla, refillKm: [] });
  assert.equal(line.enough, false);
  assert.equal(line.neededMl, 2400);
  assert.equal(line.carriedMl, 750);
  assert.equal(line.missingMl, 1650);
  assert.equal(line.runOutKm, 23.4);
  assert.equal(line.runOutMin, 56);
  assert.deepEqual(line.stationsReached, []);
  assert.deepEqual(line.stationsMissed, []);
  assert.equal(line.points.at(-1)?.kind, "run_out");
});

test("a station reached with water left tops the bottles back up", () => {
  const line = raceFluidTimeline({ ...carla, refillKm: [20] });
  assert.equal(line.enough, false);
  assert.deepEqual(line.stationsReached, [20]);
  assert.deepEqual(line.stationsMissed, []);
  assert.equal(line.refills[0]?.addedMl, 640);
  assert.equal(line.runOutKm, 43.4);
  assert.equal(line.runOutMin, 104);
  assert.equal(line.missingMl, 1010);
  const refill = line.points.find((point) => point.kind === "refill");
  assert.equal(refill?.km, 20);
  assert.equal(refill?.remainingMl, 750);
});

test("stations before the run-out still leave a gap", () => {
  const line = raceFluidTimeline({ ...carla, refillKm: [40, 20, 20] });
  assert.equal(line.enough, false);
  assert.deepEqual(line.stationsReached, [20, 40]);
  assert.deepEqual(line.stationsMissed, []);
  assert.equal(line.runOutKm, 63.4);
  assert.equal(line.runOutMin, 152);
  assert.equal(line.missingMl, 370);
  assert.equal(line.runOutKm != null && line.runOutKm < carla.distanceKm, true);
});

test("a station after the run-out is missed and adds no water", () => {
  const line = raceFluidTimeline({ ...carla, refillKm: [40] });
  assert.deepEqual(line.stationsReached, []);
  assert.deepEqual(line.stationsMissed, [40]);
  assert.deepEqual(line.refills, []);
  assert.equal(line.runOutKm, 23.4);
  assert.equal(line.missingMl, 1650);
});

test("a stop reached exactly empty still counts", () => {
  const line = raceFluidTimeline({ ...carla, carriedMl: 640, refillKm: [20] });
  assert.deepEqual(line.stationsReached, [20]);
  assert.equal(line.refills[0]?.addedMl, 640);
  assert.equal(line.runOutKm, 40);
});

test("enough water finishes with none missing, and stops outside the race are ignored", () => {
  const line = raceFluidTimeline({ ...carla, carriedMl: 2400, refillKm: [0, 75, -1] });
  assert.equal(line.enough, true);
  assert.equal(line.missingMl, 0);
  assert.equal(line.runOutKm, null);
  assert.equal(line.runOutMin, null);
  assert.deepEqual(line.stationsReached, []);
  assert.equal(line.points.at(-1)?.kind, "finish");
  assert.equal(line.points.at(-1)?.remainingMl, 0);
});

test("a race day uses the high end of the band, capped by tolerance", () => {
  const open = fuelingPlan({
    durationMin: 180,
    sport: "CYCLING",
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: 40,
    chosenGPerH: null,
    sweatRateLPerH: 0.8,
    products: [],
    containers: [],
    raceMaxCarb: true,
    toleranceGh: null,
  });
  assert.equal(open.targetGPerH, 90);
  assert.equal(open.carbBasis, "band_max");
  const capped = fuelingPlan({
    durationMin: 180,
    sport: "CYCLING",
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: 40,
    chosenGPerH: null,
    sweatRateLPerH: 0.8,
    products: [],
    containers: [],
    raceMaxCarb: true,
    toleranceGh: 60,
  });
  assert.equal(capped.targetGPerH, 60);
  assert.equal(capped.carbBasis, "band_max");
  assert.equal(capped.totalCarbsG, 180);
  const chosen = fuelingPlan({
    durationMin: 180,
    sport: "CYCLING",
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: null,
    chosenGPerH: 70,
    sweatRateLPerH: null,
    products: [],
    containers: [],
    raceMaxCarb: true,
    toleranceGh: 60,
  });
  assert.equal(chosen.carbBasis, "chosen");
  assert.equal(chosen.targetGPerH, 70);
});
