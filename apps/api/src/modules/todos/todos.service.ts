import type { TodoList, TodoStatus } from "@carbadapt/contracts";

export type TodoFilter = {
  status?: TodoStatus;
};

/** Open and closed to-dos for the signed-in athlete. */
export interface TodosService {
  listTodos(userId: string, filter: TodoFilter): Promise<TodoList>;
}
