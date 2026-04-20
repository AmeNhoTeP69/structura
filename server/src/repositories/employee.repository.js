const { prisma } = require('../lib/prisma');

async function listEmployeeTypes() {
  return prisma.employeeType.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

async function createEmployeeType(data) {
  return prisma.employeeType.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

async function updateEmployeeType(id, data) {
  return prisma.employeeType.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
      description: data.description || null,
    },
  });
}

async function deleteEmployeeType(id) {
  return prisma.employeeType.delete({
    where: {
      id: Number(id),
    },
  });
}

async function getEmployeeProfile(userId) {
  return prisma.employeeProfile.findUnique({
    where: {
      userId: Number(userId),
    },
    include: {
      employeeType: true,
      user: true,
    },
  });
}

async function upsertEmployeeProfile(userId, data) {
  return prisma.employeeProfile.upsert({
    where: {
      userId: Number(userId),
    },
    create: {
      userId: Number(userId),
      employeeTypeId: Number(data.employeeTypeId),
      speciality: data.speciality || null,
      notes: data.notes || null,
    },
    update: {
      employeeTypeId: Number(data.employeeTypeId),
      speciality: data.speciality || null,
      notes: data.notes || null,
    },
    include: {
      employeeType: true,
      user: true,
    },
  });
}

module.exports = {
  listEmployeeTypes,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType,
  getEmployeeProfile,
  upsertEmployeeProfile,
};
