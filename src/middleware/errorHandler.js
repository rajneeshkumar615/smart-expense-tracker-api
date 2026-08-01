const ApiError = require('../utils/ApiError');

/**
 * Handles requests to routes that do not exist.
 */
function notFoundHandler(req, res, next) {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
}

/**
 * Centralized error handling middleware.
 * All errors thrown (or passed to next()) anywhere in the app end up here.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known, expected application errors.
  // Checked via `instanceof` (reliable even if the isApiError flag is ever
  // missing/stripped) as well as the isApiError flag itself.
  if (err && (err instanceof ApiError || err.isApiError)) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details && err.details.length ? err.details : undefined,
    });
  }

  // JSON body parsing errors from express.json()
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload in request body.',
    });
  }

  // Fallback: unexpected/unhandled errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};