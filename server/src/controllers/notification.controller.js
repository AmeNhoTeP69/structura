const { sendSuccess } = require('../utils/api-response');
const { createHttpError } = require('../utils/http-error');
const {
  listNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
  deleteNotificationService,
} = require('../services/notification.service');

async function listNotifications(req, res, next) {
  try {
    const notifications = await listNotificationsService(req.auth.user.id, req.query);
    return sendSuccess(res, notifications);
  } catch (error) {
    return next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const updated = await markNotificationReadService(req.params.id, req.auth.user.id);

    if (!updated) {
      return next(createHttpError(404, 'Notification not found'));
    }

    return sendSuccess(res, { updated: true });
  } catch (error) {
    return next(error);
  }
}

async function markAllNotificationsRead(req, res, next) {
  try {
    await markAllNotificationsReadService(req.auth.user.id);
    return sendSuccess(res, { updated: true });
  } catch (error) {
    return next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const deleted = await deleteNotificationService(req.params.id, req.auth.user.id);

    if (!deleted) {
      return next(createHttpError(404, 'Notification not found'));
    }

    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
