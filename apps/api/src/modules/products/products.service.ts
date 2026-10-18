import type { ProductList } from "./products.schema.js";

/** Product library. The mock returns fixed rows. Staging and production are not written. */
export interface ProductsService {
  listProducts(): Promise<ProductList>;
}
