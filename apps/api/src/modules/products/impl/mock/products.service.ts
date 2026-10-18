import { HttpError } from "../../../../http/errors.js";
import { presentProduct } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { ProductsService } from "../../products.service.js";

export function createMockProductsService(deps: ModuleDeps): ProductsService {
  const { db } = deps;
  return {
    async listProducts(userId) {
      const rows = await db.product.findMany({
        where: { userId, deletedAt: null },
        orderBy: { name: "asc" },
      });
      return { products: rows.map(presentProduct) };
    },
    async getProduct(userId, id) {
      const row = await db.product.findFirst({ where: { id, userId, deletedAt: null } });
      if (!row) throw new HttpError(404, "not_found", "Product not found.");
      return { product: presentProduct(row) };
    },
  };
}
