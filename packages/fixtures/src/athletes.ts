import {
  DEMO_LABEL,
  addFueling,
  addLoadingDay,
  addRecovery,
  raceStrategyCarry,
  symptomLog,
  type SeedData,
} from "./bag.js";
import {
  ENGINE_VERSION,
  STOP_BEFORE_NEXT_START_MIN,
  fixtureFuelingGh,
  perKgCarbs,
  proteinServingG,
  rateCarbs,
  sweatRateLPerH,
} from "./domain.js";
import { DEMO_TIMEZONE } from "./clock.js";

export const WEIGHT = { ana: 64, bruno: 70, carla: 68, eli: 60, dani: 72 };
export const ANA_RACE_OFFSET = 42;
export const ANA_ROAD_OFFSET = 12;

const ZONES = {
  z1: [100, 130],
  z2: [131, 150],
  z3: [151, 165],
  z4: [166, 176],
  z5: [177, 188],
};

export function seedAthletes(bag: SeedData): void {
  seedAna(bag);
  seedBruno(bag);
  seedCarla(bag);
  seedEli(bag);
  seedDani(bag);
}

function seedAna(bag: SeedData): void {
  const clock = bag.clock;
  const userId = "usr_ana";
  bag.users.push({
    id: userId,
    email: "ana@demo.carbadapt.test",
    name: "Ana",
    locale: "EN_US",
    theme: "SYSTEM",
    timezone: DEMO_TIMEZONE,
    mode: "GUT_TRAINING",
    briefingTimeLocal: "20:00",
    briefingDayBefore: true,
  });
  bag.subscriptions.push({ userId, status: "BETA_ALL_ACCESS" });
  bag.identities.push(
    {
      id: "idn_ana_strava",
      userId,
      provider: "STRAVA",
      providerUserId: "strava_ana",
      email: "ana@demo.carbadapt.test",
    },
    {
      id: "idn_ana_tp",
      userId,
      provider: "TRAININGPEAKS",
      providerUserId: "tp_ana",
      email: "ana@demo.carbadapt.test",
    },
  );
  const oldSweat = sweatRateLPerH({
    preWeightKg: 64,
    postWeightKg: 63.4,
    fluidMl: 300,
    urineMl: 0,
    durationMin: 60,
  });
  bag.physical.push({
    userId,
    weightKg: WEIGHT.ana,
    ftpW: 230,
    sweatRateLPerH: oldSweat,
    sweatRateSource: "sweat_test",
    ghTolerance: 80,
    maxHr: 188,
    hrZones: ZONES,
    age: 34,
    sex: "female",
    heightCm: 170,
    fieldSources: { weight: "MANUAL", ftp: "TRAININGPEAKS", hrZones: "TRAININGPEAKS" },
  });
  bag.connections.push(
    connection("con_ana_tp", userId, "TRAININGPEAKS", "CONNECTED", clock),
    connection("con_ana_strava", userId, "STRAVA", "CONNECTED", clock),
    connection("con_ana_garmin", userId, "GARMIN", "DISCONNECTED", clock),
  );
  bag.containers.push(
    container("cnt_ana_water", userId, "BOTTLE", "White bottle", "#F4F1EA", 750, "WATER"),
    container("cnt_ana_iso", userId, "BOTTLE", "Glucose bottle", "#C6F135", 750, "ISOTONIC"),
    container(
      "cnt_ana_flask",
      userId,
      "SOFT_FLASK",
      "Ember flask",
      "#FF6A3D",
      150,
      "GEL_CONCENTRATE",
    ),
  );
  bag.calibrations.push(
    {
      id: "cal_ana_water",
      containerId: "cnt_ana_water",
      weightsG: [750, 725, 700, 675],
      mlPerSip: 25,
      gPerSqueeze: null,
      validationsLeft: 0,
    },
    {
      id: "cal_ana_iso",
      containerId: "cnt_ana_iso",
      weightsG: [780, 755, 730, 705],
      mlPerSip: 25,
      gPerSqueeze: null,
      validationsLeft: 0,
    },
    {
      id: "cal_ana_flask",
      containerId: "cnt_ana_flask",
      weightsG: [150, 142, 134, 126],
      mlPerSip: null,
      gPerSqueeze: 8,
      validationsLeft: 0,
    },
  );
  const products = [
    product("prd_ana_iso", userId, "DRINK_MIX", "Demo Isotonic Mix", 40, 40, 30, 400, 0, true),
    product("prd_ana_hc", userId, "DRINK_MIX", "Demo High-Carb Mix", 80, null, 80, 200, 0, false),
    product("prd_ana_gel", userId, "GEL", "Demo Gel", 40, null, 22, 40, 0, true),
    product(
      "prd_ana_gel_caf",
      userId,
      "GEL",
      "Demo Gel (caffeinated)",
      40,
      null,
      22,
      40,
      75,
      false,
    ),
    product("prd_ana_bar", userId, "SOLID", "Demo Rice Bar", 50, null, 30, 80, 0, true),
    product("prd_ana_custom", userId, "SOLID", "Ana's rice-cake bite", 30, null, 24, 10, 0, false),
  ];
  bag.products.push(...products);

  bag.races.push(
    race(
      "race_ana_gf",
      userId,
      "Sierras Gran Fondo",
      ANA_RACE_OFFSET,
      clock.at(ANA_RACE_OFFSET, 9, 0),
      300,
      "gran_fondo",
      154,
      2200,
      "TWO_DAY",
      false,
      clock,
    ),
    race(
      "race_ana_rr",
      userId,
      "Early Start Road Race",
      ANA_ROAD_OFFSET,
      clock.at(ANA_ROAD_OFFSET, 6, 30),
      180,
      "road_race",
      92,
      800,
      "ONE_DAY",
      false,
      clock,
    ),
  );
  bag.aidStations.push(
    aid("aid_ana_1", "race_ana_gf", null, 40, true, false, false),
    aid("aid_ana_2", "race_ana_gf", null, 80, true, true, false),
    aid("aid_ana_3", "race_ana_gf", null, 120, true, true, true),
  );
  for (const [index, plan] of [
    ["Stop once at km 80 and refill the isotonic bottle.", [80]],
    ["Refill at km 40 and again at km 120.", [40, 120]],
    ["Use every aid station. Carry only the first hour.", [40, 80, 120]],
  ].entries()) {
    bag.strategies.push({
      id: `str_ana_${index + 1}`,
      raceId: "race_ana_gf",
      chosen: false,
      refillPoints: { km: plan[1] },
      description: plan[0],
      carryList: raceStrategyCarry(bag, userId, {
        durationMin: 300,
        sport: "CYCLING",
        sweatLPerH: oldSweat,
      }),
    });
  }
  const loadingGuidance = [
    "Low fiber and low fat.",
    "D-1 dinner is early and moderate.",
    "Race-morning breakfast is about 2 g/kg, 2–3 h before the start, on the breakfast screen.",
  ];
  addLoadingDay(bag, {
    id: "ld_ana_gf_d2",
    raceId: "race_ana_gf",
    day: "D_MINUS_2",
    dayOffset: ANA_RACE_OFFSET - 2,
    gPerKg: 10,
    weightKg: WEIGHT.ana,
    guidance: loadingGuidance,
  });
  addLoadingDay(bag, {
    id: "ld_ana_gf_d1",
    raceId: "race_ana_gf",
    day: "D_MINUS_1",
    dayOffset: ANA_RACE_OFFSET - 1,
    gPerKg: 10,
    weightKg: WEIGHT.ana,
    guidance: [...loadingGuidance, "Early moderate dinner tonight."],
  });
  addLoadingDay(bag, {
    id: "ld_ana_rr_d1",
    raceId: "race_ana_rr",
    day: "D_MINUS_1",
    dayOffset: ANA_ROAD_OFFSET - 1,
    gPerKg: 10,
    weightKg: WEIGHT.ana,
    guidance: [
      "Protocol C: D-1 only, about 10 g/kg, high-GI and low-fiber. D-2 is normal eating and has no loading row.",
      ...loadingGuidance,
    ],
  });
  bag.rehearsals.push(
    {
      id: "reh_ana_gf",
      raceId: "race_ana_gf",
      date: clock.day(ANA_RACE_OFFSET - 7),
      longRideWorkoutId: "wrk_ana_rehearsal_ride",
      status: "SUGGESTED",
      dismissedAt: null,
    },
    {
      id: "reh_ana_rr",
      raceId: "race_ana_rr",
      date: clock.day(ANA_ROAD_OFFSET - 8),
      longRideWorkoutId: null,
      status: "DISMISSED",
      dismissedAt: clock.at(-2, 18, 0),
    },
  );

  const ride = (
    id: string,
    offset: number,
    duration: number,
    source: string,
    type: string | null,
    status: string,
    name: string,
    start: boolean,
  ) => {
    bag.workouts.push({
      id,
      userId,
      source,
      externalId: source === "MANUAL" ? null : id,
      sport: "CYCLING",
      kind: "STANDARD",
      workoutType: type,
      name,
      plannedStart: start ? clock.at(offset, 8, 0) : null,
      plannedDate: clock.day(offset),
      durationMin: duration,
      structure: type === "BASE" && duration >= 150 ? longRideBlock(duration) : null,
      status,
      stageId: null,
      sourceUpdatedAt: clock.at(offset, 6, 0),
    });
  };

  ride("wrk_ana_today", 0, 180, "TRAININGPEAKS", "BASE", "PLANNED", "Long ride", true);
  addFueling(bag, fuel("fp_ana_today", "wrk_ana_today", 180, 80, oldSweat));
  ride("wrk_ana_manual", 2, 45, "MANUAL", "RECOVERY", "PLANNED", "Park loops", false);
  addFueling(bag, fuel("fp_ana_manual", "wrk_ana_manual", 45, fixtureFuelingGh(45), oldSweat));
  ride("wrk_ana_open", 3, 75, "TRAININGPEAKS", null, "PLANNED", "Unstructured spin", true);
  ride("wrk_ana_next", 5, 90, "TRAININGPEAKS", "THRESHOLD", "PLANNED", "Threshold", true);
  addFueling(bag, fuel("fp_ana_next", "wrk_ana_next", 90, fixtureFuelingGh(90), oldSweat));
  ride(
    "wrk_ana_rehearsal_ride",
    ANA_RACE_OFFSET - 6,
    180,
    "TRAININGPEAKS",
    "BASE",
    "PLANNED",
    "Rehearsal long ride",
    true,
  );
  addFueling(bag, fuel("fp_ana_reh", "wrk_ana_rehearsal_ride", 180, 80, oldSweat));

  ride(
    "wrk_ana_feedback",
    -1,
    150,
    "TRAININGPEAKS",
    "BASE",
    "COMPLETED",
    "Yesterday's endurance",
    true,
  );
  activity(bag, "act_ana_feedback", userId, "wrk_ana_feedback", -1, 150, null);
  ride("wrk_ana_intake", -4, 130, "STRAVA", "BASE", "COMPLETED", "Add intake", true);
  activity(bag, "act_ana_intake", userId, "wrk_ana_intake", -4, 130, null);

  const logged = (
    id: string,
    offset: number,
    duration: number,
    gh: number,
    rating: "NONE" | "MILD" | "MODERATE" | "SEVERE",
    extra: Record<string, unknown> = {},
  ) => {
    ride(id, offset, duration, "TRAININGPEAKS", "BASE", "COMPLETED", `Gut session ${gh} g/h`, true);
    activity(bag, `act_${id}`, userId, id, offset, duration, null);
    const intake = Math.round(gh * (duration / 60));
    bag.logs.push({
      id: `log_${id}`,
      workoutId: id,
      ...symptomLog(rating, intake),
      submittedAt: clock.at(offset, 18, 0),
      ...extra,
    });
    return `log_${id}`;
  };

  const none1 = logged("wrk_ana_none1", -55, 150, 60, "NONE");
  const mild1 = logged("wrk_ana_mild1", -52, 180, 60, "MILD");
  const mod = logged("wrk_ana_mod", -45, 160, 70, "MODERATE");
  const sev = logged("wrk_ana_sev", -41, 180, 70, "SEVERE");
  const none2 = logged("wrk_ana_none2", -34, 150, 60, "NONE");
  const mild2 = logged("wrk_ana_mild2", -31, 180, 60, "MILD");
  const none3 = logged("wrk_ana_none3", -24, 180, 70, "NONE");
  const mild3 = logged("wrk_ana_mild3", -17, 180, 70, "MILD");
  logged("wrk_ana_late", -21, 150, 70, "MILD", {
    countsForPlan: false,
    submittedAt: clock.at(-16, 21, 0),
  });
  logged("wrk_ana_short", -10, 90, 70, "NONE", { ladderEligible: false });

  ride(
    "wrk_ana_dup",
    -8,
    120,
    "TRAININGPEAKS",
    "BASE",
    "COMPLETED",
    "Duplicated across providers",
    true,
  );
  bag.activities.push({
    id: "act_ana_dup",
    userId,
    provider: "STRAVA",
    externalId: "strava_ana_dup",
    workoutId: "wrk_ana_dup",
    startAt: clock.at(-8, 8, 0),
    durationMin: 120,
    dedupeGroup: "grp_ana_dup",
    summary: {
      dedupedProviders: [{ provider: "TRAININGPEAKS", externalId: "tp_ana_dup" }],
      note: "One ride on Strava and TrainingPeaks, stored as a single Activity.",
    },
  });

  const monday = clock.nextWeekday(1);
  for (const weeks of [1, 2, 3]) {
    const offset = monday - weeks * 7;
    if (
      bag.workouts.some(
        (row) => row.userId === userId && sameDay(row.plannedDate as Date, clock.day(offset)),
      )
    )
      continue;
    ride(
      `wrk_ana_rec_${weeks}`,
      offset,
      60,
      "TRAININGPEAKS",
      "RECOVERY",
      "COMPLETED",
      "Recovery ride",
      true,
    );
  }

  bag.workouts.push({
    id: "wrk_ana_sweat_old",
    userId,
    source: "MANUAL",
    externalId: null,
    sport: "CYCLING",
    kind: "SWEAT_TEST",
    workoutType: "BASE",
    name: "Sweat test",
    plannedStart: clock.at(-100, 8, 0),
    plannedDate: clock.day(-100),
    durationMin: 60,
    structure: null,
    status: "COMPLETED",
    stageId: null,
    sourceUpdatedAt: null,
  });
  bag.sweatTests.push({
    id: "swt_ana_old",
    userId,
    workoutId: "wrk_ana_sweat_old",
    status: "COMPLETED",
    scheduledFor: clock.day(-100),
    movedFrom: null,
    preWeightKg: 64,
    postWeightKg: 63.4,
    fluidMl: 300,
    urineMl: 0,
    startedAt: clock.at(-100, 8, 0),
    endedAt: clock.at(-100, 9, 0),
    temperatureC: 18.5,
    humidityPct: 60,
    sweatRateLPerH: oldSweat,
  });
  bag.workouts.push({
    id: "wrk_ana_sweat_due",
    userId,
    source: "MANUAL",
    externalId: null,
    sport: "CYCLING",
    kind: "SWEAT_TEST",
    workoutType: "BASE",
    name: "Sweat test",
    plannedStart: clock.at(monday, 8, 0),
    plannedDate: clock.day(monday),
    durationMin: 60,
    structure: null,
    status: "PLANNED",
    stageId: null,
    sourceUpdatedAt: null,
  });
  bag.sweatTests.push({
    id: "swt_ana_due",
    userId,
    workoutId: "wrk_ana_sweat_due",
    status: "SCHEDULED",
    scheduledFor: clock.day(monday),
    movedFrom: null,
    preWeightKg: null,
    postWeightKg: null,
    fluidMl: null,
    urineMl: null,
    startedAt: null,
    endedAt: null,
    temperatureC: null,
    humidityPct: null,
    sweatRateLPerH: null,
  });
  bag.workouts.push({
    id: "wrk_ana_sweat_moved",
    userId,
    source: "MANUAL",
    externalId: null,
    sport: "CYCLING",
    kind: "SWEAT_TEST",
    workoutType: "BASE",
    name: "Sweat test (moved)",
    plannedStart: clock.at(ANA_RACE_OFFSET + 7, 8, 0),
    plannedDate: clock.day(ANA_RACE_OFFSET + 7),
    durationMin: 60,
    structure: null,
    status: "PLANNED",
    stageId: null,
    sourceUpdatedAt: null,
  });
  bag.sweatTests.push({
    id: "swt_ana_moved",
    userId,
    workoutId: "wrk_ana_sweat_moved",
    status: "RESCHEDULED",
    scheduledFor: clock.day(ANA_RACE_OFFSET + 7),
    movedFrom: clock.day(ANA_RACE_OFFSET - 1),
    preWeightKg: null,
    postWeightKg: null,
    fluidMl: null,
    urineMl: null,
    startedAt: null,
    endedAt: null,
    temperatureC: null,
    humidityPct: null,
    sweatRateLPerH: null,
  });

  bag.gutPlans.push({
    id: "gut_ana",
    userId,
    targetKind: "RACE",
    raceId: "race_ana_gf",
    targetDate: clock.day(ANA_RACE_OFFSET),
    startGh: 60,
    goalGh: 90,
    defaultGh: 90,
    tooFast: false,
    status: "ACTIVE",
    engineVersion: ENGINE_VERSION,
  });
  bag.steps.push(
    step("stp_ana_0", "gut_ana", 0, 60, clock.day(-42), "DONE"),
    step("stp_ana_1", "gut_ana", 1, 70, clock.day(-28), "DONE"),
    step("stp_ana_2", "gut_ana", 2, 80, clock.day(-7), "CURRENT"),
    step("stp_ana_3", "gut_ana", 3, 90, clock.day(ANA_RACE_OFFSET - 28), "UPCOMING"),
  );
  bag.decisions.push(
    decision(
      "dec_ana_adv1",
      "gut_ana",
      "ADVANCE",
      60,
      70,
      [none1, mild1],
      "Two symptom-free sessions (none and mild) at 60 g/h.",
    ),
    decision("dec_ana_hold", "gut_ana", "HOLD", 70, 70, [mod], "Moderate symptoms hold the step."),
    decision("dec_ana_back", "gut_ana", "STEP_BACK", 70, 60, [sev], "Severe symptoms step back."),
    decision(
      "dec_ana_adv2",
      "gut_ana",
      "ADVANCE",
      60,
      70,
      [none2, mild2],
      "Two symptom-free sessions after the step back. 70 g/h was already achieved, so this is not a new achievement.",
    ),
    decision(
      "dec_ana_adv3",
      "gut_ana",
      "ADVANCE",
      70,
      80,
      [none3, mild3],
      "Two symptom-free sessions at 70 g/h.",
    ),
  );
  bag.achievements.push(
    {
      id: "ach_ana_70",
      userId,
      type: "GH_INCREASE",
      valueGh: 70,
      workoutId: "wrk_ana_mild1",
      achievedAt: clock.at(-52, 12, 0),
      celebratedAt: clock.at(-52, 19, 0),
    },
    {
      id: "ach_ana_80",
      userId,
      type: "GH_INCREASE",
      valueGh: 80,
      workoutId: "wrk_ana_mild3",
      achievedAt: clock.at(-17, 12, 0),
      celebratedAt: null,
    },
  );
  bag.todos.push(
    todo(
      "todo_ana_feedback",
      userId,
      "LAST_SESSION_FEEDBACK",
      "HIGHEST",
      "Workout",
      "wrk_ana_feedback",
    ),
    todo("todo_ana_strategy", userId, "PRE_RACE_STRATEGY", "HIGHEST", "Race", "race_ana_gf"),
    todo(
      "todo_ana_rehearsal",
      userId,
      "LOADING_REHEARSAL",
      "HIGHEST",
      "LoadingRehearsal",
      "reh_ana_gf",
    ),
    todo("todo_ana_sweat", userId, "SWEAT_TEST", "CALIBRATION", "SweatTest", "swt_ana_due"),
  );
}

