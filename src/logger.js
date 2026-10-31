const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}]: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'library-catalog-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
    }),
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS,
    }),
  ],
});

/**
 * Express middleware for logging incoming requests and response status
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const logData = {
      method,
      url: originalUrl,
      statusCode,
      durationMs: duration,
      ip,
      userAgent: req.get('user-agent') || 'unknown',
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logData);
    } else {
      logger.info(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logData);
    }
  });

  next();
};

/**
 * Helper to log domain-specific copy status transitions
 */
const logStatusChange = ({ inventoryNumber, previousStatus, newStatus, performedBy, reason }) => {
  logger.info(`Copy status changed: ${inventoryNumber} [${previousStatus} -> ${newStatus}]`, {
    action: 'COPY_STATUS_CHANGE',
    inventoryNumber,
    previousStatus,
    newStatus,
    performedBy: performedBy || 'anonymous',
    reason: reason || null,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper to log book archive actions
 */
const logArchiveChange = ({ bookId, title, isArchived, performedBy }) => {
  logger.info(`Book archive status updated: ${bookId} (${title}) -> isArchived=${isArchived}`, {
    action: 'BOOK_ARCHIVE_CHANGE',
    bookId,
    title,
    isArchived,
    performedBy: performedBy || 'anonymous',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logger,
  requestLogger,
  logStatusChange,
  logArchiveChange,
};
