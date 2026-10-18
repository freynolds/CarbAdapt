import { createApp } from "./app.js";
import { readApiEnv } from "./schemas/env.js";

const env = readApiEnv();
const app = createApp();

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(`api listening on http://${env.API_HOST}:${env.API_PORT}`);
});
