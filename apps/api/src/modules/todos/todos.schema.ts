import { z } from "zod";
import { todoStatusSchema } from "@carbadapt/contracts";

export { todoListSchema } from "@carbadapt/contracts";

export const todoQuerySchema = z.object({
  status: todoStatusSchema.optional(),
});
