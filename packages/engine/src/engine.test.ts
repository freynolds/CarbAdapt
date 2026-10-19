import assert from "node:assert/strict";
import test from "node:test";
import {
  adapt,
  buildLadder,
  carbBand,
  carbLoadingBands,
  calibrateSips,
  fuelingPlan,
  ghIncrease,
  gutRaceAllowed,
  intakePrefill,
  ladderStepG,
  raceBreakfast,
  recoveryOccasions,
  stageFallbackAt,
  stageRecovery,
  startingPoint,
  sweatRateLPerH,
  ENGINE_VERSION,
} from "./index.js";

test("engine version is set", () => {
  assert.equal(ENGINE_VERSION, "2026.10.19");
});

test("duration bands follow Master Plan §7.1 and leave empty cells unset", () => {
  assert.equal(carbBand(30, "CYCLING").none, true);
  assert.equal(carbBand(60, "RUNNING").mouthRinse, true);
  assert.deepEqual(
    [carbBand(120, "CYCLING").minGPerH, carbBand(120, "CYCLING").maxGPerH],
    [30, 60],
  );
  assert.deepEqual(
    [carbBand(180, "TRAIL_RUNNING").minGPerH, carbBand(180, "TRAIL_RUNNING").maxGPerH],
    [60, 90],
  );
  assert.deepEqual(
    [carbBand(300, "CYCLING").minGPerH, carbBand(300, "CYCLING").maxGPerH],
    [90, 120],
  );
  assert.equal(carbBand(300, "RUNNING").specified, false);
  assert.equal(carbBand(40, "TRAIL_RUNNING").specified, false);
  assert.equal(carbBand(120, "OTHER").specified, false);
});

test("fuel mode keeps the band and does not pick a single g/h", () => {
  const plan = fuelingPlan({
    durationMin: 120,
    sport: "CYCLING",
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: 80,
    chosenGPerH: null,
    sweatRateLPerH: null,
    products: [],
    containers: [],
  });
  assert.equal(plan.targetGPerH, null);
  assert.equal(plan.carbStatus, "not_set");
  assert.equal(plan.fluidStatus, "not_set");
  assert.equal(plan.scheduleStatus, "not_set");
  assert.deepEqual(plan.schedule, []);
});

test("gut training uses the ladder step and sweat rate when both exist", () => {
  const plan = fuelingPlan({
    durationMin: 180,
    sport: "CYCLING",
    mode: "GUT_TRAINING",
    currentStepGh: 80,
    chosenGPerH: null,
    sweatRateLPerH: 1,
    products: [{ id: "p1", type: "DRINK_MIX", name: "Mix", carbsG: 30, sodiumMg: 300 }],
    containers: [{ id: "c1", name: "Bottle", capacityMl: 750, usualContent: "ISOTONIC" }],
  });
  assert.equal(plan.targetGPerH, 80);
  assert.equal(plan.totalCarbsG, 240);
  assert.equal(plan.totalFluidMl, 3000);
  assert.equal(plan.drinkMixGPerMl, 0.1);
  assert.equal(plan.items[0]?.carryCarbsG, 75);
  assert.equal(plan.items[0]?.fluidMl, 750);
  assert.equal(plan.items[0]?.volumeMl, 750);
  assert.equal(plan.items[0]?.servings, 2.5);
  const carbs = plan.items.reduce((sum, item) => sum + (item.carryCarbsG ?? 0), 0);
  const fluid = plan.items.reduce((sum, item) => sum + (item.fluidMl ?? 0), 0);
  assert.equal(carbs, 240);
  assert.equal(fluid, 3000);
});

test("gut training fills every container and the rows sum to the session", () => {
  const plan = fuelingPlan({
    durationMin: 180,
    sport: "CYCLING",
    mode: "GUT_TRAINING",
    currentStepGh: 80,
    chosenGPerH: null,
    sweatRateLPerH: 0.9,
    products: [
      { id: "mix", type: "DRINK_MIX", name: "Mix", carbsG: 30, sodiumMg: 400, scoopG: 40 },
      { id: "gel", type: "GEL", name: "Gel", carbsG: 22, sodiumMg: 40 },
    ],
    containers: [
      { id: "water", name: "White bottle", capacityMl: 750, usualContent: "WATER" },
      { id: "iso", name: "Glucose bottle", capacityMl: 750, usualContent: "ISOTONIC" },
      { id: "flask", name: "Ember flask", capacityMl: 150, usualContent: "GEL_CONCENTRATE" },
    ],
  });
  assert.equal(plan.totalCarbsG, 240);
  assert.equal(plan.totalFluidMl, 2700);
  const water = plan.items.find((item) => item.containerId === "water");
  const iso = plan.items.find((item) => item.containerId === "iso");
  const flask = plan.items.find((item) => item.containerId === "flask");
  assert.equal(water?.role, "water");
  assert.equal(water?.fluidMl, 750);
  assert.equal(water?.carryCarbsG, 0);
  assert.equal(iso?.productName, "Mix");
  assert.equal(iso?.unit, "scoop");
  assert.equal(iso?.carryCarbsG, 75);
  assert.equal(flask?.productName, "Gel");
  assert.equal(flask?.carryCarbsG, 165);
  const carbs = plan.items.reduce((sum, item) => sum + (item.carryCarbsG ?? 0), 0);
  const fluid = plan.items.reduce((sum, item) => sum + (item.fluidMl ?? 0), 0);
  assert.equal(carbs, plan.totalCarbsG);
  assert.equal(fluid, plan.totalFluidMl);
});

