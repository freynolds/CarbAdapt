import { DEMO_LABEL, addFueling, addLoadingDay, symptomLog, type SeedData } from "./bag.js";
import { ENGINE_VERSION, fixtureFuelingGh, sweatRateLPerH } from "./domain.js";
import { DEMO_TIMEZONE } from "./clock.js";

export const WEIGHT = { ana: 64 };
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
      carryList: {
        note: "Hand-made option. None is chosen. Needs for a 5 h race at the current step exceed the three containers.",
        items: [
          { productId: "prd_ana_iso", name: "Demo Isotonic Mix" },
          { productId: "prd_ana_gel", name: "Demo Gel" },
        ],
      },
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
      structure: type === "BASE" && duration >= 150 ? blocks(duration) : null,
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

function blocks(durationMin: number) {
  const warm = Math.min(20, Math.round(durationMin * 0.15));
  const cool = Math.min(15, Math.round(durationMin * 0.1));
  return [
    { name: "Warm-up", durationMin: warm, zone: "Z2" },
    { name: "Main set", durationMin: Math.max(1, durationMin - warm - cool), zone: "Z2" },
    { name: "Cool-down", durationMin: cool, zone: "Z1" },
  ];
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
