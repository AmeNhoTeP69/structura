const express = require('express');
const cors = require('cors');

const { env } = require('./config/env');
const { apiRouter } = require('./routes');
const { notFoundHandler } = require('./middlewares/not-found-handler');
const { errorHandler } = require('./middlewares/error-handler');

function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: env.jsonBodyLimit }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    req.requestStartedAt = Date.now();
    next();
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
