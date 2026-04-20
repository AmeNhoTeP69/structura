const { Router } = require('express');

const {
  listUsers,
  loginUser,
  createLegacyUser,
  updateLegacyUser,
  deleteLegacyUser,
  listProjects,
  getProjectById,
  createLegacyProject,
  transitionProjectRequestToProject,
  updateLegacyProject,
  listProjectAssignments,
  createProjectAssignment,
  updateProjectAssignment,
  deleteProjectAssignment,
  listProjectTimelineLogs,
  createProjectTimelineLog,
  updateProjectTimelineLog,
  deleteProjectTimelineLog,
  listProjectDocuments,
  createProjectDocument,
  getProjectDocumentDownload,
  deleteProjectDocument,
  deleteLegacyProject,
} = require('../controllers/legacy.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorizeRoles } = require('../middlewares/authorize-roles');
const {
  validateRequest,
  validateAssignmentBody,
  validateAssignmentPatchBody,
  validateTimelineLogBody,
  validateTimelineLogPatchBody,
} = require('../middlewares/request-validation');
const { uploadProjectDocument } = require('../middlewares/upload');

const legacyRouter = Router();

// Legacy JSON-backed endpoints kept temporarily during phase 1 migration.
legacyRouter.post('/users/login', loginUser);
legacyRouter.get('/users', authenticate, authorizeRoles('ADMIN'), listUsers);
legacyRouter.post('/users', authenticate, authorizeRoles('ADMIN'), createLegacyUser);
legacyRouter.put('/users/:id', authenticate, authorizeRoles('ADMIN'), updateLegacyUser);
legacyRouter.delete('/users/:id', authenticate, authorizeRoles('ADMIN'), deleteLegacyUser);

legacyRouter.get('/projects', authenticate, authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'), listProjects);
legacyRouter.get('/projects/:id', authenticate, authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'), getProjectById);
legacyRouter.get(
  '/projects/:id/assignments',
  authenticate,
  authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'),
  listProjectAssignments,
);
legacyRouter.post('/projects', authenticate, authorizeRoles('ADMIN'), createLegacyProject);
legacyRouter.post(
  '/projects/:id/assignments',
  authenticate,
  authorizeRoles('ADMIN'),
  validateRequest(validateAssignmentBody),
  createProjectAssignment,
);
legacyRouter.patch(
  '/projects/:id/assignments/:assignmentId',
  authenticate,
  authorizeRoles('ADMIN'),
  validateRequest(validateAssignmentPatchBody),
  updateProjectAssignment,
);
legacyRouter.delete(
  '/projects/:id/assignments/:assignmentId',
  authenticate,
  authorizeRoles('ADMIN'),
  deleteProjectAssignment,
);
legacyRouter.get(
  '/projects/:id/timeline-logs',
  authenticate,
  authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'),
  listProjectTimelineLogs,
);
legacyRouter.post(
  '/projects/:id/timeline-logs',
  authenticate,
  authorizeRoles('EMPLOYEE', 'ADMIN'),
  validateRequest(validateTimelineLogBody),
  createProjectTimelineLog,
);
legacyRouter.get(
  '/projects/:id/documents',
  authenticate,
  authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'),
  listProjectDocuments,
);
legacyRouter.post(
  '/projects/:id/documents',
  authenticate,
  authorizeRoles('EMPLOYEE', 'ADMIN'),
  uploadProjectDocument,
  createProjectDocument,
);
legacyRouter.get(
  '/projects/:id/documents/:documentId/download',
  authenticate,
  authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'),
  getProjectDocumentDownload,
);
legacyRouter.delete(
  '/projects/:id/documents/:documentId',
  authenticate,
  authorizeRoles('EMPLOYEE', 'ADMIN'),
  deleteProjectDocument,
);
legacyRouter.patch(
  '/projects/:id/timeline-logs/:logId',
  authenticate,
  authorizeRoles('EMPLOYEE', 'ADMIN'),
  validateRequest(validateTimelineLogPatchBody),
  updateProjectTimelineLog,
);
legacyRouter.delete(
  '/projects/:id/timeline-logs/:logId',
  authenticate,
  authorizeRoles('EMPLOYEE', 'ADMIN'),
  deleteProjectTimelineLog,
);
legacyRouter.post(
  '/project-requests/:id/transition-to-project',
  authenticate,
  authorizeRoles('ADMIN'),
  transitionProjectRequestToProject,
);
legacyRouter.put('/projects/:id', authenticate, authorizeRoles('EMPLOYEE', 'ADMIN'), updateLegacyProject);
legacyRouter.delete('/projects/:id', authenticate, authorizeRoles('ADMIN'), deleteLegacyProject);

module.exports = { legacyRouter };
