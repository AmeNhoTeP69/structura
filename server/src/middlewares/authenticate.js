const { createHttpError } = require('../utils/http-error');
const { verifyAccessToken } = require('../utils/jwt');
const { getUserByIdService } = require('../services/user.service');

async function authenticate(req, _res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(createHttpError(401, 'Authentication required', 'UNAUTHENTICATED'));
    }

    const payload = verifyAccessToken(token);
    const user = await getUserByIdService(payload.sub);

    if (!user || !user.isActive) {
      return next(createHttpError(401, 'Invalid or inactive user', 'INVALID_USER'));
    }

    req.auth = { user };
    return next();
  } catch (_error) {
    return next(createHttpError(401, 'Invalid access token', 'INVALID_TOKEN'));
  }
}

module.exports = { authenticate };
