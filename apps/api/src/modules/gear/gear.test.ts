import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /containers returns bottles and their calibrations", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const id = testId("cnt");
    await db.container.create({
      data: {
        id,
        userId,
        type: "BOTTLE",
        name: "White bottle",
        colorHex: "#F4F1EA",
        capacityMl: 750,
        usualContent: "WATER",
        calibrations: {
          create: {
            id: testId("cal"),
            weightsG: [750, 725, 700, 675],
            mlPerSip: 25,
            validationsLeft: 4,
          },
        },
      },
    });
    const list = await fetch(`${baseUrl}/containers`, { headers: { cookie } });
    assert.equal(list.status, 200);
    const body = (await list.json()) as {
      containers: Array<{
        id: string;
        capacityMl: number;
        calibrations: Array<{ mlPerSip: number }>;
      }>;
    };
    assert.equal(body.containers.length, 1);
    assert.equal(body.containers[0]?.id, id);
    assert.equal(body.containers[0]?.capacityMl, 750);
    assert.equal(body.containers[0]?.calibrations[0]?.mlPerSip, 25);

    const one = await fetch(`${baseUrl}/containers/${id}`, { headers: { cookie } });
    assert.equal(one.status, 200);
    const missing = await fetch(`${baseUrl}/containers/cnt_missing`, { headers: { cookie } });
    assert.equal(missing.status, 404);
  });
});
