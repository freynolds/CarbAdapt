import assert from "node:assert/strict";
import test from "node:test";
import { HttpErrorCode } from "@carbadapt/contracts";
import type { PrismaClient } from "@carbadapt/db";
import { testId, withAthlete } from "../../test/harness.js";

const auth = (token: string) => ({
  "content-type": "application/json",
  authorization: `Bearer ${token}`,
});

type PlanBody = {
  racePlan: {
    saved: boolean;
    ownedFluidMl: number;
    carriedMl: number;
    neededMl: number | null;
    missingMl: number | null;
    enough: boolean | null;
    computable: boolean;
    runOutKm: number | null;
    runOutMin: number | null;
    stationsReachedKm: number[];
    stationsMissedKm: number[];
    courseAidKm: number[];
    extraBottlesMl: number[];
    refillKm: number[];
    refills: { km: number; addedMl: number }[];
    distanceKm: number | null;
  };
};

async function stageWorkout(
  db: PrismaClient,
  userId: string,
  options: { distanceKm?: number | null; aidKm?: number | null } = {},
) {
  const raceId = testId("race");
  const stageId = testId("stg");
  const workoutId = testId("wrk");
  const distanceKm = options.distanceKm === undefined ? 75 : options.distanceKm;
  await db.physicalData.create({ data: { userId, sweatRateLPerH: 0.8, ghTolerance: 60 } });
  await db.container.create({
    data: { userId, type: "BOTTLE", name: "Road bottle", capacityMl: 750, usualContent: "ISOTONIC" },
  });
  await db.container.create({
    data: { userId, type: "SOFT_FLASK", name: "Gel flask", capacityMl: 150, usualContent: "GEL_CONCENTRATE" },
  });
  await db.race.create({
    data: {
      id: raceId,
      userId,
      name: "Stage race",
      date: new Date("2026-12-01T00:00:00.000Z"),
      estimatedDurationMin: 180,
      type: "road",
      distanceKm: 75,
      isMultiStage: true,
      stages: {
        create: {
          id: stageId,
          index: 7,
          date: new Date("2026-12-01T00:00:00.000Z"),
          startAt: new Date("2026-12-01T12:00:00.000Z"),
          estimatedDurationMin: 180,
          type: "road",
          distanceKm,
          ...(options.aidKm == null
            ? {}
            : { aidStations: { create: [{ kmMark: options.aidKm, hasWater: true }] } }),
        },
      },
    },
  });
  await db.workout.create({
    data: {
      id: workoutId,
      userId,
      source: "MANUAL",
      sport: "CYCLING",
      name: "Stage 7",
      plannedDate: new Date("2026-12-01T00:00:00.000Z"),
      durationMin: 180,
      status: "PLANNED",
      stageId,
    },
  });
  return workoutId;
}

test("a race plan says where one bottle runs out", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const workoutId = await stageWorkout(db, userId, { aidKm: 20 });
    const response = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, { headers: auth(token) });
    assert.equal(response.status, 200);
    const body = (await response.json()) as PlanBody;
    assert.equal(body.racePlan.saved, false);
    assert.equal(body.racePlan.ownedFluidMl, 750);
    assert.equal(body.racePlan.carriedMl, 750);
    assert.equal(body.racePlan.neededMl, 2400);
    assert.equal(body.racePlan.missingMl, 1650);
    assert.equal(body.racePlan.enough, false);
    assert.equal(body.racePlan.runOutKm, 23.4);
    assert.equal(body.racePlan.runOutMin, 56);
    assert.deepEqual(body.racePlan.stationsReachedKm, []);
    assert.deepEqual(body.racePlan.courseAidKm, [20]);
  });
});

test("a station reached in time extends the run-out and still falls short", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const workoutId = await stageWorkout(db, userId);
    const one = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({ extraBottlesMl: [], refillKm: [20] }),
    });
    assert.equal(one.status, 200);
    const reached = (await one.json()) as PlanBody;
    assert.equal(reached.racePlan.saved, true);
    assert.deepEqual(reached.racePlan.stationsReachedKm, [20]);
    assert.deepEqual(reached.racePlan.stationsMissedKm, []);
    assert.equal(reached.racePlan.refills[0]?.addedMl, 640);
    assert.equal(reached.racePlan.runOutKm, 43.4);
    assert.equal(reached.racePlan.missingMl, 1010);

    const two = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({ extraBottlesMl: [], refillKm: [20, 40] }),
    });
    assert.equal(two.status, 200);
    const both = (await two.json()) as PlanBody;
    assert.deepEqual(both.racePlan.stationsReachedKm, [20, 40]);
    assert.equal(both.racePlan.enough, false);
    assert.equal(both.racePlan.runOutKm, 63.4);
    assert.equal(both.racePlan.runOutMin, 152);
    assert.equal(both.racePlan.missingMl, 370);
  });
});

test("a station after the run-out adds no water", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const workoutId = await stageWorkout(db, userId);
    const response = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({ extraBottlesMl: [], refillKm: [40] }),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as PlanBody;
    assert.deepEqual(body.racePlan.stationsMissedKm, [40]);
    assert.deepEqual(body.racePlan.stationsReachedKm, []);
    assert.deepEqual(body.racePlan.refills, []);
    assert.equal(body.racePlan.runOutKm, 23.4);
    assert.equal(body.racePlan.missingMl, 1650);
  });
});

test("an extra bottle counts as water the athlete carries", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const workoutId = await stageWorkout(db, userId);
    const response = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({ extraBottlesMl: [750], refillKm: [] }),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as PlanBody;
    assert.deepEqual(body.racePlan.extraBottlesMl, [750]);
    assert.equal(body.racePlan.carriedMl, 1500);
    assert.equal(body.racePlan.runOutKm, 46.9);
    assert.equal(body.racePlan.runOutMin, 113);
    assert.equal(body.racePlan.missingMl, 900);
    assert.equal(body.racePlan.enough, false);
  });
});

test("a stop at or past the finish is rejected, and a missing distance can be saved", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const workoutId = await stageWorkout(db, userId, { distanceKm: null });
    const open = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, { headers: auth(token) });
    const before = (await open.json()) as PlanBody;
    assert.equal(before.racePlan.computable, false);
    assert.equal(before.racePlan.distanceKm, null);
    const late = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({ extraBottlesMl: [], refillKm: [20], distanceKm: 75 }),
    });
    assert.equal(late.status, 200);
    const saved = (await late.json()) as PlanBody;
    assert.equal(saved.racePlan.distanceKm, 75);
    assert.deepEqual(saved.racePlan.stationsReachedKm, [20]);
    const past = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({ extraBottlesMl: [], refillKm: [75] }),
    });
    assert.equal(past.status, 400);
    assert.equal(((await past.json()) as { error: string }).error, HttpErrorCode.InvalidRequest);
  });
});

test("a workout that is not a stage has no race plan", async () => {
  await withAthlete(async ({ baseUrl, token }) => {
    const created = await fetch(`${baseUrl}/workouts`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({
        name: "Base",
        sport: "CYCLING",
        workoutType: "BASE",
        plannedDate: "2026-12-02",
        durationMin: 90,
      }),
    });
    assert.equal(created.status, 201);
    const workoutId = ((await created.json()) as { workout: { id: string } }).workout.id;
    const response = await fetch(`${baseUrl}/workouts/${workoutId}/race-plan`, { headers: auth(token) });
    assert.equal(response.status, 400);
    assert.equal(((await response.json()) as { error: string }).error, HttpErrorCode.InvalidRequest);
  });
});