test("fuel mode lists container products and does not invent carb servings", () => {
  const plan = fuelingPlan({
    durationMin: 120,
    sport: "CYCLING",
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: 80,
    chosenGPerH: null,
    sweatRateLPerH: 1,
    products: [{ id: "mix", type: "DRINK_MIX", name: "Mix", carbsG: 30, sodiumMg: 200 }],
    containers: [{ id: "iso", name: "Road bottle", capacityMl: 750, usualContent: "ISOTONIC" }],
  });
  assert.equal(plan.carbStatus, "not_set");
  assert.equal(plan.targetGPerH, null);
  assert.equal(plan.items[0]?.productName, "Mix");
  assert.equal(plan.items[0]?.servings, null);
  assert.equal(plan.items[0]?.carryCarbsG, null);
  assert.equal(plan.items[0]?.fluidMl, 750);
  assert.equal(plan.items.find((item) => item.role === "unassigned")?.fluidMl, 1250);
});

test("a 30 g/h gap uses 10 g/h steps and a smaller gap uses 5", () => {
  assert.equal(ladderStepG(60, 90), 10);
  assert.deepEqual(
    buildLadder({
      startGh: 60,
      goalGh: 90,
      today: "2026-10-19",
      targetDate: "2027-04-19",
      sessionsPerWeek: null,
    }).steps.map((step) => step.gh),
    [70, 80, 90],
  );
  assert.equal(ladderStepG(80, 100), 5);
  assert.deepEqual(
    buildLadder({
      startGh: 80,
      goalGh: 100,
      today: "2026-10-19",
      targetDate: "2027-04-19",
      sessionsPerWeek: null,
    }).steps.map((step) => step.gh),
    [85, 90, 95, 100],
  );
  assert.equal(ladderStepG(70, 99), 5);
});

test("a gut-training race has to be at least four weeks ahead", () => {
  assert.deepEqual(gutRaceAllowed("2026-10-19", "2026-11-16"), { ok: true, reason: null });
  assert.deepEqual(gutRaceAllowed("2026-10-19", "2026-11-15"), { ok: false, reason: "too_soon" });
  assert.deepEqual(gutRaceAllowed("2026-10-19", "2026-10-01"), { ok: false, reason: "past" });
});

test("a gap under four hours is one snack in the middle", () => {
  const occasions = recoveryOccasions({ gap: "UNDER_4H", gapMin: 180, liquidsAndGelsOnly: false });
  assert.equal(occasions.length, 1);
  assert.equal(occasions[0]?.key, "middle");
  assert.equal(occasions[0]?.offsetMin, 90);
  assert.equal(occasions[0]?.form, "snack");
  assert.equal(occasions[0]?.carbShare, 1);
  const drink = recoveryOccasions({ gap: "UNDER_4H", gapMin: 75, liquidsAndGelsOnly: true });
  assert.equal(drink[0]?.form, "drink");
  assert.equal(drink[0]?.offsetMin, 38);
});

test("60 to 120 g/h in 14 days at two sessions a week is too fast", () => {
  const ladder = buildLadder({
    startGh: 60,
    goalGh: 120,
    today: "2026-10-19",
    targetDate: "2026-11-02",
    sessionsPerWeek: 2,
  });
  assert.equal(ladder.tooFastKnown, true);
  assert.equal(ladder.tooFast, true);
  assert.equal(ladder.warnsAbove120, false);
  assert.equal(ladder.steps[0]?.gh, 70);
  assert.equal(ladder.steps.at(-1)?.gh, 120);
});

test("a long runway can reach 90 g/h with four rides left", () => {
  const ladder = buildLadder({
    startGh: 60,
    goalGh: 90,
    today: "2026-10-19",
    targetDate: "2027-04-19",
    sessionsPerWeek: 2,
  });
  assert.equal(ladder.tooFast, false);
  assert.equal(ladder.defaultGh, 90);
});

