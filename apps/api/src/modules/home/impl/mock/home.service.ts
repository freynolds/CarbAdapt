import { SWEAT_PROMPT_DAYS, type Workout } from "@carbadapt/contracts";
import { shiftDay } from "@carbadapt/engine";
import { calendarDate } from "../../../../http/calendar.js";
import type { HomeDeps } from "../../home.factory.js";
import type { HomeService } from "../../home.service.js";

function heroWorkout(mode: "FUEL_MY_WORKOUTS" | "GUT_TRAINING" | null, workouts: Workout[]) {
  const withPlan = workouts.filter((row) => row.status === "PLANNED" && row.fuelingPlan?.isCurrent);
  if (mode === "GUT_TRAINING") {
    return (
      withPlan.find((row) => {
        const minutes = row.durationMin ?? 0;
        if (row.sport === "CYCLING") return minutes > 120;
        if (row.sport === "RUNNING" || row.sport === "TRAIL_RUNNING") return minutes > 60;
        return false;
      }) ?? null
    );
  }
  if (mode === "FUEL_MY_WORKOUTS") return withPlan[0] ?? null;
  return null;
}

/** Due now, overdue, or scheduled within the prompt window. Farther dates stay off the home card. */
function sweatIsPrompted(
  row: { status: string; scheduledFor: string | null },
  today: string,
): boolean {
  if (row.status === "IN_PROGRESS" || row.status === "AWAITING_DATA") return true;
  if (row.status !== "SCHEDULED" && row.status !== "RESCHEDULED") return false;
  if (!row.scheduledFor) return false;
  return row.scheduledFor <= shiftDay(today, SWEAT_PROMPT_DAYS);
}

export function createMockHomeService(deps: HomeDeps): HomeService {
  return {
    async getHome(userId) {
      const me = await deps.profile.getMe(userId);
      const today = calendarDate(new Date(), me.user.timezone);
      const [workouts, sweat, todos, products, containers, races] = await Promise.all([
        deps.workouts.listWorkouts(userId, { from: today, to: today }),
        deps.sweatTests.listSweatTests(userId),
        deps.todos.listTodos(userId, { status: "OPEN" }),
        deps.products.listProducts(userId),
        deps.gear.listContainers(userId),
        deps.races.listRaces(userId),
      ]);
      const prompted = sweat.sweatTests.filter((row) => sweatIsPrompted(row, today));
      const sweatTest =
        prompted.find((row) => row.status === "IN_PROGRESS" || row.status === "AWAITING_DATA") ??
        prompted.find((row) => row.status === "SCHEDULED" || row.status === "RESCHEDULED") ??
        null;
      const sweatById = new Map(sweat.sweatTests.map((row) => [row.id, row]));
      const visibleTodos = todos.todos.filter((todo) => {
        if (todo.type !== "SWEAT_TEST" || !todo.refId) return true;
        const test = sweatById.get(todo.refId);
        if (!test) return true;
        return sweatIsPrompted(test, today);
      });
      return {
        user: me.user,
        physical: me.physical,
        hero: heroWorkout(me.user.mode, workouts.workouts),
        sweatTest,
        todos: visibleTodos,
        counts: {
          openTodos: visibleTodos.length,
          products: products.products.length,
          containers: containers.containers.length,
          upcomingRaces: races.races.filter((race) => race.date !== null && race.date >= today)
            .length,
        },
      };
    },
  };
}
