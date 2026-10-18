import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { insertSeed } from "../src/insert-seed.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(packageDir, "../../.env"), quiet: true });
process.env.DATABASE_URL ??= "mysql://carbadapt:carbadapt@127.0.0.1:3306/carbadapt";

const client = new PrismaClient();

insertSeed(client)
  .then(async () => {
    const users = await client.user.count();
    const workouts = await client.workout.count();
    const foods = await client.foodItem.count();
    console.log(`Seeded ${users} athletes, ${workouts} workouts, ${foods} USDA foods.`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.$disconnect();
  });
