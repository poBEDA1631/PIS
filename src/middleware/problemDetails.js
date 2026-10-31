/**
 * Helper to construct RFC 7807 Problem Details response
 */
function sendProblemDetails(res, { type, title, status, detail, instance }) {
  return res.status(status).json({
    type: type || 'https://api.library.local/errors/generic',
    title: title || 'Error',
    status,
    detail,
    instance: instance || res.req?.originalUrl,
  });
}

module.exports = { sendProblemDetails };
