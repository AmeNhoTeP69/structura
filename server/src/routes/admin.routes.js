const { Router } = require('express');

const {
  listAdminProjectRequests,
  getAdminProjectRequest,
  updateAdminProjectRequest,
} = require('../controllers/admin-project-request.controller');
const {
  listEmployeeTypes,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType,
  getEmployeeProfile,
  updateEmployeeProfile,
} = require('../controllers/admin-employee.controller');
const {
  getAdminHomeContent,
  updateAdminHomeContent,
  getAdminPublicSettings,
  updateAdminPublicSettings,
  listAdminContactMessages,
  updateAdminContactMessage,
} = require('../controllers/admin-site.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorizeRoles } = require('../middlewares/authorize-roles');
const {
  validateRequest,
  validateAdminProjectRequestUpdateBody,
  validateSiteHomeContentBody,
  validatePublicSettingsBody,
  validateContactStatusBody,
} = require('../middlewares/request-validation');

const adminRouter = Router();

adminRouter.use(authenticate, authorizeRoles('ADMIN'));

adminRouter.get('/project-requests', listAdminProjectRequests);
adminRouter.get('/project-requests/:id', getAdminProjectRequest);
adminRouter.put(
  '/project-requests/:id',
  validateRequest(validateAdminProjectRequestUpdateBody),
  updateAdminProjectRequest,
);
adminRouter.get('/employee-types', listEmployeeTypes);
adminRouter.post('/employee-types', createEmployeeType);
adminRouter.put('/employee-types/:id', updateEmployeeType);
adminRouter.delete('/employee-types/:id', deleteEmployeeType);
adminRouter.get('/employees/:userId/profile', getEmployeeProfile);
adminRouter.put('/employees/:userId/profile', updateEmployeeProfile);
adminRouter.get('/site-content/home', getAdminHomeContent);
adminRouter.put('/site-content/home', validateRequest(validateSiteHomeContentBody), updateAdminHomeContent);
adminRouter.get('/site-settings', getAdminPublicSettings);
adminRouter.put('/site-settings', validateRequest(validatePublicSettingsBody), updateAdminPublicSettings);
adminRouter.get('/contact-messages', listAdminContactMessages);
adminRouter.patch('/contact-messages/:id', validateRequest(validateContactStatusBody), updateAdminContactMessage);

module.exports = { adminRouter };
