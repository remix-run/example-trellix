import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

process.on("beforeExit", () => {
  prisma.$disconnect();
});

export { prisma };
