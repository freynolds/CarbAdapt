import type { ProductsService } from "../../products.service.js";
import type { ProductList } from "../../products.schema.js";

/** Placeholder rows so the route has a body. Not seed data and not a catalog. */
const MOCK_PRODUCTS: ProductList = {
  products: [
    {
      id: "prod_mock_drink",
      type: "DRINK_MIX",
      name: "Example drink mix",
      brand: "Example",
      carbsG: 80,
      favorite: true,
    },
    {
      id: "prod_mock_gel",
      type: "GEL",
      name: "Example gel",
      brand: "Example",
      carbsG: 25,
      favorite: false,
    },
  ],
};

export function createMockProductsService(): ProductsService {
  return {
    async listProducts() {
      return MOCK_PRODUCTS;
    },
  };
}
