const serviceRepository = require('../repositories/service.repository');

function mapService(service) {
  return {
    id: String(service.id),
    name: service.name,
    slug: service.slug,
    shortDescription: service.shortDescription || '',
    fullDescription: service.fullDescription || '',
    tags: service.categories.map((item) => item.category.name),
    categorySlugs: service.categories.map((item) => item.category.slug),
  };
}

async function listPublicServicesService(query = {}) {
  const services = await serviceRepository.listActiveServices({
    category: query.category,
  });

  return services.map(mapService);
}

async function listFeaturedServicesService() {
  const services = await serviceRepository.listActiveServices({
    featuredOnly: true,
    limit: 3,
  });

  return services.map(mapService);
}

async function getPublicServiceService(id) {
  const service = await serviceRepository.getServiceById(id);
  return service ? mapService(service) : null;
}

async function listPublicServiceCategoriesService() {
  const categories = await serviceRepository.listServiceCategories();
  return categories.map((category) => ({
    id: String(category.id),
    name: category.name,
    slug: category.slug,
  }));
}

function getHomeContentService() {
  return {
    heroTitle: 'Engineering the Future of Infrastructure.',
    heroHighlight: 'Future',
    heroDescription:
      'Structura delivers world-class engineering, interior design, and site planning services tailored for modern residential and commercial projects.',
    heroPrimaryCta: 'Start Your Project',
    heroSecondaryCta: 'Explore Services',
    trustTitle: 'Trusted by 200+ Global Enterprise Partners',
    partners: ['CONSTRUCTO', 'METRO-LINK', 'GLOBALBUILD', 'INDUS-CORP'],
  };
}

function getPublicSettingsService() {
  return {
    companyName: 'Structura',
    supportEmail: 'projects@structura.engineering',
    supportPhone: '+1 (555) 234-5678',
  };
}

module.exports = {
  listPublicServicesService,
  listFeaturedServicesService,
  getPublicServiceService,
  listPublicServiceCategoriesService,
  getHomeContentService,
  getPublicSettingsService,
};
