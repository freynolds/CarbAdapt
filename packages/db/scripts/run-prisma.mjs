import { spawn } from "node:child_process";
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

const prismaBin = resolve(packageDir, "node_modules/.bin/prisma");
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
