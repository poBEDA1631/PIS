const { sendProblemDetails } = require('./problemDetails');
const { logger } = require('../logger');

/**
 * Authentication middleware: parses Authorization Bearer header
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (token.includes('librarian')) {
    req.user = { role: 'librarian', id: 'lib-001', name: 'Головний бібліотекар' };
  } else if (token.includes('reader')) {
    req.user = { role: 'reader', id: 'reader-001', name: 'Читач' };
  } else {
    req.user = null;
  }
  next();
};

/**
 * Authorization guard: requires Librarian role
 */
const requireLibrarian = (req, res, next) => {
  if (!req.headers.authorization) {
    logger.warn(`Unauthorized access attempt to ${req.method} ${req.originalUrl}`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Потрібна автентифікація бібліотекаря.',
      instance: req.originalUrl,
    });
  }

  if (!req.user || req.user.role !== 'librarian') {
    logger.warn(`Forbidden access attempt to ${req.method} ${req.originalUrl} by ${req.user ? req.user.role : 'anonymous'}`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: 'Операція дозволена виключно користувачам з роллю «Бібліотекар».',
      instance: req.originalUrl,
    });
  }

  next();
};

module.exports = {
  authenticate,
  requireLibrarian,
};
