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
  /** Present when the library stores a scoop. Drink mix is counted in scoops then. */
  scoopG?: number | null;
};

export type FuelContainer = {
  id: string;
  name: string;
  capacityMl: number;
  usualContent: "WATER" | "ISOTONIC" | "GEL_CONCENTRATE";
};

export type CarryRole = "water" | "drink_mix" | "gel" | "solid" | "unassigned";

export type CarryItem = {
  name: string;
  containerName: string | null;
  containerId: string | null;
  productId: string | null;
  productName: string | null;
  /** Servings, scoops, or units of the product in this container. */
  servings: number | null;
  unit: "serving" | "scoop" | "unit" | null;
  volumeMl: number | null;
  fluidMl: number | null;
  carryCarbsG: number | null;
  sodiumMg: number | null;
  role: CarryRole;
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

  const built = buildCarry({
    containers: input.containers,
    products: input.products,
    mode: input.mode,
    carbStatus,
    fluidStatus,
    totalCarbsG,
    totalFluidMl,
  });

  return {
    targetGPerH: target,
    band,
    totalCarbsG,
    totalFluidMl,
    totalSodiumMg: built.sodiumKnown ? built.sodium : 0,
    carbStatus,
    fluidStatus,
    sodiumStatus: built.sodiumKnown ? "computed" : NOT_SET,
    scheduleStatus: NOT_SET,
    schedule: [],
    items: built.items,
    drinkMixGPerMl: built.drinkMixGPerMl,
  };
}

function productOf(products: FuelProduct[], type: FuelProduct["type"]): FuelProduct | null {
  return products.find((item) => item.type === type) ?? null;
}

function sodiumFor(product: FuelProduct | null, servings: number | null): number | null {
  if (product?.sodiumMg == null || servings == null) return null;
  return roundInt(servings * product.sodiumMg);
}

/**
 * Every container gets a row. Gut training fills isotonic bottles at ~10% w/v
 * and puts leftover carbs in a gel flask, then a solid, then an unassigned row.
 * Fuel mode does not split carbs across containers (that rule is unset). Fluid
 * fills non-gel containers up to their volume. Leftover fluid is unassigned.
 */
