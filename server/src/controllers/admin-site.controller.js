const { sendSuccess } = require('../utils/api-response');
const {
  getHomeContentService,
  updateHomeContentService,
  getPublicSettingsService,
  updatePublicSettingsService,
} = require('../services/site-content.service');
const {
  listContactMessagesService,
  updateContactMessageStatusService,
} = require('../services/contact-message.service');

async function getAdminHomeContent(_req, res, next) {
  try {
    return sendSuccess(res, await getHomeContentService());
  } catch (error) {
    return next(error);
  }
}

async function updateAdminHomeContent(req, res, next) {
  try {
    return sendSuccess(res, await updateHomeContentService(req.body));
  } catch (error) {
    return next(error);
  }
}

async function getAdminPublicSettings(_req, res, next) {
  try {
    return sendSuccess(res, await getPublicSettingsService());
  } catch (error) {
    return next(error);
  }
}

async function updateAdminPublicSettings(req, res, next) {
  try {
    return sendSuccess(res, await updatePublicSettingsService(req.body));
  } catch (error) {
    return next(error);
  }
}

async function listAdminContactMessages(req, res, next) {
  try {
    return sendSuccess(res, await listContactMessagesService(req.query));
  } catch (error) {
    return next(error);
  }
}

async function updateAdminContactMessage(req, res, next) {
  try {
    return sendSuccess(res, await updateContactMessageStatusService(req.params.id, req.body));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAdminHomeContent,
  updateAdminHomeContent,
  getAdminPublicSettings,
  updateAdminPublicSettings,
  listAdminContactMessages,
  updateAdminContactMessage,
};
