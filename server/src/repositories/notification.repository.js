const { prisma } = require('../lib/prisma');

async function listNotificationsByUserId(userId, { limit } = {}) {
  return prisma.notification.findMany({
    where: {
      userId: Number(userId),
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(limit ? { take: Number(limit) } : {}),
  });
}

async function createNotification(data) {
  return prisma.notification.create({
    data,
  });
}

async function createNotifications(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  await prisma.notification.createMany({
    data: items,
  });

  return true;
}

async function markNotificationRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: {
      id: Number(notificationId),
      userId: Number(userId),
    },
    data: {
      isRead: true,
    },
  });
}

async function markAllNotificationsRead(userId) {
  return prisma.notification.updateMany({
    where: {
      userId: Number(userId),
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

async function deleteNotification(notificationId, userId) {
  return prisma.notification.deleteMany({
    where: {
      id: Number(notificationId),
      userId: Number(userId),
    },
  });
}

async function listAdminUserIds() {
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return admins.map((admin) => admin.id);
}

module.exports = {
  listNotificationsByUserId,
  createNotification,
  createNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  listAdminUserIds,
};
