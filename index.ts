import { createServer, shutdown } from "./src/server";
import { config } from "./src/config";

const server = createServer();

console.log(`Pingu listening on http://${config.host}:${config.port}`);

process.on("SIGINT", () => {
  console.log("\nShutting down...");
  shutdown();
  server.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  server.stop();
  process.exit(0);
});