test("goal above 200 is flagged and unknown volume has no dates", () => {
  const ladder = buildLadder({
    startGh: 60,
    goalGh: 210,
    today: "2026-10-19",
    targetDate: "2026-12-19",
    sessionsPerWeek: null,
  });
  assert.equal(ladder.overMax, true);
  assert.equal(ladder.tooFastKnown, false);
  assert.equal(ladder.steps[0]?.approxDate, null);
});

test("two mild sessions advance, moderate holds, severe steps back", () => {
  const logs = [
    {
      id: "b",
      gh: 60,
      symptom: "MILD" as const,
      eligible: true,
      countsForPlan: true,
      weekKey: "1",
    },
    {
      id: "a",
      gh: 60,
      symptom: "NONE" as const,
      eligible: true,
      countsForPlan: true,
      weekKey: "1",
    },
  ];
  const advance = adapt({
    currentGh: 60,
    logsNewestFirst: logs,
    advancesThisWeek: 0,
    weekKey: "1",
  });
  assert.equal(advance.outcome, "ADVANCE");
  assert.equal(advance.toGh, 70);

  const first = logs[0];
  assert.ok(first);
  const hold = adapt({
    currentGh: 60,
    logsNewestFirst: [{ ...first, id: "m", symptom: "MODERATE" }],
    advancesThisWeek: 0,
    weekKey: "1",
  });
  assert.equal(hold.outcome, "HOLD");

  const back = adapt({
    currentGh: 70,
    logsNewestFirst: [{ ...first, id: "s", gh: 70, symptom: "SEVERE" }],
    advancesThisWeek: 0,
    weekKey: "1",
  });
  assert.equal(back.outcome, "STEP_BACK");
  assert.equal(back.toGh, 60);
});

test("a second step above 90 g/h in the same week is held", () => {
  const result = adapt({
    currentGh: 100,
    logsNewestFirst: [
      { id: "b", gh: 100, symptom: "NONE", eligible: true, countsForPlan: true, weekKey: "1" },
      { id: "a", gh: 100, symptom: "NONE", eligible: true, countsForPlan: true, weekKey: "1" },
    ],
    advancesThisWeek: 1,
    weekKey: "1",
  });
  assert.equal(result.reason, "weekly_cap");
  assert.equal(result.outcome, "HOLD");
});

test("short cycling is not eligible and a 70 minute run is", () => {
  assert.equal(
    adapt({
      currentGh: 60,
      logsNewestFirst: [
        { id: "x", gh: 60, symptom: "NONE", eligible: false, countsForPlan: true, weekKey: "1" },
      ],
      advancesThisWeek: 0,
      weekKey: "1",
    }).reason,
    "not_eligible",
  );
});

test("starting point uses the highest mild-or-better g/h, else min(60, 1 g/kg)", () => {
  assert.deepEqual(
    startingPoint({
      weightKg: 70,
      workouts: [
        { gh: 40, symptom: "MILD" },
        { gh: 90, symptom: "SEVERE" },
        { gh: 70, symptom: "NONE" },
      ],
    }),
    { gh: 70, source: "history" },
  );
  assert.deepEqual(startingPoint({ weightKg: 54, workouts: [] }), { gh: 54, source: "fallback" });
  assert.deepEqual(startingPoint({ weightKg: 80, workouts: [] }), { gh: 60, source: "fallback" });
  assert.equal(startingPoint({ weightKg: null, workouts: [] }).source, "not_set");
});

test("sweat rate divides the volume balance by hours", () => {
  assert.equal(
    sweatRateLPerH({
      preWeightKg: 70,
      postWeightKg: 69,
      fluidMl: 500,
      urineMl: 0,
      durationMin: 60,
    }),
    1.5,
  );
});

test("water sips use 1 g/ml and isotonic volume stays unset", () => {
  assert.equal(calibrateSips([800, 788, 776, 764], "WATER")?.mlPerSip, 12);
  assert.equal(calibrateSips([800, 788, 776, 764], "ISOTONIC")?.mlPerSip, null);
  assert.equal(calibrateSips([200, 190, 180, 170], "GEL_CONCENTRATE")?.gPerSqueeze, 10);
});

test("loading bands only cover the §5.2 proposal rows", () => {
  const long = carbLoadingBands({ choice: "TWO_DAY", durationMin: 300 });
  assert.equal(long.source, "mvp-5.2-proposal");
  assert.equal(long.days[1]?.usedGPerKg, 10);
  assert.equal(carbLoadingBands({ choice: "ONE_DAY", durationMin: 180 }).days[0]?.day, "D_MINUS_1");
  assert.equal(carbLoadingBands({ choice: "TWO_DAY", durationMin: 180 }).source, "not_set");
  assert.equal(carbLoadingBands({ choice: "NONE", durationMin: 300 }).days.length, 0);
});

