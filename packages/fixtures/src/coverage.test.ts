import { describe, expect, it } from "vitest";
import { buildSeed, fixtureFuelingGh, loadingTargetG, makeClock, perKgCarbs, rateCarbs, splitMeals, sweatRateLPerH, tooFastPreview, FOODS, WEIGHT } from "./index.js";

const NOW = new Date("2026-10-18T15:00:00.000Z");

describe("fixture clock and domain rules", () => {
  it("uses the Buenos Aires calendar date", () => {
    const clock = makeClock(NOW);
    expect(clock.today.toISOString().slice(0, 10)).toBe("2026-10-18");
    expect(clock.nextWeekday(1)).toBe(1);
    expect(clock.at(0, 8, 0).toISOString()).toBe("2026-10-18T11:00:00.000Z");
  });

  it("computes sweat rate from the documented formula", () => {
    expect(sweatRateLPerH({ preWeightKg: 64, postWeightKg: 63.4, fluidMl: 300, urineMl: 0, durationMin: 60 })).toBe(0.9);
    expect(sweatRateLPerH({ preWeightKg: 70, postWeightKg: 69.4, fluidMl: 400, urineMl: 0, durationMin: 60 })).toBe(1);
  });

  it("rounds loading targets to 10 g and meal splits sum to the total", () => {
    expect(loadingTargetG(10, 64)).toBe(640);
    expect(loadingTargetG(5, 60)).toBe(300);
    expect(loadingTargetG(7, 60)).toBe(420);
    const meals = splitMeals(640);
    expect(meals.reduce((sum, meal) => sum + meal.carbsG, 0)).toBe(640);
  });

  it("flags only the documented 60 to 120 g/h preview", () => {
    const today = makeClock(NOW).today;
    const soon = makeClock(NOW).day(14);
    const flagged = tooFastPreview({ startGh: 60, goalGh: 120, today, targetDate: soon });
    expect(flagged.tooFast).toBe(true);
    expect(flagged.suggestedLaterDate).toBe("2026-11-22");
    expect(flagged.suggestedGoalGh).toBeNull();
    const other = tooFastPreview({ startGh: 60, goalGh: 90, today, targetDate: soon });
    expect(other.tooFast).toBe(false);
  });
});

