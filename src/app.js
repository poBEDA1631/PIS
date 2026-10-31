const express = require('express');
const { requestLogger, logger } = require('./logger');
const { authenticate } = require('./middleware/auth');
const booksRouter = require('./routes/books');
const copiesRouter = require('./routes/copies');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(authenticate);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'library-catalog-api' });
});

// API Routes
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/copies', copiesRouter);

// 404 Handler (RFC 7807 Problem Details)
app.use((req, res) => {
  res.status(404).json({
    type: 'https://api.library.local/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: `Ресурс за адресою ${req.originalUrl} не знайдено.`,
    instance: req.originalUrl,
  });
});

// Global Error Handler (RFC 7807 Problem Details)
app.use((err, req, res, next) => {
  logger.error('Unhandled Application Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    type: 'https://api.library.local/errors/internal-server-error',
    title: err.name || 'Internal Server Error',
    status: statusCode,
    detail: err.message || 'Сталася внутрішня помилка сервера.',
    instance: req.originalUrl,
  });
});

module.exports = app;
