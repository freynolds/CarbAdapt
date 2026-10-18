import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANA_RACE_OFFSET,
  buildSeed,
  fixtureFuelingGh,
  FOODS,
  loadingTargetG,
  makeClock,
  perKgCarbs,
  rateCarbs,
  splitMeals,
  sweatRateLPerH,
  tooFastPreview,
  WEIGHT,
} from "./index.js";

const NOW = new Date("2026-10-18T15:00:00.000Z");

describe("fixture clock and domain rules", () => {
  it("uses the Buenos Aires calendar date", () => {
    const clock = makeClock(NOW);
    assert.equal(clock.today.toISOString().slice(0, 10), "2026-10-18");
    assert.equal(clock.nextWeekday(1), 1);
    assert.equal(clock.at(0, 8, 0).toISOString(), "2026-10-18T11:00:00.000Z");
  });

  it("computes sweat rate from the documented formula", () => {
    assert.equal(
      sweatRateLPerH({
        preWeightKg: 64,
        postWeightKg: 63.4,
        fluidMl: 300,
        urineMl: 0,
        durationMin: 60,
      }),
      0.9,
    );
  });

  it("rounds loading targets to 10 g and meal splits sum to the total", () => {
    assert.equal(loadingTargetG(10, WEIGHT.ana), 640);
    const meals = splitMeals(640);
    assert.equal(
      meals.reduce((sum, meal) => sum + meal.carbsG, 0),
      640,
    );
  });

  it("flags only the documented 60 to 120 g/h preview", () => {
    const today = makeClock(NOW).today;
    const soon = makeClock(NOW).day(14);
    const flagged = tooFastPreview({ startGh: 60, goalGh: 120, today, targetDate: soon });
    assert.equal(flagged.tooFast, true);
    assert.equal(flagged.suggestedLaterDate, "2026-11-22");
    assert.equal(flagged.suggestedGoalGh, null);
    const other = tooFastPreview({ startGh: 60, goalGh: 90, today, targetDate: soon });
    assert.equal(other.tooFast, false);
  });
});

describe("Ana", () => {
  const seed = buildSeed(NOW);

  it("is the only demo athlete, in gut training", () => {
    assert.deepEqual(
      seed.users.map((row) => row.name),
      ["Ana"],
    );
    assert.equal(seed.users[0]?.mode, "GUT_TRAINING");
    assert.equal(seed.users[0]?.id, "usr_ana");
  });

  it("builds the in-progress ladder, celebration, and duplicate ride", () => {
    const steps = seed.steps
      .filter((row) => row.planId === "gut_ana")
      .sort((a, b) => Number(a.index) - Number(b.index));
    assert.deepEqual(
      steps.map((row) => row.status),
      ["DONE", "DONE", "CURRENT", "UPCOMING"],
    );
    assert.deepEqual(
      steps.map((row) => row.gh),
      [60, 70, 80, 90],
    );
    const plan = seed.gutPlans.find((row) => row.id === "gut_ana");
    assert.equal(plan?.startGh, 60);
    assert.equal(plan?.goalGh, 90);
    assert.equal(plan?.status, "ACTIVE");
    assert.equal(plan?.engineVersion, "fixture");
    const pending = seed.achievements.filter(
      (row) => row.userId === "usr_ana" && row.celebratedAt == null,
    );
    assert.equal(pending.length, 1);
    assert.equal(pending[0]?.valueGh, 80);
    const dupes = seed.activities.filter((row) => row.workoutId === "wrk_ana_dup");
    assert.equal(dupes.length, 1);
    assert.equal(dupes[0]?.dedupeGroup, "grp_ana_dup");
    const today = seed.fuelingPlans.find((row) => row.workoutId === "wrk_ana_today");
    assert.equal(today?.targetGPerH, 80);
    assert.equal(today?.engineVersion, "fixture");
    const moved = seed.sweatTests.find((row) => row.id === "swt_ana_moved");
    assert.equal(moved?.status, "RESCHEDULED");
    assert.deepEqual(moved?.movedFrom, seed.clock.day(ANA_RACE_OFFSET - 1));
    assert.deepEqual(seed.rehearsals.map((row) => row.status).sort(), ["DISMISSED", "SUGGESTED"]);
    const short = seed.logs.find((row) => row.workoutId === "wrk_ana_short");
    assert.equal(short?.ladderEligible, false);
    const late = seed.logs.find((row) => row.workoutId === "wrk_ana_late");
    assert.equal(late?.countsForPlan, false);
    assert.equal(seed.connections.filter((row) => row.status === "CONNECTED").length, 2);
  });

  it("stores the USDA sample and tags computed rows as fixtures", () => {
    assert.equal(new Set(FOODS.map((food) => food.fdcId)).size, FOODS.length);
    assert.equal(FOODS.find((food) => food.fdcId === 168878)?.carbsPer100g, 28.17);
    assert.equal(
      seed.fuelingPlans.every((row) => row.engineVersion === "fixture"),
      true,
    );
    assert.equal(
      seed.gutPlans.every((row) => row.engineVersion === "fixture"),
      true,
    );
    assert.equal(loadingTargetG(10, WEIGHT.ana), 640);
    assert.equal(fixtureFuelingGh(45), 60);
    assert.equal(fixtureFuelingGh(180), 90);
    assert.equal(perKgCarbs(10, WEIGHT.ana), 640);
    assert.equal(rateCarbs(1, WEIGHT.ana, 60), 64);
  });
});
