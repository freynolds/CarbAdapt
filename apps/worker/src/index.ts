import { PrismaClient } from "@carbadapt/db";
import { runDueJobs } from "@carbadapt/api/runner";

/**
 * How often the process asks MySQL for due jobs.
 * This is an operations knob, not a product push time.
 */
const DEFAULT_POLL_MS = 5000;

const parsed = Number(process.env.WORKER_POLL_MS);
const pollMs = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_POLL_MS;
const db = new PrismaClient();

async function tick(): Promise<void> {
  const result = await runDueJobs(db);
  if (result.delivered > 0 || result.webhooks > 0) {
    console.info(`[worker] delivered=${result.delivered} webhooks=${result.webhooks}`);
  }
}

console.info(`[worker] polling every ${pollMs} ms`);
const timer = setInterval(() => {
  void tick().catch((error: unknown) => {
    const name = error instanceof Error ? error.name : "failed";
    console.error(`[worker] ${name}`);
  });
}, pollMs);

async function stop(): Promise<void> {
  clearInterval(timer);
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void stop();
});
process.on("SIGTERM", () => {
  void stop();
});

void tick().catch((error: unknown) => {
  const name = error instanceof Error ? error.name : "failed";
  console.error(`[worker] ${name}`);
});
