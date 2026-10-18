import { seedAthletes } from "./athletes.js";
import { createBag, type SeedData } from "./bag.js";
import { makeClock } from "./clock.js";

export { DEMO_TIMEZONE, makeClock } from "./clock.js";
export { ENGINE_VERSION, sweatRateLPerH, tooFastPreview, loadingTargetG, perKgCarbs, rateCarbs, fixtureFuelingGh, splitMeals } from "./domain.js";
export { FOODS, FOOD_ID } from "./foods.js";
export { DEMO_ISOTONIC_SODIUM_MG_PER_L } from "./bag.js";
export { WEIGHT, ANA_RACE_OFFSET } from "./athletes.js";
export type { SeedData } from "./bag.js";

export function buildSeed(now: Date = new Date()): SeedData {
  const bag = createBag(makeClock(now));
  seedAthletes(bag);
  return bag;
}
