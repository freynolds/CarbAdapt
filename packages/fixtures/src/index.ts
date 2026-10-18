import { seedAthletes } from "./athletes.js";
import { createBag, type SeedData } from "./bag.js";
import { makeClock } from "./clock.js";

export { DEMO_TIMEZONE, makeClock } from "./clock.js";
export {
  ENGINE_VERSION,
  fixtureFuelingGh,
  loadingTargetG,
  perKgCarbs,
  rateCarbs,
  splitMeals,
  sweatRateLPerH,
  tooFastPreview,
} from "./domain.js";
export { FOOD_ID, FOODS } from "./foods.js";
export { DEMO_ISOTONIC_SODIUM_MG_PER_L } from "./bag.js";
export { ANA_RACE_OFFSET, WEIGHT } from "./athletes.js";
export type { SeedData } from "./bag.js";

export function buildSeed(now: Date = new Date()): SeedData {
  const bag = createBag(makeClock(now));
  seedAthletes(bag);
  return bag;
}