function seedBruno(bag: SeedData): void {
  const clock = bag.clock;
  const userId = "usr_bruno";
  const sweat = sweatRateLPerH({
    preWeightKg: 70,
    postWeightKg: 69.4,
    fluidMl: 400,
    urineMl: 0,
    durationMin: 60,
  });
  bag.users.push({
    id: userId,
    email: "bruno@demo.carbadapt.test",
    name: "Bruno",
    locale: "EN_US",
    theme: "DARK",
    timezone: DEMO_TIMEZONE,
    mode: "GUT_TRAINING",
    briefingTimeLocal: "19:30",
    briefingDayBefore: true,
  });
  bag.subscriptions.push({ userId, status: "BETA_ALL_ACCESS" });
  bag.identities.push({
    id: "idn_bruno_strava",
    userId,
    provider: "STRAVA",
    providerUserId: "strava_bruno",
    email: "bruno@demo.carbadapt.test",
  });
  bag.physical.push({
    userId,
    weightKg: WEIGHT.bruno,
    ftpW: null,
    sweatRateLPerH: sweat,
    sweatRateSource: "sweat_test",
    ghTolerance: 100,
    maxHr: 182,
    hrZones: ZONES,
    age: 38,
    sex: "male",
    heightCm: 178,
    fieldSources: { weight: "MANUAL" },
  });
  bag.connections.push(connection("con_bruno_strava", userId, "STRAVA", "CONNECTED", clock));
  bag.products.push(
    product("prd_bruno_iso", userId, "DRINK_MIX", "Demo Isotonic Mix", 40, 40, 30, 400, 0, true),
    product("prd_bruno_gel", userId, "GEL", "Demo Gel", 40, null, 22, 60, 0, true),
  );
  bag.containers.push(
    container("cnt_bruno_soft", userId, "SOFT_FLASK", "Trail flask", "#2B3A55", 500, "ISOTONIC"),
  );
  bag.calibrations.push({
    id: "cal_bruno_soft",
    containerId: "cnt_bruno_soft",
    weightsG: [500, 480, 460, 440],
    mlPerSip: 20,
    gPerSqueeze: null,
    validationsLeft: 0,
  });

  bag.races.push(
    race(
      "race_bruno",
      userId,
      "Andes Stage Race",
      -2,
      clock.at(-2, 8, 0),
      120 + 300 + 180 + 120,
      "trail_stage",
      86,
      4200,
      "NONE",
      true,
      clock,
    ),
  );
  const stages = [
    { index: 1, offset: -2, hour: 8, minute: 0, duration: 120, km: 18, ele: 900, done: true },
    { index: 2, offset: -1, hour: 8, minute: 0, duration: 300, km: 42, ele: 1800, done: true },
    { index: 3, offset: 0, hour: 9, minute: 0, duration: 180, km: 24, ele: 1100, done: false },
    { index: 4, offset: 1, hour: 8, minute: 0, duration: 120, km: 16, ele: 700, done: false },
  ];
  for (const stage of stages) {
    const id = `stg_bruno_${stage.index}`;
    const start = clock.at(stage.offset, stage.hour, stage.minute);
    const arrival = stage.done ? new Date(start.getTime() + stage.duration * 60_000) : null;
    bag.stages.push({
      id,
      raceId: "race_bruno",
      index: stage.index,
      date: clock.day(stage.offset),
      startAt: start,
      estimatedDurationMin: stage.duration,
      type: "trail_stage",
      distanceKm: stage.km,
      elevationGainM: stage.ele,
      activityId: stage.done ? `act_${id}` : null,
      arrivalAt: arrival,
      arrivalSource: stage.done ? "PLATFORM_WEBHOOK" : null,
    });
    bag.aidStations.push(
      aid(
        `aid_bruno_${stage.index}`,
        "race_bruno",
        id,
        Math.max(5, stage.km / 2),
        true,
        stage.index % 2 === 0,
        true,
      ),
    );
    const workoutId = `wrk_${id}`;
    bag.workouts.push({
      id: workoutId,
      userId,
      source: "MANUAL",
      externalId: null,
      sport: "TRAIL_RUNNING",
      kind: "STANDARD",
      workoutType: "BASE",
      name: `Stage ${stage.index}`,
      plannedStart: start,
      plannedDate: clock.day(stage.offset),
      durationMin: stage.duration,
      structure: stageBlock(stage.duration),
      status: stage.done ? "COMPLETED" : "PLANNED",
      stageId: id,
      sourceUpdatedAt: null,
    });
    if (stage.done) {
      activity(bag, `act_${id}`, userId, workoutId, stage.offset, stage.duration, null);
    }
    addFueling(bag, {
      id: `fp_${id}`,
      workoutId,
      durationMin: stage.duration,
      targetGPerH: 100,
      sweatLPerH: sweat,
      productId: "prd_bruno_gel",
      productName: "Demo Gel",
      carbsPerServing: 22,
      sodiumPerServing: 60,
      containerId: "cnt_bruno_soft",
      containerName: "Trail flask",
    });
  }
  addRecovery(bag, {
    id: "rec_bruno_1",
    stageId: "stg_bruno_1",
    gapCase: "OVERNIGHT",
    gapMin: 22 * 60,
    weightKg: WEIGHT.bruno,
    sensitive: false,
    carbsTargetG: perKgCarbs(6, WEIGHT.bruno),
    proteinTargetG: null,
    sweatLPerH: sweat,
    durationMin: 120,
    fluidDrunkMl: 600,
    guidance: [
      "Trail rule: a stage under 2.5 h uses at least 6–8 g/kg overnight, not the 5–6 g/kg band. Fixture uses the low end, 6 g/kg.",
      "Carbs eaten on the stage are not subtracted.",
    ],
  });
  addRecovery(bag, {
    id: "rec_bruno_2",
    stageId: "stg_bruno_2",
    gapCase: "OVERNIGHT",
    gapMin: 20 * 60,
    weightKg: WEIGHT.bruno,
    sensitive: false,
    carbsTargetG: perKgCarbs(7, WEIGHT.bruno),
    proteinTargetG: null,
    sweatLPerH: sweat,
    durationMin: 300,
    fluidDrunkMl: 1500,
    guidance: [
      "Stage was 5 h, so the overnight band is 7–9 g/kg. Fixture uses the low end, 7 g/kg.",
    ],
  });
  bag.strategies.push({
    id: "str_bruno_1",
    raceId: "race_bruno",
    chosen: false,
    refillPoints: { km: [12] },
    description:
      "One plan only, so the screen has no carousel. Refill the flask at the mid-stage aid station.",
    carryList: raceStrategyCarry(bag, userId, {
      durationMin: 120 + 300 + 180 + 120,
      sport: "TRAIL_RUNNING",
      sweatLPerH: sweat,
    }),
  });

  const run = (
    id: string,
    offset: number,
    duration: number,
    gh: number,
    rating: "NONE" | "MILD",
    eligible: boolean,
  ) => {
    bag.workouts.push({
      id,
      userId,
      source: "STRAVA",
      externalId: id,
      sport: "TRAIL_RUNNING",
      kind: "STANDARD",
      workoutType: "BASE",
      name: duration >= 60 ? "Long run" : "Short run",
      plannedStart: clock.at(offset, 7, 0),
      plannedDate: clock.day(offset),
      durationMin: duration,
      structure: null,
      status: "COMPLETED",
      stageId: null,
      sourceUpdatedAt: null,
    });
    activity(bag, `act_${id}`, userId, id, offset, duration, null);
    bag.logs.push({
      id: `log_${id}`,
      workoutId: id,
      ...symptomLog(rating, Math.round(gh * (duration / 60))),
      ladderEligible: eligible,
      submittedAt: clock.at(offset, 18, 0),
    });
    return `log_${id}`;
  };
  const b1 = run("wrk_bruno_80a", -70, 80, 80, "NONE", true);
  const b2 = run("wrk_bruno_80b", -67, 90, 80, "MILD", true);
  const b3 = run("wrk_bruno_90a", -48, 80, 90, "NONE", true);
  const b4 = run("wrk_bruno_90b", -45, 75, 90, "MILD", true);
  run("wrk_bruno_short", -60, 45, 80, "NONE", false);

  bag.gutPlans.push({
    id: "gut_bruno",
    userId,
    targetKind: "RACE",
    raceId: "race_bruno",
    targetDate: clock.day(-2),
    startGh: 80,
    goalGh: 100,
    defaultGh: 100,
    tooFast: false,
    status: "COMPLETED",
    engineVersion: ENGINE_VERSION,
  });
  bag.steps.push(
    step("stp_bruno_0", "gut_bruno", 0, 80, clock.day(-80), "DONE"),
    step("stp_bruno_1", "gut_bruno", 1, 90, clock.day(-50), "DONE"),
    step("stp_bruno_2", "gut_bruno", 2, 100, clock.day(-40), "DONE"),
  );
  bag.decisions.push(
    decision(
      "dec_bruno_1",
      "gut_bruno",
      "ADVANCE",
      80,
      90,
      [b1, b2],
      "Two symptom-free runs longer than 60 min.",
    ),
    decision(
      "dec_bruno_2",
      "gut_bruno",
      "ADVANCE",
      90,
      100,
      [b3, b4],
      "Above 90 g/h this step is 10 days after the previous one, so at most one step that week.",
    ),
  );
  bag.achievements.push(
    {
      id: "ach_bruno_90",
      userId,
      type: "GH_INCREASE",
      valueGh: 90,
      workoutId: "wrk_bruno_80b",
      achievedAt: clock.at(-67, 12, 0),
      celebratedAt: clock.at(-67, 19, 0),
    },
    {
      id: "ach_bruno_100",
      userId,
      type: "GH_INCREASE",
      valueGh: 100,
      workoutId: "wrk_bruno_90b",
      achievedAt: clock.at(-45, 12, 0),
      celebratedAt: clock.at(-45, 19, 0),
    },
  );
  bag.workouts.push({
    id: "wrk_bruno_sweat",
    userId,
    source: "MANUAL",
    externalId: null,
    sport: "RUNNING",
    kind: "SWEAT_TEST",
    workoutType: "BASE",
    name: "Sweat test",
    plannedStart: clock.at(-20, 8, 0),
    plannedDate: clock.day(-20),
    durationMin: 60,
    structure: null,
    status: "COMPLETED",
    stageId: null,
    sourceUpdatedAt: null,
  });
  bag.sweatTests.push({
    id: "swt_bruno",
    userId,
    workoutId: "wrk_bruno_sweat",
    status: "COMPLETED",
    scheduledFor: clock.day(-20),
    movedFrom: null,
    preWeightKg: 70,
    postWeightKg: 69.4,
    fluidMl: 400,
    urineMl: 0,
    startedAt: clock.at(-20, 8, 0),
    endedAt: clock.at(-20, 9, 0),
    temperatureC: 21,
    humidityPct: 48,
    sweatRateLPerH: sweat,
  });
}

