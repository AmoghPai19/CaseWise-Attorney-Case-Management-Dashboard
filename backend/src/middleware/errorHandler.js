// Not found handler
function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

// Centralized error handler.
// Uses err.statusCode when a controller sets one (e.g. permission checks
// throw `error.statusCode = 403`), otherwise falls back to 500.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode);

  const response = {
    message: err.message || 'Server error',
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.json(response);
}

module.exports = { notFound, errorHandler };
