const { sendSuccess } = require('../utils/api-response');
const { createHttpError } = require('../utils/http-error');
const { signAccessToken } = require('../utils/jwt');
const {
  authenticateUserService,
  registerClientService,
  getUserByIdService,
  updateCurrentUserService,
  changeCurrentUserPasswordService,
} = require('../services/user.service');
const { toPublicUser } = require('../utils/user-mapper');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authenticateUserService(email, password);

    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    const token = signAccessToken(user);

    return sendSuccess(res, {
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await getUserByIdService(req.auth.user.id);
    return sendSuccess(res, toPublicUser(user));
  } catch (error) {
    return next(error);
  }
}

async function registerClient(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const user = await registerClientService({ name, email, password, phone });
    const token = signAccessToken(user);

    return sendSuccess(res, {
      token,
      user: toPublicUser(user),
    }, 201);
  } catch (error) {
    return next(error);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const user = await updateCurrentUserService(req.auth.user.id, req.body);
    return sendSuccess(res, toPublicUser(user));
  } catch (error) {
    return next(error);
  }
}

async function changeCurrentUserPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await changeCurrentUserPasswordService(req.auth.user.id, currentPassword, newPassword);
    return sendSuccess(res, { passwordUpdated: true });
  } catch (error) {
    return next(error);
  }
}

function logout(_req, res) {
  return sendSuccess(res, { loggedOut: true });
}

module.exports = {
  login,
  logout,
  getCurrentUser,
  registerClient,
  updateCurrentUser,
  changeCurrentUserPassword,
};
