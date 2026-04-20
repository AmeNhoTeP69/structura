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

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/register/client', registerClient);
authRouter.get('/me', authenticate, getCurrentUser);
authRouter.put('/me', authenticate, updateCurrentUser);
authRouter.patch('/me/password', authenticate, changeCurrentUserPassword);

module.exports = { authRouter };