test("race breakfast is 2 g/kg and fluid is not set", () => {
  const breakfast = raceBreakfast(70);
  assert.equal(breakfast.gPerKg, 2);
  assert.equal(breakfast.carbsG, 140);
  assert.equal(breakfast.fluidMl, null);
  assert.equal(breakfast.earlyStart, null);
});

test("trail overnight does not use the 5–6 g/kg band", () => {
  const plan = stageRecovery({
    gapMin: 14 * 60,
    restDay: false,
    stageDurationMin: 120,
    sport: "TRAIL_RUNNING",
    weightKg: 70,
    sensitiveStomach: false,
    intakeCarbsG: null,
    targetGPerH: null,
    sweatRateLPerH: null,
    fluidDrunkMl: null,
  });
  assert.equal(plan.gapCase, "OVERNIGHT");
  assert.equal(plan.trailRaised, true);
  assert.equal(plan.carbsLowG, 6 * 70);
  assert.equal(plan.carbsHighG, 8 * 70);
  assert.equal(plan.carbChoice, "low_end_default");
});

test("intake under 75% adds 1 g/kg and fluid stays a range", () => {
  const plan = stageRecovery({
    gapMin: 8 * 60,
    restDay: false,
    stageDurationMin: 180,
    sport: "CYCLING",
    weightKg: 60,
    sensitiveStomach: false,
    intakeCarbsG: 40,
    targetGPerH: 60,
    sweatRateLPerH: 1,
    fluidDrunkMl: 500,
  });
  assert.equal(plan.gapCase, "H4_TO_12H");
  assert.equal(plan.lowIntakeBonusGPerKg, 1);
  assert.equal(plan.fluidTargetMl, null);
  assert.ok(plan.fluidTargetRangeMl);
  assert.equal(plan.sodiumTargetMg, null);
  assert.deepEqual(plan.sodiumMmolPerL, { min: 50, max: 80 });
});

test("a gap under 90 minutes is liquids and gels only", () => {
  const plan = stageRecovery({
    gapMin: 75,
    restDay: false,
    stageDurationMin: 60,
    sport: "CYCLING",
    weightKg: 70,
    sensitiveStomach: false,
    intakeCarbsG: null,
    targetGPerH: null,
    sweatRateLPerH: null,
    fluidDrunkMl: null,
  });
  assert.equal(plan.liquidsAndGelsOnly, true);
  assert.equal(plan.gapCase, "UNDER_4H");
});

test("an achievement is only a higher tolerated g/h", () => {
  assert.equal(ghIncrease({ previousMaxGh: 60, toleratedGh: 70 })?.valueGh, 70);
  assert.equal(ghIncrease({ previousMaxGh: 70, toleratedGh: 70 }), null);
});

test("intake prefill uses the plan total when the plan set one", () => {
  const prefill = intakePrefill({
    durationMin: 180,
    plannedCarbsG: 240,
    plannedFluidMl: 2700,
    workingGPerH: 80,
    fluidLPerH: 0.9,
  });
  assert.equal(prefill.carbsG, 240);
  assert.equal(prefill.fluidMl, 2700);
  assert.equal(prefill.carbSource, "plan");
  assert.equal(prefill.fluidSource, "plan");
});

test("intake prefill falls back to the working rate times duration", () => {
  const prefill = intakePrefill({
    durationMin: 90,
    plannedCarbsG: null,
    plannedFluidMl: null,
    workingGPerH: 70,
    fluidLPerH: 1,
  });
  assert.equal(prefill.carbsG, 105);
  assert.equal(prefill.fluidMl, 1500);
  assert.equal(prefill.carbSource, "working_rate");
  assert.equal(prefill.fluidSource, "working_rate");
});

test("a zero plan total is kept and a null rate stays unset", () => {
  const plannedZero = intakePrefill({
    durationMin: 45,
    plannedCarbsG: 0,
    plannedFluidMl: null,
    workingGPerH: 80,
    fluidLPerH: null,
  });
  assert.equal(plannedZero.carbsG, 0);
  assert.equal(plannedZero.carbSource, "plan");
  assert.equal(plannedZero.fluidMl, null);
  assert.equal(plannedZero.fluidSource, "not_set");

  const noDuration = intakePrefill({
    durationMin: null,
    plannedCarbsG: null,
    plannedFluidMl: null,
    workingGPerH: 80,
    fluidLPerH: 1,
  });
  assert.equal(noDuration.carbsG, null);
  assert.equal(noDuration.fluidMl, null);
  assert.equal(noDuration.carbSource, "not_set");
  assert.equal(noDuration.fluidSource, "not_set");
});

test("stage fallback is start plus 1.5 times estimated duration", () => {
  const start = new Date("2026-10-19T12:00:00.000Z");
  const at = stageFallbackAt(start, 120);
  assert.equal(at.toISOString(), "2026-10-19T15:00:00.000Z");
});
