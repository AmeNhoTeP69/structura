const { prisma } = require('../lib/prisma');

function toLegacyAssignment(assignment) {
  if (!assignment) return null;

  return {
    id: String(assignment.id),
    projectId: String(assignment.projectId),
    employeeUserId: String(assignment.employeeUserId),
    assignedByAdminId: assignment.assignedByAdminId ? String(assignment.assignedByAdminId) : null,
    assignmentRole: assignment.assignmentRole || '',
    isLead: Boolean(assignment.isLead),
    assignedAt: assignment.assignedAt.toISOString(),
    employeeName: assignment.employeeUser?.fullName || '',
    employeeEmail: assignment.employeeUser?.email || '',
    employeeTypeId: assignment.employeeUser?.employeeProfile?.employeeTypeId
      ? String(assignment.employeeUser.employeeProfile.employeeTypeId)
      : null,
    employeeTypeName: assignment.employeeUser?.employeeProfile?.employeeType?.name || '',
    speciality: assignment.employeeUser?.employeeProfile?.speciality || '',
  };
}

function toLegacyTimelineLog(log) {
  if (!log) return null;

  return {
    id: String(log.id),
    projectId: String(log.projectId),
    authorUserId: String(log.authorUserId),
    authorName: log.authorUser?.fullName || '',
    logType: String(log.logType || '').toLowerCase().replaceAll('_', '-'),
    message: log.message,
    visibility: String(log.visibility || '').toLowerCase().replaceAll('_', '-'),
    progressValue: log.progressValue ?? undefined,
    createdAt: log.createdAt.toISOString(),
  };
}

function toLegacyProjectUpdate(log) {
  if (!log) return null;

  return {
    id: String(log.id),
    date: log.createdAt.toISOString().split('T')[0],
    authorName: log.authorUser?.fullName || '',
    content: log.message,
  };
}

function filterVisibleTimelineLogs(timelineLogs, authUser) {
  if (!timelineLogs || timelineLogs.length === 0) {
    return [];
  }

  if (!authUser || authUser.role === 'CLIENT') {
    return timelineLogs.filter((log) => log.visibility === 'ALL');
  }

  return timelineLogs;
}

function toLegacyProject(project, authUser) {
  if (!project) return null;

  const mappedAssignments = (project.assignments || []).map(toLegacyAssignment);
  const leadAssignment = mappedAssignments.find((assignment) => assignment.isLead) || mappedAssignments[0] || null;
  const visibleTimelineLogs = filterVisibleTimelineLogs(project.timelineLogs || [], authUser);

  return {
    id: String(project.id),
    projectRequestId: String(project.projectRequestId),
    title: project.title,
    description: project.description,
    status: String(project.status || '').toLowerCase().replaceAll('_', '-'),
    clientId: String(project.clientId),
    clientName: project.client?.fullName || '',
    progress: project.progress,
    employeeId: leadAssignment?.employeeUserId || undefined,
    employeeName: leadAssignment?.employeeName || undefined,
    startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : null,
    endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
    budget: project.budget ? String(project.budget) : '',
    location: project.location,
    assignments: mappedAssignments,
    documents: [],
    updates: visibleTimelineLogs.map(toLegacyProjectUpdate),
  };
}

function buildProjectAccessWhere(id, authUser) {
  const projectId = Number(id);

  if (!authUser || authUser.role === 'ADMIN') {
    return { id: projectId };
  }

  if (authUser.role === 'CLIENT') {
    return {
      id: projectId,
      clientId: Number(authUser.id),
    };
  }

  if (authUser.role === 'EMPLOYEE') {
    return {
      id: projectId,
      assignments: {
        some: {
          employeeUserId: Number(authUser.id),
        },
      },
    };
  }

  return { id: -1 };
}

function buildProjectListWhere(authUser) {
  if (!authUser || authUser.role === 'ADMIN') {
    return {};
  }

  if (authUser.role === 'CLIENT') {
    return {
      clientId: Number(authUser.id),
    };
  }

  if (authUser.role === 'EMPLOYEE') {
    return {
      assignments: {
        some: {
          employeeUserId: Number(authUser.id),
        },
      },
    };
  }

  return { id: -1 };
}

