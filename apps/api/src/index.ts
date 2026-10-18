import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createApp } from "./app.js";

for (const path of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")]) {
  if (existsSync(path)) config({ path, override: false });
}

const port = Number(process.env.API_PORT ?? 4000);
const app = createApp();
app.listen(port, () => {
  console.log(`CarbAdapt API listening on http://localhost:${port}`);
});
