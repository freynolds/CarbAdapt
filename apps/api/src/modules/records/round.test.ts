import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

function dayOffset(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function auth(token: string, body?: unknown): RequestInit {
  return {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

test("a fuel-mode athlete can save gut training and the ladder uses the gap rule", async () => {
  await withAthlete(async ({ baseUrl, db, userId, token }) => {
    await db.physicalData.create({ data: { userId, ghTolerance: 60 } });
    const patch = await fetch(`${baseUrl}/me`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ mode: "GUT_TRAINING" }),
    });
    assert.equal(patch.status, 200);
    const saved = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: dayOffset(40),
        startGh: 60,
        goalGh: 90,
        sessionsPerWeek: null,
      }),
    });
    assert.equal(saved.status, 200);
    const me = (await (await fetch(`${baseUrl}/me`, auth(token))).json()) as {
      user: { mode: string };
    };
    assert.equal(me.user.mode, "GUT_TRAINING");
    const plan = (await (await fetch(`${baseUrl}/gut-plan`, auth(token))).json()) as {
      plan: { steps: { gh: number }[] } | null;
    };
    assert.deepEqual(
      plan.plan?.steps.map((step) => step.gh),
      [70, 80, 90],
    );

    const small = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: dayOffset(80),
        startGh: 80,
        goalGh: 100,
        sessionsPerWeek: null,
      }),
    });
    assert.equal(small.status, 200);
    const smallBody = (await small.json()) as { plan: { steps: { gh: number }[] } };
    assert.deepEqual(
      smallBody.plan.steps.map((step) => step.gh),
      [85, 90, 95, 100],
    );
  });
});

test("a gut-training race inside four weeks is rejected", async () => {
  await withAthlete(async ({ baseUrl, db, userId, token }) => {
    const raceId = testId("race");
    await db.race.create({
      data: {
        id: raceId,
        userId,
        name: "Soon",
        date: new Date(`${dayOffset(10)}T00:00:00.000Z`),
        estimatedDurationMin: 180,
        type: "road",
      },
    });
    const saved = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        targetKind: "RACE",
        raceId,
        targetDate: dayOffset(10),
        startGh: 60,
        goalGh: 90,
        sessionsPerWeek: null,
      }),
    });
    assert.equal(saved.status, 400);
    const body = (await saved.json()) as { error: string };
    assert.equal(body.error, "race_too_soon");
  });
});

test("a sweat test can be recorded or marked not completed", async () => {
  await withAthlete(async ({ baseUrl, db, userId, token }) => {
    const doneId = testId("swt");
    const skipId = testId("swt");
    await db.sweatTest.create({
      data: { id: doneId, userId, scheduledFor: new Date(`${dayOffset(1)}T00:00:00.000Z`) },
    });
    await db.sweatTest.create({
      data: { id: skipId, userId, scheduledFor: new Date(`${dayOffset(2)}T00:00:00.000Z`) },
    });
    const recorded = await fetch(
      `${baseUrl}/sweat-tests/${doneId}/record`,
      auth(token, { preWeightKg: 70, postWeightKg: 69, fluidMl: 500, urineMl: 0, durationMin: 60 }),
    );
    assert.equal(recorded.status, 200);
    const recordedBody = (await recorded.json()) as {
      sweatTest: { status: string; sweatRateLPerH: number | null };
    };
    assert.equal(recordedBody.sweatTest.status, "COMPLETED");
    assert.equal(recordedBody.sweatTest.sweatRateLPerH, 1.5);

    const skipped = await fetch(`${baseUrl}/sweat-tests/${skipId}/not-completed`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(skipped.status, 200);
    const skippedBody = (await skipped.json()) as { sweatTest: { status: string } };
    assert.equal(skippedBody.sweatTest.status, "NOT_COMPLETED");
    const again = await fetch(`${baseUrl}/sweat-tests/${skipId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const againBody = (await again.json()) as { sweatTest: { status: string } };
    assert.equal(againBody.sweatTest.status, "NOT_COMPLETED");
  });
});

test("dismissing a rehearsal can be undone", async () => {
  await withAthlete(async ({ baseUrl, db, userId, token }) => {
    const raceId = testId("race");
    await db.race.create({
      data: {
        id: raceId,
        userId,
        name: "Fondo",
        date: new Date(`${dayOffset(30)}T00:00:00.000Z`),
        estimatedDurationMin: 300,
        type: "road",
        rehearsal: {
          create: {
            date: new Date(`${dayOffset(23)}T00:00:00.000Z`),
            status: "SUGGESTED",
          },
        },
      },
    });
    const dismissed = await fetch(`${baseUrl}/races/${raceId}/rehearsal/dismiss`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(dismissed.status, 200);
    const restored = await fetch(`${baseUrl}/races/${raceId}/rehearsal/restore`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(restored.status, 200);
    const body = (await restored.json()) as { race: { rehearsal: { status: string } | null } };
    assert.equal(body.race.rehearsal?.status, "SUGGESTED");
  });
});

test("a race-day workout stays in fuel mode for a gut-training athlete", async () => {
  await withAthlete(async ({ baseUrl, db, userId, token }) => {
    const raceId = testId("race");
    const stageId = testId("stg");
    const workoutId = testId("wrk");
    await db.user.update({ where: { id: userId }, data: { mode: "GUT_TRAINING" } });
    await db.physicalData.create({ data: { userId, ghTolerance: 80, sweatRateLPerH: 1 } });
    await db.race.create({
      data: {
        id: raceId,
        userId,
        name: "Stage race",
        date: new Date(`${dayOffset(2)}T00:00:00.000Z`),
        estimatedDurationMin: 180,
        type: "road",
        isMultiStage: true,
        stages: {
          create: {
            id: stageId,
            index: 0,
            date: new Date(`${dayOffset(2)}T00:00:00.000Z`),
            startAt: new Date(),
            estimatedDurationMin: 180,
            type: "road",
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
        name: "Stage",
        plannedDate: new Date(`${dayOffset(2)}T00:00:00.000Z`),
        durationMin: 180,
        status: "PLANNED",
        stageId,
      },
    });
    const saved = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: dayOffset(60),
        startGh: 60,
        goalGh: 90,
        sessionsPerWeek: null,
      }),
    });
    assert.equal(saved.status, 200);
    const plan = await fetch(`${baseUrl}/workouts/${workoutId}/fueling-plan`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = (await plan.json()) as {
      fuelingPlan: { targetGPerH: number | null; carryList: { carbStatus?: string } } | null;
    };
    assert.equal(body.fuelingPlan?.targetGPerH, null);
    assert.equal(body.fuelingPlan?.carryList.carbStatus, "not_set");
  });
});
