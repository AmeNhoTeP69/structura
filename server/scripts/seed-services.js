const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: 'Architecture', slug: 'architecture' },
  { name: 'Interior Design', slug: 'interior-design' },
  { name: 'Landscape', slug: 'landscape' },
  { name: 'Construction', slug: 'construction' },
];

const services = [
  {
    name: 'Construction Management',
    slug: 'construction-management',
    shortDescription: 'Full construction oversight from planning to delivery.',
    fullDescription:
      'End-to-end management of residential and commercial construction projects, including planning, coordination, and site supervision.',
    categories: ['construction'],
  },
  {
    name: 'Interior Design',
    slug: 'interior-design',
    shortDescription: 'Spatial design tailored to lifestyle, comfort, and brand identity.',
    fullDescription:
      'Concept, planning, and detailed interior design for homes, offices, and hospitality environments.',
    categories: ['interior-design'],
  },
  {
    name: 'Landscape Architecture',
    slug: 'landscape-architecture',
    shortDescription: 'Outdoor environment design for villas, residences, and commercial sites.',
    fullDescription:
      'Landscape planning and outdoor spatial composition for gardens, courtyards, terraces, and project surroundings.',
    categories: ['landscape', 'architecture'],
  },
  {
    name: 'Architectural Design',
    slug: 'architectural-design',
    shortDescription: 'Architectural concept development and technical design packages.',
    fullDescription:
      'Architectural studies, concept drawings, layout optimization, and design development for new builds and renovations.',
    categories: ['architecture'],
  },
];

async function seed() {
  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const service of services) {
    const savedService = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        shortDescription: service.shortDescription,
        fullDescription: service.fullDescription,
        isActive: true,
      },
      create: {
        name: service.name,
        slug: service.slug,
        shortDescription: service.shortDescription,
        fullDescription: service.fullDescription,
        isActive: true,
      },
    });

    for (const categorySlug of service.categories) {
      const category = await prisma.serviceCategory.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) continue;

      await prisma.serviceCategoryItem.upsert({
        where: {
          serviceId_categoryId: {
            serviceId: savedService.id,
            categoryId: category.id,
          },
        },
        update: {},
        create: {
          serviceId: savedService.id,
          categoryId: category.id,
        },
      });
    }
  }

  console.log(`Seeded ${services.length} public services.`);
}

seed()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
