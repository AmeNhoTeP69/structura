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
  deleteProjectService,
} = require('../services/project.service');

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

    return sendSuccess(res, result, 201);
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
  deleteLegacyProject,
};
