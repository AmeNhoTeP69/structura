const path = require('path');
const { sendSuccess } = require('../utils/api-response');
const { createHttpError } = require('../utils/http-error');
const { toPublicUser } = require('../utils/user-mapper');
const {
  listUsersService,
  authenticateUserService,
  createUserService,
  updateUserService,
  deleteUserService,
} = require('../services/user.service');
const {
  listProjectsService,
  getProjectByIdService,
  createProjectService,
  createProjectFromRequestService,
  updateProjectService,
  listProjectAssignmentsService,
  createProjectAssignmentService,
  updateProjectAssignmentService,
  deleteProjectAssignmentService,
  listProjectTimelineLogsService,
  createProjectTimelineLogService,
  updateProjectTimelineLogService,
  deleteProjectTimelineLogService,
  listProjectDocumentsService,
  createProjectDocumentService,
  getProjectDocumentDownloadService,
  deleteProjectDocumentService,
  deleteProjectService,
} = require('../services/project.service');
const { createNotificationForUser, notifyAdmins } = require('../services/notification.service');

async function listUsers(_req, res, next) {
  try {
    const users = await listUsersService();
    return sendSuccess(res, users.map(toPublicUser));
  } catch (error) {
    return next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authenticateUserService(email, password);

    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    return sendSuccess(res, toPublicUser(user));
  } catch (error) {
    return next(error);
  }
}

async function createLegacyUser(req, res, next) {
  try {
    const user = await createUserService(req.body);
    return sendSuccess(res, toPublicUser(user), 201);
  } catch (error) {
    return next(error);
  }
}

async function updateLegacyUser(req, res, next) {
  try {
    const user = await updateUserService(req.params.id, req.body);

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    return sendSuccess(res, toPublicUser(user));
  } catch (error) {
    return next(error);
  }
}

