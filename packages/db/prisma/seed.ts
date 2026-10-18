import { PrismaClient } from "../src/generated/client/index.js";
import { insertSeed } from "../src/insert-seed.js";

const client = new PrismaClient();

insertSeed(client)
  .then(async () => {
    const users = await client.user.count();
    const workouts = await client.workout.count();
    const foods = await client.foodItem.count();
    console.log(`Seeded ${users} athletes, ${workouts} workouts, ${foods} USDA foods.`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.$disconnect();
  });
