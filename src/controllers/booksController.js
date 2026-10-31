const BookService = require('../services/bookService');
const { handleControllerError } = require('../middleware/problemDetails');
const { ForbiddenError } = require('../domain/errors');
const { logger, logArchiveChange } = require('../logger');

/**
 * Controller for searching books (REQ-F-001, REQ-F-004)
 */
const searchBooks = (req, res) => {
  const { query, isbn, genre, isArchived, page, limit } = req.query;

  try {
    const isArchivedRequested = isArchived === 'true';

    // Security guard for viewing archived books (REQ-F-004)
    if (isArchivedRequested && (!req.user || req.user.role !== 'librarian')) {
      logger.warn('Unauthorized/forbidden attempt to access archived books catalog');
      throw new ForbiddenError(
        'Недостатньо прав для перегляду заархівованих книг (доступно лише бібліотекарю).'
      );
    }

    const result = BookService.searchBooks({
      query,
      isbn,
      genre,
      isArchived: isArchivedRequested,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });

    logger.info(
      `Books searched: query="${query || ''}", isbn="${isbn || ''}", genre="${genre || ''}", isArchived=${isArchivedRequested} -> Found ${result.data.length} books`
    );
    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Search books error: ${err.message}`);
    return handleControllerError(res, req, err);
  }
};

/**
 * Controller for getting book card with TitleAvailability (REQ-F-002)
 */
const getBookById = (req, res) => {
  const { id } = req.params;

  try {
    const book = BookService.getBookDetail(id);
    logger.info(`Fetched book card: ${book.id} (${book.title}) with status=${book.availabilityStatus}`);
    return res.status(200).json(book);
  } catch (err) {
    logger.warn(`Get book by ID failed: ${err.message}`);
    return handleControllerError(res, req, err);
  }
};

/**
 * Controller for getting book copies list (REQ-F-002)
 */
const getBookCopies = (req, res) => {
  const { id } = req.params;

  try {
    const result = BookService.getBookCopies(id);
    logger.info(`Fetched ${result.copies.length} copies for book ID ${id}`);
    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Get book copies failed: ${err.message}`);
    return handleControllerError(res, req, err);
  }
};

/**
 * Controller for archiving a book (REQ-F-004)
 */
const archiveBook = (req, res) => {
  const { id } = req.params;

  try {
    const result = BookService.archiveBook(id);
    logArchiveChange({
      bookId: result.id,
      title: result.title,
      isArchived: true,
      performedBy: req.user ? req.user.name : 'librarian',
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Book archive failure for ID "${id}": ${err.message}`);
    return handleControllerError(res, req, err);
  }
};

/**
 * Controller for unarchiving a book (REQ-F-004)
 */
const unarchiveBook = (req, res) => {
  const { id } = req.params;

  try {
    const result = BookService.unarchiveBook(id);
    logArchiveChange({
      bookId: result.id,
      title: result.id,
      isArchived: false,
      performedBy: req.user ? req.user.name : 'librarian',
    });
    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Book unarchive failure for ID "${id}": ${err.message}`);
    return handleControllerError(res, req, err);
  }
};

module.exports = {
  searchBooks,
  getBookById,
  getBookCopies,
  archiveBook,
  unarchiveBook,
};
