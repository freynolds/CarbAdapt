import type { ProductList, ProductResponse } from "@carbadapt/contracts";

/** The signed-in athlete's product library. Deleted rows stay out of the list. */
export interface ProductsService {
  listProducts(userId: string): Promise<ProductList>;
  getProduct(userId: string, id: string): Promise<ProductResponse>;
}
