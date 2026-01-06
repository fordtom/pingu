import { createServer, shutdown } from "./src/server";
import { config } from "./src/config";

const server = createServer();

const protocol = config.tlsEnabled ? "https" : "http";
console.log(`Pingu listening on ${protocol}://${config.host}:${config.port}`);

const exit = () => {
  shutdown();
  server.stop();
  process.exit(0);
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