function seedCarla(bag: SeedData): void {
  const clock = bag.clock;
  const userId = "usr_carla";
  const sweat = 0.8;
  bag.users.push({
    id: userId,
    email: "carla@demo.carbadapt.test",
    name: "Carla",
    locale: "EN_US",
    theme: "LIGHT",
    timezone: DEMO_TIMEZONE,
    mode: "FUEL_MY_WORKOUTS",
    briefingTimeLocal: "20:30",
    briefingDayBefore: true,
  });
  bag.subscriptions.push({ userId, status: "BETA_ALL_ACCESS" });
  bag.identities.push({
    id: "idn_carla_strava",
    userId,
    provider: "STRAVA",
    providerUserId: "strava_carla",
    email: "carla@demo.carbadapt.test",
  });
  bag.physical.push({
    userId,
    weightKg: WEIGHT.carla,
    ftpW: 250,
    sweatRateLPerH: sweat,
    sweatRateSource: "estimate",
    ghTolerance: 60,
    maxHr: 190,
    hrZones: ZONES,
    age: 31,
    sex: "female",
    heightCm: 172,
    fieldSources: { ftp: "MANUAL", weight: "MANUAL" },
  });
  bag.connections.push(connection("con_carla_strava", userId, "STRAVA", "CONNECTED", clock));
  bag.products.push(
    product("prd_carla_iso", userId, "DRINK_MIX", "Demo Isotonic Mix", 40, 40, 30, 400, 0, true),
  );
  bag.containers.push(
    container("cnt_carla_iso", userId, "BOTTLE", "Road bottle", "#FF6A3D", 750, "ISOTONIC"),
  );
  bag.calibrations.push({
    id: "cal_carla",
    containerId: "cnt_carla_iso",
    weightsG: [750, 725, 700, 675],
    mlPerSip: 25,
    gPerSqueeze: null,
    validationsLeft: 0,
  });

  bag.races.push({
    id: "race_carla",
    userId,
    name: "Vuelta del Sur",
    date: clock.day(-4),
    startAt: clock.at(-4, 8, 0),
    estimatedDurationMin: 75 + 120 + 180 + 180 + 150 + 90 + 180,
    type: "road_stage",
    distanceKm: 420,
    elevationGainM: 3500,
    carbLoading: "NONE",
    isMultiStage: true,
  });

  const s1Start = clock.at(-4, 8, 0);
  const s2Start = clock.at(-4, 10, 30);
  const s3Start = clock.at(-3, 9, 0);
  const s4Start = clock.at(-3, 15, 0);
  const s5Start = clock.at(-2, 8, 0);
  const s5Arrival = new Date(s5Start.getTime() + 150 * 1.5 * 60_000);
  const s6Start = new Date(s5Arrival.getTime() + 8 * 60 * 60_000);
  const s6Arrival = new Date(s6Start.getTime() + 90 * 60_000);
  const s7Start = clock.at(0, 9, 0);

  const specs = [
    {
      index: 1,
      start: s1Start,
      date: clock.day(-4),
      duration: 75,
      km: 32,
      arrival: new Date(s1Start.getTime() + 75 * 60_000),
      source: "PLATFORM_WEBHOOK" as const,
      done: true,
    },
    {
      index: 2,
      start: s2Start,
      date: clock.day(-4),
      duration: 120,
      km: 48,
      arrival: new Date(s2Start.getTime() + 120 * 60_000),
      source: "PLATFORM_WEBHOOK" as const,
      done: true,
    },
    {
      index: 3,
      start: s3Start,
      date: clock.day(-3),
      duration: 180,
      km: 70,
      arrival: new Date(s3Start.getTime() + 180 * 60_000),
      source: "PLATFORM_WEBHOOK" as const,
      done: true,
    },
    {
      index: 4,
      start: s4Start,
      date: clock.day(-3),
      duration: 180,
      km: 65,
      arrival: new Date(s4Start.getTime() + 180 * 60_000),
      source: "PLATFORM_WEBHOOK" as const,
      done: true,
    },
    {
      index: 5,
      start: s5Start,
      date: clock.day(-2),
      duration: 150,
      km: 55,
      arrival: s5Arrival,
      source: "FALLBACK_TIMER" as const,
      done: true,
    },
    {
      index: 6,
      start: s6Start,
      date: clock.day(-2),
      duration: 90,
      km: 35,
      arrival: s6Arrival,
      source: "PLATFORM_WEBHOOK" as const,
      done: true,
    },
    {
      index: 7,
      start: s7Start,
      date: clock.day(0),
      duration: 180,
      km: 75,
      arrival: null,
      source: null,
      done: false,
    },
  ];
  for (const stage of specs) {
    const id = `stg_carla_${stage.index}`;
    bag.stages.push({
      id,
      raceId: "race_carla",
      index: stage.index,
      date: stage.date,
      startAt: stage.start,
      estimatedDurationMin: stage.duration,
      type: "road_stage",
      distanceKm: stage.km,
      elevationGainM: 400,
      activityId: stage.done && stage.source === "PLATFORM_WEBHOOK" ? `act_${id}` : null,
      arrivalAt: stage.arrival,
      arrivalSource: stage.source,
    });
    bag.aidStations.push(
      aid(`aid_carla_${stage.index}`, "race_carla", id, 20, true, true, stage.index % 2 === 0),
    );
    const workoutId = `wrk_${id}`;
    bag.workouts.push({
      id: workoutId,
      userId,
      source: "MANUAL",
      externalId: null,
      sport: "CYCLING",
      kind: "STANDARD",
      workoutType: "THRESHOLD",
      name: `Stage ${stage.index}`,
      plannedStart: stage.start,
      plannedDate: stage.date,
      durationMin: stage.duration,
      structure: stageBlock(stage.duration),
      status: stage.done ? "COMPLETED" : "PLANNED",
      stageId: id,
      sourceUpdatedAt: null,
    });
    if (stage.done && stage.source === "PLATFORM_WEBHOOK") {
      bag.activities.push({
        id: `act_${id}`,
        userId,
        provider: "STRAVA",
        externalId: `strava_${id}`,
        workoutId,
        startAt: stage.start,
        durationMin: stage.duration,
        dedupeGroup: null,
        summary: null,
      });
    }
    const gh = fixtureFuelingGh(stage.duration);
    addFueling(bag, {
      id: `fp_${id}`,
      workoutId,
      durationMin: stage.duration,
      targetGPerH: gh,
      sweatLPerH: sweat,
      productId: "prd_carla_iso",
      productName: "Demo Isotonic Mix",
      carbsPerServing: 30,
      sodiumPerServing: 400,
      containerId: "cnt_carla_iso",
      containerName: "Road bottle",
    });
  }
  const s4Target = Math.round(fixtureFuelingGh(180) * 3);
  bag.logs.push({
    id: "log_carla_s4",
    workoutId: "wrk_stg_carla_4",
    ...symptomLog("MILD", 150),
    fluidMl: 500,
    countsForPlan: true,
    ladderEligible: false,
    submittedAt: clock.at(-3, 20, 0),
  });

  const window = (gapMin: number) => gapMin - STOP_BEFORE_NEXT_START_MIN;
  addRecovery(bag, {
    id: "rec_carla_1",
    stageId: "stg_carla_1",
    gapCase: "UNDER_4H",
    gapMin: 75,
    weightKg: WEIGHT.carla,
    sensitive: false,
    carbsTargetG: rateCarbs(1, WEIGHT.carla, window(75)),
    proteinTargetG: proteinServingG(WEIGHT.carla),
    sweatLPerH: sweat,
    durationMin: 75,
    fluidDrunkMl: 200,
    liquidsAndGelsOnly: true,
    windowMin: window(75),
    intakeEveryMin: 15,
    guidance: [
      "Gap under 90 min: liquids and gels only (isotonic drink, chocolate milk, gel).",
      "Protein 0.3 g/kg in the first intake.",
    ],
  });
  addRecovery(bag, {
    id: "rec_carla_2",
    stageId: "stg_carla_2",
    gapCase: "OVERNIGHT",
    gapMin: 20 * 60 + 30,
    weightKg: WEIGHT.carla,
    sensitive: false,
    carbsTargetG: perKgCarbs(5, WEIGHT.carla),
    proteinTargetG: null,
    sweatLPerH: sweat,
    durationMin: 120,
    fluidDrunkMl: 400,
    guidance: ["Stage under 2.5 h on the road: overnight carbs at the low end, 5 g/kg."],
  });
  addRecovery(bag, {
    id: "rec_carla_3",
    stageId: "stg_carla_3",
    gapCase: "UNDER_4H",
    gapMin: 180,
    weightKg: WEIGHT.carla,
    sensitive: true,
    carbsTargetG: rateCarbs(0.8, WEIGHT.carla, window(180)),
    proteinTargetG: Math.round(0.3 * WEIGHT.carla * (window(180) / 60)),
    sweatLPerH: sweat,
    durationMin: 180,
    fluidDrunkMl: 500,
    windowMin: window(180),
    intakeEveryMin: 20,
    guidance: [
      "Sensitive stomach is on: 0.8 g/kg/h carbs and 0.3 g/kg/h protein until 30 min before the next start.",
    ],
  });
  addRecovery(bag, {
    id: "rec_carla_4",
    stageId: "stg_carla_4",
    gapCase: "OVERNIGHT",
    gapMin: 14 * 60,
    weightKg: WEIGHT.carla,
    sensitive: false,
    carbsTargetG: perKgCarbs(7, WEIGHT.carla),
    proteinTargetG: null,
    sweatLPerH: sweat,
    durationMin: 180,
    fluidDrunkMl: 500,
    guidance: [
      `In-stage intake was 150 g against a ${s4Target} g target (under 75%), so the overnight target is 6 g/kg plus 1 g/kg.`,
      "Stage duration is inside 2.5–4 h, low end 6 g/kg before that adjustment.",
    ],
  });
  const first4h = rateCarbs(1, WEIGHT.carla, 240);
  const preStart = perKgCarbs(1, WEIGHT.carla);
  addRecovery(bag, {
    id: "rec_carla_5",
    stageId: "stg_carla_5",
    gapCase: "H4_TO_12H",
    gapMin: 480,
    weightKg: WEIGHT.carla,
    sensitive: false,
    carbsTargetG: first4h + preStart,
    proteinTargetG: proteinServingG(WEIGHT.carla) * 2,
    sweatLPerH: sweat,
    durationMin: 150,
    fluidDrunkMl: 400,
    windowMin: 240,
    intakeEveryMin: 20,
    intakeCarbsG: first4h,
    preStartMealCarbsG: preStart,
    guidance: [
      "First 4 h at 1.0 g/kg/h (low end of 1–1.2).",
      "Pre-start meal is 1 g/kg (low end of 1–2), 2–3 h before the start.",
      "Protein 0.3 g/kg in the first hour and again in a meal at least 3 h before the start.",
      "Normal meals in the middle are named in the guidance only. Their grams are not specified, so they are not added on top.",
      "Arrival for this stage is the fallback timer: start plus estimated duration × 1.5. There is no activity webhook.",
    ],
  });
  addRecovery(bag, {
    id: "rec_carla_6",
    stageId: "stg_carla_6",
    gapCase: "REST_DAY",
    gapMin: 35 * 60 + 45,
    weightKg: WEIGHT.carla,
    sensitive: false,
    carbsTargetG: perKgCarbs(5, WEIGHT.carla),
    proteinTargetG: null,
    sweatLPerH: sweat,
    durationMin: 90,
    fluidDrunkMl: 300,
    guidance: [
      "Rest day inside the race. Overnight plan at the lowest band for a stage under 2.5 h: 5 g/kg.",
    ],
  });
}

