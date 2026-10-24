import { hours, roundInt } from "./numbers.js";
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

/** How the athlete wants carbohydrate divided between bottles and gels. */
export type CarbSplit = "BOTTLES_THEN_GELS" | "MOSTLY_WATER" | "MORE_MIX";

/** What to do with fluid that does not fit in the bottles the athlete owns. */
export type FluidPlan = "MORE_BOTTLES" | "REFILL";

/** Where a numeric carb rate came from. `band_low` is the low end of §7.1, not a single recommended rate. */
export type CarbBasis = "chosen" | "ladder" | "band_low" | "not_set";

export type FuelProduct = {
  id: string;
  type: "DRINK_MIX" | "GEL" | "SOLID";
  name: string;
  carbsG: number;
  sodiumMg: number | null;
  /** Present when the library stores a scoop. Drink mix is counted in scoops then. */
  scoopG?: number | null;
  /**
   * Milliliters one scoop prepares. Fuel mode uses this to scale scoops to the
   * fluid poured into a bottle. Null uses {@link DEFAULT_PREPARES_ML}.
   */
  preparesMl?: number | null;
};

export type FuelContainer = {
  id: string;
  name: string;
  capacityMl: number;
  usualContent: "WATER" | "ISOTONIC" | "GEL_CONCENTRATE";
};

const CONTENT_ORDER: Record<FuelContainer["usualContent"], number> = {
  WATER: 0,
  ISOTONIC: 1,
  GEL_CONCENTRATE: 2,
};

export type CarryRole =
  | "water"
  | "drink_mix"
  | "gel"
  | "solid"
  | "more_bottles"
  | "refill"
  | "extra_powder";

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
  /** Extra bottles to add, when role is `more_bottles`. */
  count: number | null;
};

export type FuelingResult = {
  targetGPerH: number | null;
  carbBasis: CarbBasis;
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
  /** Gut-training drink mix starts from the cited ~10% w/v. Fuel mode does not. */
  drinkMixGPerMl: number | null;
  /** True when whole gels or half scoops carry more carbohydrate than the session target. */
  carbsRoundedUp: boolean;
};

/** One scoop prepares this much fluid when the product does not say otherwise. */
export const DEFAULT_PREPARES_ML = 500;

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
  /** Default fills isotonic bottles, then gels. */
  carbSplit?: CarbSplit;
  /** Default asks for more bottles. Refill fluid is always plain water. */
  fluidPlan?: FluidPlan;
  /**
   * Aid-station stops that share a water refill. Used only when fluidPlan is REFILL.
   * Zero means one refill row for the whole shortfall.
   */
  aidStationCount?: number;
}): FuelingResult {
  const duration = input.durationMin ?? 0;
  const band = input.durationMin == null ? carbBand(0, "OTHER") : carbBand(duration, input.sport);
  const resolved = resolveTarget(input, band);
  const carbStatus: SetStatus = resolved.target == null || input.durationMin == null ? NOT_SET : "computed";
  const totalCarbsG =
    carbStatus === "computed" && resolved.target != null ? roundInt(resolved.target * hours(duration)) : 0;
  const fluidStatus: SetStatus = input.sweatRateLPerH == null || input.durationMin == null ? NOT_SET : "computed";
  const totalFluidMl =
    fluidStatus === "computed" && input.sweatRateLPerH != null
      ? Math.max(0, roundInt(input.sweatRateLPerH * hours(duration) * 1000))
      : 0;

  const built = buildCarry({
    containers: input.containers,
    products: input.products,
    mode: input.mode,
    carbSplit: input.carbSplit ?? "BOTTLES_THEN_GELS",
    fluidPlan: input.fluidPlan ?? "MORE_BOTTLES",
    aidStationCount: input.aidStationCount ?? 0,
    carbStatus,
    fluidStatus,
    totalCarbsG,
    totalFluidMl,
  });

  return {
    targetGPerH: resolved.target,
    carbBasis: carbStatus === "computed" ? resolved.basis : "not_set",
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
    carbsRoundedUp: built.carbsRoundedUp,
  };
}