describe("approved seed cases", () => {
  const seed = buildSeed(NOW);
  const user = (id: string) => seed.users.find((row) => row.id === id);

  it("seeds the five demo athletes", () => {
    expect(seed.users.map((row) => row.name)).toEqual(["Ana", "Bruno", "Carla", "Eli", "Dani"]);
    expect(user("usr_ana")?.mode).toBe("GUT_TRAINING");
    expect(user("usr_bruno")?.mode).toBe("GUT_TRAINING");
    expect(user("usr_carla")?.mode).toBe("FUEL_MY_WORKOUTS");
    expect(user("usr_eli")?.mode).toBe("FUEL_MY_WORKOUTS");
    expect(user("usr_dani")?.mode).toBeNull();
  });

  it("covers every to-do type once across athletes", () => {
    const types = new Set(seed.todos.map((row) => row.type));
    expect([...types].sort()).toEqual(
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

  it("builds Ana's in-progress ladder, celebration, and duplicate ride", () => {
    const steps = seed.steps.filter((row) => row.planId === "gut_ana").sort((a, b) => Number(a.index) - Number(b.index));
    expect(steps.map((row) => row.status)).toEqual(["DONE", "DONE", "CURRENT", "UPCOMING"]);
    expect(steps.map((row) => row.gh)).toEqual([60, 70, 80, 90]);
    const pending = seed.achievements.filter((row) => row.userId === "usr_ana" && row.celebratedAt == null);
    expect(pending).toHaveLength(1);
    expect(pending[0]?.valueGh).toBe(80);
    const dupes = seed.activities.filter((row) => row.workoutId === "wrk_ana_dup");
    expect(dupes).toHaveLength(1);
    expect(dupes[0]?.dedupeGroup).toBe("grp_ana_dup");
    const today = seed.fuelingPlans.find((row) => row.workoutId === "wrk_ana_today");
    expect(today?.targetGPerH).toBe(80);
    expect(today?.engineVersion).toBe("fixture");
    const moved = seed.sweatTests.find((row) => row.id === "swt_ana_moved");
    expect(moved?.status).toBe("RESCHEDULED");
    expect(moved?.movedFrom).toEqual(seed.clock.day(41));
    expect(seed.rehearsals.map((row) => row.status).sort()).toEqual(["DISMISSED", "SUGGESTED"]);
    const short = seed.logs.find((row) => row.workoutId === "wrk_ana_short");
    expect(short?.ladderEligible).toBe(false);
    const late = seed.logs.find((row) => row.workoutId === "wrk_ana_late");
    expect(late?.countsForPlan).toBe(false);
  });

  it("marks Bruno's plan complete and keeps the trail overnight bands", () => {
    const plan = seed.gutPlans.find((row) => row.id === "gut_bruno");
    expect(plan?.status).toBe("COMPLETED");
    const steps = seed.steps.filter((row) => row.planId === "gut_bruno");
    expect(steps.every((row) => row.status === "DONE")).toBe(true);
    const date90 = seed.steps.find((row) => row.id === "stp_bruno_1")?.approxDate as Date;
    const date100 = seed.steps.find((row) => row.id === "stp_bruno_2")?.approxDate as Date;
    expect((date100.getTime() - date90.getTime()) / 86_400_000).toBeGreaterThanOrEqual(7);
    expect(seed.recoveries.find((row) => row.id === "rec_bruno_1")?.carbsTargetG).toBe(perKgCarbs(6, WEIGHT.bruno));
    expect(seed.recoveries.find((row) => row.id === "rec_bruno_2")?.carbsTargetG).toBe(perKgCarbs(7, WEIGHT.bruno));
    expect(seed.logs.find((row) => row.workoutId === "wrk_bruno_short")?.ladderEligible).toBe(false);
    expect(seed.logs.find((row) => row.workoutId === "wrk_bruno_80a")?.ladderEligible).toBe(true);
    expect(seed.strategies.filter((row) => row.raceId === "race_bruno")).toHaveLength(1);
    expect(seed.sweatTests.find((row) => row.id === "swt_bruno")?.status).toBe("COMPLETED");
  });

  it("covers Carla's seven stages and every gap case", () => {
    const stages = seed.stages.filter((row) => row.raceId === "race_carla");
    expect(stages).toHaveLength(7);
    expect(seed.recoveries.filter((row) => String(row.stageId).startsWith("stg_carla"))).toHaveLength(6);
    expect(seed.recoveries.find((row) => row.stageId === "stg_carla_7")).toBeUndefined();
    expect(new Set(seed.recoveries.map((row) => row.gapCase))).toEqual(
      new Set(["UNDER_4H", "H4_TO_12H", "OVERNIGHT", "REST_DAY"]),
    );
    expect(seed.recoveries.find((row) => row.id === "rec_carla_1")?.carbsTargetG).toBe(rateCarbs(1, WEIGHT.carla, 45));
    expect(seed.recoveries.find((row) => row.id === "rec_carla_3")?.sensitiveStomach).toBe(true);
    expect(seed.recoveries.find((row) => row.id === "rec_carla_3")?.carbsTargetG).toBe(rateCarbs(0.8, WEIGHT.carla, 150));
    expect(seed.recoveries.find((row) => row.id === "rec_carla_4")?.carbsTargetG).toBe(perKgCarbs(7, WEIGHT.carla));
    expect(seed.stages.find((row) => row.id === "stg_carla_5")?.arrivalSource).toBe("FALLBACK_TIMER");
    expect(seed.activities.find((row) => row.workoutId === "wrk_stg_carla_5")).toBeUndefined();
    const s4 = seed.logs.find((row) => row.id === "log_carla_s4");
    const target = Math.round(fixtureFuelingGh(180) * 3);
    expect(Number(s4?.intakeCarbsG)).toBeLessThan(target * 0.75);
  });

  it("gives Eli the conflict, calibration, and loading bands", () => {
    expect(seed.sweatTests.find((row) => row.id === "swt_eli")?.status).toBe("AWAITING_DATA");
    expect(seed.sweatTests.find((row) => row.id === "swt_eli")?.postWeightKg).toBeNull();
    expect(seed.races.find((row) => row.id === "race_eli_half")?.carbLoading).toBe("NONE");
    const days = seed.loadingDays.filter((row) => row.raceId === "race_eli_25");
    expect(days.map((row) => row.targetCarbsG).sort()).toEqual([300, 420]);
    expect(seed.conflicts[0]?.resolvedAt).toBeNull();
    expect(seed.calibrations.find((row) => row.containerId === "cnt_eli_blue")).toBeUndefined();
    expect(seed.calibrations.find((row) => row.id === "cal_eli_green")?.validationsLeft).toBe(2);
    expect(seed.gutPlans.find((row) => row.id === "gut_eli")?.targetKind).toBe("DATE");
    const proposal = seed.logs.find((row) => row.id === "log_eli_sip")?.sipProposal as { status: string };
    expect(proposal.status).toBe("pending");
  });

  it("leaves Dani in the empty first-step state with estimate workouts", () => {
    expect(seed.workouts.filter((row) => row.userId === "usr_dani")).toHaveLength(5);
    expect(seed.products.filter((row) => row.userId === "usr_dani")).toHaveLength(3);
    expect(seed.containers.filter((row) => row.userId === "usr_dani")).toHaveLength(0);
    expect(seed.connections.filter((row) => row.userId === "usr_dani")).toHaveLength(0);
    expect(seed.onboarding).toHaveLength(1);
    expect(seed.achievements.filter((row) => row.userId === "usr_dani")).toHaveLength(0);
    expect(seed.sweatTests.filter((row) => row.userId === "usr_dani")).toHaveLength(0);
  });

  it("stores real USDA ids and fixture engine versions", () => {
    expect(new Set(FOODS.map((food) => food.fdcId)).size).toBe(FOODS.length);
    expect(FOODS.find((food) => food.fdcId === 168878)?.carbsPer100g).toBe(28.17);
    expect(seed.gutPlans.every((row) => row.engineVersion === "fixture")).toBe(true);
    expect(seed.fuelingPlans.every((row) => row.engineVersion === "fixture")).toBe(true);
    expect(seed.recoveries.every((row) => row.engineVersion === "fixture")).toBe(true);
    expect(loadingTargetG(10, WEIGHT.ana)).toBe(640);
    expect(perKgCarbs(5, WEIGHT.carla)).toBe(340);
  });
});
