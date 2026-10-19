import { spawn } from "node:child_process";
import { join } from "node:path";
import process from "node:process";
import { setTimeout } from "node:timers";

// Optional root .env. Existing shell values win. Missing keys get the
// localhost defaults so Next's /backend rewrite matches the API bind.
try {
  process.loadEnvFile(join(import.meta.dirname, "..", ".env"));
} catch (error) {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code !== "ENOENT") throw error;
}

const apiHost = process.env.API_HOST || "127.0.0.1";
const apiPort = process.env.API_PORT || "4050";
const env = {
  ...process.env,
  API_HOST: apiHost,
  API_PORT: apiPort,
  API_URL: process.env.API_URL || `http://${apiHost}:${apiPort}`,
};

const children = ["@carbadapt/web", "@carbadapt/api", "@carbadapt/worker"].map((workspace) =>
  spawn("npm", ["run", "dev", "-w", workspace], {
    stdio: "inherit",
    env,
  }),
);

let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 500);
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (stopping) return;
    stop(signal ? 0 : (code ?? 1));
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