function resolveTarget(
  input: {
    durationMin: number | null;
    mode: "FUEL_MY_WORKOUTS" | "GUT_TRAINING" | null;
    currentStepGh: number | null;
    chosenGPerH: number | null;
  },
  band: CarbBand,
): { target: number | null; basis: CarbBasis } {
  if (input.durationMin == null) return { target: null, basis: "not_set" };
  if (input.chosenGPerH != null) return { target: input.chosenGPerH, basis: "chosen" };
  if (input.mode === "GUT_TRAINING" && input.currentStepGh != null) {
    return { target: input.currentStepGh, basis: "ladder" };
  }
  if (band.specified && band.minGPerH != null) return { target: band.minGPerH, basis: "band_low" };
  return { target: null, basis: "not_set" };
}

function productOf(products: FuelProduct[], type: FuelProduct["type"]): FuelProduct | null {
  return products.find((item) => item.type === type) ?? null;
}

function sodiumFor(product: FuelProduct | null, servings: number | null): number | null {
  if (product?.sodiumMg == null || servings == null) return null;
  return roundInt(servings * product.sodiumMg);
}

/** Nearest half. 1.42 → 1.5, 0.75 → 1. */
function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/** Next half up. 5.5 stays 5.5. 0.51 becomes 1. */
function ceilHalf(value: number): number {
  return Math.ceil(value * 2 - 1e-9) / 2;
}

function ceilUnits(value: number): number {
  return Math.ceil(value - 1e-9);
}

function grams(servings: number, perServing: number): number {
  return roundInt(servings * perServing);
}

/**
 * Each owned bottle is filled once. Scoops follow the fluid poured into that
 * bottle (its capacity, when the session needs at least that much). Gut
 * training caps that fill at ~10% w/v, then rounds to half scoops. Fuel mode
 * uses the product's scoop-per-volume. Leftover carbohydrate is whole gels,
 * or extra powder when the athlete has no gel. Refill fluid is plain water.
 */
