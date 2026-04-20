const { sendSuccess } = require('../utils/api-response');
const {
  listAdminProjectRequestsService,
  getAdminProjectRequestService,
  updateAdminProjectRequestService,
} = require('../services/project-request.service');

async function listAdminProjectRequests(req, res, next) {
  try {
    const projectRequests = await listAdminProjectRequestsService(req.query);
    return sendSuccess(res, projectRequests);
  } catch (error) {
    return next(error);
  }
}

async function getAdminProjectRequest(req, res, next) {
  try {
    const projectRequest = await getAdminProjectRequestService(req.params.id);
    return sendSuccess(res, projectRequest);
  } catch (error) {
    return next(error);
  }
}

async function updateAdminProjectRequest(req, res, next) {
  try {
    const projectRequest = await updateAdminProjectRequestService(
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
  listAdminProjectRequests,
  getAdminProjectRequest,
  updateAdminProjectRequest,
};
