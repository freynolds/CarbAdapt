import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /gut-plan returns the active plan and its ladder", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const planId = testId("gut");
    await db.gutTrainingPlan.create({
      data: {
        id: planId,
        userId,
        targetKind: "DATE",
        targetDate: new Date("2026-12-01T00:00:00.000Z"),
        startGh: 60,
        goalGh: 130,
        status: "ACTIVE",
        engineVersion: "fixture",
        steps: {
          create: [
            { id: testId("stp"), index: 1, gh: 90, status: "UPCOMING" },
            { id: testId("stp"), index: 0, gh: 60, status: "CURRENT" },
          ],
        },
        decisions: {
          create: {
            id: testId("adp"),
            outcome: "HOLD",
            fromGh: 60,
            toGh: 60,
            inputLogIds: [],
            engineVersion: "fixture",
          },
        },
      },
    });
    await db.gutTrainingPlan.create({
      data: {
        id: testId("gut"),
        userId,
        targetKind: "DATE",
        targetDate: new Date("2026-06-01T00:00:00.000Z"),
        startGh: 40,
        goalGh: 80,
        status: "COMPLETED",
        engineVersion: "fixture",
      },
    });

    const response = await fetch(`${baseUrl}/gut-plan`, { headers: { cookie } });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      plan: {
        id: string;
        warningAbove120: boolean;
        steps: Array<{ index: number; gh: number }>;
        decisions: Array<{ outcome: string }>;
      };
    };
    assert.equal(body.plan.id, planId);
    assert.equal(body.plan.warningAbove120, true);
    assert.deepEqual(
      body.plan.steps.map((step) => step.index),
      [0, 1],
    );
    assert.equal(body.plan.steps[0]?.gh, 60);
    assert.equal(body.plan.decisions[0]?.outcome, "HOLD");
  });
});
