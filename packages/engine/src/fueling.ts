import { hours, round2, roundInt } from "./numbers.js";
import { NOT_SET, type SetStatus } from "./tbd.js";

export type EngineSport = "CYCLING" | "RUNNING" | "TRAIL_RUNNING" | "OTHER";

export type CarbBand = {
  minGPerH: number | null;
  maxGPerH: number | null;
  mouthRinse: boolean;
  none: boolean;
  specified: boolean;
};

/**
 * Master Plan §7.1 duration rows.
 * The published rows overlap at 75, 150, and 240 minutes. The shorter row
 * keeps the shared boundary: 75 stays in 45–75, 150 stays in 1–2.5 h,
 * and 240 stays in 2.5–4 h. Triathlon rows are not applied: Sport has no
 * triathlon value.
 */
export function carbBand(durationMin: number, sport: EngineSport): CarbBand {
  const unspecified = (): CarbBand => ({
    minGPerH: null,
    maxGPerH: null,
    mouthRinse: false,
    none: false,
    specified: false,
  });
  if (sport === "OTHER") return unspecified();
  if (durationMin < 45) {
    if (sport === "TRAIL_RUNNING") return unspecified();
    return { minGPerH: null, maxGPerH: null, mouthRinse: false, none: true, specified: true };
  }
  if (durationMin <= 75) {
    if (sport === "TRAIL_RUNNING") return unspecified();
    return { minGPerH: null, maxGPerH: null, mouthRinse: true, none: false, specified: true };
  }
  if (durationMin <= 150) {
    return { minGPerH: 30, maxGPerH: 60, mouthRinse: false, none: false, specified: true };
  }
  if (durationMin <= 240) {
    return { minGPerH: 60, maxGPerH: 90, mouthRinse: false, none: false, specified: true };
  }
  if (sport === "RUNNING") return unspecified();
  return { minGPerH: 90, maxGPerH: 120, mouthRinse: false, none: false, specified: true };
}

export type FuelProduct = {
  id: string;
  type: "DRINK_MIX" | "GEL" | "SOLID";
  name: string;
  carbsG: number;
  sodiumMg: number | null;
};

export type FuelContainer = {
  id: string;
  name: string;
  capacityMl: number;
  usualContent: "WATER" | "ISOTONIC" | "GEL_CONCENTRATE";
};

export type CarryItem = {
  name: string;
  containerName: string | null;
  containerId: string | null;
  productId: string | null;
  servings: number | null;
  carryCarbsG: number | null;
  sodiumMg: number | null;
};

export type FuelingResult = {
  targetGPerH: number | null;
  band: CarbBand;
  totalCarbsG: number;
  totalFluidMl: number;
  totalSodiumMg: number;
  carbStatus: SetStatus;
  fluidStatus: SetStatus;
  sodiumStatus: SetStatus;
  scheduleStatus: SetStatus;
  schedule: [];
  items: CarryItem[];
  /** Gut-training drink mix uses the cited ~10% w/v only. Fuel mode does not. */
  drinkMixGPerMl: number | null;
};

const GUT_DRINK_G_PER_ML = 0.1;

export function fuelingPlan(input: {
  durationMin: number | null;
  sport: EngineSport;
  mode: "FUEL_MY_WORKOUTS" | "GUT_TRAINING" | null;
  /** Current ladder step. Gut-training dose is this step (Master §9.5.2). */
  currentStepGh: number | null;
  /** Athlete override from the more/less stepper. */
  chosenGPerH: number | null;
  sweatRateLPerH: number | null;
  products: FuelProduct[];
  containers: FuelContainer[];
}): FuelingResult {
  const duration = input.durationMin ?? 0;
  const band = input.durationMin == null ? carbBand(0, "OTHER") : carbBand(duration, input.sport);
  const target =
    input.chosenGPerH ??
    (input.mode === "GUT_TRAINING" ? input.currentStepGh : null);
  const carbStatus: SetStatus = target == null || input.durationMin == null ? NOT_SET : "computed";
  const totalCarbsG =
    carbStatus === "computed" && target != null ? roundInt(target * hours(duration)) : 0;
  const fluidStatus: SetStatus = input.sweatRateLPerH == null || input.durationMin == null ? NOT_SET : "computed";
  const totalFluidMl =
    fluidStatus === "computed" && input.sweatRateLPerH != null
      ? Math.max(0, roundInt(input.sweatRateLPerH * hours(duration) * 1000))
      : 0;

  const items: CarryItem[] = [];
  let drinkMixGPerMl: number | null = null;
  let sodium = 0;
  let sodiumKnown = false;

  const drink = input.products.find((item) => item.type === "DRINK_MIX");
  const bottle = input.containers.find((item) => item.usualContent !== "GEL_CONCENTRATE");
  if (
    input.mode === "GUT_TRAINING" &&
    drink &&
    bottle &&
    fluidStatus === "computed" &&
    carbStatus === "computed" &&
    drink.carbsG > 0
  ) {
    drinkMixGPerMl = GUT_DRINK_G_PER_ML;
    const drinkCarbs = Math.min(totalCarbsG, roundInt(GUT_DRINK_G_PER_ML * totalFluidMl));
    const servings = round2(drinkCarbs / drink.carbsG);
    const sodiumMg = drink.sodiumMg == null ? null : roundInt(servings * drink.sodiumMg);
    if (sodiumMg != null) {
      sodium += sodiumMg;
      sodiumKnown = true;
    }
    items.push({
      name: drink.name,
      containerName: bottle.name,
      containerId: bottle.id,
      productId: drink.id,
      servings,
      carryCarbsG: drinkCarbs,
      sodiumMg,
    });
  }

  for (const container of input.containers) {
    if (items.some((item) => item.containerId === container.id)) continue;
    items.push({
      name: container.name,
      containerName: container.name,
      containerId: container.id,
      productId: null,
      servings: null,
      carryCarbsG: null,
      sodiumMg: null,
    });
  }

  return {
    targetGPerH: target,
    band,
    totalCarbsG,
    totalFluidMl,
    totalSodiumMg: sodiumKnown ? sodium : 0,
    carbStatus,
    fluidStatus,
    sodiumStatus: sodiumKnown ? "computed" : NOT_SET,
    scheduleStatus: NOT_SET,
    schedule: [],
    items,
    drinkMixGPerMl,
  };
}
