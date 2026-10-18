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
  const servings = Math.max(1, Math.ceil(totalCarbsG / input.carbsPerServing));
  const carryCarbsG = servings * input.carbsPerServing;
  const totalSodiumMg = servings * input.sodiumPerServing;
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
      note: "Whole servings round the carry list up to the next serving. Fluid replaces sweat 1:1 for this fixture only; that is not an ACSM during-exercise prescription.",
      items: [
        {
          containerId: input.containerId ?? null,
          containerName: input.containerName ?? null,
          productId: input.productId,
          name: input.productName,
          servings,
          carbsPerServing: input.carbsPerServing,
          carryCarbsG,
          sodiumMg: totalSodiumMg,
        },
      ],
    },
  });
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
      replacement: "125% of the deficit (low end of 125–150%). Deficit is not carried to the next stage.",
      sodiumMgPerL: 1150,
      drinkSodiumMgPerL: DEMO_ISOTONIC_SODIUM_MG_PER_L,
      remainderFrom: "broth or salty food",
    },
  };
  if (input.windowMin && input.intakeEveryMin) {
    const offsets: number[] = [];
    for (let minute = 0; minute < input.windowMin; minute += input.intakeEveryMin) offsets.push(minute);
    const intakeCarbs = input.intakeCarbsG ?? input.carbsTargetG;
    const base = Math.floor(intakeCarbs / offsets.length);
    const extra = intakeCarbs - base * offsets.length;
    const proteinTotal = input.proteinTargetG ?? 0;
    const proteinBase = input.sensitive ? Math.floor(proteinTotal / offsets.length) : 0;
    const proteinExtra = input.sensitive ? proteinTotal - proteinBase * offsets.length : proteinTotal;
    meals.intakes = offsets.map((offsetMin, index) => ({
      offsetMin,
      carbsG: base + (index === 0 ? extra : 0),
      proteinG: input.sensitive ? proteinBase + (index === 0 ? proteinExtra : 0) : index === 0 ? proteinExtra : 0,
      form: input.liquidsAndGelsOnly ? "liquid or gel" : "liquid, gel, or low-fat low-fiber food",
    }));
    if (input.preStartMealCarbsG) {
      meals.preStartMeal = {
        carbsG: input.preStartMealCarbsG,
        timing: "2–3 h before the next start",
        exampleFoods: EXAMPLE_FOODS_PLACEHOLDER,
      };
    }
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
