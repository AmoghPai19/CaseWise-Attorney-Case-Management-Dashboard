// Not found handler
function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

// Centralized error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
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

