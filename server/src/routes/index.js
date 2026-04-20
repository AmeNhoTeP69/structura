const { Router } = require('express');

const { healthRouter } = require('./health.routes');
const { authRouter } = require('./auth.routes');
const { publicRouter } = require('./public.routes');
const { projectRequestRouter } = require('./project-request.routes');
const { adminRouter } = require('./admin.routes');
const { legacyRouter } = require('./legacy.routes');

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/public', publicRouter);
apiRouter.use('/project-requests', projectRequestRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use(legacyRouter);

module.exports = { apiRouter };
