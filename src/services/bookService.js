const BookRepository = require('../repositories/bookRepository');
const CopyRepository = require('../repositories/copyRepository');
const AvailabilityService = require('./availabilityService');
const { CopyStatus } = require('../domain/constants');
const { NotFoundError, ArchivePreconditionError } = require('../domain/errors');
const { validateIsbn } = require('../utils/validators');

class BookService {
  /**
   * Search books with filters, pagination and calculated TitleAvailability (REQ-F-001, REQ-F-004)
   */
  static searchBooks({ query, isbn, genre, isArchived = false, page = 1, limit = 20 }) {
    if (isbn) {
      validateIsbn(isbn);
    }

    const filtered = BookRepository.findAll((book) => {
      if (book.isArchived !== isArchived) return false;

      if (query) {
        const q = query.trim().toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesAuthor = book.author.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor) return false;
      }

      if (isbn && book.isbn !== isbn.trim()) {
        return false;
      }

      if (genre && book.genre.toLowerCase() !== genre.trim().toLowerCase()) {
        return false;
      }

      return true;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const data = paginated.map((book) => {
      const copies = CopyRepository.findByBookId(book.id);
      const { availabilityStatus, copiesSummary } = AvailabilityService.calculate(copies);
      return {
        ...book,
        availabilityStatus,
        totalCopies: copiesSummary.total,
        availableCopies: copiesSummary.available,
      };
    });

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Get detailed book card with aggregated TitleAvailability (REQ-F-002)
   */
  static getBookDetail(id) {
    const book = BookRepository.findById(id);
    if (!book) {
      throw new NotFoundError(`Книгу з ID ${id} не знайдено.`);
    }

    const copies = CopyRepository.findByBookId(book.id);
    const { availabilityStatus, copiesSummary } = AvailabilityService.calculate(copies);

    return {
      ...book,
      availabilityStatus,
      copiesSummary,
    };
  }

  /**
   * Get list of physical copies for a book (REQ-F-002)
   */
  static getBookCopies(id) {
    const book = BookRepository.findById(id);
    if (!book) {
      throw new NotFoundError(`Книгу з ID ${id} не знайдено.`);
    }

    const copies = CopyRepository.findByBookId(book.id);
    return {
      bookId: id,
      copies,
    };
  }

  /**
   * Archive book checking business invariant that all copies must be LOST or DECOMMISSIONED (REQ-F-004, REQ-F-ADD-001)
   */
  static archiveBook(id) {
    const book = BookRepository.findById(id);
    if (!book) {
      throw new NotFoundError(`Книгу з ID ${id} не знайдено.`);
    }

    const copies = CopyRepository.findByBookId(id);
    const nonLostOrDecommissioned = copies.filter(
      (c) => c.status !== CopyStatus.LOST && c.status !== CopyStatus.DECOMMISSIONED
    );

    if (nonLostOrDecommissioned.length > 0) {
      throw new ArchivePreconditionError(
        'Неможливо заархівувати книгу: не всі примірники мають статус LOST або DECOMMISSIONED (знайдено примірники в обігу/ремонті).'
      );
    }

    const archivedAt = new Date().toISOString();
    BookRepository.update(id, { isArchived: true, archivedAt });

    return {
      id: book.id,
      title: book.title,
      isArchived: true,
      archivedAt,
    };
  }

  /**
   * Unarchive book (REQ-F-004)
   */
  static unarchiveBook(id) {
    const book = BookRepository.findById(id);
    if (!book) {
      throw new NotFoundError(`Книгу з ID ${id} не знайдено.`);
    }

    const unarchivedAt = new Date().toISOString();
    BookRepository.update(id, { isArchived: false, unarchivedAt });

    return {
      id: book.id,
      isArchived: false,
      unarchivedAt,
    };
  }
}

module.exports = BookService;
