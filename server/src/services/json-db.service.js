const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../../db.json');

function readDb() {
  const raw = fs.readFileSync(dbFile, 'utf8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

function getUsers() {
  return readDb().users;
}

function findUserByEmail(email) {
  if (!email) return null;
  return getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

function createUser({ name, email, role, password }) {
  const db = readDb();
  const user = {
    id: `u${Date.now()}`,
    name,
    email,
    role,
    password: password || 'password123',
  };

  db.users.push(user);
  writeDb(db);
  return user;
}

function updateUser(id, updates) {
  const db = readDb();
  const index = db.users.findIndex((user) => user.id === id);

  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  return db.users[index];
}

function deleteUser(id) {
  const db = readDb();
  db.users = db.users.filter((user) => user.id !== id);
  writeDb(db);
}

function getProjects() {
  return readDb().projects;
}

function createProject(projectData) {
  const db = readDb();
  db.projects.unshift(projectData);
  writeDb(db);
  return projectData;
}

function updateProject(id, updates) {
  const db = readDb();
  const index = db.projects.findIndex((project) => project.id === id);

  if (index === -1) return null;

  db.projects[index] = { ...db.projects[index], ...updates };
  writeDb(db);
  return db.projects[index];
}

function deleteProject(id) {
  const db = readDb();
  db.projects = db.projects.filter((project) => project.id !== id);
  writeDb(db);
}

module.exports = {
  readDb,
  getUsers,
  findUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
