const { sendSuccess } = require('../utils/api-response');
const {
  listEmployeeTypesService,
  createEmployeeTypeService,
  updateEmployeeTypeService,
  deleteEmployeeTypeService,
  getEmployeeProfileService,
  updateEmployeeProfileService,
} = require('../services/employee.service');

async function listEmployeeTypes(req, res, next) {
  try {
    return sendSuccess(res, await listEmployeeTypesService());
  } catch (error) {
    return next(error);
  }
}

async function createEmployeeType(req, res, next) {
  try {
    return sendSuccess(res, await createEmployeeTypeService(req.body), 201);
  } catch (error) {
    return next(error);
  }
}

async function updateEmployeeType(req, res, next) {
  try {
    return sendSuccess(res, await updateEmployeeTypeService(req.params.id, req.body));
  } catch (error) {
    return next(error);
  }
}

async function deleteEmployeeType(req, res, next) {
  try {
    await deleteEmployeeTypeService(req.params.id);
    return sendSuccess(res, { deleted: true });
  } catch (error) {
    return next(error);
  }
}

async function getEmployeeProfile(req, res, next) {
  try {
    return sendSuccess(res, await getEmployeeProfileService(req.params.userId));
  } catch (error) {
    return next(error);
  }
}

async function updateEmployeeProfile(req, res, next) {
  try {
    return sendSuccess(res, await updateEmployeeProfileService(req.params.userId, req.body));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listEmployeeTypes,
  createEmployeeType,
  updateEmployeeType,
  deleteEmployeeType,
  getEmployeeProfile,
  updateEmployeeProfile,
};
