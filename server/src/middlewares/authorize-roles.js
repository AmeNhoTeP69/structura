const { createHttpError } = require('../utils/http-error');

function authorizeRoles(...roles) {
  return (req, _res, next) => {
    const currentRole = String(req.auth?.user?.role || '').toUpperCase();

    if (!roles.includes(currentRole)) {
      return next(createHttpError(403, 'Access denied', 'FORBIDDEN'));
    }

    return next();
  };
}

module.exports = { authorizeRoles };
