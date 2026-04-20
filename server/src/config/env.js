const fs = require('fs');
const path = require('path');

const dotenvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '5001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'structura-dev-secret',
};

module.exports = { env };
