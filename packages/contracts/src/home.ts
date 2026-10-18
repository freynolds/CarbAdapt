import { z } from "zod";
import { physicalSchema, userSchema } from "./profile.js";
import { sweatTestSchema } from "./sweat-tests.js";
import { todoSchema } from "./todos.js";
import { workoutSchema } from "./workouts.js";

export const homeResponseSchema = z
  .object({
    user: userSchema,
    physical: physicalSchema.nullable(),
    hero: workoutSchema.nullable(),
    sweatTest: sweatTestSchema.nullable(),
    todos: z.array(todoSchema),
    counts: z
      .object({
        openTodos: z.number().int(),
        products: z.number().int(),
        containers: z.number().int(),
        upcomingRaces: z.number().int(),
      })
      .strict(),
  })
  .strict();

export type HomeResponse = z.infer<typeof homeResponseSchema>;
