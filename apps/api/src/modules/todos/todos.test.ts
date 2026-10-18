import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /todos sorts by tier and filters status", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    await db.todoItem.createMany({
      data: [
        { id: testId("tdo"), userId, type: "ADD_BOTTLE", tier: "LOWER", status: "OPEN" },
        { id: testId("tdo"), userId, type: "DATA_CONFLICT", tier: "HIGHEST", status: "OPEN" },
        { id: testId("tdo"), userId, type: "SWEAT_TEST", tier: "CALIBRATION", status: "DONE" },
      ],
    });
    const open = await fetch(`${baseUrl}/todos?status=OPEN`, { headers: { cookie } });
    assert.equal(open.status, 200);
    const openBody = (await open.json()) as { todos: Array<{ type: string; tier: string }> };
    assert.deepEqual(
      openBody.todos.map((item) => item.tier),
      ["HIGHEST", "LOWER"],
    );
    assert.equal(openBody.todos[0]?.type, "DATA_CONFLICT");

    const all = await fetch(`${baseUrl}/todos`, { headers: { cookie } });
    const allBody = (await all.json()) as { todos: unknown[] };
    assert.equal(allBody.todos.length, 3);
  });
});
