import type { RequestHandler } from "express";
import { parseInput } from "../../http/errors.js";
import { userId } from "../../http/session.js";
import { todoListSchema, todoQuerySchema } from "./todos.schema.js";
import type { TodosService } from "./todos.service.js";

export function createListTodosHandler(service: TodosService): RequestHandler {
  return async (req, res) => {
    const filter = parseInput(todoQuerySchema, req.query);
    res.status(200).json(todoListSchema.parse(await service.listTodos(userId(req), filter)));
  };
}
