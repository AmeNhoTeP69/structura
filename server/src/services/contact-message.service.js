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

module.exports = { createContactMessageService };
