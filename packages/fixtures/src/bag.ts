import {
  fuelingPlan,
  type EngineSport,
  type FuelContainer,
  type FuelProduct,
} from "@carbadapt/engine";
import type { Clock } from "./clock.js";
import {
  ENGINE_VERSION,
  EXAMPLE_FOODS_PLACEHOLDER,
  FODMAP_NOTE,
  FIXTURE_WEATHER,
  hydration,
  loadingTargetG,
  proteinServingG,
  rateCarbs,
  splitMeals,
} from "./domain.js";
import { FODMAP_EXAMPLE_IDS, foodById, gramsForCarbs } from "./foods.js";

export { ENGINE_VERSION };

export const FIXTURE_WEATHER_SNAPSHOT = FIXTURE_WEATHER;

export const DEMO_LABEL = {
  illustrative: true,
  note: "Demo library entry for the mock phase. Not a transcribed commercial nutrition label.",
};

/** 400 mg sodium in 500 ml prepared = 800 mg/L. Inside the ACSM 460–1150 mg/L pre-race range. */
export const DEMO_ISOTONIC_SODIUM_MG_PER_L = 800;

export type SeedData = {
  clock: Clock;
  users: Record<string, unknown>[];
  identities: Record<string, unknown>[];
  physical: Record<string, unknown>[];
  conflicts: Record<string, unknown>[];
  connections: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  onboarding: Record<string, unknown>[];
  containers: Record<string, unknown>[];
  calibrations: Record<string, unknown>[];
  products: Record<string, unknown>[];
  races: Record<string, unknown>[];
  stages: Record<string, unknown>[];
  aidStations: Record<string, unknown>[];
  strategies: Record<string, unknown>[];
  loadingDays: Record<string, unknown>[];
  rehearsals: Record<string, unknown>[];
  workouts: Record<string, unknown>[];
  activities: Record<string, unknown>[];
  fuelingPlans: Record<string, unknown>[];
  logs: Record<string, unknown>[];
  sweatTests: Record<string, unknown>[];
  gutPlans: Record<string, unknown>[];
  steps: Record<string, unknown>[];
  decisions: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  recoveries: Record<string, unknown>[];
  todos: Record<string, unknown>[];
};

export function createBag(clock: Clock): SeedData {
  return {
    clock,
    users: [],
    identities: [],
    physical: [],
    conflicts: [],
    connections: [],
    subscriptions: [],
    onboarding: [],
    containers: [],
    calibrations: [],
    products: [],
    races: [],
    stages: [],
    aidStations: [],
    strategies: [],
    loadingDays: [],
    rehearsals: [],
    workouts: [],
    activities: [],
    fuelingPlans: [],
    logs: [],
    sweatTests: [],
    gutPlans: [],
    steps: [],
    decisions: [],
    achievements: [],
    recoveries: [],
    todos: [],
  };
}

export function addFueling(
  bag: SeedData,
  input: {
    id: string;
    workoutId: string;
    durationMin: number;
    targetGPerH: number;
    sweatLPerH: number;
    productId: string;
    productName: string;
    carbsPerServing: number;
    sodiumPerServing: number;
    containerId?: string;
    containerName?: string;
  },
): void {
  const hours = input.durationMin / 60;
  const totalCarbsG = Math.round(input.targetGPerH * hours);
  const totalFluidMl = Math.round(input.sweatLPerH * hours * 1000);
  const workout = bag.workouts.find((row) => row.id === input.workoutId);
  const userId = typeof workout?.userId === "string" ? workout.userId : "";
  const user = bag.users.find((row) => row.id === userId);
  const stageId = workout?.stageId;
  const mode =
    stageId != null
      ? "FUEL_MY_WORKOUTS"
      : user?.mode === "GUT_TRAINING"
        ? "GUT_TRAINING"
        : "FUEL_MY_WORKOUTS";
  const sport = (typeof workout?.sport === "string" ? workout.sport : "CYCLING") as EngineSport;
  const { products, containers } = athleteGear(bag, userId);
  const planned = fuelingPlan({
    durationMin: input.durationMin,
    sport,
    mode,
    currentStepGh: mode === "GUT_TRAINING" ? input.targetGPerH : null,
    chosenGPerH: mode === "FUEL_MY_WORKOUTS" ? input.targetGPerH : null,
    sweatRateLPerH: input.sweatLPerH,
    products,
    containers,
  });
  const totalSodiumMg = planned.totalSodiumMg;
  const every = 20;
  const slots = Math.max(1, Math.floor(input.durationMin / every));
  const base = Math.floor(totalCarbsG / slots);
  let remainder = totalCarbsG - base * slots;
  const schedule = Array.from({ length: slots }, (_, index) => {
    const carbsG = base + (index === 0 ? remainder : 0);
    remainder = index === 0 ? 0 : remainder;
    return {
      offsetMin: index * every,
      kind: "isotonic",
      productId: input.productId,
      carbsG,
    };
  });
  bag.fuelingPlans.push({
    id: input.id,
    workoutId: input.workoutId,
    engineVersion: ENGINE_VERSION,
    targetGPerH: input.targetGPerH,
    totalCarbsG,
    totalFluidMl,
    totalSodiumMg,
    userAdjusted: false,
    isCurrent: true,
    weather: FIXTURE_WEATHER,
    schedule,
    carryList: {
      items: planned.items,
      carbStatus: planned.carbStatus,
      fluidStatus: planned.fluidStatus,
      sodiumStatus: planned.sodiumStatus,
      scheduleStatus: planned.scheduleStatus,
      targetBandGPerH: planned.band,
      drinkMixGPerMl: planned.drinkMixGPerMl,
    },
  });
}