const projectInclude = {
  client: true,
  assignments: {
    include: {
      employeeUser: {
        include: {
          employeeProfile: {
            include: {
              employeeType: true,
            },
          },
        },
      },
      assignedByAdmin: true,
    },
    orderBy: [{ isLead: 'desc' }, { assignedAt: 'asc' }],
  },
  timelineLogs: {
    include: {
      authorUser: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
};

async function getProjectById(id, authUser) {
  const project = await prisma.project.findFirst({
    where: buildProjectAccessWhere(id, authUser),
    include: projectInclude,
  });

  return toLegacyProject(project, authUser);
}

async function listProjects(authUser) {
  const projects = await prisma.project.findMany({
    where: buildProjectListWhere(authUser),
    include: projectInclude,
    orderBy: { createdAt: 'desc' },
  });

  return projects.map((project) => toLegacyProject(project, authUser));
}

async function createProject(projectData, adminUserId) {
  let projectRequestId = Number(projectData.projectRequestId);

  if (!projectRequestId) {
    const request = await prisma.projectRequest.create({
      data: {
        clientId: Number(projectData.clientId),
        referenceCode: `REQ-${projectData.id || Date.now()}`,
        title: projectData.title,
        description: projectData.description || '',
        location: projectData.location || '',
        requestedStartDate: projectData.startDate ? new Date(projectData.startDate) : null,
        requestedBudget: projectData.budget ? Number(projectData.budget) : null,
        status: 'APPROVED',
        submittedAt: new Date(),
        reviewedAt: new Date(),
        clientRespondedAt: new Date(),
      },
    });

    projectRequestId = request.id;
  }

  const project = await prisma.project.create({
    data: {
      projectRequestId,
      clientId: Number(projectData.clientId),
      referenceCode: projectData.referenceCode || projectData.id || `PRJ-${Date.now()}`,
      title: projectData.title,
      description: projectData.description || '',
      location: projectData.location || '',
      startDate: projectData.startDate ? new Date(projectData.startDate) : null,
      endDate: projectData.endDate ? new Date(projectData.endDate) : null,
      budget: projectData.budget ? Number(projectData.budget) : null,
      status: String(projectData.status || 'pending').toUpperCase().replaceAll('-', '_'),
      progress: Number(projectData.progress || 0),
      assignments:
        projectData.employeeId || projectData.employeeUserId
          ? {
              create: {
                employeeUserId: Number(projectData.employeeId || projectData.employeeUserId),
                assignedByAdminId: adminUserId ? Number(adminUserId) : null,
                assignmentRole: projectData.assignmentRole || 'Lead engineer',
                isLead: true,
              },
            }
          : undefined,
    },
    include: projectInclude,
  });

  return toLegacyProject(project, { role: 'ADMIN' });
}

async function createProjectFromRequest(requestId, adminUserId) {
  const existingRequest = await prisma.projectRequest.findUnique({
    where: { id: Number(requestId) },
    include: {
      client: true,
      services: true,
      documents: true,
      project: true,
    },
  });

  if (!existingRequest) {
    return null;
  }

  if (existingRequest.project) {
    return toLegacyProject(
      await prisma.project.findUnique({
        where: { id: existingRequest.project.id },
        include: projectInclude,
      }),
      { role: 'ADMIN' },
    );
  }

  if (existingRequest.status !== 'APPROVED') {
    return { error: 'REQUEST_NOT_APPROVED' };
  }

  const project = await prisma.project.create({
    data: {
      projectRequestId: existingRequest.id,
      clientId: existingRequest.clientId,
      referenceCode: `PRJ-${existingRequest.referenceCode.replace(/^REQ-/, '')}`,
      title: existingRequest.title,
      description: existingRequest.description,
      location: existingRequest.location,
      startDate: existingRequest.adminProposedStartDate || existingRequest.requestedStartDate,
      budget: existingRequest.adminProposedBudget || existingRequest.requestedBudget,
      status: 'NOT_STARTED',
      progress: 0,
      createdByAdminId: adminUserId ? Number(adminUserId) : null,
      services: {
        create: existingRequest.services.map((service) => ({
          serviceId: service.serviceId,
          notes: service.notes || null,
        })),
      },
      documents: {
        create: existingRequest.documents.map((document) => ({
          uploadedByUserId: document.uploadedByUserId,
          sourceRequestDocumentId: document.id,
          documentType: 'REQUEST_COPY',
          fileName: document.fileName,
          filePath: document.filePath,
          mimeType: document.mimeType,
          fileSize: document.fileSize,
          visibility: 'ALL',
        })),
      },
      statusHistory: {
        create: {
          oldStatus: null,
          newStatus: 'NOT_STARTED',
          changedByUserId: adminUserId ? Number(adminUserId) : null,
          comment: 'Project created from approved project request.',
        },
      },
    },
    include: projectInclude,
  });

  return toLegacyProject(project, { role: 'ADMIN' });
}

async function updateProject(id, updates) {
  const existingProject = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: projectInclude,
  });

  if (!existingProject) return null;

  const project = await prisma.project.update({
    where: { id: Number(id) },
    data: {
      title: updates.title ?? existingProject.title,
      description: updates.description ?? existingProject.description,
      location: updates.location ?? existingProject.location,
      startDate: updates.startDate ? new Date(updates.startDate) : existingProject.startDate,
      endDate: updates.endDate ? new Date(updates.endDate) : existingProject.endDate,
      budget: updates.budget ? Number(updates.budget) : existingProject.budget,
      status: updates.status
        ? String(updates.status).toUpperCase().replaceAll('-', '_')
        : existingProject.status,
      progress: updates.progress ?? existingProject.progress,
    },
    include: projectInclude,
  });

  return toLegacyProject(project, { role: 'ADMIN' });
}

