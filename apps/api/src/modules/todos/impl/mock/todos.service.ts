import type { Todo } from "@carbadapt/contracts";
import { presentTodo } from "../../../../http/present.js";
import type { ModuleDeps } from "../../../deps.js";
import type { TodosService } from "../../todos.service.js";

const TIER_RANK: Record<Todo["tier"], number> = { HIGHEST: 0, CALIBRATION: 1, LOWER: 2 };

export function createMockTodosService(deps: ModuleDeps): TodosService {
  return {
    async listTodos(userId, filter) {
      const rows = await deps.db.todoItem.findMany({
        where: { userId, status: filter.status },
      });
      rows.sort(
        (a, b) =>
          TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.createdAt.getTime() - b.createdAt.getTime(),
      );
      return { todos: rows.map(presentTodo) };
    },
  };
}
