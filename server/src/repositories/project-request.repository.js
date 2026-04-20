const { prisma } = require('../lib/prisma');

const projectRequestInclude = {
  client: true,
  services: {
    include: {
      service: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  documents: {
    orderBy: {
      createdAt: 'desc',
    },
  },
  statusHistory: {
    include: {
      changedByUser: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
  project: true,
};

async function listProjectRequestsByClientId(clientId) {
  return prisma.projectRequest.findMany({
    where: {
      clientId: Number(clientId),
    },
    include: projectRequestInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function listProjectRequests(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = String(filters.status).toUpperCase().replaceAll('-', '_');
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { referenceCode: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
      { client: { fullName: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  return prisma.projectRequest.findMany({
    where,
    include: projectRequestInclude,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getProjectRequestById(id) {
  return prisma.projectRequest.findUnique({
    where: {
      id: Number(id),
    },
    include: projectRequestInclude,
  });
}

async function createProjectRequest(data) {
  return prisma.projectRequest.create({
    data,
    include: projectRequestInclude,
  });
}

async function updateProjectRequest(id, data) {
  return prisma.projectRequest.update({
    where: {
      id: Number(id),
    },
    data,
    include: projectRequestInclude,
  });
}

module.exports = {
  listProjectRequestsByClientId,
  listProjectRequests,
  getProjectRequestById,
  createProjectRequest,
  updateProjectRequest,
};
