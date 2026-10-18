import type { FoodsService } from "../../foods.service.js";

export function createMockFoodsService(): FoodsService {
  return { module: "foods" };
}
