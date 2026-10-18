import assert from "node:assert/strict";
import test from "node:test";
import { calendarDate } from "../../http/calendar.js";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /achievements lists rows and the progress streak", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const workoutId = testId("wrk");
    await db.workout.create({
      data: {
        id: workoutId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Counted",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        durationMin: 120,
        status: "COMPLETED",
        fuelingPlans: {
          create: {
            id: testId("flp"),
            engineVersion: "fixture",
            totalCarbsG: 80,
            totalFluidMl: 500,
            totalSodiumMg: 300,
            schedule: [],
            carryList: {},
            isCurrent: true,
          },
        },
        feedback: {
          create: {
            id: testId("log"),
            intakeCarbsG: 90,
            symptomUpper: "NONE",
            symptomLower: "MILD",
            symptomSystemic: "NONE",
          },
        },
      },
    });
    await db.achievement.create({
      data: {
        id: testId("ach"),
        userId,
        type: "GH_INCREASE",
        valueGh: 90,
        workoutId,
      },
    });
    await db.physicalData.create({ data: { userId, ghTolerance: 90 } });

    const list = await fetch(`${baseUrl}/achievements`, { headers: { cookie } });
    assert.equal(list.status, 200);
    const listed = (await list.json()) as {
      achievements: Array<{ valueGh: number; celebratedAt: null }>;
    };
    assert.equal(listed.achievements.length, 1);
    assert.equal(listed.achievements[0]?.valueGh, 90);
    assert.equal(listed.achievements[0]?.celebratedAt, null);

    const pending = await fetch(`${baseUrl}/achievements/pending`, { headers: { cookie } });
    assert.equal(pending.status, 200);
    assert.equal(((await pending.json()) as { achievements: unknown[] }).achievements.length, 1);

    const progress = await fetch(`${baseUrl}/achievements/progress`, { headers: { cookie } });
    assert.equal(progress.status, 200);
    const progressBody = (await progress.json()) as {
      toleratedGh: number;
      streak: number;
      sessions: Array<{ planCarbsG: number; intakeCarbsG: number }>;
    };
    assert.equal(progressBody.toleratedGh, 90);
    assert.equal(progressBody.streak, 1);
    assert.equal(progressBody.sessions[0]?.planCarbsG, 80);
    assert.equal(progressBody.sessions[0]?.intakeCarbsG, 90);
  });
});
