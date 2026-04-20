const { Router } = require('express');

const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorizeRoles } = require('../middlewares/authorize-roles');

const notificationRouter = Router();

notificationRouter.use(authenticate, authorizeRoles('CLIENT', 'EMPLOYEE', 'ADMIN'));
notificationRouter.get('/', listNotifications);
notificationRouter.patch('/read-all', markAllNotificationsRead);
notificationRouter.patch('/:id/read', markNotificationRead);
notificationRouter.delete('/:id', deleteNotification);

module.exports = { notificationRouter };
