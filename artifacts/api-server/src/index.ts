import { createServer } from "http";
import app from "./app";
import { setupRealtime } from "./lib/realtime";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
setupRealtime(httpServer);

httpServer.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
