const serviceRepository = require('../repositories/service.repository');
const {
  getHomeContentService,
  getPublicSettingsService,
} = require('./site-content.service');

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

module.exports = {
  listPublicServicesService,
  listFeaturedServicesService,
  getPublicServiceService,
  listPublicServiceCategoriesService,
  getHomeContentService,
  getPublicSettingsService,
};