function seedEli(bag: SeedData): void {
  const clock = bag.clock;
  const userId = "usr_eli";
  bag.users.push({
    id: userId,
    email: "eli@demo.carbadapt.test",
    name: "Eli",
    locale: "EN_US",
    theme: "SYSTEM",
    timezone: DEMO_TIMEZONE,
    mode: "FUEL_MY_WORKOUTS",
    briefingTimeLocal: "19:00",
    briefingDayBefore: false,
  });
  bag.subscriptions.push({ userId, status: "BETA_ALL_ACCESS" });
  bag.identities.push({
    id: "idn_eli_tp",
    userId,
    provider: "TRAININGPEAKS",
    providerUserId: "tp_eli",
    email: "eli@demo.carbadapt.test",
  });
  bag.physical.push({
    userId,
    weightKg: WEIGHT.eli,
    ftpW: 250,
    sweatRateLPerH: null,
    sweatRateSource: null,
    ghTolerance: 50,
    maxHr: 186,
    hrZones: ZONES,
    age: 29,
    sex: "female",
    heightCm: 168,
    fieldSources: { ftp: "MANUAL", weight: "MANUAL", hrZones: "MANUAL" },
  });
  bag.conflicts.push({
    id: "cfl_eli_ftp",
    userId,
    field: "ftp",
    manualValue: 250,
    syncedValue: 270,
    provider: "TRAININGPEAKS",
    resolvedWith: null,
    resolvedAt: null,
  });
  bag.connections.push(connection("con_eli_tp", userId, "TRAININGPEAKS", "REVOKED", clock));
  bag.containers.push(
    container("cnt_eli_blue", userId, "BOTTLE", "Blue bottle", "#2B3A55", 650, "WATER"),
    container("cnt_eli_green", userId, "BOTTLE", "Green bottle", "#101A2B", 650, "WATER"),
    container("cnt_eli_yellow", userId, "BOTTLE", "Yellow bottle", "#FF6A3D", 500, "ISOTONIC"),
  );
  bag.calibrations.push(
    {
      id: "cal_eli_green",
      containerId: "cnt_eli_green",
      weightsG: [650, 632, 614, 596],
      mlPerSip: 18,
      gPerSqueeze: null,
      validationsLeft: 2,
    },
    {
      id: "cal_eli_yellow",
      containerId: "cnt_eli_yellow",
      weightsG: [500, 485, 470, 455],
      mlPerSip: 15,
      gPerSqueeze: null,
      validationsLeft: 0,
    },
  );
  bag.products.push(product("prd_eli_gel", userId, "GEL", "Demo Gel", 40, null, 22, 40, 0, true));

  bag.races.push(
    race(
      "race_eli_half",
      userId,
      "City Half Marathon",
      20,
      clock.at(20, 8, 30),
      100,
      "half_marathon",
      21.1,
      120,
      "NONE",
      false,
      clock,
    ),
    race(
      "race_eli_25",
      userId,
      "Regional 25 km",
      27,
      clock.at(27, 9, 0),
      120,
      "road_race",
      25,
      180,
      "TWO_DAY",
      false,
      clock,
    ),
  );
  addLoadingDay(bag, {
    id: "ld_eli_d2",
    raceId: "race_eli_25",
    day: "D_MINUS_2",
    dayOffset: 25,
    gPerKg: 5,
    weightKg: WEIGHT.eli,
    guidance: ["90 min to 2.5 h band, low end: D-2 is 5 g/kg."],
  });
  addLoadingDay(bag, {
    id: "ld_eli_d1",
    raceId: "race_eli_25",
    day: "D_MINUS_1",
    dayOffset: 26,
    gPerKg: 7,
    weightKg: WEIGHT.eli,
    guidance: ["90 min to 2.5 h band, low end: D-1 is 7 g/kg."],
  });

  bag.gutPlans.push({
    id: "gut_eli",
    userId,
    targetKind: "DATE",
    raceId: null,
    targetDate: clock.day(56),
    startGh: 50,
    goalGh: 70,
    defaultGh: 70,
    tooFast: false,
    status: "ACTIVE",
    engineVersion: ENGINE_VERSION,
  });
  bag.steps.push(
    step("stp_eli_0", "gut_eli", 0, 50, clock.day(-14), "DONE"),
    step("stp_eli_1", "gut_eli", 1, 60, clock.day(0), "CURRENT"),
    step("stp_eli_2", "gut_eli", 2, 70, clock.day(21), "UPCOMING"),
  );

  bag.workouts.push(
    {
      id: "wrk_eli_today",
      userId,
      source: "MANUAL",
      externalId: null,
      sport: "RUNNING",
      kind: "STANDARD",
      workoutType: "BASE",
      name: "Easy run",
      plannedStart: clock.at(0, 7, 30),
      plannedDate: clock.day(0),
      durationMin: 70,
      structure: null,
      status: "PLANNED",
      stageId: null,
      sourceUpdatedAt: null,
    },
    {
      id: "wrk_eli_feedback",
      userId,
      source: "STRAVA",
      externalId: "wrk_eli_feedback",
      sport: "RUNNING",
      kind: "STANDARD",
      workoutType: "BASE",
      name: "Yesterday's run",
      plannedStart: clock.at(-1, 7, 0),
      plannedDate: clock.day(-1),
      durationMin: 50,
      structure: null,
      status: "COMPLETED",
      stageId: null,
      sourceUpdatedAt: null,
    },
    {
      id: "wrk_eli_intake",
      userId,
      source: "STRAVA",
      externalId: "wrk_eli_intake",
      sport: "RUNNING",
      kind: "STANDARD",
      workoutType: "BASE",
      name: "Add intake",
      plannedStart: clock.at(-3, 7, 0),
      plannedDate: clock.day(-3),
      durationMin: 80,
      structure: null,
      status: "COMPLETED",
      stageId: null,
      sourceUpdatedAt: null,
    },
    {
      id: "wrk_eli_sip",
      userId,
      source: "STRAVA",
      externalId: "wrk_eli_sip",
      sport: "RUNNING",
      kind: "STANDARD",
      workoutType: "RECOVERY",
      name: "Sip check",
      plannedStart: clock.at(-6, 7, 30),
      plannedDate: clock.day(-6),
      durationMin: 40,
      structure: null,
      status: "COMPLETED",
      stageId: null,
      sourceUpdatedAt: null,
    },
    {
      id: "wrk_eli_sweat",
      userId,
      source: "MANUAL",
      externalId: null,
      sport: "RUNNING",
      kind: "SWEAT_TEST",
      workoutType: "BASE",
      name: "Sweat test",
      plannedStart: clock.at(-1, 18, 0),
      plannedDate: clock.day(-1),
      durationMin: 60,
      structure: null,
      status: "COMPLETED",
      stageId: null,
      sourceUpdatedAt: null,
    },
  );
  activity(bag, "act_eli_feedback", userId, "wrk_eli_feedback", -1, 50, null);
  activity(bag, "act_eli_intake", userId, "wrk_eli_intake", -3, 80, null);
  activity(bag, "act_eli_sip", userId, "wrk_eli_sip", -6, 40, null);
  addFueling(bag, {
    id: "fp_eli_today",
    workoutId: "wrk_eli_today",
    durationMin: 70,
    targetGPerH: fixtureFuelingGh(70),
    sweatLPerH: 0,
    productId: "prd_eli_gel",
    productName: "Demo Gel",
    carbsPerServing: 22,
    sodiumPerServing: 40,
  });
  bag.logs.push({
    id: "log_eli_sip",
    workoutId: "wrk_eli_sip",
    ...symptomLog("NONE", 20),
    ladderEligible: false,
    containerWeighIns: { calibrationId: "cal_eli_yellow", weightsG: [500, 482, 464] },
    sipProposal: {
      calibrationId: "cal_eli_yellow",
      currentMlPerSip: 15,
      proposedMlPerSip: 18,
      status: "pending",
    },
    submittedAt: clock.at(-6, 9, 0),
  });
  bag.sweatTests.push({
    id: "swt_eli",
    userId,
    workoutId: "wrk_eli_sweat",
    status: "AWAITING_DATA",
    scheduledFor: clock.day(-1),
    movedFrom: null,
    preWeightKg: 60,
    postWeightKg: null,
    fluidMl: 250,
    urineMl: null,
    startedAt: clock.at(-1, 18, 0),
    endedAt: clock.at(-1, 19, 0),
    temperatureC: 19,
    humidityPct: 62,
    sweatRateLPerH: null,
  });
  bag.todos.push(
    todo("todo_eli_cal", userId, "SIP_CALIBRATION", "CALIBRATION", "Container", "cnt_eli_blue"),
    todo(
      "todo_eli_val",
      userId,
      "SIP_VALIDATION",
      "CALIBRATION",
      "ContainerCalibration",
      "cal_eli_green",
    ),
    todo(
      "todo_eli_conflict",
      userId,
      "DATA_CONFLICT",
      "HIGHEST",
      "PhysicalDataConflict",
      "cfl_eli_ftp",
    ),
    todo(
      "todo_eli_feedback",
      userId,
      "LAST_SESSION_FEEDBACK",
      "HIGHEST",
      "Workout",
      "wrk_eli_feedback",
    ),
  );
}

