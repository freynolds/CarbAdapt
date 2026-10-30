import assert from "node:assert/strict";
import test from "node:test";
import { calendarDate } from "../../http/calendar.js";
import { testId, withAthlete } from "../../test/harness.js";

test("GET /home composes the hero, sweat test, to-dos, and counts", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const heroId = testId("wrk");
    const laterId = testId("wrk");
    await db.workout.create({
      data: {
        id: heroId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Hero ride",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        plannedStart: new Date(`${today}T12:00:00.000Z`),
        durationMin: 90,
        status: "PLANNED",
        fuelingPlans: {
          create: {
            id: testId("flp"),
            engineVersion: "fixture",
            totalCarbsG: 60,
            totalFluidMl: 400,
            totalSodiumMg: 200,
            schedule: [],
            carryList: {},
            isCurrent: true,
          },
        },
      },
    });
    await db.workout.create({
      data: {
        id: laterId,
        userId,
        source: "MANUAL",
        sport: "CYCLING",
        name: "Later ride",
        plannedDate: new Date(`${today}T00:00:00.000Z`),
        plannedStart: new Date(`${today}T16:00:00.000Z`),
        durationMin: 180,
        status: "PLANNED",
      },
    });
    const sweatId = testId("swt");
    await db.sweatTest.create({
      data: {
        id: sweatId,
        userId,
        status: "SCHEDULED",
        scheduledFor: new Date(`${today}T00:00:00.000Z`),
      },
    });
    await db.todoItem.create({
      data: { id: testId("tdo"), userId, type: "ADD_RACE", tier: "LOWER", status: "OPEN" },
    });
    await db.product.create({
      data: { id: testId("prd"), userId, type: "GEL", name: "Home gel", carbsG: 22 },
    });
    await db.container.create({
      data: { id: testId("cnt"), userId, type: "BOTTLE", name: "Home bottle", capacityMl: 750 },
    });
    await db.race.create({
      data: {
        id: testId("race"),
        userId,
        name: "Future race",
        date: new Date("2027-01-01T00:00:00.000Z"),
        estimatedDurationMin: 120,
        type: "road_race",
      },
    });

    const response = await fetch(`${baseUrl}/home`, { headers: { cookie } });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      hero: { id: string } | null;
      sweatTest: { id: string } | null;
      todos: Array<{ type: string }>;
      counts: { openTodos: number; products: number; containers: number; upcomingRaces: number };
    };
    assert.equal(body.hero?.id, heroId);
    assert.equal(body.sweatTest?.id, sweatId);
    assert.equal(body.todos[0]?.type, "ADD_RACE");
    assert.deepEqual(body.counts, { openTodos: 1, products: 1, containers: 1, upcomingRaces: 1 });
  });
});

test("a sweat test more than a week away is not called due", async () => {
  await withAthlete(async ({ baseUrl, db, userId, cookie }) => {
    const today = calendarDate(new Date(), "UTC");
    const soon = shiftDay(today, 7);
    const later = shiftDay(today, 40);
    const soonId = testId("swt");
    const laterId = testId("swt");
    await db.sweatTest.create({
      data: {
        id: laterId,
        userId,
        status: "RESCHEDULED",
        scheduledFor: new Date(`${later}T00:00:00.000Z`),
      },
    });
    await db.sweatTest.create({
      data: {
        id: soonId,
        userId,
        status: "SCHEDULED",
        scheduledFor: new Date(`${soon}T00:00:00.000Z`),
      },
    });
    await db.todoItem.create({
      data: {
        id: testId("tdo"),
        userId,
        type: "SWEAT_TEST",
        tier: "CALIBRATION",
        status: "OPEN",
        refType: "SweatTest",
        refId: laterId,
      },
    });
    await db.todoItem.create({
      data: {
        id: testId("tdo"),
        userId,
        type: "SWEAT_TEST",
        tier: "CALIBRATION",
        status: "OPEN",
        refType: "SweatTest",
        refId: soonId,
      },
    });
    const response = await fetch(`${baseUrl}/home`, { headers: { cookie } });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      sweatTest: { id: string } | null;
      todos: { refId: string | null }[];
    };
    assert.equal(body.sweatTest?.id, soonId);
    assert.equal(
      body.todos.some((todo) => todo.refId === laterId),
      false,
    );
    assert.equal(
      body.todos.some((todo) => todo.refId === soonId),
      true,
    );
  });
});

function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
