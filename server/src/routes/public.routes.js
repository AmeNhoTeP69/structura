const { Router } = require('express');

const {
  getHomeContent,
  getSettings,
  getContactSettings,
  listPublicServices,
  listFeaturedServices,
  getPublicService,
  listServiceCategories,
  createContactMessage,
} = require('../controllers/public.controller');
const {
  validateRequest,
  validateContactMessageBody,
} = require('../middlewares/request-validation');

const publicRouter = Router();

publicRouter.get('/site-content/home', getHomeContent);
publicRouter.get('/settings', getSettings);
publicRouter.get('/settings/contact', getContactSettings);
publicRouter.get('/services', listPublicServices);
publicRouter.get('/services/featured', listFeaturedServices);
publicRouter.get('/services/:serviceId', getPublicService);
publicRouter.get('/service-categories', listServiceCategories);
publicRouter.post('/contact-messages', validateRequest(validateContactMessageBody), createContactMessage);

module.exports = { publicRouter };
