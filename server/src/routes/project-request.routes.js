const { Router } = require('express');

const {
  listClientProjectRequests,
  getClientProjectRequest,
  createClientProjectRequest,
  updateClientProjectRequest,
  submitClientProjectRequest,
  respondToClientProjectRequest,
} = require('../controllers/project-request.controller');
const {
  transitionProjectRequestToProject,
} = require('../controllers/legacy.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorizeRoles } = require('../middlewares/authorize-roles');
const {
  validateRequest,
  validateProjectRequestBody,
  validateProjectRequestResponseBody,
} = require('../middlewares/request-validation');

const projectRequestRouter = Router();

projectRequestRouter.post(
  '/:id/transition-to-project',
  authenticate,
  authorizeRoles('ADMIN'),
  transitionProjectRequestToProject,
);

projectRequestRouter.use(authenticate, authorizeRoles('CLIENT'));
projectRequestRouter.get('/mine', listClientProjectRequests);
projectRequestRouter.get('/:id', getClientProjectRequest);
projectRequestRouter.post('/', validateRequest(validateProjectRequestBody), createClientProjectRequest);
projectRequestRouter.put('/:id', validateRequest(validateProjectRequestBody), updateClientProjectRequest);
projectRequestRouter.post('/:id/submit', submitClientProjectRequest);
projectRequestRouter.post(
  '/:id/respond',
  validateRequest(validateProjectRequestResponseBody),
  respondToClientProjectRequest,
);

module.exports = { projectRequestRouter };
