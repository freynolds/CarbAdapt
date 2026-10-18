import assert from "node:assert/strict";
import test from "node:test";
import { calendarDate } from "../../http/calendar.js";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /workouts/:id/feedback returns the post-workout log", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const workoutId = testId("wrk");
    const logId = testId("log");
    await db.workout.create({
      data: {
        id: workoutId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Logged ride",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        durationMin: 90,
        status: "COMPLETED",
        feedback: {
          create: {
            id: logId,
            intakeCarbsG: 80,
            intakeItems: [{ productId: "prd_demo", servings: 2 }],
            fluidMl: 500,
            symptomUpper: "NONE",
            symptomLower: "MILD",
            symptomSystemic: "NONE",
            feeling: "steady",
            countsForPlan: true,
            ladderEligible: true,
          },
        },
      },
    });
    const response = await fetch(`${baseUrl}/workouts/${workoutId}/feedback`, {
      headers: { cookie },
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      log: { id: string; intakeCarbsG: number; symptomLower: string; ladderEligible: boolean };
    };
    assert.equal(body.log.id, logId);
    assert.equal(body.log.intakeCarbsG, 80);
    assert.equal(body.log.symptomLower, "MILD");
    assert.equal(body.log.ladderEligible, true);

    const bareId = testId("wrk");
    await db.workout.create({
      data: {
        id: bareId,
        userId,
        source: "MANUAL",
        sport: "RUNNING",
        name: "No log",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        status: "PLANNED",
      },
    });
    const empty = await fetch(`${baseUrl}/workouts/${bareId}/feedback`, { headers: { cookie } });
    assert.equal(empty.status, 200);
    assert.deepEqual(await empty.json(), { log: null });
  });
});
