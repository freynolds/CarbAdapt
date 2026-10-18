import { z } from "zod";

export { foodListSchema } from "@carbadapt/contracts";

export const foodQuerySchema = z.object({
  query: z.string().optional(),
});
