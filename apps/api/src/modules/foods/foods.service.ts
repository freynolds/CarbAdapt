import type { FoodList } from "@carbadapt/contracts";

/** Static USDA food list. Not owned by an athlete. */
export interface FoodsService {
  listFoods(query?: string): Promise<FoodList>;
}
