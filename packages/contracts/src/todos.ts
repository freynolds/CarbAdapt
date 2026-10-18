import { z } from "zod";
import {
  isoDateTimeSchema,
  jsonSchema,
  todoStatusSchema,
  todoTierSchema,
  todoTypeSchema,
} from "./common.js";

export type TodoStatus = z.infer<typeof todoStatusSchema>;

export const todoSchema = z
  .object({
    id: z.string(),
    type: todoTypeSchema,
    tier: todoTierSchema,
    status: todoStatusSchema,
    refType: z.string().nullable(),
    refId: z.string().nullable(),
    payload: jsonSchema.nullable(),
    createdAt: isoDateTimeSchema.nullable(),
    closedAt: isoDateTimeSchema.nullable(),
  })
  .strict();

export const todoListSchema = z
  .object({
    todos: z.array(todoSchema),
  })
  .strict();

export type Todo = z.infer<typeof todoSchema>;
export type TodoList = z.infer<typeof todoListSchema>;
