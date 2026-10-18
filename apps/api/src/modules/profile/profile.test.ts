import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /me returns profile, physical data, and conflicts for the session", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    await db.physicalData.create({
      data: {
        userId,
        weightKg: 64.5,
        ftpW: 230,
        sweatRateLPerH: 1.2,
        sweatRateSource: "estimate",
        ghTolerance: 80,
        age: 34,
        sex: "female",
        heightCm: 170,
        hrZones: { z2: [120, 140] },
      },
    });
    await db.subscription.create({ data: { userId, status: "BETA_ALL_ACCESS" } });
    await db.physicalDataConflict.create({
      data: {
        id: testId("cfl"),
        userId,
        field: "ftp",
        manualValue: 220,
        syncedValue: 230,
        provider: "TRAININGPEAKS",
      },
    });

    const me = await fetch(`${baseUrl}/me`, { headers: { cookie } });
    assert.equal(me.status, 200);
    const meBody = (await me.json()) as {
      user: { id: string; timezone: string; mode: string };
      physical: { weightKg: number; ftpW: number; hrZones: { z2: number[] } };
      subscription: { status: string };
    };
    assert.equal(meBody.user.id, userId);
    assert.equal(meBody.user.timezone, "UTC");
    assert.equal(meBody.user.mode, "FUEL_MY_WORKOUTS");
    assert.equal(meBody.physical.weightKg, 64.5);
    assert.equal(meBody.physical.ftpW, 230);
    assert.deepEqual(meBody.physical.hrZones.z2, [120, 140]);
    assert.equal(meBody.subscription.status, "BETA_ALL_ACCESS");

    const physical = await fetch(`${baseUrl}/me/physical-data`, { headers: { cookie } });
    assert.equal(physical.status, 200);
    const physicalBody = (await physical.json()) as { physical: { ghTolerance: number } };
    assert.equal(physicalBody.physical.ghTolerance, 80);

    const conflicts = await fetch(`${baseUrl}/me/conflicts`, { headers: { cookie } });
    assert.equal(conflicts.status, 200);
    const conflictBody = (await conflicts.json()) as {
      conflicts: Array<{ field: string; provider: string; resolvedAt: null }>;
    };
    assert.equal(conflictBody.conflicts.length, 1);
    assert.equal(conflictBody.conflicts[0]?.field, "ftp");
    assert.equal(conflictBody.conflicts[0]?.provider, "TRAININGPEAKS");
    assert.equal(conflictBody.conflicts[0]?.resolvedAt, null);
  });
});
