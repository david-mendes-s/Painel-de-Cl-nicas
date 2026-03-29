import "dotenv/config";
import type { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL,
  },
} satisfies PrismaConfig;