import assert from "node:assert/strict";
import test from "node:test";
import { calendarDate } from "../../http/calendar.js";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /sweat-tests returns the athlete's tests", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const id = testId("swt");
    await db.sweatTest.create({
      data: {
        id,
        userId,
        status: "COMPLETED",
        scheduledFor: new Date(`${today}T00:00:00.000Z`),
        preWeightKg: 64,
        postWeightKg: 63.4,
        fluidMl: 300,
        urineMl: 0,
        sweatRateLPerH: 0.9,
      },
    });
    const list = await fetch(`${baseUrl}/sweat-tests`, { headers: { cookie } });
    assert.equal(list.status, 200);
    const body = (await list.json()) as {
      sweatTests: Array<{ id: string; preWeightKg: number; formula: string }>;
    };
    assert.equal(body.sweatTests.length, 1);
    assert.equal(body.sweatTests[0]?.id, id);
    assert.equal(body.sweatTests[0]?.preWeightKg, 64);
    assert.match(body.sweatTests[0]?.formula ?? "", /divided by hours/);

    const one = await fetch(`${baseUrl}/sweat-tests/${id}`, { headers: { cookie } });
    assert.equal(one.status, 200);
    const missing = await fetch(`${baseUrl}/sweat-tests/swt_missing`, { headers: { cookie } });
    assert.equal(missing.status, 404);
  });
});
