import assert from "node:assert/strict";
import test from "node:test";
import { HttpErrorCode } from "@carbadapt/contracts";
import { ENGINE_VERSION } from "@carbadapt/engine";
import { testId, withApp, withAthlete } from "../../test/harness.js";

const auth = (token: string) => ({
  "content-type": "application/json",
  authorization: `Bearer ${token}`,
});

async function json(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

test("magic link signs in and dev login still works", async () => {
  await withApp(async ({ baseUrl, db }) => {
    const email = `${testId("magic")}@test.carbadapt`;
    const sent = await fetch(`${baseUrl}/auth/magic-link`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    assert.equal(sent.status, 200);
    const links = await fetch(`${baseUrl}/dev/magic-links`);
    assert.equal(links.status, 200);
    const list = (await links.json()) as { links: { email: string; url: string }[] };
    const match = list.links.find((item) => item.email === email);
    assert.ok(match);
    const token = new URL(match.url).searchParams.get("token");
    assert.ok(token);
    const verified = await fetch(`${baseUrl}/auth/magic-link/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, timezone: "America/New_York" }),
    });
    assert.equal(verified.status, 200);
    const session = (await verified.json()) as {
      token: string;
      user: { id: string; email: string };
    };
    assert.equal(session.user.email, email);
    assert.ok(verified.headers.get("set-cookie")?.includes("carbadapt_session="));
    const me = await fetch(`${baseUrl}/me`, {
      headers: { authorization: `Bearer ${session.token}` },
    });
    assert.equal(me.status, 200);
    await db.magicLinkToken.deleteMany({ where: { email } });
    await db.user.delete({ where: { id: session.user.id } });
  });
});

test("a manual workout stores a fueling plan from the engine", async () => {
  await withAthlete(async ({ baseUrl, token }) => {
    const created = await fetch(`${baseUrl}/workouts`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({
        name: "Base",
        sport: "CYCLING",
        workoutType: "BASE",
        plannedDate: "2026-11-02",
        durationMin: 180,
      }),
    });
    assert.equal(created.status, 201);
    const body = (await created.json()) as {
      workout: {
        fuelingPlan: {
          engineVersion: string;
          targetGPerH: number | null;
          carryList: { carbStatus?: string };
        } | null;
      };
    };
    assert.equal(body.workout.fuelingPlan?.engineVersion, ENGINE_VERSION);
    assert.equal(body.workout.fuelingPlan?.targetGPerH, null);
    assert.equal(body.workout.fuelingPlan?.carryList.carbStatus, "not_set");
  });
});

test("a two-stage race stores recovery and one stage notification", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    await db.physicalData.create({ data: { userId, weightKg: 70 } });
    const created = await fetch(`${baseUrl}/races`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({
        name: "Two stages",
        date: "2026-11-08",
        estimatedDurationMin: 180,
        type: "trail",
        isMultiStage: true,
        stages: [
          {
            date: "2026-11-08",
            startAt: "2026-11-08T07:00:00.000Z",
            estimatedDurationMin: 180,
            type: "trail",
          },
          {
            date: "2026-11-08",
            startAt: "2026-11-08T15:00:00.000Z",
            estimatedDurationMin: 120,
            type: "trail",
          },
        ],
      }),
    });
    assert.equal(created.status, 201);
    const body = (await created.json()) as {
      race: { stages: { recovery: { engineVersion: string; gapCase: string } | null }[] };
    };
    assert.equal(body.race.stages[0]?.recovery?.engineVersion, ENGINE_VERSION);
    assert.equal(body.race.stages[0]?.recovery?.gapCase, "H4_TO_12H");
    assert.equal(body.race.stages[1]?.recovery, null);
    const notes = await db.notification.findMany({ where: { userId, type: "STAGE_COMPLETE" } });
    assert.equal(notes.length, 1);
  });
});

test("two symptom-free sessions advance the ladder", async () => {
  await withAthlete(async ({ baseUrl, token }) => {
    const plan = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: "2027-06-01",
        startGh: 60,
        goalGh: 80,
        sessionsPerWeek: 2,
      }),
    });
    assert.equal(plan.status, 200);
    for (const date of ["2026-11-02", "2026-11-04"]) {
      const workout = await fetch(`${baseUrl}/workouts`, {
        method: "POST",
        headers: auth(token),
        body: JSON.stringify({
          name: "Long",
          sport: "CYCLING",
          workoutType: "BASE",
          plannedDate: date,
          durationMin: 180,
        }),
      });
      const created = (await workout.json()) as { workout: { id: string } };
      const feedback = await fetch(`${baseUrl}/workouts/${created.workout.id}/feedback`, {
        method: "POST",
        headers: auth(token),
        body: JSON.stringify({
          symptomUpper: "NONE",
          symptomLower: "NONE",
          symptomSystemic: "NONE",
        }),
      });
      assert.equal(feedback.status, 201);
    }
    const after = await fetch(`${baseUrl}/gut-plan`, { headers: auth(token) });
    const body = (await after.json()) as { plan: { steps: { gh: number; status: string }[] } };
    const current = body.plan.steps.find((step) => step.status === "CURRENT");
    const done = body.plan.steps.find((step) => step.status === "DONE");
    assert.equal(done?.gh, 70);
    assert.equal(current?.gh, 80);
  });
});

test("a goal above 200 is rejected", async () => {
  await withAthlete(async ({ baseUrl, token }) => {
    const response = await fetch(`${baseUrl}/gut-plan`, {
      method: "PUT",
      headers: auth(token),
      body: JSON.stringify({
        targetKind: "DATE",
        targetDate: "2027-06-01",
        startGh: 60,
        goalGh: 201,
      }),
    });
    assert.equal(response.status, 400);
    assert.equal((await json(response)).error, HttpErrorCode.GoalAboveMax);
  });
});

test("sweat test completion writes the rate", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const created = await fetch(`${baseUrl}/sweat-tests`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ scheduledFor: "2026-11-03" }),
    });
    assert.equal(created.status, 201);
    const testRow = (await created.json()) as { sweatTest: { id: string } };
    const started = await fetch(`${baseUrl}/sweat-tests/${testRow.sweatTest.id}/start`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ preWeightKg: 70 }),
    });
    assert.equal(started.status, 200);
    await db.sweatTest.update({
      where: { id: testRow.sweatTest.id },
      data: { startedAt: new Date(Date.now() - 60 * 60 * 1000) },
    });
    const done = await fetch(`${baseUrl}/sweat-tests/${testRow.sweatTest.id}/complete`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ postWeightKg: 69, fluidMl: 500, urineMl: 0 }),
    });
    assert.equal(done.status, 200);
    const body = (await done.json()) as { sweatTest: { sweatRateLPerH: number | null } };
    assert.ok(body.sweatTest.sweatRateLPerH != null);
    assert.ok(Math.abs(body.sweatTest.sweatRateLPerH - 1.5) < 0.05);
    const physical = await db.physicalData.findUnique({ where: { userId } });
    assert.equal(physical?.sweatRateSource, "sweat_test");
  });
});

test("a product used by a plan needs a replacement", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const first = await fetch(`${baseUrl}/products`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ type: "GEL", name: "Gel A", carbsG: 25 }),
    });
    const second = await fetch(`${baseUrl}/products`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ type: "GEL", name: "Gel B", carbsG: 30 }),
    });
    const productA = (await first.json()) as { product: { id: string } };
    const productB = (await second.json()) as { product: { id: string } };
    const workout = await db.workout.create({
      data: {
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Uses gel",
        plannedDate: new Date("2026-11-02T00:00:00.000Z"),
        durationMin: 120,
      },
    });
    await db.fuelingPlan.create({
      data: {
        workoutId: workout.id,
        engineVersion: ENGINE_VERSION,
        totalCarbsG: 25,
        totalFluidMl: 0,
        totalSodiumMg: 0,
        schedule: [],
        carryList: { items: [{ productId: productA.product.id }] },
      },
    });
    const blocked = await fetch(`${baseUrl}/products/${productA.product.id}`, {
      method: "DELETE",
      headers: auth(token),
      body: JSON.stringify({}),
    });
    assert.equal(blocked.status, 409);
    assert.equal((await json(blocked)).error, HttpErrorCode.ProductInUse);
    const replaced = await fetch(`${baseUrl}/products/${productA.product.id}`, {
      method: "DELETE",
      headers: auth(token),
      body: JSON.stringify({ replacementId: productB.product.id }),
    });
    assert.equal(replaced.status, 200);
  });
});

test("garmin connect is disabled until the flag is on", async () => {
  await withAthlete(async ({ baseUrl, token }) => {
    const response = await fetch(`${baseUrl}/connections/GARMIN`, {
      method: "POST",
      headers: auth(token),
    });
    assert.equal(response.status, 403);
    assert.equal((await json(response)).error, HttpErrorCode.ProviderDisabled);
  });
});

test("a webhook job completes the workout and a later tick delivers the push", async () => {
  await withAthlete(async ({ baseUrl, token, db, userId }) => {
    const connected = await fetch(`${baseUrl}/connections/STRAVA`, {
      method: "POST",
      headers: auth(token),
    });
    assert.equal(connected.status, 200);
    const workout = await fetch(`${baseUrl}/workouts`, {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({
        name: "Imported",
        sport: "CYCLING",
        plannedDate: "2026-11-02",
        durationMin: 90,
      }),
    });
    const created = (await workout.json()) as { workout: { id: string } };
    const hook = await fetch(`${baseUrl}/webhooks/strava`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        externalId: testId("act"),
        eventType: "create",
        ownerId: "mock-strava",
        workoutId: created.workout.id,
        startAt: "2026-11-02T08:00:00.000Z",
        durationMin: 90,
      }),
    });
    assert.equal(hook.status, 200);
    const first = await fetch(`${baseUrl}/dev/jobs/tick`, { method: "POST" });
    assert.equal(first.status, 200);
    const completed = await db.workout.findUnique({ where: { id: created.workout.id } });
    assert.equal(completed?.status, "COMPLETED");
    const second = await fetch(`${baseUrl}/dev/jobs/tick`, { method: "POST" });
    assert.equal(second.status, 200);
    const note = await db.notification.findFirst({
      where: { userId, dedupeKey: `POST_WORKOUT:${created.workout.id}` },
    });
    assert.equal(note?.status, "SENT");
  });
});
