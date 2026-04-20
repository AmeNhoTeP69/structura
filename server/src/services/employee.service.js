const employeeRepository = require('../repositories/employee.repository');
const userRepository = require('../repositories/user.repository');
const { createHttpError } = require('../utils/http-error');
const { toPublicUser } = require('../utils/user-mapper');

function toEmployeeType(item) {
  return {
    id: String(item.id),
    name: item.name,
    description: item.description || '',
  };
}

function toEmployeeProfile(item) {
  return {
    userId: String(item.userId),
    employeeTypeId: String(item.employeeTypeId),
    employeeTypeName: item.employeeType?.name || '',
    speciality: item.speciality || '',
    notes: item.notes || '',
    user: toPublicUser(item.user),
  };
}

async function listEmployeeTypesService() {
  const items = await employeeRepository.listEmployeeTypes();
  return items.map(toEmployeeType);
}

async function createEmployeeTypeService(payload) {
  if (!payload.name?.trim()) {
    throw createHttpError(400, 'Employee type name is required', 'VALIDATION_ERROR');
  }

  const item = await employeeRepository.createEmployeeType(payload);
  return toEmployeeType(item);
}

async function updateEmployeeTypeService(id, payload) {
  if (!payload.name?.trim()) {
    throw createHttpError(400, 'Employee type name is required', 'VALIDATION_ERROR');
  }

  const item = await employeeRepository.updateEmployeeType(id, payload);
  return toEmployeeType(item);
}

async function deleteEmployeeTypeService(id) {
  await employeeRepository.deleteEmployeeType(id);
}

async function getEmployeeProfileService(userId) {
  const profile = await employeeRepository.getEmployeeProfile(userId);

  if (!profile) {
    throw createHttpError(404, 'Employee profile not found', 'EMPLOYEE_PROFILE_NOT_FOUND');
  }

  return toEmployeeProfile(profile);
}

async function updateEmployeeProfileService(userId, payload) {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  if (String(user.role).toUpperCase() !== 'EMPLOYEE') {
    throw createHttpError(400, 'User is not an employee', 'INVALID_EMPLOYEE_USER');
  }

  if (!payload.employeeTypeId) {
    throw createHttpError(400, 'Employee type is required', 'VALIDATION_ERROR');
  }

  const profile = await employeeRepository.upsertEmployeeProfile(userId, payload);
  return toEmployeeProfile(profile);
}

module.exports = {
  listEmployeeTypesService,
  createEmployeeTypeService,
  updateEmployeeTypeService,
  deleteEmployeeTypeService,
  getEmployeeProfileService,
  updateEmployeeProfileService,
};
