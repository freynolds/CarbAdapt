import { createApp } from "./app.js";
import { readConfig } from "./config/env.js";

const config = readConfig();
const app = createApp(config);

app.listen(config.API_PORT, config.API_HOST, () => {
  console.log(`api listening on http://${config.API_HOST}:${config.API_PORT} (${config.APP_ENV})`);
});
