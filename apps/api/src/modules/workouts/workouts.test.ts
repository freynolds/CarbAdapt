import assert from "node:assert/strict";
import test from "node:test";
import { calendarDate } from "../../http/calendar.js";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /workouts filters by calendar range", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const todayId = testId("wrk");
    const otherId = testId("wrk");
    await db.workout.create({
      data: {
        id: todayId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Today ride",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        durationMin: 90,
        status: "PLANNED",
        workoutType: "BASE",
      },
    });
    await db.workout.create({
      data: {
        id: otherId,
        userId,
        source: "MANUAL",
        sport: "RUNNING",
        name: "Old run",
        plannedDate: new Date("2020-01-01T00:00:00.000Z"),
        durationMin: 40,
        status: "COMPLETED",
      },
    });

    const ranged = await fetch(`${baseUrl}/workouts?from=${today}&to=${today}`, {
      headers: { cookie },
    });
    assert.equal(ranged.status, 200);
    const rangedBody = (await ranged.json()) as { workouts: Array<{ id: string; name: string }> };
    assert.deepEqual(
      rangedBody.workouts.map((item) => item.id),
      [todayId],
    );

    const one = await fetch(`${baseUrl}/workouts/${todayId}`, { headers: { cookie } });
    assert.equal(one.status, 200);
    const oneBody = (await one.json()) as {
      workout: { plannedDate: string; needsIntake: boolean };
    };
    assert.equal(oneBody.workout.plannedDate, today);
    assert.equal(oneBody.workout.needsIntake, false);

    const bad = await fetch(`${baseUrl}/workouts?from=yesterday`, { headers: { cookie } });
    assert.equal(bad.status, 400);
    const missing = await fetch(`${baseUrl}/workouts/wrk_missing`, { headers: { cookie } });
    assert.equal(missing.status, 404);
  });
});