async function listProjectAssignments(projectId, authUser) {
  const project = await prisma.project.findFirst({
    where: buildProjectAccessWhere(projectId, authUser),
    select: { id: true },
  });

  if (!project) {
    return null;
  }

  const assignments = await prisma.projectAssignment.findMany({
    where: { projectId: Number(projectId) },
    include: {
      employeeUser: {
        include: {
          employeeProfile: {
            include: {
              employeeType: true,
            },
          },
        },
      },
      assignedByAdmin: true,
    },
    orderBy: [{ isLead: 'desc' }, { assignedAt: 'asc' }],
  });

  return assignments.map(toLegacyAssignment);
}

async function createProjectAssignment(projectId, payload, adminUserId) {
  const employeeUserId = Number(payload.employeeUserId);

  const [project, employee] = await Promise.all([
    prisma.project.findUnique({ where: { id: Number(projectId) }, select: { id: true } }),
    prisma.user.findFirst({
      where: { id: employeeUserId, role: 'EMPLOYEE', isActive: true },
      select: { id: true },
    }),
  ]);

  if (!project) {
    return null;
  }

  if (!employee) {
    return { error: 'EMPLOYEE_NOT_FOUND' };
  }

  const duplicateAssignment = await prisma.projectAssignment.findFirst({
    where: {
      projectId: Number(projectId),
      employeeUserId,
    },
    select: { id: true },
  });

  if (duplicateAssignment) {
    return { error: 'ASSIGNMENT_ALREADY_EXISTS' };
  }

  const assignment = await prisma.$transaction(async (tx) => {
    if (payload.isLead) {
      await tx.projectAssignment.updateMany({
        where: { projectId: Number(projectId) },
        data: { isLead: false },
      });
    }

    return tx.projectAssignment.create({
      data: {
        projectId: Number(projectId),
        employeeUserId,
        assignedByAdminId: adminUserId ? Number(adminUserId) : null,
        assignmentRole: payload.assignmentRole || null,
        isLead: Boolean(payload.isLead),
      },
      include: {
        employeeUser: {
          include: {
            employeeProfile: {
              include: {
                employeeType: true,
              },
            },
          },
        },
        assignedByAdmin: true,
      },
    });
  });

  return toLegacyAssignment(assignment);
}

async function updateProjectAssignment(projectId, assignmentId, payload) {
  const existingAssignment = await prisma.projectAssignment.findFirst({
    where: {
      id: Number(assignmentId),
      projectId: Number(projectId),
    },
    select: { id: true },
  });

  if (!existingAssignment) {
    return null;
  }

  if (typeof payload.employeeUserId !== 'undefined') {
    const nextEmployeeUserId = Number(payload.employeeUserId);
    const employee = await prisma.user.findFirst({
      where: { id: nextEmployeeUserId, role: 'EMPLOYEE', isActive: true },
      select: { id: true },
    });

    if (!employee) {
      return { error: 'EMPLOYEE_NOT_FOUND' };
    }

    const duplicateAssignment = await prisma.projectAssignment.findFirst({
      where: {
        projectId: Number(projectId),
        employeeUserId: nextEmployeeUserId,
        NOT: {
          id: Number(assignmentId),
        },
      },
      select: { id: true },
    });

    if (duplicateAssignment) {
      return { error: 'ASSIGNMENT_ALREADY_EXISTS' };
    }
  }

  const assignment = await prisma.$transaction(async (tx) => {
    if (payload.isLead === true) {
      await tx.projectAssignment.updateMany({
        where: {
          projectId: Number(projectId),
          NOT: { id: Number(assignmentId) },
        },
        data: { isLead: false },
      });
    }

    return tx.projectAssignment.update({
      where: { id: Number(assignmentId) },
      data: {
        employeeUserId:
          typeof payload.employeeUserId !== 'undefined' ? Number(payload.employeeUserId) : undefined,
        assignmentRole:
          typeof payload.assignmentRole === 'string' ? payload.assignmentRole || null : undefined,
        isLead: typeof payload.isLead === 'boolean' ? payload.isLead : undefined,
      },
      include: {
        employeeUser: {
          include: {
            employeeProfile: {
              include: {
                employeeType: true,
              },
            },
          },
        },
        assignedByAdmin: true,
      },
    });
  });

  return toLegacyAssignment(assignment);
}

