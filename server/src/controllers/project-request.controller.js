const { sendSuccess } = require('../utils/api-response');
const {
  listClientProjectRequestsService,
  getClientProjectRequestService,
  createClientProjectRequestService,
  updateClientProjectRequestService,
  submitClientProjectRequestService,
  respondToClientProjectRequestService,
} = require('../services/project-request.service');

async function listClientProjectRequests(req, res, next) {
  try {
    const projectRequests = await listClientProjectRequestsService(req.auth.user.id);
    return sendSuccess(res, projectRequests);
  } catch (error) {
    return next(error);
  }
}

async function getClientProjectRequest(req, res, next) {
  try {
    const projectRequest = await getClientProjectRequestService(req.auth.user.id, req.params.id);
    return sendSuccess(res, projectRequest);
  } catch (error) {
    return next(error);
  }
}

async function createClientProjectRequest(req, res, next) {
  try {
    const projectRequest = await createClientProjectRequestService(req.auth.user.id, req.body);
    return sendSuccess(res, projectRequest, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateClientProjectRequest(req, res, next) {
  try {
    const projectRequest = await updateClientProjectRequestService(
      req.auth.user.id,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, projectRequest);
  } catch (error) {
    return next(error);
  }
}

async function submitClientProjectRequest(req, res, next) {
  try {
    const projectRequest = await submitClientProjectRequestService(req.auth.user.id, req.params.id);
    return sendSuccess(res, projectRequest);
  } catch (error) {
    return next(error);
  }
}

async function respondToClientProjectRequest(req, res, next) {
  try {
    const projectRequest = await respondToClientProjectRequestService(
      req.auth.user.id,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, projectRequest);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listClientProjectRequests,
  getClientProjectRequest,
  createClientProjectRequest,
  updateClientProjectRequest,
  submitClientProjectRequest,
  respondToClientProjectRequest,
};