async function deleteLegacyUser(req, res, next) {
  try {
    await deleteUserService(req.params.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

async function listProjects(req, res, next) {
  try {
    return sendSuccess(res, await listProjectsService(req.auth?.user));
  } catch (error) {
    return next(error);
  }
}

async function getProjectById(req, res, next) {
  try {
    const project = await getProjectByIdService(req.params.id, req.auth?.user);

    if (!project) {
      return next(createHttpError(404, 'Project not found'));
    }

    return sendSuccess(res, project);
  } catch (error) {
    return next(error);
  }
}

async function createLegacyProject(req, res, next) {
  try {
    const project = await createProjectService(req.body, req.auth?.user?.id);
    return sendSuccess(res, project, 201);
  } catch (error) {
    return next(error);
  }
}

async function transitionProjectRequestToProject(req, res, next) {
  try {
    const project = await createProjectFromRequestService(req.params.id, req.auth?.user?.id);

    if (!project) {
      return next(createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND'));
    }

    if (project.error === 'REQUEST_NOT_APPROVED') {
      return next(
        createHttpError(
          400,
          'Only approved project requests can be converted to projects',
          'PROJECT_REQUEST_NOT_APPROVED',
        ),
      );
    }

    await createNotificationForUser(project.clientId, {
      type: 'PROJECT_CREATED',
      title: 'Project created',
      message: `Your request has been converted into project ${project.title}.`,
      relatedEntityType: 'PROJECT',
      relatedEntityId: project.id,
    });

    return sendSuccess(res, project, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateLegacyProject(req, res, next) {
  try {
    const existingProject = await getProjectByIdService(req.params.id, req.auth?.user);

    if (!existingProject) {
      return next(createHttpError(404, 'Project not found'));
    }

    const project = await updateProjectService(req.params.id, req.body);

    if (!project) {
      return next(createHttpError(404, 'Project not found'));
    }

    if (existingProject.status !== project.status) {
      await createNotificationForUser(project.clientId, {
        type: 'PROJECT_STATUS_CHANGED',
        title: 'Project status updated',
        message: `${project.title} moved to ${project.status.replaceAll('-', ' ')}.`,
        relatedEntityType: 'PROJECT',
        relatedEntityId: project.id,
      });
    }

    return sendSuccess(res, project);
  } catch (error) {
    return next(error);
  }
}

async function deleteLegacyProject(req, res, next) {
  try {
    await deleteProjectService(req.params.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

async function listProjectAssignments(req, res, next) {
  try {
    const assignments = await listProjectAssignmentsService(req.params.id, req.auth?.user);

    if (!assignments) {
      return next(createHttpError(404, 'Project not found'));
    }

    return sendSuccess(res, assignments);
  } catch (error) {
    return next(error);
  }
}

async function createProjectAssignment(req, res, next) {
  try {
    const assignment = await createProjectAssignmentService(
      req.params.id,
      req.body,
      req.auth?.user?.id,
    );

    if (!assignment) {
      return next(createHttpError(404, 'Project not found'));
    }

    if (assignment.error === 'EMPLOYEE_NOT_FOUND') {
      return next(createHttpError(400, 'Employee not found or inactive', 'EMPLOYEE_NOT_FOUND'));
    }

    if (assignment.error === 'ASSIGNMENT_ALREADY_EXISTS') {
      return next(createHttpError(400, 'Employee is already assigned to this project', 'ASSIGNMENT_ALREADY_EXISTS'));
    }

    await createNotificationForUser(assignment.employeeUserId, {
      type: 'PROJECT_ASSIGNED',
      title: 'New project assignment',
      message: `You were assigned to project #${req.params.id}${assignment.assignmentRole ? ` as ${assignment.assignmentRole}` : ''}.`,
      relatedEntityType: 'PROJECT',
      relatedEntityId: req.params.id,
    });

    return sendSuccess(res, assignment, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateProjectAssignment(req, res, next) {
  try {
    const assignment = await updateProjectAssignmentService(
      req.params.id,
      req.params.assignmentId,
      req.body,
    );

    if (!assignment) {
      return next(createHttpError(404, 'Project assignment not found'));
    }

    if (assignment.error === 'EMPLOYEE_NOT_FOUND') {
      return next(createHttpError(400, 'Employee not found or inactive', 'EMPLOYEE_NOT_FOUND'));
    }

    if (assignment.error === 'ASSIGNMENT_ALREADY_EXISTS') {
      return next(createHttpError(400, 'Employee is already assigned to this project', 'ASSIGNMENT_ALREADY_EXISTS'));
    }

    return sendSuccess(res, assignment);
  } catch (error) {
    return next(error);
  }
}

async function deleteProjectAssignment(req, res, next) {
  try {
    const deleted = await deleteProjectAssignmentService(req.params.id, req.params.assignmentId);

    if (!deleted) {
      return next(createHttpError(404, 'Project assignment not found'));
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

async function listProjectTimelineLogs(req, res, next) {
  try {
    const timelineLogs = await listProjectTimelineLogsService(req.params.id, req.auth?.user);

    if (!timelineLogs) {
      return next(createHttpError(404, 'Project not found'));
    }

    return sendSuccess(res, timelineLogs);
  } catch (error) {
    return next(error);
  }
}

async function createProjectTimelineLog(req, res, next) {
  try {
    const result = await createProjectTimelineLogService(req.params.id, req.body, req.auth?.user);

    if (!result) {
      return next(createHttpError(404, 'Project not found'));
    }

    const project = await getProjectByIdService(req.params.id, req.auth?.user);
    const posterRole = req.auth?.user?.role;
    const posterId = req.auth?.user?.id;

    if (project) {
      const isVisibleToAll = result.timelineLog?.visibility === 'all';

      // Always notify the client when visibility=all and the poster is not the client
      if (isVisibleToAll && posterId !== project.clientId) {
        await createNotificationForUser(project.clientId, {
          type: 'PROJECT_TIMELINE_UPDATED',
          title: 'New project update',
          message: `${result.timelineLog?.authorName || 'Team'} posted an update on "${project.title}".`,
          relatedEntityType: 'PROJECT',
          relatedEntityId: project.id,
        });
      }

      // If poster is ADMIN → also notify all assigned employees
      if (posterRole === 'ADMIN' && project.assignments?.length) {
        const employeeIds = project.assignments
          .map((a) => a.employeeUserId)
          .filter((id, idx, arr) => id && arr.indexOf(id) === idx);

        await Promise.all(
          employeeIds.map((empId) =>
            createNotificationForUser(empId, {
              type: 'PROJECT_ACTIVITY',
              title: 'Project update from admin',
              message: `Admin posted an update on "${project.title}".`,
              relatedEntityType: 'PROJECT',
              relatedEntityId: project.id,
            }),
          ),
        );
      }

      // If poster is EMPLOYEE → notify admins
      if (posterRole === 'EMPLOYEE') {
        await notifyAdmins({
          type: 'PROJECT_ACTIVITY',
          title: 'Project activity',
          message: `${result.timelineLog?.authorName || 'An employee'} posted an update on "${project.title}".`,
          relatedEntityType: 'PROJECT',
          relatedEntityId: project.id,
        });
      }
    }

    return sendSuccess(res, result, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateProjectTimelineLog(req, res, next) {
  try {
    const timelineLog = await updateProjectTimelineLogService(
      req.params.id,
      req.params.logId,
      req.body,
      req.auth?.user,
    );

    if (!timelineLog) {
      return next(createHttpError(404, 'Timeline log not found'));
    }

    if (timelineLog.error === 'FORBIDDEN') {
      return next(createHttpError(403, 'You cannot edit this timeline log', 'FORBIDDEN'));
    }

    return sendSuccess(res, timelineLog);
  } catch (error) {
    return next(error);
  }
}

async function deleteProjectTimelineLog(req, res, next) {
  try {
    const deleted = await deleteProjectTimelineLogService(
      req.params.id,
      req.params.logId,
      req.auth?.user,
    );

    if (!deleted) {
      return next(createHttpError(404, 'Timeline log not found'));
    }

    if (deleted.error === 'FORBIDDEN') {
      return next(createHttpError(403, 'You cannot delete this timeline log', 'FORBIDDEN'));
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

async function listProjectDocuments(req, res, next) {
  try {
    const documents = await listProjectDocumentsService(req.params.id, req.auth?.user);

    if (!documents) {
      return next(createHttpError(404, 'Project not found'));
    }

    return sendSuccess(res, documents);
  } catch (error) {
    return next(error);
  }
}

async function createProjectDocument(req, res, next) {
  try {
    const payload = {
      ...req.body,
      fileName: req.body.fileName || (req.file ? req.file.originalname : undefined),
      filePath: req.file ? `/uploads/projects/${req.params.id}/${req.file.filename}` : undefined,
      mimeType: req.file ? req.file.mimetype : req.body.mimeType,
      fileSize: req.file ? req.file.size : req.body.fileSize,
    };
    const document = await createProjectDocumentService(req.params.id, payload, req.auth?.user);

    if (!document) {
      return next(createHttpError(404, 'Project not found'));
    }

    const project = await getProjectByIdService(req.params.id, req.auth?.user);

    if (project && document.visibility === 'all' && req.auth?.user?.id !== project.clientId) {
      await createNotificationForUser(project.clientId, {
        type: 'PROJECT_DOCUMENT_ADDED',
        title: 'New project document',
        message: `${document.name} was added to ${project.title}.`,
        relatedEntityType: 'PROJECT',
        relatedEntityId: project.id,
      });
    }

    return sendSuccess(res, document, 201);
  } catch (error) {
    return next(error);
  }
}

async function getProjectDocumentDownload(req, res, next) {
  try {
    const document = await getProjectDocumentDownloadService(
      req.params.id,
      req.params.documentId,
      req.auth?.user,
    );

    if (!document) {
      return next(createHttpError(404, 'Project document not found'));
    }

    if (!document.filePath) {
      return next(createHttpError(404, 'File not found for this document entry'));
    }

    const absolutePath = path.join(process.cwd(), document.filePath);
    return res.download(absolutePath, document.fileName || 'document');
  } catch (error) {
    return next(error);
  }
}

async function deleteProjectDocument(req, res, next) {
  try {
    const deleted = await deleteProjectDocumentService(
      req.params.id,
      req.params.documentId,
      req.auth?.user,
    );

    if (!deleted) {
      return next(createHttpError(404, 'Project document not found'));
    }

    if (deleted.error === 'FORBIDDEN') {
      return next(createHttpError(403, 'You cannot delete this project document', 'FORBIDDEN'));
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
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
};
