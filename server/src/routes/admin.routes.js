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
const { authenticate } = require('../middlewares/authenticate');
const { authorizeRoles } = require('../middlewares/authorize-roles');

const adminRouter = Router();

adminRouter.use(authenticate, authorizeRoles('ADMIN'));

adminRouter.get('/project-requests', listAdminProjectRequests);
adminRouter.get('/project-requests/:id', getAdminProjectRequest);
adminRouter.put('/project-requests/:id', updateAdminProjectRequest);
adminRouter.get('/employee-types', listEmployeeTypes);
adminRouter.post('/employee-types', createEmployeeType);
adminRouter.put('/employee-types/:id', updateEmployeeType);
adminRouter.delete('/employee-types/:id', deleteEmployeeType);
adminRouter.get('/employees/:userId/profile', getEmployeeProfile);
adminRouter.put('/employees/:userId/profile', updateEmployeeProfile);

module.exports = { adminRouter };
