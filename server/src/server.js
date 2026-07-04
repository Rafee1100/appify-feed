import env from "./config/env.js";
import app from "./app.js";
import { query, close as closeDb } from "./config/db.js";

async function startServer() {
  try {
    await query("SELECT 1");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`server is running on port ${env.PORT}`);
  });

  const shutdown = async () => {
    console.log("Shutting down server...");
    server.close(async () => {
      try {
        await closeDb();
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
