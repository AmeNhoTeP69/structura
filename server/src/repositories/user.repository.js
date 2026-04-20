const { prisma } = require('../lib/prisma');

async function listUsers() {
  return prisma.user.findMany({
    include: {
      employeeProfile: {
        include: {
          employeeType: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      employeeProfile: {
        include: {
          employeeType: true,
        },
      },
    },
  });
}

async function createUser({ name, email, role, password, phone, employeeTypeId, speciality, notes }) {
  return prisma.user.create({
    data: {
      fullName: name,
      email: email.toLowerCase(),
      role: String(role || 'client').toUpperCase(),
      passwordHash: password || 'password123',
      phone: phone || null,
      employeeProfile:
        String(role || 'client').toUpperCase() === 'EMPLOYEE' && employeeTypeId
          ? {
              create: {
                employeeTypeId: Number(employeeTypeId),
                speciality: speciality || null,
                notes: notes || null,
              },
            }
          : undefined,
    },
    include: {
      employeeProfile: {
        include: {
          employeeType: true,
        },
      },
    },
  });
}

async function updateUser(id, updates) {
  const existingUser = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!existingUser) return null;

  return prisma.user.update({
    where: { id: Number(id) },
    data: {
      fullName: updates.name ?? updates.fullName ?? existingUser.fullName,
      email: updates.email ? updates.email.toLowerCase() : existingUser.email,
      role: updates.role ? String(updates.role).toUpperCase() : existingUser.role,
      passwordHash: updates.passwordHash ?? updates.password ?? existingUser.passwordHash,
      phone: updates.phone ?? existingUser.phone,
      isActive: typeof updates.isActive === 'boolean' ? updates.isActive : existingUser.isActive,
    },
    include: {
      employeeProfile: {
        include: {
          employeeType: true,
        },
      },
    },
  });
}

async function deleteUser(id) {
  await prisma.user.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  listUsers,
  findUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
