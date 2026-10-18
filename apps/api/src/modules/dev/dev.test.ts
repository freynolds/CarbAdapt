import assert from "node:assert/strict";
import test from "node:test";
import { HttpErrorCode, httpErrorBody } from "@carbadapt/contracts";
import { getJson, testId, withApp, withAthlete } from "../../test/harness.js";

test("POST /dev/login-as sets a session cookie and GET /dev/athletes lists ids", async () => {
  await withAthlete(async ({ baseUrl, userId, cookie, token }) => {
    const me = await getJson(`${baseUrl}/me`, cookie);
    assert.equal(me.status, 200);
    const meBody = me.body as { user: { id: string } };
    assert.equal(meBody.user.id, userId);

    const bearer = await fetch(`${baseUrl}/me`, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(bearer.status, 200);

    const listed = await getJson(`${baseUrl}/dev/athletes`);
    assert.equal(listed.status, 200);
    const athletes = (listed.body as { athletes: Array<{ athleteId: string }> }).athletes;
    assert.ok(athletes.some((athlete) => athlete.athleteId === userId));

    const missing = await fetch(`${baseUrl}/dev/login-as`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ athleteId: "usr_missing" }),
    });
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), httpErrorBody(HttpErrorCode.AthleteNotFound));

    const unauthenticated = await getJson(`${baseUrl}/me`);
    assert.equal(unauthenticated.status, 401);
    assert.deepEqual(unauthenticated.body, httpErrorBody(HttpErrorCode.Unauthorized));
  });
});

test("POST /dev/login-as clears a deleted athlete", async () => {
  await withApp(async ({ baseUrl, db }) => {
    const userId = testId("usr");
    await db.user.create({
      data: {
        id: userId,
        email: `${userId}@test.carbadapt`,
        name: "Deleted",
        timezone: "UTC",
        deletedAt: new Date(),
      },
    });
    try {
      const login = await fetch(`${baseUrl}/dev/login-as`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ athleteId: userId }),
      });
      assert.equal(login.status, 200);
      const body = (await login.json()) as { user: { deletedAt: string | null } };
      assert.equal(body.user.deletedAt, null);
    } finally {
      await db.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
});

test("POST /dev/reset runs the seed", async () => {
  await withApp(async ({ baseUrl, db }) => {
    const response = await fetch(`${baseUrl}/dev/reset`, { method: "POST" });
    assert.equal(response.status, 200);
    const body = (await response.json()) as { ok: boolean; seededAt: string };
    assert.equal(body.ok, true);
    assert.match(body.seededAt, /^\d{4}-\d{2}-\d{2}T/);
    const ana = await db.user.findUnique({ where: { id: "usr_ana" } });
    assert.equal(ana?.name, "Ana");
    assert.ok((await db.foodItem.count()) > 0);
  });
});
