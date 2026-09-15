import app from "./app.js";

import env from "./config/env.js";
import {
  verifyMailConnection
} from "./config/mail.js";

import { 
  connectDatabase,
  disconnectDatabase
} from "./config/database.js";




const startServer = async () => {
  await connectDatabase();
  await verifyMailConnection();
  const server = app.listen(env.port, () => {
    console.log("");
    console.log("=================================");
    console.log("     TRAVEL CRM BACKEND");
    console.log("=================================");
    console.log(`🚀 Server: http://localhost:${env.port}`);
    console.log(
      `❤️  Health: http://localhost:${env.port}/health`
    );
    console.log("=================================");
    console.log("");
  });

  const shutdown = async () => {
    console.log("Shutting down server...");

    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();