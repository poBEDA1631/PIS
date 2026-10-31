const BookRepository = require('../repositories/bookRepository');
const BookService = require('../services/bookService');
const CopyService = require('../services/copyService');
const AvailabilityService = require('../services/availabilityService');
const { CopyStatus, TitleAvailability } = require('../domain/constants');

/**
 * Facade preserving backwards compatibility with earlier iteration exports
 */
module.exports = {
  CopyStatus,
  TitleAvailability,
  searchBooks: (args) => BookService.searchBooks(args),
  getBookById: (id) => BookService.getBookDetail(id),
  getBookCopies: (id) => BookService.getBookCopies(id),
  updateCopyStatus: (inv, status, comment) => CopyService.updateStatus(inv, status, comment),
  archiveBook: (id) => BookService.archiveBook(id),
  unarchiveBook: (id) => BookService.unarchiveBook(id),
  calculateTitleAvailability: (copies) => AvailabilityService.calculate(copies),
  resetStore: () => BookRepository.reset(),
};
