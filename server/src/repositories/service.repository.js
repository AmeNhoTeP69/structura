const { prisma } = require('../lib/prisma');

async function listActiveServices({ category, featuredOnly = false, limit } = {}) {
  return prisma.service.findMany({
    where: {
      isActive: true,
      ...(featuredOnly ? { slug: { in: ['construction-management', 'interior-design', 'landscape-architecture'] } } : {}),
      ...(category
        ? {
            categories: {
              some: {
                category: {
                  slug: category,
                },
              },
            },
          }
        : {}),
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    ...(limit ? { take: limit } : {}),
  });
}

async function getServiceById(id) {
  return prisma.service.findUnique({
    where: { id: Number(id) },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

async function listServiceCategories() {
  return prisma.serviceCategory.findMany({
    orderBy: { name: 'asc' },
  });
}

module.exports = {
  listActiveServices,
  getServiceById,
  listServiceCategories,
};
