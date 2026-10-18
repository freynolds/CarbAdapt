import type { PrismaClient } from "./generated/client/index.js";
import { buildSeed, FOODS } from "@carbadapt/fixtures";

export async function insertSeed(client: PrismaClient, now = new Date()): Promise<void> {
  const data = buildSeed(now);
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
  await client.user.createMany({ data: data.users as never });
  await client.authIdentity.createMany({ data: data.identities as never });
  await client.physicalData.createMany({ data: data.physical as never });
  await client.physicalDataConflict.createMany({ data: data.conflicts as never });
  await client.providerConnection.createMany({ data: data.connections as never });
  await client.subscription.createMany({ data: data.subscriptions as never });
  await client.onboardingAnswers.createMany({ data: data.onboarding as never });
  await client.container.createMany({ data: data.containers as never });
  await client.containerCalibration.createMany({ data: data.calibrations as never });
  await client.product.createMany({ data: data.products as never });
  await client.race.createMany({ data: data.races as never });
  await client.stage.createMany({ data: data.stages as never });
  await client.aidStation.createMany({ data: data.aidStations as never });
  await client.workout.createMany({ data: data.workouts as never });
  await client.activity.createMany({ data: data.activities as never });
  await client.fuelingPlan.createMany({ data: data.fuelingPlans as never });
  await client.postWorkoutLog.createMany({ data: data.logs as never });
  await client.sweatTest.createMany({ data: data.sweatTests as never });
  await client.gutTrainingPlan.createMany({ data: data.gutPlans as never });
  await client.ladderStep.createMany({ data: data.steps as never });
  await client.adaptationDecision.createMany({ data: data.decisions as never });
  await client.achievement.createMany({ data: data.achievements as never });
  await client.raceStrategy.createMany({ data: data.strategies as never });
  await client.carbLoadingDay.createMany({ data: data.loadingDays as never });
  await client.loadingRehearsal.createMany({ data: data.rehearsals as never });
  await client.stageRecoveryPlan.createMany({ data: data.recoveries as never });
  await client.todoItem.createMany({ data: data.todos as never });
}

export async function resetDemoData(client: PrismaClient, now = new Date()): Promise<void> {
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
  await insertSeed(client, now);
}
