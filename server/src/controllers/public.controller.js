const { sendSuccess } = require('../utils/api-response');
const { createHttpError } = require('../utils/http-error');
const {
  listPublicServicesService,
  listFeaturedServicesService,
  getPublicServiceService,
  listPublicServiceCategoriesService,
  getHomeContentService,
  getPublicSettingsService,
} = require('../services/public.service');
const { createContactMessageService } = require('../services/contact-message.service');

async function getHomeContent(_req, res, next) {
  try {
    return sendSuccess(res, getHomeContentService());
  } catch (error) {
    return next(error);
  }
}

async function getSettings(_req, res, next) {
  try {
    return sendSuccess(res, getPublicSettingsService());
  } catch (error) {
    return next(error);
  }
}

async function getContactSettings(_req, res, next) {
  try {
    const settings = getPublicSettingsService();
    return sendSuccess(res, {
      email: settings.supportEmail,
      phone: settings.supportPhone,
    });
  } catch (error) {
    return next(error);
  }
}

async function listPublicServices(req, res, next) {
  try {
    return sendSuccess(res, await listPublicServicesService(req.query));
  } catch (error) {
    return next(error);
  }
}

async function listFeaturedServices(_req, res, next) {
  try {
    return sendSuccess(res, await listFeaturedServicesService());
  } catch (error) {
    return next(error);
  }
}

async function getPublicService(req, res, next) {
  try {
    const service = await getPublicServiceService(req.params.serviceId);

    if (!service) {
      return next(createHttpError(404, 'Service not found', 'SERVICE_NOT_FOUND'));
    }

    return sendSuccess(res, service);
  } catch (error) {
    return next(error);
  }
}

async function listServiceCategories(_req, res, next) {
  try {
    return sendSuccess(res, await listPublicServiceCategoriesService());
  } catch (error) {
    return next(error);
  }
}

async function createContactMessage(req, res, next) {
  try {
    const contactMessage = await createContactMessageService(req.body);
    return sendSuccess(res, contactMessage, 201);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHomeContent,
  getSettings,
  getContactSettings,
  listPublicServices,
  listFeaturedServices,
  getPublicService,
  listServiceCategories,
  createContactMessage,
};
