import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /races includes stages and GET /races/stages/:id/recovery returns the plan", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const raceId = testId("race");
    const stageId = testId("stg");
    await db.race.create({
      data: {
        id: raceId,
        userId,
        name: "Test stage race",
        date: new Date("2026-11-02T00:00:00.000Z"),
        startAt: new Date("2026-11-02T10:00:00.000Z"),
        estimatedDurationMin: 300,
        type: "trail_stage",
        distanceKm: 40,
        carbLoading: "TWO_DAY",
        isMultiStage: true,
        stages: {
          create: {
            id: stageId,
            index: 1,
            date: new Date("2026-11-02T00:00:00.000Z"),
            startAt: new Date("2026-11-02T10:00:00.000Z"),
            estimatedDurationMin: 180,
            type: "trail_stage",
            distanceKm: 40,
            aidStations: {
              create: { id: testId("aid"), kmMark: 15, hasWater: true },
            },
            recovery: {
              create: {
                id: testId("rcv"),
                gapCase: "UNDER_4H",
                gapMin: 75,
                carbsTargetG: 80,
                proteinTargetG: 20,
                fluidTargetMl: 500,
                sodiumTargetMg: 400,
                meals: [{ name: "rice" }],
                engineVersion: "fixture",
              },
            },
          },
        },
      },
    });

    const list = await fetch(`${baseUrl}/races`, { headers: { cookie } });
    assert.equal(list.status, 200);
    const listed = (await list.json()) as {
      races: Array<{ id: string; stages: Array<{ id: string }> }>;
    };
    assert.equal(listed.races[0]?.id, raceId);
    assert.equal(listed.races[0]?.stages[0]?.id, stageId);

    const one = await fetch(`${baseUrl}/races/${raceId}`, { headers: { cookie } });
    const detail = (await one.json()) as {
      race: {
        stages: Array<{ recovery: { carbsTargetG: number } | null; aidStations: unknown[] }>;
      };
    };
    assert.equal(detail.race.stages[0]?.recovery?.carbsTargetG, 80);
    assert.equal(detail.race.stages[0]?.aidStations.length, 1);

    const recovery = await fetch(`${baseUrl}/races/stages/${stageId}/recovery`, {
      headers: { cookie },
    });
    assert.equal(recovery.status, 200);
    const recoveryBody = (await recovery.json()) as {
      recovery: { gapCase: string; gapMin: number };
    };
    assert.equal(recoveryBody.recovery.gapCase, "UNDER_4H");
    assert.equal(recoveryBody.recovery.gapMin, 75);

    const missing = await fetch(`${baseUrl}/races/stages/stg_missing/recovery`, {
      headers: { cookie },
    });
    assert.equal(missing.status, 404);
  });
});
