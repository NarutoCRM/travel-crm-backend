import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import env from "./env.js";

const adapter = new PrismaPg({
  connectionString: env.databaseUrl
});

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["warn", "error"]
      : ["error"]
});

const connectDatabase = async () => {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL connected");
    console.log("✅ Prisma Client connected");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);

    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export {
  prisma,
  connectDatabase,
  disconnectDatabase
};