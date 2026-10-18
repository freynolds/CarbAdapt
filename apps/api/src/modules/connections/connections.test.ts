import assert from "node:assert/strict";
import test from "node:test";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /connections always lists Garmin, TrainingPeaks, and Strava without tokens", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    await db.providerConnection.create({
      data: {
        id: testId("con"),
        userId,
        provider: "STRAVA",
        externalUserId: "strava_test",
        accessTokenEnc: "fixture-not-a-real-token",
        status: "CONNECTED",
        scopes: "activity:read",
      },
    });
    const response = await fetch(`${baseUrl}/connections`, { headers: { cookie } });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      connections: Array<{ provider: string; status: string; externalUserId: string | null }>;
    };
    assert.deepEqual(
      body.connections.map((item) => item.provider),
      ["GARMIN", "TRAININGPEAKS", "STRAVA"],
    );
    const strava = body.connections.find((item) => item.provider === "STRAVA");
    assert.equal(strava?.status, "CONNECTED");
    assert.equal(strava?.externalUserId, "strava_test");
    assert.equal(JSON.stringify(body).includes("fixture-not-a-real-token"), false);
    assert.equal(
      body.connections.find((item) => item.provider === "GARMIN")?.status,
      "DISCONNECTED",
    );
  });
});
