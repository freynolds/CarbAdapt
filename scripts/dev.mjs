import { spawn } from "node:child_process";
import process from "node:process";
import { setTimeout } from "node:timers";

const children = ["@carbadapt/web", "@carbadapt/api"].map((workspace) =>
  spawn("npm", ["run", "dev", "-w", workspace], {
    stdio: "inherit",
    env: process.env,
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
