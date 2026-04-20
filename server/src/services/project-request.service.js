const projectRequestRepository = require('../repositories/project-request.repository');
const { createHttpError } = require('../utils/http-error');

function normalizeStatus(status) {
  if (!status) return 'DRAFT';
  return String(status).trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
}

function normalizeDocumentType(type) {
  if (!type) return 'OTHER';
  return String(type).trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
}

function decimalToString(value) {
  return value != null ? String(value) : null;
}

function dateToString(value) {
  if (!value) return null;
  return new Date(value).toISOString().split('T')[0];
}

function createReferenceCode() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${stamp}-${random}`;
}

function toPublicProjectRequest(projectRequest) {
  if (!projectRequest) return null;

  return {
    id: String(projectRequest.id),
    projectId: projectRequest.project ? String(projectRequest.project.id) : null,
    referenceCode: projectRequest.referenceCode,
    clientId: String(projectRequest.clientId),
    clientName: projectRequest.client?.fullName || '',
    title: projectRequest.title,
    description: projectRequest.description,
    location: projectRequest.location,
    requestedStartDate: dateToString(projectRequest.requestedStartDate),
    requestedBudget: decimalToString(projectRequest.requestedBudget),
    adminProposedStartDate: dateToString(projectRequest.adminProposedStartDate),
    adminProposedBudget: decimalToString(projectRequest.adminProposedBudget),
    status: String(projectRequest.status || '').toLowerCase().replaceAll('_', '-'),
    adminReviewNote: projectRequest.adminReviewNote || '',
    clientResponseNote: projectRequest.clientResponseNote || '',
    submittedAt: projectRequest.submittedAt ? new Date(projectRequest.submittedAt).toISOString() : null,
    reviewedAt: projectRequest.reviewedAt ? new Date(projectRequest.reviewedAt).toISOString() : null,
    clientRespondedAt: projectRequest.clientRespondedAt
      ? new Date(projectRequest.clientRespondedAt).toISOString()
      : null,
    createdAt: new Date(projectRequest.createdAt).toISOString(),
    updatedAt: new Date(projectRequest.updatedAt).toISOString(),
    services: projectRequest.services.map((item) => ({
      id: String(item.id),
      serviceId: String(item.serviceId),
      name: item.service.name,
      slug: item.service.slug,
      quantity: item.quantity,
      notes: item.notes || '',
      tags: item.service.categories.map((categoryItem) => categoryItem.category.name),
    })),
    documents: projectRequest.documents.map((document) => ({
      id: String(document.id),
      documentType: String(document.documentType || '').toLowerCase().replaceAll('_', '-'),
      fileName: document.fileName,
      filePath: document.filePath,
      mimeType: document.mimeType || '',
      fileSize: document.fileSize || 0,
      createdAt: new Date(document.createdAt).toISOString(),
    })),
    statusHistory: projectRequest.statusHistory.map((entry) => ({
      id: String(entry.id),
      oldStatus: entry.oldStatus
        ? String(entry.oldStatus).toLowerCase().replaceAll('_', '-')
        : null,
      newStatus: String(entry.newStatus).toLowerCase().replaceAll('_', '-'),
      comment: entry.comment || '',
      changedByName: entry.changedByUser?.fullName || 'System',
      createdAt: new Date(entry.createdAt).toISOString(),
    })),
  };
}

function buildServicesCreate(services = []) {
  return {
    create: services.map((service) => ({
      serviceId: Number(service.serviceId || service.id),
      quantity: Number(service.quantity || 1),
      notes: service.notes || null,
    })),
  };
}

function buildDocumentsCreate(documents = [], userId) {
  return {
    create: documents.map((document, index) => ({
      uploadedByUserId: Number(userId),
      documentType: normalizeDocumentType(document.documentType),
      fileName: document.fileName,
      filePath:
        document.filePath || `pending-upload/request-${Date.now()}-${index + 1}-${document.fileName}`,
      mimeType: document.mimeType || null,
      fileSize: document.fileSize ? Number(document.fileSize) : null,
    })),
  };
}

function validateDraftPayload(payload) {
  if (!payload.title?.trim()) {
    throw createHttpError(400, 'Title is required', 'VALIDATION_ERROR');
  }

  if (!payload.description?.trim()) {
    throw createHttpError(400, 'Description is required', 'VALIDATION_ERROR');
  }

  if (!payload.location?.trim()) {
    throw createHttpError(400, 'Location is required', 'VALIDATION_ERROR');
  }

  if (!Array.isArray(payload.services) || payload.services.length === 0) {
    throw createHttpError(400, 'At least one service must be selected', 'VALIDATION_ERROR');
  }
}

async function listClientProjectRequestsService(clientId) {
  const projectRequests = await projectRequestRepository.listProjectRequestsByClientId(clientId);
  return projectRequests.map(toPublicProjectRequest);
}

async function listAdminProjectRequestsService(query = {}) {
  const projectRequests = await projectRequestRepository.listProjectRequests(query);
  return projectRequests.map(toPublicProjectRequest);
}

async function getClientProjectRequestService(clientId, requestId) {
  const projectRequest = await projectRequestRepository.getProjectRequestById(requestId);

  if (!projectRequest || Number(projectRequest.clientId) !== Number(clientId)) {
    throw createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND');
  }

  return toPublicProjectRequest(projectRequest);
}

async function getAdminProjectRequestService(requestId) {
  const projectRequest = await projectRequestRepository.getProjectRequestById(requestId);

  if (!projectRequest) {
    throw createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND');
  }

  return toPublicProjectRequest(projectRequest);
}

async function createClientProjectRequestService(clientId, payload) {
  validateDraftPayload(payload);

  const now = new Date();
  const status = normalizeStatus(payload.status || 'DRAFT');

  const projectRequest = await projectRequestRepository.createProjectRequest({
    clientId: Number(clientId),
    referenceCode: createReferenceCode(),
    title: payload.title.trim(),
    description: payload.description.trim(),
    location: payload.location.trim(),
    requestedStartDate: payload.requestedStartDate ? new Date(payload.requestedStartDate) : null,
    requestedBudget: payload.requestedBudget ? Number(payload.requestedBudget) : null,
    status,
    submittedAt: status === 'SUBMITTED' ? now : null,
    services: buildServicesCreate(payload.services),
    documents:
      Array.isArray(payload.documents) && payload.documents.length > 0
        ? buildDocumentsCreate(payload.documents, clientId)
        : undefined,
    statusHistory: {
      create: [
        {
          oldStatus: null,
          newStatus: status,
          changedByUserId: Number(clientId),
          comment: status === 'SUBMITTED' ? 'Project request submitted by client.' : 'Draft created.',
        },
      ],
    },
  });

  return toPublicProjectRequest(projectRequest);
}

async function updateClientProjectRequestService(clientId, requestId, payload) {
  const existing = await projectRequestRepository.getProjectRequestById(requestId);

  if (!existing || Number(existing.clientId) !== Number(clientId)) {
    throw createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND');
  }

  if (existing.status !== 'DRAFT') {
    throw createHttpError(400, 'Only draft requests can be edited', 'PROJECT_REQUEST_LOCKED');
  }

  validateDraftPayload({
    ...existing,
    ...payload,
    services: payload.services || existing.services,
  });

  const projectRequest = await projectRequestRepository.updateProjectRequest(requestId, {
    title: payload.title?.trim() ?? existing.title,
    description: payload.description?.trim() ?? existing.description,
    location: payload.location?.trim() ?? existing.location,
    requestedStartDate: payload.requestedStartDate
      ? new Date(payload.requestedStartDate)
      : existing.requestedStartDate,
    requestedBudget:
      payload.requestedBudget != null && payload.requestedBudget !== ''
        ? Number(payload.requestedBudget)
        : existing.requestedBudget,
    services: payload.services
      ? {
          deleteMany: {},
          ...buildServicesCreate(payload.services),
        }
      : undefined,
    documents:
      Array.isArray(payload.documents) && payload.documents.length > 0
        ? {
            deleteMany: {},
            ...buildDocumentsCreate(payload.documents, clientId),
          }
        : undefined,
  });

  return toPublicProjectRequest(projectRequest);
}

async function submitClientProjectRequestService(clientId, requestId) {
  const existing = await projectRequestRepository.getProjectRequestById(requestId);

  if (!existing || Number(existing.clientId) !== Number(clientId)) {
    throw createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND');
  }

  if (existing.status !== 'DRAFT') {
    throw createHttpError(400, 'Only draft requests can be submitted', 'PROJECT_REQUEST_LOCKED');
  }

  const projectRequest = await projectRequestRepository.updateProjectRequest(requestId, {
    status: 'SUBMITTED',
    submittedAt: new Date(),
    statusHistory: {
      create: {
        oldStatus: existing.status,
        newStatus: 'SUBMITTED',
        changedByUserId: Number(clientId),
        comment: 'Client submitted the project request.',
      },
    },
  });

  return toPublicProjectRequest(projectRequest);
}

async function respondToClientProjectRequestService(clientId, requestId, payload = {}) {
  const existing = await projectRequestRepository.getProjectRequestById(requestId);

  if (!existing || Number(existing.clientId) !== Number(clientId)) {
    throw createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND');
  }

  if (existing.status !== 'WAITING_CLIENT_ACCEPTANCE') {
    throw createHttpError(
      400,
      'This request is not waiting for a client response',
      'PROJECT_REQUEST_INVALID_STATE',
    );
  }

  const action = String(payload.action || '').toLowerCase();

  if (!['accept', 'refuse'].includes(action)) {
    throw createHttpError(400, 'Response action must be accept or refuse', 'VALIDATION_ERROR');
  }

  const newStatus = action === 'accept' ? 'APPROVED' : 'CANCELLED';
  const comment =
    payload.note?.trim() ||
    (action === 'accept'
      ? 'Client accepted the admin proposal.'
      : 'Client refused the admin proposal.');

  const projectRequest = await projectRequestRepository.updateProjectRequest(requestId, {
    status: newStatus,
    clientResponseNote: payload.note?.trim() || null,
    clientRespondedAt: new Date(),
    statusHistory: {
      create: {
        oldStatus: existing.status,
        newStatus,
        changedByUserId: Number(clientId),
        comment,
      },
    },
  });

  return toPublicProjectRequest(projectRequest);
}

async function updateAdminProjectRequestService(adminUserId, requestId, payload = {}) {
  const existing = await projectRequestRepository.getProjectRequestById(requestId);

  if (!existing) {
    throw createHttpError(404, 'Project request not found', 'PROJECT_REQUEST_NOT_FOUND');
  }

  const nextStatus = payload.status ? normalizeStatus(payload.status) : existing.status;
  const updateData = {
    status: nextStatus,
    adminProposedStartDate:
      payload.adminProposedStartDate !== undefined
        ? payload.adminProposedStartDate
          ? new Date(payload.adminProposedStartDate)
          : null
        : existing.adminProposedStartDate,
    adminProposedBudget:
      payload.adminProposedBudget !== undefined && payload.adminProposedBudget !== ''
        ? Number(payload.adminProposedBudget)
        : payload.adminProposedBudget === ''
          ? null
          : existing.adminProposedBudget,
    adminReviewNote:
      payload.adminReviewNote !== undefined ? payload.adminReviewNote || null : existing.adminReviewNote,
  };

  if (nextStatus === 'UNDER_REVIEW' && !existing.reviewedAt) {
    updateData.reviewedAt = new Date();
  }

  if (nextStatus === 'WAITING_CLIENT_ACCEPTANCE') {
    updateData.reviewedAt = new Date();
  }

  const shouldCreateHistory =
    nextStatus !== existing.status ||
    payload.adminReviewNote !== undefined ||
    payload.adminProposedBudget !== undefined ||
    payload.adminProposedStartDate !== undefined;

  if (shouldCreateHistory) {
    updateData.statusHistory = {
      create: {
        oldStatus: existing.status,
        newStatus: nextStatus,
        changedByUserId: Number(adminUserId),
        comment:
          payload.historyComment?.trim() ||
          payload.adminReviewNote?.trim() ||
          `Admin updated request to ${String(nextStatus).toLowerCase().replaceAll('_', '-')}.`,
      },
    };
  }

  const projectRequest = await projectRequestRepository.updateProjectRequest(requestId, updateData);
  return toPublicProjectRequest(projectRequest);
}

module.exports = {
  listClientProjectRequestsService,
  listAdminProjectRequestsService,
  getClientProjectRequestService,
  getAdminProjectRequestService,
  createClientProjectRequestService,
  updateClientProjectRequestService,
  submitClientProjectRequestService,
  respondToClientProjectRequestService,
  updateAdminProjectRequestService,
};
