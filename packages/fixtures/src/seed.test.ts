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

  it("is a gut-training road cyclist", () => {
    assert.deepEqual(
      seed.users.map((row) => row.name),
      ["Ana", "Bruno", "Carla", "Eli", "Dani"],
    );
    const ana = seed.users.find((row) => row.id === "usr_ana");
    assert.equal(ana?.mode, "GUT_TRAINING");
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
    assert.equal(
      seed.connections.filter((row) => row.userId === "usr_ana" && row.status === "CONNECTED")
        .length,
      2,
    );
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
    assert.equal(
      seed.recoveries.every((row) => row.engineVersion === "fixture"),
      true,
    );
  });
});

describe("Bruno", () => {
  const seed = buildSeed(NOW);

  it("has a completed ladder and the trail overnight bands", () => {
    const bruno = seed.users.find((row) => row.id === "usr_bruno");
    assert.equal(bruno?.mode, "GUT_TRAINING");
    const plan = seed.gutPlans.find((row) => row.id === "gut_bruno");
    assert.equal(plan?.status, "COMPLETED");
    assert.equal(plan?.startGh, 80);
    assert.equal(plan?.goalGh, 100);
    assert.equal(plan?.engineVersion, "fixture");
    const steps = seed.steps.filter((row) => row.planId === "gut_bruno");
    assert.equal(
      steps.every((row) => row.status === "DONE"),
      true,
    );
    assert.deepEqual(
      steps.map((row) => row.gh).sort((a, b) => Number(a) - Number(b)),
      [80, 90, 100],
    );
    const date90 = seed.steps.find((row) => row.id === "stp_bruno_1")?.approxDate;
    const date100 = seed.steps.find((row) => row.id === "stp_bruno_2")?.approxDate;
    assert.ok(date90 instanceof Date && date100 instanceof Date);
    assert.ok((date100.getTime() - date90.getTime()) / 86_400_000 >= 7);
    assert.equal(
      seed.recoveries.find((row) => row.id === "rec_bruno_1")?.carbsTargetG,
      perKgCarbs(6, WEIGHT.bruno),
    );
    assert.equal(
      seed.recoveries.find((row) => row.id === "rec_bruno_2")?.carbsTargetG,
      perKgCarbs(7, WEIGHT.bruno),
    );
    assert.equal(
      seed.logs.find((row) => row.workoutId === "wrk_bruno_short")?.ladderEligible,
      false,
    );
    assert.equal(seed.logs.find((row) => row.workoutId === "wrk_bruno_80a")?.ladderEligible, true);
    assert.equal(seed.strategies.filter((row) => row.raceId === "race_bruno").length, 1);
    assert.equal(seed.sweatTests.find((row) => row.id === "swt_bruno")?.status, "COMPLETED");
    assert.equal(seed.stages.filter((row) => row.raceId === "race_bruno").length, 4);
  });
});

describe("Carla", () => {
  const seed = buildSeed(NOW);

  it("covers seven stages and every gap case", () => {
    const carla = seed.users.find((row) => row.id === "usr_carla");
    assert.equal(carla?.mode, "FUEL_MY_WORKOUTS");
    const stages = seed.stages.filter((row) => row.raceId === "race_carla");
    assert.equal(stages.length, 7);
    const recoveries = seed.recoveries.filter((row) => String(row.stageId).startsWith("stg_carla"));
    assert.equal(recoveries.length, 6);
    assert.equal(
      seed.recoveries.find((row) => row.stageId === "stg_carla_7"),
      undefined,
    );
    assert.deepEqual(
      new Set(recoveries.map((row) => row.gapCase)),
      new Set(["UNDER_4H", "H4_TO_12H", "OVERNIGHT", "REST_DAY"]),
    );
    assert.equal(
      seed.recoveries.find((row) => row.id === "rec_carla_1")?.carbsTargetG,
      rateCarbs(1, WEIGHT.carla, 45),
    );
    assert.equal(seed.recoveries.find((row) => row.id === "rec_carla_3")?.sensitiveStomach, true);
    assert.equal(
      seed.recoveries.find((row) => row.id === "rec_carla_3")?.carbsTargetG,
      rateCarbs(0.8, WEIGHT.carla, 150),
    );
    assert.equal(
      seed.recoveries.find((row) => row.id === "rec_carla_4")?.carbsTargetG,
      perKgCarbs(7, WEIGHT.carla),
    );
    assert.equal(
      seed.stages.find((row) => row.id === "stg_carla_5")?.arrivalSource,
      "FALLBACK_TIMER",
    );
    assert.equal(
      seed.activities.find((row) => row.workoutId === "wrk_stg_carla_5"),
      undefined,
    );
    const s4 = seed.logs.find((row) => row.id === "log_carla_s4");
    const target = Math.round(fixtureFuelingGh(180) * 3);
    assert.ok(Number(s4?.intakeCarbsG) < target * 0.75);
    assert.equal(
      recoveries.every((row) => row.engineVersion === "fixture"),
      true,
    );
  });
});

