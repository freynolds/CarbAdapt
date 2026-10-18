import assert from "node:assert/strict";
import test from "node:test";
import { calendarDate } from "../../http/calendar.js";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /workouts/:id/fueling-plan returns the current plan", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const workoutId = testId("wrk");
    const planId = testId("flp");
    await db.workout.create({
      data: {
        id: workoutId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Fuel me",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        durationMin: 150,
        status: "PLANNED",
        fuelingPlans: {
          create: [
            {
              id: planId,
              engineVersion: "fixture",
              targetGPerH: 60,
              totalCarbsG: 150,
              totalFluidMl: 700,
              totalSodiumMg: 400,
              schedule: [{ atMin: 30, kind: "GEL" }],
              carryList: { gels: 4 },
              isCurrent: true,
            },
            {
              id: testId("flp"),
              engineVersion: "fixture",
              totalCarbsG: 10,
              totalFluidMl: 0,
              totalSodiumMg: 0,
              schedule: [],
              carryList: {},
              isCurrent: false,
            },
          ],
        },
      },
    });
    const response = await fetch(`${baseUrl}/workouts/${workoutId}/fueling-plan`, {
      headers: { cookie },
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      fuelingPlan: { id: string; totalCarbsG: number; isCurrent: boolean; schedule: unknown };
    };
    assert.equal(body.fuelingPlan.id, planId);
    assert.equal(body.fuelingPlan.totalCarbsG, 150);
    assert.equal(body.fuelingPlan.isCurrent, true);
    assert.deepEqual(body.fuelingPlan.schedule, [{ atMin: 30, kind: "GEL" }]);

    const emptyId = testId("wrk");
    await db.workout.create({
      data: {
        id: emptyId,
        userId,
        source: "MANUAL",
        sport: "OTHER",
        name: "No plan",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        status: "PLANNED",
      },
    });
    const empty = await fetch(`${baseUrl}/workouts/${emptyId}/fueling-plan`, {
      headers: { cookie },
    });
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), { fuelingPlan: null });
  });
});