function buildCarry(input: {
  containers: FuelContainer[];
  products: FuelProduct[];
  mode: "FUEL_MY_WORKOUTS" | "GUT_TRAINING" | null;
  carbSplit: CarbSplit;
  fluidPlan: FluidPlan;
  aidStationCount: number;
  carbStatus: SetStatus;
  fluidStatus: SetStatus;
  totalCarbsG: number;
  totalFluidMl: number;
}): {
  items: CarryItem[];
  sodium: number;
  sodiumKnown: boolean;
  drinkMixGPerMl: number | null;
  carbsRoundedUp: boolean;
} {
  const containers = [...input.containers].sort(
    (left, right) => CONTENT_ORDER[left.usualContent] - CONTENT_ORDER[right.usualContent],
  );
  const drink = productOf(input.products, "DRINK_MIX");
  const gel = productOf(input.products, "GEL");
  const carbKnown = input.carbStatus === "computed";
  const fluidKnown = input.fluidStatus === "computed";
  const gut = input.mode === "GUT_TRAINING";
  const canMix = drink != null && drink.carbsG > 0 && carbKnown && fluidKnown;
  let drinkMixGPerMl: number | null = null;
  if (gut && canMix) drinkMixGPerMl = GUT_DRINK_G_PER_ML;

  const fluidById = new Map<string, number>();
  let fluidLeft = fluidKnown ? input.totalFluidMl : 0;
  if (fluidKnown) {
    for (const container of containers) {
      if (container.usualContent === "GEL_CONCENTRATE") continue;
      const take = Math.min(container.capacityMl, Math.max(0, fluidLeft));
      fluidById.set(container.id, take);
      fluidLeft -= take;
    }
  }
  const shortfall = fluidKnown ? Math.max(0, fluidLeft) : 0;

  const mixIds = new Set<string>();
  if (canMix) {
    for (const container of containers) {
      if (container.usualContent === "ISOTONIC") mixIds.add(container.id);
      if (container.usualContent === "WATER" && input.carbSplit === "MORE_MIX") mixIds.add(container.id);
    }
  }

  const scoopsById = new Map<string, number>();
  let carbsLeft = carbKnown ? input.totalCarbsG : 0;
  if (canMix && drink) {
    const mixOrder = containers.filter((container) => mixIds.has(container.id));
    mixOrder.sort((left, right) => {
      if (left.usualContent === right.usualContent) return 0;
      return left.usualContent === "ISOTONIC" ? -1 : 1;
    });
    for (const container of mixOrder) {
      const fluid = fluidById.get(container.id) ?? 0;
      const scoops = scoopsInBottle(drink, fluid, gut, input.carbSplit, carbsLeft);
      scoopsById.set(container.id, scoops);
      carbsLeft -= grams(scoops, drink.carbsG);
      if (carbsLeft < 0) carbsLeft = 0;
    }
  }

  let gelPack: { units: number; carbs: number } | null = null;
  if (carbKnown && carbsLeft > 0 && gel && gel.carbsG > 0) {
    const units = Math.max(1, ceilUnits(carbsLeft / gel.carbsG));
    gelPack = { units, carbs: grams(units, gel.carbsG) };
    carbsLeft = 0;
  }

  let powder: { scoops: number; carbs: number } | null = null;
  if (carbKnown && carbsLeft > 0 && drink && drink.carbsG > 0) {
    const scoops = ceilHalf(carbsLeft / drink.carbsG);
    powder = { scoops, carbs: grams(scoops, drink.carbsG) };
    carbsLeft = 0;
  }

  const items: CarryItem[] = [];
  let gelPlaced = false;
  for (const container of containers) {
    const volumeMl = container.capacityMl;
    const held = fluidKnown ? (fluidById.get(container.id) ?? 0) : null;
    if (container.usualContent === "GEL_CONCENTRATE") {
      const place = gelPack != null && !gelPlaced;
      if (place) gelPlaced = true;
      const servings = place && gelPack ? gelPack.units : carbKnown && gel ? 0 : null;
      const carbs = place && gelPack ? gelPack.carbs : carbKnown ? 0 : null;
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
        count: null,
      });
      continue;
    }
    if (mixIds.has(container.id) && drink) {
      const scoops = scoopsById.get(container.id) ?? 0;
      const carbs = carbKnown ? grams(scoops, drink.carbsG) : null;
      items.push({
        name: drink.name,
        containerName: container.name,
        containerId: container.id,
        productId: drink.id,
        productName: drink.name,
        servings: carbKnown ? scoops : null,
        unit: drink.scoopG != null ? "scoop" : "serving",
        volumeMl,
        fluidMl: held,
        carryCarbsG: carbs,
        sodiumMg: carbs == null ? null : sodiumFor(drink, scoops),
        role: "drink_mix",
        count: null,
      });
      continue;
    }
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
        count: null,
      });
      continue;
    }
    const scoops = drink && carbKnown ? (scoopsById.get(container.id) ?? 0) : null;
    const carbs = drink && scoops != null ? grams(scoops, drink.carbsG) : carbKnown ? 0 : null;
    items.push({
      name: drink?.name ?? container.name,
      containerName: container.name,
      containerId: container.id,
      productId: drink?.id ?? null,
      productName: drink?.name ?? null,
      servings: scoops,
      unit: drink ? (drink.scoopG != null ? "scoop" : "serving") : null,
      volumeMl,
      fluidMl: held,
      carryCarbsG: carbs,
      sodiumMg: carbs == null ? null : sodiumFor(drink, scoops),
      role: "drink_mix",
      count: null,
    });
  }

  if (gelPack && !gelPlaced && gel) {
    items.push({
      name: gel.name,
      containerName: null,
      containerId: null,
      productId: gel.id,
      productName: gel.name,
      servings: gelPack.units,
      unit: "unit",
      volumeMl: null,
      fluidMl: fluidKnown ? 0 : null,
      carryCarbsG: gelPack.carbs,
      sodiumMg: sodiumFor(gel, gelPack.units),
      role: "gel",
      count: null,
    });
  }

  if (powder && drink) {
    items.push({
      name: drink.name,
      containerName: null,
      containerId: null,
      productId: drink.id,
      productName: drink.name,
      servings: powder.scoops,
      unit: drink.scoopG != null ? "scoop" : "serving",
      volumeMl: null,
      fluidMl: fluidKnown ? 0 : null,
      carryCarbsG: powder.carbs,
      sodiumMg: sodiumFor(drink, powder.scoops),
      role: "extra_powder",
      count: null,
    });
  } else if (carbKnown && carbsLeft > 0) {
    items.push({
      name: "extra_powder",
      containerName: null,
      containerId: null,
      productId: null,
      productName: null,
      servings: null,
      unit: null,
      volumeMl: null,
      fluidMl: fluidKnown ? 0 : null,
      carryCarbsG: carbsLeft,
      sodiumMg: null,
      role: "extra_powder",
      count: null,
    });
  }

  if (shortfall > 0) {
    if (input.fluidPlan === "REFILL") {
      const stops = Math.max(0, Math.floor(input.aidStationCount));
      for (const ml of splitFluid(shortfall, stops)) {
        items.push({
          name: "refill",
          containerName: null,
          containerId: null,
          productId: null,
          productName: null,
          servings: null,
          unit: null,
          volumeMl: null,
          fluidMl: ml,
          carryCarbsG: carbKnown ? 0 : null,
          sodiumMg: carbKnown ? 0 : null,
          role: "refill",
          count: null,
        });
      }
    } else {
      const capacities = containers
        .filter((container) => container.usualContent !== "GEL_CONCENTRATE")
        .map((container) => container.capacityMl);
      const largest = capacities.length > 0 ? Math.max(...capacities) : 0;
      items.push({
        name: "more_bottles",
        containerName: null,
        containerId: null,
        productId: null,
        productName: null,
        servings: null,
        unit: null,
        volumeMl: largest > 0 ? largest : null,
        fluidMl: shortfall,
        carryCarbsG: carbKnown ? 0 : null,
        sodiumMg: carbKnown ? 0 : null,
        role: "more_bottles",
        count: largest > 0 ? Math.ceil(shortfall / largest) : null,
      });
    }
  }

  let sodium = 0;
  let sodiumKnown = carbKnown;
  for (const item of items) {
    const carries = (item.carryCarbsG ?? 0) > 0 || (item.fluidMl ?? 0) > 0;
    if (item.sodiumMg == null && carries && item.role !== "water") sodiumKnown = false;
    sodium += item.sodiumMg ?? 0;
  }
  if (!carbKnown) sodiumKnown = false;

  const carriedCarbs = items.reduce((sum, item) => sum + (item.carryCarbsG ?? 0), 0);
  const carbsRoundedUp = carbKnown && carriedCarbs > input.totalCarbsG;

  return { items, sodium, sodiumKnown, drinkMixGPerMl, carbsRoundedUp };
}

