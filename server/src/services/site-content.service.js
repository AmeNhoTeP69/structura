const { prisma } = require('../lib/prisma');

const SITE_CONTENT_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS site_content_entries (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;

const defaultHomeContent = {
  heroTitle: 'Engineering the Future of Infrastructure.',
  heroHighlight: 'Future',
  heroDescription:
    'Structura delivers world-class engineering, interior design, and site planning services tailored for modern residential and commercial projects.',
  heroPrimaryCta: 'Start Your Project',
  heroSecondaryCta: 'Explore Services',
  trustTitle: 'Trusted by 200+ Global Enterprise Partners',
  partners: ['CONSTRUCTO', 'METRO-LINK', 'GLOBALBUILD', 'INDUS-CORP'],
};

const defaultPublicSettings = {
  companyName: 'Structura',
  supportEmail: 'projects@structura.engineering',
  supportPhone: '+1 (555) 234-5678',
};

async function ensureSiteContentTable() {
  await prisma.$executeRawUnsafe(SITE_CONTENT_TABLE_SQL);
}

async function readEntry(key, fallback) {
  await ensureSiteContentTable();

  const rows = await prisma.$queryRawUnsafe(
    'SELECT value FROM site_content_entries WHERE key = $1 LIMIT 1',
    key,
  );

  if (!rows.length) {
    return fallback;
  }

  return {
    ...fallback,
    ...(rows[0].value || {}),
  };
}

async function upsertEntry(key, value) {
  await ensureSiteContentTable();

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO site_content_entries (key, value, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `,
    key,
    JSON.stringify(value),
  );

  return readEntry(key, value);
}

async function getHomeContentService() {
  return readEntry('home_content', defaultHomeContent);
}

async function updateHomeContentService(payload = {}) {
  return upsertEntry('home_content', {
    ...defaultHomeContent,
    ...payload,
    partners: Array.isArray(payload.partners)
      ? payload.partners.filter(Boolean)
      : defaultHomeContent.partners,
  });
}

async function getPublicSettingsService() {
  return readEntry('public_settings', defaultPublicSettings);
}

async function updatePublicSettingsService(payload = {}) {
  return upsertEntry('public_settings', {
    ...defaultPublicSettings,
    ...payload,
  });
}

module.exports = {
  getHomeContentService,
  updateHomeContentService,
  getPublicSettingsService,
  updatePublicSettingsService,
};
