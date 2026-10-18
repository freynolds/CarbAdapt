import type { Workout } from "@carbadapt/contracts";
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
      const upcoming = sweat.sweatTests.filter(
        (row) =>
          (row.status === "SCHEDULED" || row.status === "RESCHEDULED") &&
          row.scheduledFor !== null &&
          row.scheduledFor >= today,
      );
      const sweatTest =
        upcoming[0] ??
        sweat.sweatTests.find((row) => row.status === "IN_PROGRESS") ??
        sweat.sweatTests.find((row) => row.status === "AWAITING_DATA") ??
        null;
      return {
        user: me.user,
        physical: me.physical,
        hero: heroWorkout(me.user.mode, workouts.workouts),
        sweatTest,
        todos: todos.todos,
        counts: {
          openTodos: todos.todos.length,
          products: products.products.length,
          containers: containers.containers.length,
          upcomingRaces: races.races.filter((race) => race.date !== null && race.date >= today)
            .length,
        },
      };
    },
  };
}
