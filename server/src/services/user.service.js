const userRepository = require('../repositories/user.repository');
const { createHttpError } = require('../utils/http-error');
const { hashPassword, looksHashed, verifyPassword } = require('../utils/password');

async function listUsersService() {
  return userRepository.listUsers();
}

async function authenticateUserService(email, password) {
  const user = await userRepository.findUserByEmail(email);

  if (!user || !user.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  if (!looksHashed(user.passwordHash)) {
    const passwordHash = await hashPassword(password);
    return userRepository.updateUser(user.id, { passwordHash });
  }

  return user;
}

async function createUserService(payload) {
  const passwordHash = await hashPassword(payload.password || 'password123');
  return userRepository.createUser({ ...payload, password: passwordHash });
}

async function updateUserService(id, updates) {
  const nextUpdates = { ...updates };

  if (nextUpdates.password) {
    nextUpdates.passwordHash = await hashPassword(nextUpdates.password);
    delete nextUpdates.password;
  }

  return userRepository.updateUser(id, nextUpdates);
}

async function deleteUserService(id) {
  return userRepository.deleteUser(id);
}

async function getUserByIdService(id) {
  return userRepository.getUserById(id);
}

async function registerClientService({ name, email, password, phone }) {
  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    throw createHttpError(409, 'Email already in use', 'EMAIL_CONFLICT');
  }

  const passwordHash = await hashPassword(password);

  return userRepository.createUser({
    name,
    email,
    role: 'client',
    password: passwordHash,
    phone,
  });
}

async function updateCurrentUserService(userId, updates) {
  const allowedUpdates = {
    name: updates.name,
    fullName: updates.fullName,
    email: updates.email,
    phone: updates.phone,
  };

  return userRepository.updateUser(userId, allowedUpdates);
}

async function changeCurrentUserPasswordService(userId, currentPassword, newPassword) {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);

  if (!isValid) {
    throw createHttpError(400, 'Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updateUser(userId, { passwordHash });
}

module.exports = {
  listUsersService,
  authenticateUserService,
  createUserService,
  updateUserService,
  deleteUserService,
  getUserByIdService,
  registerClientService,
  updateCurrentUserService,
  changeCurrentUserPasswordService,
};
