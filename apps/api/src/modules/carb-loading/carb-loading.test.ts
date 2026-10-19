import assert from "node:assert/strict";
import test from "node:test";
import {
  BreakfastNote,
  HttpErrorCode,
  httpErrorBody,
} from "@carbadapt/contracts";
import { testId, withAthlete } from "../../test/harness.js";

test("GET loading day and breakfast read the race for the signed-in athlete", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    await db.physicalData.create({ data: { userId, weightKg: 64 } });
    const raceId = testId("race");
    await db.race.create({
      data: {
        id: raceId,
        userId,
        name: "Early start",
        date: new Date("2026-11-02T00:00:00.000Z"),
        startAt: new Date("2026-11-02T07:00:00.000Z"),
        estimatedDurationMin: 240,
        type: "gran_fondo",
        carbLoading: "TWO_DAY",
        loadingDays: {
          create: {
            id: testId("lod"),
            day: "D_MINUS_2",
            date: new Date("2026-10-31T00:00:00.000Z"),
            gPerKg: 10,
            targetCarbsG: 640,
            meals: [{ key: "lunch", carbsG: 173 }],
          },
        },
      },
    });

    const loading = await fetch(`${baseUrl}/races/${raceId}/loading/d-2`, { headers: { cookie } });
    assert.equal(loading.status, 200);
    const loadingBody = (await loading.json()) as {
      loadingDay: { day: string; targetCarbsG: number; gPerKg: number };
    };
    assert.equal(loadingBody.loadingDay.day, "D_MINUS_2");
    assert.equal(loadingBody.loadingDay.targetCarbsG, 640);
    assert.equal(loadingBody.loadingDay.gPerKg, 10);

    const breakfast = await fetch(`${baseUrl}/races/${raceId}/breakfast`, { headers: { cookie } });
    assert.equal(breakfast.status, 200);
    const breakfastBody = (await breakfast.json()) as {
      engineVersion: string;
      note: string;
      earlyStart: boolean;
      gPerKg: number;
      carbsG: number;
      fluidMl: number;
      sodiumMg: number;
      derived: boolean;
    };
    assert.equal(breakfastBody.engineVersion, "2026.10.19");
    assert.equal(breakfastBody.note, BreakfastNote.Standard);
    assert.equal(breakfastBody.earlyStart, null);
    assert.equal(breakfastBody.gPerKg, 2);
    assert.equal(breakfastBody.carbsG, 128);
    assert.equal(breakfastBody.fluidMl, null);
    assert.equal(breakfastBody.sodiumMg, null);
    assert.equal(breakfastBody.derived, true);

    const missing = await fetch(`${baseUrl}/races/${raceId}/loading/d-1`, { headers: { cookie } });
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), httpErrorBody(HttpErrorCode.LoadingDayNotFound));
  });
});
