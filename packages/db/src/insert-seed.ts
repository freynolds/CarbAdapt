import type { Prisma, PrismaClient } from "@prisma/client";
import { buildSeed, FOODS } from "@carbadapt/fixtures";

function rows<T>(value: Record<string, unknown>[]): T[] {
  return value as unknown as T[];
}

/**
 * Replaces application rows with the fixture graph for `now`.
 * A second call ends in the same rows for that instant. `_prisma_migrations` is left in place.
 */
export async function insertSeed(client: PrismaClient, now = new Date()): Promise<void> {
  const data = buildSeed(now);
  await client.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
  const tables = await client.$queryRaw<Array<{ TABLE_NAME?: string; table_name?: string }>>`
    SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()
  `;
  for (const table of tables) {
    const name = table.TABLE_NAME ?? table.table_name;
    if (!name || name === "_prisma_migrations") continue;
    await client.$executeRawUnsafe(`TRUNCATE TABLE \`${name}\``);
  }
  await client.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");

  await client.foodItem.createMany({
    data: FOODS.map((food) => ({
      id: food.id,
      fdcId: food.fdcId,
      name: food.name,
      category: food.category,
      carbsPer100g: food.carbsPer100g,
      proteinPer100g: food.proteinPer100g,
      fatPer100g: food.fatPer100g,
      fiberPer100g: food.fiberPer100g,
      sodiumMgPer100g: food.sodiumMgPer100g,
      portionG: food.portionG,
      portionLabel: food.portionLabel,
      fodmap: food.fodmap,
    })),
  });
  await client.user.createMany({ data: rows<Prisma.UserCreateManyInput>(data.users) });
  await client.authIdentity.createMany({
    data: rows<Prisma.AuthIdentityCreateManyInput>(data.identities),
  });
  await client.physicalData.createMany({
    data: rows<Prisma.PhysicalDataCreateManyInput>(data.physical),
  });
  await client.physicalDataConflict.createMany({
    data: rows<Prisma.PhysicalDataConflictCreateManyInput>(data.conflicts),
  });
  await client.providerConnection.createMany({
    data: rows<Prisma.ProviderConnectionCreateManyInput>(data.connections),
  });
  await client.subscription.createMany({
    data: rows<Prisma.SubscriptionCreateManyInput>(data.subscriptions),
  });
  await client.onboardingAnswers.createMany({
    data: rows<Prisma.OnboardingAnswersCreateManyInput>(data.onboarding),
  });
  await client.container.createMany({
    data: rows<Prisma.ContainerCreateManyInput>(data.containers),
  });
  await client.containerCalibration.createMany({
    data: rows<Prisma.ContainerCalibrationCreateManyInput>(data.calibrations),
  });
  await client.product.createMany({ data: rows<Prisma.ProductCreateManyInput>(data.products) });
  await client.race.createMany({ data: rows<Prisma.RaceCreateManyInput>(data.races) });
  await client.stage.createMany({ data: rows<Prisma.StageCreateManyInput>(data.stages) });
  await client.aidStation.createMany({
    data: rows<Prisma.AidStationCreateManyInput>(data.aidStations),
  });
  await client.workout.createMany({ data: rows<Prisma.WorkoutCreateManyInput>(data.workouts) });
  await client.activity.createMany({ data: rows<Prisma.ActivityCreateManyInput>(data.activities) });
  await client.fuelingPlan.createMany({
    data: rows<Prisma.FuelingPlanCreateManyInput>(data.fuelingPlans),
  });
  await client.postWorkoutLog.createMany({
    data: rows<Prisma.PostWorkoutLogCreateManyInput>(data.logs),
  });
  await client.sweatTest.createMany({
    data: rows<Prisma.SweatTestCreateManyInput>(data.sweatTests),
  });
  await client.gutTrainingPlan.createMany({
    data: rows<Prisma.GutTrainingPlanCreateManyInput>(data.gutPlans),
  });
  await client.ladderStep.createMany({ data: rows<Prisma.LadderStepCreateManyInput>(data.steps) });
  await client.adaptationDecision.createMany({
    data: rows<Prisma.AdaptationDecisionCreateManyInput>(data.decisions),
  });
  await client.achievement.createMany({
    data: rows<Prisma.AchievementCreateManyInput>(data.achievements),
  });
  await client.raceStrategy.createMany({
    data: rows<Prisma.RaceStrategyCreateManyInput>(data.strategies),
  });
  await client.carbLoadingDay.createMany({
    data: rows<Prisma.CarbLoadingDayCreateManyInput>(data.loadingDays),
  });
  await client.loadingRehearsal.createMany({
    data: rows<Prisma.LoadingRehearsalCreateManyInput>(data.rehearsals),
  });
  await client.stageRecoveryPlan.createMany({
    data: rows<Prisma.StageRecoveryPlanCreateManyInput>(data.recoveries),
  });
  await client.todoItem.createMany({ data: rows<Prisma.TodoItemCreateManyInput>(data.todos) });
}
