import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageDir, "../..");

config({ path: resolve(repoRoot, ".env"), quiet: true });

// Generate and validate do not open a connection. They only require the
// variable to be set. The fallback matches .env.example for a checkout
// that has not copied that file yet.
process.env.DATABASE_URL ??= "mysql://carbadapt:carbadapt@127.0.0.1:3306/carbadapt";

// npm workspaces hoist the CLI to the repo root. A local install keeps it
// next to this package. Use whichever is present.
const prismaBin = [packageDir, repoRoot]
  .map((dir) => resolve(dir, "node_modules/.bin/prisma"))
  .find((candidate) => existsSync(candidate));

if (!prismaBin) {
  console.error("prisma CLI not found. Run npm install from the repo root.");
  process.exit(1);
}

const child = spawn(prismaBin, process.argv.slice(2), {
  cwd: packageDir,
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