function seedDani(bag: SeedData): void {
  const clock = bag.clock;
  const userId = "usr_dani";
  bag.users.push({
    id: userId,
    email: "dani@demo.carbadapt.test",
    name: "Dani",
    locale: "EN_US",
    theme: "SYSTEM",
    timezone: DEMO_TIMEZONE,
    mode: null,
    briefingTimeLocal: null,
    briefingDayBefore: true,
  });
  bag.subscriptions.push({ userId, status: "BETA_ALL_ACCESS" });
  bag.physical.push({
    userId,
    weightKg: WEIGHT.dani,
    ftpW: null,
    sweatRateLPerH: null,
    sweatRateSource: null,
    ghTolerance: null,
    maxHr: null,
    hrZones: null,
    age: null,
    sex: null,
    heightCm: null,
    fieldSources: { weight: "MANUAL" },
  });
  bag.onboarding.push({
    id: "onb_dani",
    userId,
    anonId: "anon_dani",
    answers: { sport: "cycling", experience: "new", goal: "learn fueling" },
  });
  bag.products.push(
    product("prd_dani_gel", userId, "GEL", "Demo Gel", 40, null, 22, 40, 0, false),
    product("prd_dani_drink", userId, "DRINK_MIX", "Demo Drink Mix", 30, 30, 30, 200, 0, true),
    product("prd_dani_bar", userId, "SOLID", "Demo Bar", 40, null, 25, 50, 0, false),
  );
  const recent = [
    [-2, 90],
    [-5, 120],
    [-9, 75],
    [-12, 150],
    [-16, 45],
  ] as const;
  for (const [offset, duration] of recent) {
    const id = `wrk_dani_${offset}`;
    bag.workouts.push({
      id,
      userId,
      source: "STRAVA",
      externalId: id,
      sport: "CYCLING",
      kind: "STANDARD",
      workoutType: "BASE",
      name: "Recent ride",
      plannedStart: clock.at(offset, 18, 0),
      plannedDate: clock.day(offset),
      durationMin: duration,
      structure: null,
      status: "COMPLETED",
      stageId: null,
      sourceUpdatedAt: null,
    });
    activity(
      bag,
      `act_${id}`,
      userId,
      id,
      offset,
      duration,
      { note: "Fixture platform workout for Estimate my g/h. Dani has no live connection." },
      18,
    );
  }
  bag.todos.push(
    todo("todo_dani_profile", userId, "COMPLETE_PROFILE", "LOWER", "PhysicalData", userId),
    todo("todo_dani_calendar", userId, "CONNECT_CALENDAR", "LOWER", null, null),
    todo("todo_dani_bottle", userId, "ADD_BOTTLE", "LOWER", null, null),
    todo("todo_dani_race", userId, "ADD_RACE", "LOWER", null, null),
    todo("todo_dani_estimate", userId, "ESTIMATE_GH", "HIGHEST", null, null),
    todo("todo_dani_sweat", userId, "SWEAT_TEST", "CALIBRATION", null, null),
  );
}

