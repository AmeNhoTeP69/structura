const {
  ensureObject,
  readArray,
  readBoolean,
  readDate,
  readEmail,
  readEnum,
  readNumber,
  readString,
} = require('../utils/validation');

function validateRequest(validator) {
  return (req, _res, next) => {
    try {
      req.body = validator(req.body || {});
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function validateLoginBody(body) {
  ensureObject(body);
  return {
    email: readEmail(body.email),
    password: readString(body.password, 'password', { min: 6, max: 128 }),
  };
}

function validateRegisterClientBody(body) {
  ensureObject(body);
  return {
    name: readString(body.name, 'name', { min: 2, max: 120 }),
    email: readEmail(body.email),
    password: readString(body.password, 'password', { min: 6, max: 128 }),
    phone: readString(body.phone, 'phone', { required: false, max: 40 }),
  };
}

function validateUpdateCurrentUserBody(body) {
  ensureObject(body);
  return {
    name: readString(body.name, 'name', { required: false, min: 2, max: 120 }),
    fullName: readString(body.fullName, 'fullName', { required: false, min: 2, max: 120 }),
    email: readEmail(body.email, 'email', { required: false }),
    phone: readString(body.phone, 'phone', { required: false, max: 40 }),
  };
}

function validateChangePasswordBody(body) {
  ensureObject(body);
  return {
    currentPassword: readString(body.currentPassword, 'currentPassword', {
      min: 6,
      max: 128,
    }),
    newPassword: readString(body.newPassword, 'newPassword', { min: 6, max: 128 }),
  };
}

function validateContactMessageBody(body) {
  ensureObject(body);
  return {
    fullName: readString(body.fullName, 'fullName', { min: 2, max: 120 }),
    email: readEmail(body.email),
    phone: readString(body.phone, 'phone', { required: false, max: 40 }),
    subject: readString(body.subject, 'subject', { required: false, max: 160 }),
    message: readString(body.message, 'message', { min: 10, max: 5000 }),
  };
}

function mapRequestServiceItem(item, index) {
  ensureObject(item, `services[${index}]`);
  return {
    serviceId: String(readNumber(item.serviceId || item.id, `services[${index}].serviceId`, { min: 1 })),
    quantity: readNumber(item.quantity ?? 1, `services[${index}].quantity`, { min: 1, max: 100 }),
    notes: readString(item.notes, `services[${index}].notes`, { required: false, max: 500 }),
  };
}

function mapRequestDocumentItem(item, index) {
  ensureObject(item, `documents[${index}]`);
  return {
    documentType: readString(item.documentType, `documents[${index}].documentType`, {
      required: false,
      max: 80,
    }),
    fileName: readString(item.fileName, `documents[${index}].fileName`, { min: 1, max: 255 }),
    mimeType: readString(item.mimeType, `documents[${index}].mimeType`, {
      required: false,
      max: 120,
    }),
    fileSize:
      item.fileSize != null
        ? readNumber(item.fileSize, `documents[${index}].fileSize`, { min: 0, max: 25_000_000 })
        : undefined,
  };
}

function validateProjectRequestBody(body) {
  ensureObject(body);
  const services = readArray(body.services, 'services', { required: true, min: 1 }).map(
    mapRequestServiceItem,
  );
  const documents = readArray(body.documents ?? [], 'documents', { required: false }).map(
    mapRequestDocumentItem,
  );

  return {
    title: readString(body.title, 'title', { min: 3, max: 200 }),
    description: readString(body.description, 'description', { min: 10, max: 5000 }),
    location: readString(body.location, 'location', { min: 2, max: 255 }),
    requestedStartDate: readDate(body.requestedStartDate, 'requestedStartDate', {
      required: false,
    }),
    requestedBudget:
      body.requestedBudget != null && body.requestedBudget !== ''
        ? String(readNumber(body.requestedBudget, 'requestedBudget', { min: 0 }))
        : undefined,
    services,
    documents,
    status: readEnum(body.status, 'status', ['draft', 'submitted'], { required: false }),
  };
}

function validateProjectRequestResponseBody(body) {
  ensureObject(body);
  return {
    action: readEnum(body.action, 'action', ['accept', 'refuse']),
    note: readString(body.note, 'note', { required: false, max: 1000 }),
  };
}

function validateAdminProjectRequestUpdateBody(body) {
  ensureObject(body);
  return {
    status: readEnum(
      body.status,
      'status',
      [
        'draft',
        'submitted',
        'pending',
        'under-review',
        'refused',
        'waiting-client-acceptance',
        'approved',
        'cancelled',
      ],
      { required: false },
    ),
    adminProposedStartDate: readDate(body.adminProposedStartDate, 'adminProposedStartDate', {
      required: false,
    }),
    adminProposedBudget:
      body.adminProposedBudget != null && body.adminProposedBudget !== ''
        ? String(readNumber(body.adminProposedBudget, 'adminProposedBudget', { min: 0 }))
        : body.adminProposedBudget === ''
          ? ''
          : undefined,
    adminReviewNote: readString(body.adminReviewNote, 'adminReviewNote', {
      required: false,
      max: 2000,
    }),
    historyComment: readString(body.historyComment, 'historyComment', {
      required: false,
      max: 1000,
    }),
  };
}

function validateAssignmentBody(body) {
  ensureObject(body);
  return {
    employeeUserId: String(readNumber(body.employeeUserId, 'employeeUserId', { min: 1 })),
    assignmentRole: readString(body.assignmentRole, 'assignmentRole', {
      required: false,
      max: 120,
    }),
    isLead: readBoolean(body.isLead, 'isLead', { required: false }),
  };
}

function validateAssignmentPatchBody(body) {
  ensureObject(body);
  return {
    employeeUserId:
      body.employeeUserId != null
        ? String(readNumber(body.employeeUserId, 'employeeUserId', { min: 1 }))
        : undefined,
    assignmentRole: readString(body.assignmentRole, 'assignmentRole', {
      required: false,
      max: 120,
    }),
    isLead: readBoolean(body.isLead, 'isLead', { required: false }),
  };
}

function validateTimelineLogBody(body) {
  ensureObject(body);
  return {
    logType: readEnum(body.logType, 'logType', [
      'comment',
      'status-update',
      'progress-update',
      'request',
      'note',
    ]),
    message: readString(body.message, 'message', { min: 2, max: 4000 }),
    visibility: readEnum(body.visibility, 'visibility', ['all', 'team-only'], {
      required: false,
    }),
    progressValue:
      body.progressValue != null && body.progressValue !== ''
        ? readNumber(body.progressValue, 'progressValue', { min: 0, max: 100 })
        : undefined,
    status: readEnum(body.status, 'status', ['not-started', 'in-progress', 'on-hold', 'completed', 'cancelled'], {
      required: false,
    }),
  };
}

function validateTimelineLogPatchBody(body) {
  ensureObject(body);
  return {
    message: readString(body.message, 'message', { required: false, min: 2, max: 4000 }),
    visibility: readEnum(body.visibility, 'visibility', ['all', 'team-only'], {
      required: false,
    }),
    logType: readEnum(body.logType, 'logType', [
      'comment',
      'status-update',
      'progress-update',
      'request',
      'note',
    ], {
      required: false,
    }),
  };
}

function validateProjectDocumentBody(body) {
  ensureObject(body);
  return {
    fileName: readString(body.fileName, 'fileName', { min: 1, max: 255 }),
    documentType: readString(body.documentType, 'documentType', { min: 1, max: 80 }),
    filePath: readString(body.filePath, 'filePath', { required: false, max: 1000 }),
    mimeType: readString(body.mimeType, 'mimeType', { required: false, max: 120 }),
    fileSize:
      body.fileSize != null ? readNumber(body.fileSize, 'fileSize', { min: 0, max: 25_000_000 }) : undefined,
    visibility: readEnum(body.visibility, 'visibility', ['all', 'team-only'], {
      required: false,
    }),
  };
}

function validateSiteHomeContentBody(body) {
  ensureObject(body);
  return {
    heroTitle: readString(body.heroTitle, 'heroTitle', { min: 3, max: 200 }),
    heroHighlight: readString(body.heroHighlight, 'heroHighlight', { min: 1, max: 80 }),
    heroDescription: readString(body.heroDescription, 'heroDescription', { min: 10, max: 2000 }),
    heroPrimaryCta: readString(body.heroPrimaryCta, 'heroPrimaryCta', { min: 2, max: 80 }),
    heroSecondaryCta: readString(body.heroSecondaryCta, 'heroSecondaryCta', { min: 2, max: 80 }),
    trustTitle: readString(body.trustTitle, 'trustTitle', { min: 3, max: 160 }),
    partners: readArray(body.partners, 'partners', { required: true }).map((item, index) =>
      readString(item, `partners[${index}]`, { min: 1, max: 80 }),
    ),
  };
}

function validatePublicSettingsBody(body) {
  ensureObject(body);
  return {
    companyName: readString(body.companyName, 'companyName', { min: 2, max: 120 }),
    supportEmail: readEmail(body.supportEmail, 'supportEmail'),
    supportPhone: readString(body.supportPhone, 'supportPhone', { min: 5, max: 40 }),
  };
}

function validateContactStatusBody(body) {
  ensureObject(body);
  return {
    status: readEnum(body.status, 'status', ['new', 'read', 'replied', 'archived']),
  };
}

module.exports = {
  validateRequest,
  validateLoginBody,
  validateRegisterClientBody,
  validateUpdateCurrentUserBody,
  validateChangePasswordBody,
  validateContactMessageBody,
  validateProjectRequestBody,
  validateProjectRequestResponseBody,
  validateAdminProjectRequestUpdateBody,
  validateAssignmentBody,
  validateAssignmentPatchBody,
  validateTimelineLogBody,
  validateTimelineLogPatchBody,
  validateProjectDocumentBody,
  validateSiteHomeContentBody,
  validatePublicSettingsBody,
  validateContactStatusBody,
};
