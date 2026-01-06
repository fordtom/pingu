import { createServer, shutdown } from "./src/server";
import { config } from "./src/config";

const server = createServer();

console.log(`Pingu listening on http://${config.host}:${config.port}`);

const exit = () => {
  shutdown();
  server.stop();
  process.exit(0);
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
