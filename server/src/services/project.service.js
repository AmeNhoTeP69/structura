const projectRepository = require('../repositories/project.repository');

async function listProjectsService(authUser) {
  return projectRepository.listProjects(authUser);
}

async function getProjectByIdService(id, authUser) {
  return projectRepository.getProjectById(id, authUser);
}

async function createProjectService(payload, adminUserId) {
  return projectRepository.createProject(payload, adminUserId);
}

async function createProjectFromRequestService(requestId, adminUserId) {
  return projectRepository.createProjectFromRequest(requestId, adminUserId);
}

async function updateProjectService(id, updates) {
  return projectRepository.updateProject(id, updates);
}

async function listProjectAssignmentsService(projectId, authUser) {
  return projectRepository.listProjectAssignments(projectId, authUser);
}

async function createProjectAssignmentService(projectId, payload, adminUserId) {
  return projectRepository.createProjectAssignment(projectId, payload, adminUserId);
}

async function updateProjectAssignmentService(projectId, assignmentId, payload) {
  return projectRepository.updateProjectAssignment(projectId, assignmentId, payload);
}

async function deleteProjectAssignmentService(projectId, assignmentId) {
  return projectRepository.deleteProjectAssignment(projectId, assignmentId);
}

async function listProjectTimelineLogsService(projectId, authUser) {
  return projectRepository.listProjectTimelineLogs(projectId, authUser);
}

async function createProjectTimelineLogService(projectId, payload, authUser) {
  return projectRepository.createProjectTimelineLog(projectId, payload, authUser);
}

async function deleteProjectService(id) {
  return projectRepository.deleteProject(id);
}

module.exports = {
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
};
