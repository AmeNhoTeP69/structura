const notificationRepository = require('../repositories/notification.repository');

const notificationTypeMap = {
  PROJECT_REQUEST_SUBMITTED: 'REQUEST_STATUS_CHANGED',
  PROJECT_REQUEST_UPDATED: 'REQUEST_STATUS_CHANGED',
  PROJECT_REQUEST_ACCEPTED: 'REQUEST_APPROVED',
  PROJECT_REQUEST_REFUSED: 'REQUEST_REFUSED',
  PROJECT_CREATED: 'REQUEST_APPROVED',
  PROJECT_ASSIGNED: 'PROJECT_ASSIGNED',
  PROJECT_ACTIVITY: 'NEW_TIMELINE_LOG',
  PROJECT_TIMELINE_UPDATED: 'NEW_TIMELINE_LOG',
  PROJECT_DOCUMENT_ADDED: 'DOCUMENT_ADDED',
};

function normalizeNotificationType(type) {
  const key = String(type || '')
    .trim()
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_');

  return notificationTypeMap[key] || key;
}

function toPublicNotification(notification) {
  if (!notification) return null;

  return {
    id: String(notification.id),
    type: String(notification.type || '').toLowerCase().replaceAll('_', '-'),
    title: notification.title,
    message: notification.message,
    isRead: Boolean(notification.isRead),
    relatedEntityType: notification.relatedEntityType
      ? String(notification.relatedEntityType).toLowerCase().replaceAll('_', '-')
      : null,
    relatedEntityId: notification.relatedEntityId != null ? String(notification.relatedEntityId) : null,
    createdAt: notification.createdAt.toISOString(),
  };
}

async function listNotificationsService(userId, query = {}) {
  const items = await notificationRepository.listNotificationsByUserId(userId, query);
  return items.map(toPublicNotification);
}

async function markNotificationReadService(notificationId, userId) {
  const result = await notificationRepository.markNotificationRead(notificationId, userId);
  return result.count > 0;
}

async function markAllNotificationsReadService(userId) {
  await notificationRepository.markAllNotificationsRead(userId);
  return true;
}

async function deleteNotificationService(notificationId, userId) {
  const result = await notificationRepository.deleteNotification(notificationId, userId);
  return result.count > 0;
}

async function createNotificationForUser(userId, payload) {
  return notificationRepository.createNotification({
    userId: Number(userId),
    type: normalizeNotificationType(payload.type),
    title: payload.title,
    message: payload.message,
    relatedEntityType: payload.relatedEntityType
      ? String(payload.relatedEntityType).toUpperCase().replaceAll('-', '_')
      : null,
    relatedEntityId: payload.relatedEntityId != null ? Number(payload.relatedEntityId) : null,
  });
}

async function notifyAdmins(payload) {
  const adminIds = await notificationRepository.listAdminUserIds();

  if (adminIds.length === 0) {
    return;
  }

  await notificationRepository.createNotifications(
    adminIds.map((adminId) => ({
      userId: adminId,
      type: normalizeNotificationType(payload.type),
      title: payload.title,
      message: payload.message,
      relatedEntityType: payload.relatedEntityType
        ? String(payload.relatedEntityType).toUpperCase().replaceAll('-', '_')
        : null,
      relatedEntityId: payload.relatedEntityId != null ? Number(payload.relatedEntityId) : null,
    })),
  );
}

module.exports = {
  listNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
  deleteNotificationService,
  createNotificationForUser,
  notifyAdmins,
  toPublicNotification,
};
