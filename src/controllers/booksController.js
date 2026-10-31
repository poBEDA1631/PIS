const dataStore = require('../models/dataStore');
const { sendProblemDetails } = require('../middleware/problemDetails');
const { logger, logArchiveChange } = require('../logger');

const ISBN_REGEX = /^(97[89])?\d{9}[\dX]$/i;

/**
 * Controller for searching books (REQ-F-001, REQ-F-004)
 */
const searchBooks = (req, res) => {
  const { query, isbn, genre, isArchived, page, limit } = req.query;

  // Validate ISBN format if provided
  if (isbn && !ISBN_REGEX.test(isbn.trim())) {
    logger.warn(`Invalid ISBN search format received: "${isbn}"`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/invalid-isbn',
      title: 'Bad Request',
      status: 400,
      detail: 'Некоректний формат ISBN (очікується 10 або 13 символів).',
      instance: req.originalUrl,
    });
  }

  // Security guard for viewing archived books (REQ-F-004)
  const isArchivedRequested = isArchived === 'true';
  if (isArchivedRequested && (!req.user || req.user.role !== 'librarian')) {
    logger.warn(`Unauthorized/forbidden attempt to access archived books catalog`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: 'Недостатньо прав для перегляду заархівованих книг (доступно лише бібліотекарю).',
      instance: req.originalUrl,
    });
  }

  const result = dataStore.searchBooks({
    query,
    isbn,
    genre,
    isArchived: isArchivedRequested,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  });

  logger.info(`Books searched with query="${query || ''}", isbn="${isbn || ''}", genre="${genre || ''}", isArchived=${isArchivedRequested} -> Found ${result.data.length} books`);
  return res.status(200).json(result);
};

/**
 * Controller for getting book card with TitleAvailability (REQ-F-002)
 */
const getBookById = (req, res) => {
  const { id } = req.params;
  const book = dataStore.getBookById(id);

  if (!book) {
    logger.warn(`Book with ID "${id}" was not found`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: `Книгу з ID ${id} не знайдено.`,
      instance: req.originalUrl,
    });
  }

  logger.info(`Fetched book card: ${book.id} (${book.title}) with status=${book.availabilityStatus}`);
  return res.status(200).json(book);
};

/**
 * Controller for getting book copies list (REQ-F-002)
 */
const getBookCopies = (req, res) => {
  const { id } = req.params;
  const result = dataStore.getBookCopies(id);

  if (!result) {
    logger.warn(`Copies for book ID "${id}" requested, but book was not found`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: `Книгу з ID ${id} не знайдено.`,
      instance: req.originalUrl,
    });
  }

  logger.info(`Fetched ${result.copies.length} copies for book ID ${id}`);
  return res.status(200).json(result);
};

/**
 * Controller for archiving a book (REQ-F-004)
 */
const archiveBook = (req, res) => {
  const { id } = req.params;

  try {
    const result = dataStore.archiveBook(id);
    logArchiveChange({
      bookId: result.id,
      title: result.title,
      isArchived: true,
      performedBy: req.user ? req.user.name : 'librarian',
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Book archive failure for ID "${id}": ${err.message}`);
    return sendProblemDetails(res, {
      type: err.errorType || 'https://api.library.local/errors/archive-error',
      title: err.title || 'Archive Error',
      status: err.statusCode || 500,
      detail: err.message,
      instance: req.originalUrl,
    });
  }
};

/**
 * Controller for unarchiving a book (REQ-F-004)
 */
const unarchiveBook = (req, res) => {
  const { id } = req.params;

  try {
    const result = dataStore.unarchiveBook(id);
    logArchiveChange({
      bookId: result.id,
      title: result.id,
      isArchived: false,
      performedBy: req.user ? req.user.name : 'librarian',
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Book unarchive failure for ID "${id}": ${err.message}`);
    return sendProblemDetails(res, {
      type: err.errorType || 'https://api.library.local/errors/unarchive-error',
      title: err.title || 'Unarchive Error',
      status: err.statusCode || 500,
      detail: err.message,
      instance: req.originalUrl,
    });
  }
};

module.exports = {
  searchBooks,
  getBookById,
  getBookCopies,
  archiveBook,
  unarchiveBook,
};