function buildCarry(input: {
  containers: FuelContainer[];
  products: FuelProduct[];
  mode: "FUEL_MY_WORKOUTS" | "GUT_TRAINING" | null;
  carbStatus: SetStatus;
  fluidStatus: SetStatus;
  totalCarbsG: number;
  totalFluidMl: number;
}): { items: CarryItem[]; sodium: number; sodiumKnown: boolean; drinkMixGPerMl: number | null } {
  const drink = productOf(input.products, "DRINK_MIX");
  const gel = productOf(input.products, "GEL");
  const solid = productOf(input.products, "SOLID");
  const carbKnown = input.carbStatus === "computed";
  const fluidKnown = input.fluidStatus === "computed";
  const gutMix =
    input.mode === "GUT_TRAINING" && drink != null && carbKnown && fluidKnown && drink.carbsG > 0;
  let drinkMixGPerMl: number | null = null;
  if (gutMix) drinkMixGPerMl = GUT_DRINK_G_PER_ML;

  const fluidById = new Map<string, number>();
  let fluidLeft = fluidKnown ? input.totalFluidMl : 0;
  if (fluidKnown) {
    for (const container of input.containers) {
      if (container.usualContent === "GEL_CONCENTRATE") continue;
      const take = Math.min(container.capacityMl, Math.max(0, fluidLeft));
      fluidById.set(container.id, take);
      fluidLeft -= take;
    }
  }

  let carbsLeft = carbKnown ? input.totalCarbsG : 0;
  const gutCarbsById = new Map<string, number>();
  if (gutMix && drink) {
    for (const container of input.containers) {
      if (container.usualContent !== "ISOTONIC") continue;
      const fluid = fluidById.get(container.id) ?? 0;
      const room = roundInt(GUT_DRINK_G_PER_ML * fluid);
      const carbs = Math.min(carbsLeft, room);
      gutCarbsById.set(container.id, carbs);
      carbsLeft -= carbs;
    }
  }

  const items: CarryItem[] = [];
  let gelUsed = false;
  for (const container of input.containers) {
    const volumeMl = container.capacityMl;
    const held = fluidKnown ? (fluidById.get(container.id) ?? 0) : null;
    if (container.usualContent === "WATER") {
      items.push({
        name: container.name,
        containerName: container.name,
        containerId: container.id,
        productId: null,
        productName: null,
        servings: null,
        unit: null,
        volumeMl,
        fluidMl: held,
        carryCarbsG: carbKnown ? 0 : null,
        sodiumMg: carbKnown ? 0 : null,
        role: "water",
      });
      continue;
    }
    if (container.usualContent === "ISOTONIC") {
      const carbs = gutCarbsById.has(container.id) ? (gutCarbsById.get(container.id) ?? 0) : null;
      const servings =
        drink && drink.carbsG > 0 && carbs != null ? round2(carbs / drink.carbsG) : null;
      items.push({
        name: drink?.name ?? container.name,
        containerName: container.name,
        containerId: container.id,
        productId: drink?.id ?? null,
        productName: drink?.name ?? null,
        servings,
        unit: drink ? (drink.scoopG != null ? "scoop" : "serving") : null,
        volumeMl,
        fluidMl: held,
        carryCarbsG: carbs,
        sodiumMg: carbs == null ? null : sodiumFor(drink, servings),
        role: "drink_mix",
      });
      continue;
    }
    let carbs: number | null = null;
    let servings: number | null = null;
    if (gutMix && !gelUsed && gel && gel.carbsG > 0) {
      carbs = carbsLeft;
      if (carbs > 0) carbsLeft = 0;
      servings = round2(carbs / gel.carbsG);
      gelUsed = true;
    }
    items.push({
      name: gel?.name ?? container.name,
      containerName: container.name,
      containerId: container.id,
      productId: gel?.id ?? null,
      productName: gel?.name ?? null,
      servings,
      unit: gel ? "unit" : null,
      volumeMl,
      fluidMl: fluidKnown ? 0 : null,
      carryCarbsG: carbs,
      sodiumMg: carbs == null ? null : sodiumFor(gel, servings),
      role: "gel",
    });
  }

  if (gutMix && carbsLeft > 0 && gel && gel.carbsG > 0 && !gelUsed) {
    const carbs = carbsLeft;
    carbsLeft = 0;
    const servings = round2(carbs / gel.carbsG);
    items.push({
      name: gel.name,
      containerName: null,
      containerId: null,
      productId: gel.id,
      productName: gel.name,
      servings,
      unit: "unit",
      volumeMl: null,
      fluidMl: fluidKnown ? 0 : null,
      carryCarbsG: carbs,
      sodiumMg: sodiumFor(gel, servings),
      role: "gel",
    });
  } else if (gutMix && carbsLeft > 0 && solid && solid.carbsG > 0) {
    const carbs = carbsLeft;
    carbsLeft = 0;
    const servings = round2(carbs / solid.carbsG);
    items.push({
      name: solid.name,
      containerName: null,
      containerId: null,
      productId: solid.id,
      productName: solid.name,
      servings,
      unit: "serving",
      volumeMl: null,
      fluidMl: fluidKnown ? 0 : null,
      carryCarbsG: carbs,
      sodiumMg: sodiumFor(solid, servings),
      role: "solid",
    });
  }

  if ((carbKnown && carbsLeft > 0) || (fluidKnown && fluidLeft > 0)) {
    items.push({
      name: "unassigned",
      containerName: null,
      containerId: null,
      productId: null,
      productName: null,
      servings: null,
      unit: null,
      volumeMl: null,
      fluidMl: fluidKnown ? fluidLeft : null,
      carryCarbsG: carbKnown ? carbsLeft : null,
      sodiumMg: null,
      role: "unassigned",
    });
  }

  let sodium = 0;
  let sodiumKnown = carbKnown;
  for (const item of items) {
    if (item.sodiumMg == null && ((item.carryCarbsG ?? 0) > 0 || (item.fluidMl ?? 0) > 0) && item.role !== "water") {
      sodiumKnown = false;
    }
    sodium += item.sodiumMg ?? 0;
  }
  if (!carbKnown) sodiumKnown = false;

  return { items, sodium, sodiumKnown, drinkMixGPerMl };
}