function fuel(
  id: string,
  workoutId: string,
  durationMin: number,
  targetGPerH: number,
  sweat: number,
) {
  return {
    id,
    workoutId,
    durationMin,
    targetGPerH,
    sweatLPerH: sweat,
    productId: "prd_ana_iso",
    productName: "Demo Isotonic Mix",
    carbsPerServing: 30,
    sodiumPerServing: 400,
    containerId: "cnt_ana_iso",
    containerName: "Glucose bottle",
  };
}

/** A long ride is one steady block, not a warm-up / main set / cool-down split. */
function longRideBlock(durationMin: number) {
  return [{ name: "Long ride", durationMin, zone: "Z2" }];
}

/** A race stage is one effort. A warm-up split is not a stage. */
function stageBlock(durationMin: number) {
  return [{ name: "Stage", durationMin, zone: null }];
}

function connection(
  id: string,
  userId: string,
  provider: string,
  status: string,
  clock: SeedData["clock"],
) {
  return {
    id,
    userId,
    provider,
    externalUserId: `${provider.toLowerCase()}_${userId}`,
    accessTokenEnc: "fixture-not-a-real-token",
    refreshTokenEnc: null,
    expiresAt: null,
    scopes: null,
    status,
    webhookSubscriptionId: null,
    lastSyncAt: status === "CONNECTED" ? clock.at(-1, 6, 0) : null,
  };
}

