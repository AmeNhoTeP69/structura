const { Router } = require('express');

const {
  login,
  logout,
  getCurrentUser,
  registerClient,
  updateCurrentUser,
  changeCurrentUserPassword,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authenticate');
const {
  validateRequest,
  validateLoginBody,
  validateRegisterClientBody,
  validateUpdateCurrentUserBody,
  validateChangePasswordBody,
} = require('../middlewares/request-validation');

const authRouter = Router();

authRouter.post('/login', validateRequest(validateLoginBody), login);
authRouter.post('/logout', logout);
authRouter.post('/register/client', validateRequest(validateRegisterClientBody), registerClient);
authRouter.get('/me', authenticate, getCurrentUser);
authRouter.put('/me', authenticate, validateRequest(validateUpdateCurrentUserBody), updateCurrentUser);
authRouter.patch(
  '/me/password',
  authenticate,
  validateRequest(validateChangePasswordBody),
  changeCurrentUserPassword,
);

module.exports = { authRouter };
