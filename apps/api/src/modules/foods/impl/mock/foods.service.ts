import { presentFood } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { FoodsService } from "../../foods.service.js";

export function createMockFoodsService(deps: ModuleDeps): FoodsService {
  return {
    async listFoods(query) {
      const rows = await deps.db.foodItem.findMany({
        where: query ? { name: { contains: query } } : {},
        orderBy: { name: "asc" },
      });
      return { foods: rows.map(presentFood) };
    },
  };
}
