function createHttpError(statusCode, message, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code || 'HTTP_ERROR';
  return error;
}

module.exports = { createHttpError };