async function deleteProjectAssignment(projectId, assignmentId) {
  const existingAssignment = await prisma.projectAssignment.findFirst({
    where: {
      id: Number(assignmentId),
      projectId: Number(projectId),
    },
    select: { id: true },
  });

  if (!existingAssignment) {
    return false;
  }

  await prisma.projectAssignment.delete({
    where: { id: Number(assignmentId) },
  });

  return true;
}

async function listProjectTimelineLogs(projectId, authUser) {
  const project = await prisma.project.findFirst({
    where: buildProjectAccessWhere(projectId, authUser),
    select: { id: true },
  });

  if (!project) {
    return null;
  }

  const visibilityWhere =
    !authUser || authUser.role === 'CLIENT' ? { visibility: 'ALL' } : {};

  const logs = await prisma.projectTimelineLog.findMany({
    where: {
      projectId: Number(projectId),
      ...visibilityWhere,
    },
    include: {
      authorUser: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return logs.map(toLegacyTimelineLog);
}

async function createProjectTimelineLog(projectId, payload, authUser) {
  const project = await prisma.project.findFirst({
    where: buildProjectAccessWhere(projectId, authUser),
    select: {
      id: true,
      status: true,
      progress: true,
    },
  });

  if (!project) {
    return null;
  }

  const nextStatus = payload.status
    ? String(payload.status).toUpperCase().replaceAll('-', '_')
    : null;
  const nextProgress =
    typeof payload.progressValue === 'number' ? Number(payload.progressValue) : project.progress;

  const result = await prisma.$transaction(async (tx) => {
    const timelineLog = await tx.projectTimelineLog.create({
      data: {
        projectId: Number(projectId),
        authorUserId: Number(authUser.id),
        logType: String(payload.logType || 'COMMENT').toUpperCase().replaceAll('-', '_'),
        message: payload.message,
        visibility: String(payload.visibility || 'ALL').toUpperCase().replaceAll('-', '_'),
        progressValue:
          typeof payload.progressValue === 'number' ? Number(payload.progressValue) : null,
      },
      include: {
        authorUser: true,
      },
    });

    const projectUpdates = {};

    if (typeof payload.progressValue === 'number') {
      projectUpdates.progress = nextProgress;
    }

    if (nextStatus && nextStatus !== project.status) {
      projectUpdates.status = nextStatus;

      await tx.projectStatusHistory.create({
        data: {
          projectId: Number(projectId),
          oldStatus: project.status,
          newStatus: nextStatus,
          changedByUserId: Number(authUser.id),
          comment: payload.message || 'Project status updated from timeline log.',
        },
      });
    }

    if (Object.keys(projectUpdates).length > 0) {
      await tx.project.update({
        where: { id: Number(projectId) },
        data: projectUpdates,
      });
    }

    const nextProject = await tx.project.findUnique({
      where: { id: Number(projectId) },
      include: projectInclude,
    });

    return {
      timelineLog,
      project: nextProject,
    };
  });

  return {
    timelineLog: toLegacyTimelineLog(result.timelineLog),
    project: toLegacyProject(result.project, authUser),
  };
}

async function deleteProject(id) {
  await prisma.project.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  createProjectFromRequest,
  updateProject,
  listProjectAssignments,
  createProjectAssignment,
  updateProjectAssignment,
  deleteProjectAssignment,
  listProjectTimelineLogs,
  createProjectTimelineLog,
  deleteProject,
};
