let PrismaClient;
let prisma;

try {
  ({ PrismaClient } = require('@prisma/client'));
  prisma = new PrismaClient();
} catch (_error) {
  prisma = null;
}

async function prismaStatus() {
  if (!prisma) {
    return {
      available: false,
      connected: false,
      reason: 'Prisma client is not installed or not generated yet.',
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { available: true, connected: true };
  } catch (error) {
    return {
      available: true,
      connected: false,
      reason: error.message,
    };
  }
}

module.exports = { prisma, prismaStatus };
