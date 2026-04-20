const { env } = require('../config/env');
const { prismaStatus } = require('../lib/prisma');
const { sendSuccess } = require('../utils/api-response');

async function getHealth(_req, res) {
  const dbStatus = await prismaStatus();

  return sendSuccess(res, {
    service: 'structura-backend',
    environment: env.nodeEnv,
    port: env.port,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };
