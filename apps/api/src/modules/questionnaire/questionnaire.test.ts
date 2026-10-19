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
    const bare = (await empty.json()) as {
      log: null;
      prefill: {
        carbsG: number | null;
        fluidMl: number | null;
        carbSource: string;
        fluidSource: string;
      };
    };
    assert.equal(bare.log, null);
    assert.equal(bare.prefill.carbsG, null);
    assert.equal(bare.prefill.fluidMl, null);
    assert.equal(bare.prefill.carbSource, "not_set");
    assert.equal(bare.prefill.fluidSource, "not_set");
  });
});

const jsonHeaders = (cookie: string) => ({
  "content-type": "application/json",
  cookie,
});

test("feedback prefill comes from the plan, else the working rate, else stays unset", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    await db.user.update({ where: { id: userId }, data: { mode: "GUT_TRAINING" } });
    await db.physicalData.create({ data: { userId, sweatRateLPerH: 1, weightKg: 64 } });
    const plan = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: jsonHeaders(cookie),
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: "2027-06-01",
        startGh: 60,
        goalGh: 80,
        sessionsPerWeek: 2,
      }),
    });
    assert.equal(plan.status, 200);

    const created = await fetch(`${baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(cookie),
      body: JSON.stringify({
        name: "Planned",
        sport: "CYCLING",
        plannedDate: "2026-11-02",
        durationMin: 180,
      }),
    });
    assert.equal(created.status, 201);
    const plannedId = ((await created.json()) as { workout: { id: string } }).workout.id;
    const planned = await fetch(`${baseUrl}/workouts/${plannedId}/feedback`, {
      headers: { cookie },
    });
    assert.equal(planned.status, 200);
    const plannedBody = (await planned.json()) as {
      prefill: {
        carbsG: number | null;
        fluidMl: number | null;
        carbSource: string;
        fluidSource: string;
      };
    };
    assert.equal(plannedBody.prefill.carbsG, 210);
    assert.equal(plannedBody.prefill.fluidMl, 3000);
    assert.equal(plannedBody.prefill.carbSource, "plan");
    assert.equal(plannedBody.prefill.fluidSource, "plan");

    const openId = testId("wrk");
    await db.workout.create({
      data: {
        id: openId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Unplanned",
        plannedDate: new Date("2026-11-03T00:00:00.000Z"),
        durationMin: 120,
        status: "COMPLETED",
      },
    });
    const open = await fetch(`${baseUrl}/workouts/${openId}/feedback`, { headers: { cookie } });
    const openBody = (await open.json()) as {
      prefill: {
        carbsG: number | null;
        fluidMl: number | null;
        carbSource: string;
        fluidSource: string;
      };
    };
    assert.equal(openBody.prefill.carbsG, 140);
    assert.equal(openBody.prefill.fluidMl, 2000);
    assert.equal(openBody.prefill.carbSource, "working_rate");
    assert.equal(openBody.prefill.fluidSource, "working_rate");
  });
});

test("a fuel-mode plan with unset totals does not prefill zero", async () => {
  await withAthlete(async ({ baseUrl, cookie }) => {
    const created = await fetch(`${baseUrl}/workouts`, {
      method: "POST",
      headers: jsonHeaders(cookie),
      body: JSON.stringify({
        name: "Fuel",
        sport: "CYCLING",
        plannedDate: "2026-11-02",
        durationMin: 120,
      }),
    });
    assert.equal(created.status, 201);
    const id = ((await created.json()) as { workout: { id: string } }).workout.id;
    const response = await fetch(`${baseUrl}/workouts/${id}/feedback`, { headers: { cookie } });
    const body = (await response.json()) as {
      prefill: {
        carbsG: number | null;
        fluidMl: number | null;
        carbSource: string;
        fluidSource: string;
      };
    };
    assert.equal(body.prefill.carbsG, null);
    assert.equal(body.prefill.fluidMl, null);
    assert.equal(body.prefill.carbSource, "not_set");
    assert.equal(body.prefill.fluidSource, "not_set");
  });
});

test("saving feedback twice updates the log and replays ladder advancement", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    await db.user.update({ where: { id: userId }, data: { mode: "GUT_TRAINING" } });
    const plan = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: jsonHeaders(cookie),
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: "2027-06-01",
        startGh: 60,
        goalGh: 80,
        sessionsPerWeek: 2,
      }),
    });
    assert.equal(plan.status, 200);
    const ids: string[] = [];
    for (const date of ["2026-11-02", "2026-11-04"]) {
      const workout = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: jsonHeaders(cookie),
        body: JSON.stringify({
          name: "Long",
          sport: "CYCLING",
          plannedDate: date,
          durationMin: 180,
        }),
      });
      const created = (await workout.json()) as { workout: { id: string } };
      ids.push(created.workout.id);
      const feedback = await fetch(`${baseUrl}/workouts/${created.workout.id}/feedback`, {
        method: "POST",
        headers: jsonHeaders(cookie),
        body: JSON.stringify({
          intakeCarbsG: 200,
          fluidMl: 1500,
          symptomUpper: "NONE",
          symptomLower: "NONE",
          symptomSystemic: "NONE",
          feeling: "q.steady",
          intakeTiming: { when: "as" },
        }),
      });
      assert.equal(feedback.status, 201);
    }
    const feelingOnly = await fetch(`${baseUrl}/workouts/${ids[1]}/feedback`, {
      method: "POST",
      headers: jsonHeaders(cookie),
      body: JSON.stringify({
        intakeCarbsG: 180,
        fluidMl: 1400,
        symptomUpper: "NONE",
        symptomLower: "NONE",
        symptomSystemic: "NONE",
        feeling: "q.strong",
        intakeTiming: { when: "late" },
      }),
    });
    assert.equal(feelingOnly.status, 200);
    const saved = (await feelingOnly.json()) as {
      log: { intakeCarbsG: number; feeling: string; intakeTiming: { when: string } };
    };
    assert.equal(saved.log.intakeCarbsG, 180);
    assert.equal(saved.log.feeling, "q.strong");
    assert.equal(saved.log.intakeTiming.when, "late");
    const stillAdvanced = await fetch(`${baseUrl}/gut-plan`, { headers: { cookie } });
    const advanced = (await stillAdvanced.json()) as {
      plan: { steps: { gh: number; status: string }[] };
    };
    assert.equal(advanced.plan.steps.find((step) => step.status === "CURRENT")?.gh, 80);

    const severe = await fetch(`${baseUrl}/workouts/${ids[0]}/feedback`, {
      method: "POST",
      headers: jsonHeaders(cookie),
      body: JSON.stringify({
        intakeCarbsG: 200,
        fluidMl: 1500,
        symptomUpper: "SEVERE",
        symptomLower: "SEVERE",
        symptomSystemic: "SEVERE",
        feeling: "q.veryHard",
        intakeTiming: { when: "skip" },
      }),
    });
    assert.equal(severe.status, 200);
    const after = await fetch(`${baseUrl}/gut-plan`, { headers: { cookie } });
    const body = (await after.json()) as { plan: { steps: { gh: number; status: string }[] } };
    assert.equal(body.plan.steps.find((step) => step.status === "CURRENT")?.gh, 70);
    const reread = await fetch(`${baseUrl}/workouts/${ids[0]}/feedback`, { headers: { cookie } });
    const log = (await reread.json()) as { log: { feeling: string; symptomUpper: string } };
    assert.equal(log.log.feeling, "q.veryHard");
    assert.equal(log.log.symptomUpper, "SEVERE");
  });
});