const CONTENT_ORDER = { WATER: 0, ISOTONIC: 1, GEL_CONCENTRATE: 2 } as const;

/** Favorites come first so the engine packs the athlete's chosen product of each type. */
function athleteGear(bag: SeedData, userId: string): { products: FuelProduct[]; containers: FuelContainer[] } {
  const products: FuelProduct[] = bag.products
    .filter((row) => row.userId === userId && row.deletedAt == null)
    .sort((left, right) => Number(right.favorite === true) - Number(left.favorite === true))
    .flatMap((row) => {
      const type = row.type;
      if (type !== "DRINK_MIX" && type !== "GEL" && type !== "SOLID") return [];
      return [
        {
          id: String(row.id),
          type,
          name: String(row.name),
          carbsG: Number(row.carbsG),
          sodiumMg: row.sodiumMg == null ? null : Number(row.sodiumMg),
          scoopG: row.scoopG == null ? null : Number(row.scoopG),
        },
      ];
    });
  const containers: FuelContainer[] = bag.containers.flatMap((row) => {
    if (row.userId !== userId) return [];
    const usual = row.usualContent;
    if (usual !== "WATER" && usual !== "ISOTONIC" && usual !== "GEL_CONCENTRATE") return [];
    return [
      {
        id: String(row.id),
        name: String(row.name),
        capacityMl: Number(row.capacityMl),
        usualContent: usual,
      },
    ];
  });
  containers.sort((left, right) => CONTENT_ORDER[left.usualContent] - CONTENT_ORDER[right.usualContent]);
  return { products, containers };
}

/** Race strategy is fuel mode. A single g/h inside the band stays unset. */
export function raceStrategyCarry(
  bag: SeedData,
  userId: string,
  input: { durationMin: number; sport: EngineSport; sweatLPerH: number | null },
) {
  const { products, containers } = athleteGear(bag, userId);
  const planned = fuelingPlan({
    durationMin: input.durationMin,
    sport: input.sport,
    mode: "FUEL_MY_WORKOUTS",
    currentStepGh: null,
    chosenGPerH: null,
    sweatRateLPerH: input.sweatLPerH,
    products,
    containers,
  });
  return {
    items: planned.items,
    carbStatus: planned.carbStatus,
    fluidStatus: planned.fluidStatus,
    sodiumStatus: planned.sodiumStatus,
    scheduleStatus: planned.scheduleStatus,
    targetBandGPerH: planned.band,
    drinkMixGPerMl: planned.drinkMixGPerMl,
  };
}

export function loadingMeals(totalCarbsG: number, guidance: string[]) {
  return {
    exampleFoods: EXAMPLE_FOODS_PLACEHOLDER,
    fodmapNote: FODMAP_NOTE,
    guidance,
    meals: splitMeals(totalCarbsG).map((meal, index) => {
      const foodId = FODMAP_EXAMPLE_IDS[index % FODMAP_EXAMPLE_IDS.length] ?? FODMAP_EXAMPLE_IDS[0];
      const food = foodById(foodId);
      return {
        name: meal.label,
        carbsG: meal.carbsG,
        exampleFoods: EXAMPLE_FOODS_PLACEHOLDER,
        example: {
          foodItemId: food.id,
          fdcId: food.fdcId,
          name: food.name,
          fodmap: food.fodmap,
          portionG: gramsForCarbs(food.id, meal.carbsG),
          note: "Portion grams are meal carbs divided by this food's USDA carbohydrate per 100 g. Not a prescribed menu.",
        },
      };
    }),
    exampleFoodList: FODMAP_EXAMPLE_IDS.map((id) => {
      const food = foodById(id);
      return { foodItemId: food.id, fdcId: food.fdcId, name: food.name, fodmap: food.fodmap };
    }),
  };
}

