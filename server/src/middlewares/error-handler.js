function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error('[error]', {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Unexpected server error',
    },
  });
}

module.exports = { errorHandler };