function container(
  id: string,
  userId: string,
  type: string,
  name: string,
  colorHex: string,
  capacityMl: number,
  usualContent: string,
) {
  return { id, userId, type, name, colorHex, capacityMl, usualContent };
}

function product(
  id: string,
  userId: string,
  type: string,
  name: string,
  servingG: number,
  scoopG: number | null,
  carbsG: number,
  sodiumMg: number,
  caffeineMg: number,
  favorite: boolean,
) {
  return {
    id,
    userId,
    type,
    name,
    brand: "CarbAdapt Demo",
    servingG,
    scoopG,
    carbsG,
    sodiumMg,
    caffeineMg,
    label: DEMO_LABEL,
    favorite,
    source: "MANUAL",
    deletedAt: null,
  };
}

function race(
  id: string,
  userId: string,
  name: string,
  offset: number,
  startAt: Date,
  estimatedDurationMin: number,
  type: string,
  distanceKm: number,
  elevationGainM: number,
  carbLoading: string,
  isMultiStage: boolean,
  clock: SeedData["clock"],
) {
  return {
    id,
    userId,
    name,
    date: clock.day(offset),
    startAt,
    estimatedDurationMin,
    type,
    distanceKm,
    elevationGainM,
    carbLoading,
    isMultiStage,
  };
}