export function addLoadingDay(
  bag: SeedData,
  input: {
    id: string;
    raceId: string;
    day: "D_MINUS_2" | "D_MINUS_1";
    dayOffset: number;
    gPerKg: number;
    weightKg: number;
    guidance: string[];
  },
): void {
  const targetCarbsG = loadingTargetG(input.gPerKg, input.weightKg);
  bag.loadingDays.push({
    id: input.id,
    raceId: input.raceId,
    day: input.day,
    date: bag.clock.day(input.dayOffset),
    gPerKg: input.gPerKg,
    targetCarbsG,
    isRehearsal: false,
    meals: loadingMeals(targetCarbsG, input.guidance),
  });
}

export function addRecovery(
  bag: SeedData,
  input: {
    id: string;
    stageId: string;
    gapCase: "UNDER_4H" | "H4_TO_12H" | "OVERNIGHT" | "REST_DAY";
    gapMin: number;
    weightKg: number;
    sensitive: boolean;
    carbsTargetG: number;
    proteinTargetG: number | null;
    sweatLPerH: number;
    durationMin: number;
    fluidDrunkMl: number;
    guidance: string[];
    liquidsAndGelsOnly?: boolean;
    windowMin?: number;
    intakeEveryMin?: number;
    /** When set, timed intakes sum to this figure and the rest of carbsTargetG is the pre-start meal. */
    intakeCarbsG?: number;
    preStartMealCarbsG?: number;
  },
): void {
  const hydro = hydration({
    sweatLPerH: input.sweatLPerH,
    durationMin: input.durationMin,
    fluidDrunkMl: input.fluidDrunkMl,
    drinkSodiumMgPerL: DEMO_ISOTONIC_SODIUM_MG_PER_L,
  });
  const meals: Record<string, unknown> = {
    exampleFoods: EXAMPLE_FOODS_PLACEHOLDER,
    fodmapNote: FODMAP_NOTE,
    guidance: input.guidance,
    liquidsAndGelsOnly: input.liquidsAndGelsOnly ?? false,
    hydration: {
      ...hydro,
      replacement:
        "125% of the deficit (low end of 125–150%). Deficit is not carried to the next stage.",
      sodiumMgPerL: 1150,
      drinkSodiumMgPerL: DEMO_ISOTONIC_SODIUM_MG_PER_L,
      remainderFrom: "broth or salty food",
    },
  };
  if (input.gapCase === "UNDER_4H") {
    meals.occasions = [
      {
        key: "middle",
        offsetMin: Math.round(input.gapMin / 2),
        carbsG: input.carbsTargetG,
        proteinG: input.proteinTargetG,
        form: input.liquidsAndGelsOnly ? "drink" : "snack",
      },
    ];
  } else if (input.gapCase === "H4_TO_12H") {
    const occasions: Record<string, unknown>[] = [
      {
        key: "first",
        offsetMin: null,
        carbsG: input.intakeCarbsG ?? null,
        proteinG: input.proteinTargetG,
        form: "meal",
      },
    ];
    if (input.preStartMealCarbsG) {
      occasions.push({
        key: "pre_start",
        offsetMin: null,
        carbsG: input.preStartMealCarbsG,
        proteinG: null,
        form: "meal",
      });
    }
    meals.occasions = occasions;
    meals.mealSplit = "not_set";
  } else {
    meals.meals = splitMeals(input.carbsTargetG).map((meal) => ({
      name: meal.label,
      carbsG: meal.carbsG,
      proteinG: null,
      exampleFoods: EXAMPLE_FOODS_PLACEHOLDER,
      example: {
        foodItemId: foodById(1).id,
        fdcId: foodById(1).fdcId,
        portionG: gramsForCarbs(1, meal.carbsG),
      },
    }));
    meals.proteinNote =
      "0.3 g/kg per serving is the stated serving size. The spec does not fix how many overnight servings to schedule, so no daily protein total is stored.";
  }
  bag.recoveries.push({
    id: input.id,
    stageId: input.stageId,
    gapCase: input.gapCase,
    gapMin: input.gapMin,
    carbsTargetG: input.carbsTargetG,
    proteinTargetG: input.proteinTargetG,
    fluidTargetMl: hydro.fluidTargetMl,
    sodiumTargetMg: hydro.sodiumTargetMg,
    sensitiveStomach: input.sensitive,
    engineVersion: ENGINE_VERSION,
    meals,
  });
}

export function symptomLog(
  rating: "NONE" | "MILD" | "MODERATE" | "SEVERE",
  intakeCarbsG: number,
): Record<string, unknown> {
  return {
    intakeCarbsG,
    symptomUpper: rating,
    symptomLower: rating,
    symptomSystemic: rating,
    countsForPlan: true,
    ladderEligible: true,
  };
}

export { proteinServingG, rateCarbs };
