const { prisma } = require('../lib/prisma');

async function createContactMessageService({ fullName, email, phone, subject, message }) {
  const contactMessage = await prisma.contactMessage.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      phone: phone || null,
      subject: subject || null,
      message,
    },
  });

  return {
    id: String(contactMessage.id),
    fullName: contactMessage.fullName,
    email: contactMessage.email,
    phone: contactMessage.phone || undefined,
    subject: contactMessage.subject || undefined,
    message: contactMessage.message,
    status: String(contactMessage.status || '').toLowerCase(),
    createdAt: contactMessage.createdAt.toISOString(),
  };
}

function toPublicContactMessage(contactMessage) {
  return {
    id: String(contactMessage.id),
    fullName: contactMessage.fullName,
    email: contactMessage.email,
    phone: contactMessage.phone || undefined,
    subject: contactMessage.subject || undefined,
    message: contactMessage.message,
    status: String(contactMessage.status || '').toLowerCase(),
    createdAt: contactMessage.createdAt.toISOString(),
  };
}

async function listContactMessagesService(query = {}) {
  const messages = await prisma.contactMessage.findMany({
    where: {
      ...(query.status ? { status: String(query.status).toUpperCase() } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return messages.map(toPublicContactMessage);
}

async function updateContactMessageStatusService(messageId, payload = {}) {
  const nextStatus = String(payload.status || '').trim().toUpperCase();

  const contactMessage = await prisma.contactMessage.update({
    where: {
      id: Number(messageId),
    },
    data: {
      status: nextStatus,
    },
  });

  return toPublicContactMessage(contactMessage);
}

module.exports = {
  createContactMessageService,
  listContactMessagesService,
  updateContactMessageStatusService,
};