function aid(
  id: string,
  raceId: string,
  stageId: string | null,
  kmMark: number,
  hasWater: boolean,
  hasIsotonic: boolean,
  hasGels: boolean,
) {
  return { id, raceId, stageId, kmMark, hasWater, hasIsotonic, hasGels };
}

function activity(
  bag: SeedData,
  id: string,
  userId: string,
  workoutId: string,
  offset: number,
  durationMin: number,
  summary: Record<string, unknown> | null,
  hour = 8,
) {
  bag.activities.push({
    id,
    userId,
    provider: "STRAVA",
    externalId: id,
    workoutId,
    startAt: bag.clock.at(offset, hour, 0),
    durationMin,
    dedupeGroup: null,
    summary,
  });
}

function step(
  id: string,
  planId: string,
  index: number,
  gh: number,
  approxDate: Date,
  status: string,
) {
  return { id, planId, index, gh, approxDate, status };
}

function decision(
  id: string,
  planId: string,
  outcome: string,
  fromGh: number,
  toGh: number,
  inputLogIds: string[],
  reason: string,
) {
  return { id, planId, outcome, fromGh, toGh, inputLogIds, reason, engineVersion: ENGINE_VERSION };
}

function todo(
  id: string,
  userId: string,
  type: string,
  tier: string,
  refType: string | null,
  refId: string | null,
) {
  return {
    id,
    userId,
    type,
    tier,
    refType,
    refId,
    payload: { titleKey: `todo.${type}` },
    status: "OPEN",
    closedAt: null,
  };
}

function sameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}
