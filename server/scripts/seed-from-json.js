const path = require('path');

const { PrismaClient, UserRole, ProjectStatus } = require('@prisma/client');
const { hashPassword, looksHashed } = require('../src/utils/password');

const prisma = new PrismaClient();
const { readDb } = require('../src/services/json-db.service');

function mapUserRole(role) {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'CLIENT') return UserRole.CLIENT;
  if (normalized === 'EMPLOYEE') return UserRole.EMPLOYEE;
  if (normalized === 'ADMIN') return UserRole.ADMIN;
  return UserRole.CLIENT;
}

function mapProjectStatus(status) {
  const normalized = String(status || '').toUpperCase().replaceAll('-', '_');
  if (normalized in ProjectStatus) return ProjectStatus[normalized];
  if (normalized === 'PENDING') return ProjectStatus.NOT_STARTED;
  return ProjectStatus.NOT_STARTED;
}

async function seedUsers(jsonUsers) {
  for (const user of jsonUsers) {
    const passwordHash = looksHashed(user.password)
      ? user.password
      : await hashPassword(user.password || 'password123');

    await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        fullName: user.name,
        role: mapUserRole(user.role),
        passwordHash,
      },
      create: {
        fullName: user.name,
        email: user.email.toLowerCase(),
        role: mapUserRole(user.role),
        passwordHash,
      },
    });
  }
}

async function seedProjectRequestsAndProjects(jsonProjects) {
  const firstClient = await prisma.user.findFirst({
    where: { role: UserRole.CLIENT },
    orderBy: { id: 'asc' },
  });

  if (!firstClient) {
    throw new Error('Cannot seed projects without at least one client user.');
  }

  for (const project of jsonProjects) {
    const linkedClient =
      (await prisma.user.findFirst({
        where: {
          OR: [
            ...(project.clientName ? [{ fullName: project.clientName }] : []),
          ],
        },
      })) || firstClient;

    const request = await prisma.projectRequest.create({
      data: {
        clientId: linkedClient.id,
        referenceCode: `REQ-${project.id}`,
        title: project.title,
        description: project.description || '',
        location: project.location || '',
        requestedStartDate: project.startDate ? new Date(project.startDate) : null,
        requestedBudget: project.budget && !Number.isNaN(Number(project.budget)) ? Number(project.budget) : null,
        status: 'APPROVED',
        submittedAt: new Date(),
        reviewedAt: new Date(),
        clientRespondedAt: new Date(),
      },
    });

    await prisma.project.create({
      data: {
        projectRequestId: request.id,
        clientId: linkedClient.id,
        referenceCode: project.id,
        title: project.title,
        description: project.description || '',
        location: project.location || '',
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
        budget: project.budget && !Number.isNaN(Number(project.budget)) ? Number(project.budget) : null,
        status: mapProjectStatus(project.status),
        progress: Number(project.progress || 0),
      },
    });
  }
}

async function seed() {
  const db = readDb();

  const usersCount = await prisma.user.count();
  const projectsCount = await prisma.project.count();

  if (usersCount === 0) {
    await seedUsers(db.users || []);
    console.log(`Seeded ${db.users.length} users from db.json`);
  } else {
    console.log('Users table already contains data, skipping user seed.');
  }

  if (projectsCount === 0) {
    await seedProjectRequestsAndProjects(db.projects || []);
    console.log(`Seeded ${db.projects.length} projects from db.json`);
  } else {
    console.log('Projects table already contains data, skipping project seed.');
  }
}

seed()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