describe("Eli", () => {
  const seed = buildSeed(NOW);

  it("keeps the conflict, calibration, and loading bands", () => {
    const eli = seed.users.find((row) => row.id === "usr_eli");
    assert.equal(eli?.mode, "FUEL_MY_WORKOUTS");
    assert.equal(seed.sweatTests.find((row) => row.id === "swt_eli")?.status, "AWAITING_DATA");
    assert.equal(seed.sweatTests.find((row) => row.id === "swt_eli")?.postWeightKg, null);
    assert.equal(seed.races.find((row) => row.id === "race_eli_half")?.carbLoading, "NONE");
    const days = seed.loadingDays.filter((row) => row.raceId === "race_eli_25");
    assert.deepEqual(
      days.map((row) => row.targetCarbsG).sort((a, b) => Number(a) - Number(b)),
      [300, 420],
    );
    assert.equal(seed.conflicts[0]?.resolvedAt, null);
    assert.equal(
      seed.calibrations.find((row) => row.containerId === "cnt_eli_blue"),
      undefined,
    );
    assert.equal(seed.calibrations.find((row) => row.id === "cal_eli_green")?.validationsLeft, 2);
    assert.equal(seed.gutPlans.find((row) => row.id === "gut_eli")?.targetKind, "DATE");
    assert.equal(seed.gutPlans.find((row) => row.id === "gut_eli")?.status, "ACTIVE");
    const proposal = seed.logs.find((row) => row.id === "log_eli_sip")?.sipProposal as {
      status: string;
    };
    assert.equal(proposal.status, "pending");
    assert.equal(seed.connections.find((row) => row.userId === "usr_eli")?.status, "REVOKED");
  });
});

describe("Dani", () => {
  const seed = buildSeed(NOW);

  it("stays in the empty first step with estimate workouts", () => {
    const dani = seed.users.find((row) => row.id === "usr_dani");
    assert.equal(dani?.mode, null);
    assert.equal(seed.workouts.filter((row) => row.userId === "usr_dani").length, 5);
    assert.equal(seed.products.filter((row) => row.userId === "usr_dani").length, 3);
    assert.equal(seed.containers.filter((row) => row.userId === "usr_dani").length, 0);
    assert.equal(seed.connections.filter((row) => row.userId === "usr_dani").length, 0);
    assert.equal(seed.onboarding.length, 1);
    assert.equal(seed.achievements.filter((row) => row.userId === "usr_dani").length, 0);
    assert.equal(seed.sweatTests.filter((row) => row.userId === "usr_dani").length, 0);
  });
});

describe("coverage", () => {
  const seed = buildSeed(NOW);

  it("covers every to-do type", () => {
    const types = new Set(seed.todos.map((row) => row.type));
    assert.deepEqual(
      [...types].sort(),
      [
        "ADD_BOTTLE",
        "ADD_RACE",
        "COMPLETE_PROFILE",
        "CONNECT_CALENDAR",
        "DATA_CONFLICT",
        "ESTIMATE_GH",
        "LAST_SESSION_FEEDBACK",
        "LOADING_REHEARSAL",
        "PRE_RACE_STRATEGY",
        "SIP_CALIBRATION",
        "SIP_VALIDATION",
        "SWEAT_TEST",
      ].sort(),
    );
  });
});
