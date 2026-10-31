const { ProblemTypes } = require('../domain/constants');

/**
 * Helper to construct RFC 7807 Problem Details response
 */
function sendProblemDetails(res, { type, title, status, detail, instance }) {
  return res.status(status).json({
    type: type || ProblemTypes.INTERNAL_SERVER_ERROR,
    title: title || 'Error',
    status,
    detail,
    instance: instance || res.req?.originalUrl,
  });
}

/**
 * Centralized error response formatter for controllers
 */
function handleControllerError(res, req, err) {
  const status = err.statusCode || 500;
  return sendProblemDetails(res, {
    type: err.errorType || ProblemTypes.INTERNAL_SERVER_ERROR,
    title: err.title || 'Internal Server Error',
    status,
    detail: err.message,
    instance: req.originalUrl,
  });
}

module.exports = {
  sendProblemDetails,
  handleControllerError,
};