/**
 * Half-scoop count for one bottle fill. Gut training starts from 10% w/v.
 * Fuel mode starts from fluid / preparesMl. Mostly-water uses half of that
 * count. The result never puts more carbohydrate in the bottle than is left.
 */
function scoopsInBottle(
  drink: FuelProduct,
  fluidMl: number,
  gut: boolean,
  split: CarbSplit,
  carbsLeft: number,
): number {
  if (fluidMl <= 0 || drink.carbsG <= 0 || carbsLeft <= 0) return 0;
  let full: number;
  if (gut) {
    const capG = roundInt(GUT_DRINK_G_PER_ML * fluidMl);
    full = roundHalf(capG / drink.carbsG);
    while (full > 0 && grams(full, drink.carbsG) > capG) full -= 0.5;
  } else {
    const prepares = drink.preparesMl != null && drink.preparesMl > 0 ? drink.preparesMl : DEFAULT_PREPARES_ML;
    full = roundHalf(fluidMl / prepares);
  }
  let scoops = split === "MOSTLY_WATER" ? roundHalf(full / 2) : full;
  while (scoops > 0 && grams(scoops, drink.carbsG) > carbsLeft) scoops -= 0.5;
  return Math.max(0, scoops);
}

/** Even milliliters across stops. The last stop takes the remainder. No stops means one row. */
function splitFluid(totalMl: number, stops: number): number[] {
  if (stops <= 1) return [totalMl];
  const base = Math.floor(totalMl / stops);
  const remainder = totalMl - base * stops;
  return Array.from({ length: stops }, (_, index) => base + (index === stops - 1 ? remainder : 0));
}
