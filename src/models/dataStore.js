/**
 * In-memory data store for Books and Physical Copies
 * strictly conforming to spec/openapi.yaml and spec/srs.md
 */

const CopyStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  BORROWED: 'BORROWED',
  RESERVED: 'RESERVED',
  IN_REPAIR: 'IN_REPAIR',
  LOST: 'LOST',
});

const TitleAvailability = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
});

const initialBooks = [
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000001',
    title: 'Кобзар',
    author: 'Тарас Шевченко',
    isbn: '9789660100001',
    genre: 'Поезія',
    description: 'Повна збірка поетичних творів Тараса Шевченка.',
    isArchived: false,
  },
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000002',
    title: 'Гайдамаки',
    author: 'Тарас Шевченко',
    isbn: '9789660100002',
    genre: 'Поезія',
    description: 'Поема Тараса Шевченка.',
    isArchived: false,
  },
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000003',
    title: 'Стародавня історія',
    author: 'Микола Костомаров',
    isbn: '9789660100003',
    genre: 'Історія',
    description: 'Історичне монографічне дослідження.',
    isArchived: false,
  },
  {
    id: 'b1a2c3d4-0000-0000-0000-000000000004',
    title: 'Заповіт',
    author: 'Тарас Шевченко',
    isbn: '9789660100004',
    genre: 'Поезія',
    description: 'Поетичний твір-маніфест.',
    isArchived: false,
  },
];

const initialCopies = [
  // Book 1: 'Кобзар' (available)
  {
    inventoryNumber: 'INV-1001',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000001',
    status: CopyStatus.AVAILABLE,
    location: 'Зала художньої літератури, стелаж 3',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1002',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000001',
    status: CopyStatus.AVAILABLE,
    location: 'Зала художньої літератури, стелаж 3',
    updatedAt: new Date().toISOString(),
  },

  // Book 2: 'Гайдамаки' (unavailable: borrowed & reserved)
  {
    inventoryNumber: 'INV-1003',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000002',
    status: CopyStatus.BORROWED,
    location: 'На руках у читача',
    updatedAt: new Date().toISOString(),
  },
  {
    inventoryNumber: 'INV-1005',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000002',
    status: CopyStatus.RESERVED,
    location: 'Кафедра видачі',
    updatedAt: new Date().toISOString(),
  },

  // Book 3: 'Стародавня історія' (out of stock: all LOST)
  {
    inventoryNumber: 'INV-1006',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000003',
    status: CopyStatus.LOST,
    location: 'Списано',
    updatedAt: new Date().toISOString(),
  },

  // Book 4: 'Заповіт' (in repair: INV-1004)
  {
    inventoryNumber: 'INV-1004',
    bookId: 'b1a2c3d4-0000-0000-0000-000000000004',
    status: CopyStatus.IN_REPAIR,
    location: 'Відділ реставрації',
    updatedAt: new Date().toISOString(),
  },
];

let books = JSON.parse(JSON.stringify(initialBooks));
let copies = JSON.parse(JSON.stringify(initialCopies));

/**
 * Dynamic calculation of TitleAvailability and CopiesSummary (REQ-F-002)
 */
function calculateTitleAvailability(bookCopies) {
  const total = bookCopies.length;
  const available = bookCopies.filter((c) => c.status === CopyStatus.AVAILABLE).length;
  const borrowed = bookCopies.filter((c) => c.status === CopyStatus.BORROWED).length;
  const reserved = bookCopies.filter((c) => c.status === CopyStatus.RESERVED).length;
  const inRepair = bookCopies.filter((c) => c.status === CopyStatus.IN_REPAIR).length;
  const lost = bookCopies.filter((c) => c.status === CopyStatus.LOST).length;

  const copiesSummary = {
    total,
    available,
    borrowed,
    reserved,
    inRepair,
    lost,
  };

  let availabilityStatus;
  if (available > 0) {
    availabilityStatus = TitleAvailability.AVAILABLE;
  } else if (total > 0 && lost === total) {
    availabilityStatus = TitleAvailability.OUT_OF_STOCK;
  } else if (total === 0) {
    availabilityStatus = TitleAvailability.OUT_OF_STOCK;
  } else {
    availabilityStatus = TitleAvailability.UNAVAILABLE;
  }

  return { availabilityStatus, copiesSummary };
}

/**
 * Search and filter books (REQ-F-001, REQ-F-004)
 */
function searchBooks({ query, isbn, genre, isArchived = false, page = 1, limit = 20 }) {
  let filtered = books.filter((b) => b.isArchived === isArchived);

  if (query) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }

  if (isbn) {
    const targetIsbn = isbn.trim();
    filtered = filtered.filter((b) => b.isbn === targetIsbn);
  }

  if (genre) {
    const targetGenre = genre.trim();
    filtered = filtered.filter((b) => b.genre.toLowerCase() === targetGenre.toLowerCase());
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  const items = paginated.map((book) => {
    const bookCopies = copies.filter((c) => c.bookId === book.id);
    const { availabilityStatus, copiesSummary } = calculateTitleAvailability(bookCopies);
    return {
      ...book,
      availabilityStatus,
      totalCopies: copiesSummary.total,
      availableCopies: copiesSummary.available,
    };
  });

  return {
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems,
      totalPages,
    },
  };
}

/**
 * Get book card with full detail and copiesSummary (REQ-F-002)
 */
function getBookById(id) {
  const book = books.find((b) => b.id === id);
  if (!book) return null;

  const bookCopies = copies.filter((c) => c.bookId === book.id);
  const { availabilityStatus, copiesSummary } = calculateTitleAvailability(bookCopies);

  return {
    ...book,
    availabilityStatus,
    copiesSummary,
  };
}

/**
 * Get copies of a book (REQ-F-002)
 */
function getBookCopies(id) {
  const book = books.find((b) => b.id === id);
  if (!book) return null;

  const bookCopies = copies.filter((c) => c.bookId === id);
  return {
    bookId: id,
    copies: bookCopies,
  };
}

/**
 * Update physical copy status with domain invariants (REQ-F-003, REQ-NF-002)
 */
function updateCopyStatus(inventoryNumber, targetStatus, comment) {
  const copy = copies.find((c) => c.inventoryNumber === inventoryNumber);
  if (!copy) {
    const err = new Error(`Примірник з інвентарним номером ${inventoryNumber} не знайдено.`);
    err.statusCode = 404;
    err.errorType = 'https://api.library.local/errors/not-found';
    err.title = 'Not Found';
    throw err;
  }

  const validStatuses = Object.values(CopyStatus);
  if (!validStatuses.includes(targetStatus)) {
    const err = new Error(`Неприпустимий статус примірника: ${targetStatus}.`);
    err.statusCode = 400;
    err.errorType = 'https://api.library.local/errors/invalid-copy-status';
    err.title = 'Bad Request';
    throw err;
  }

  // Domain Invariant: transition IN_REPAIR -> RESERVED is strictly forbidden
  if (copy.status === CopyStatus.IN_REPAIR && targetStatus === CopyStatus.RESERVED) {
    const err = new Error('Бронювання примірника в ремонті (IN_REPAIR -> RESERVED) заборонено.');
    err.statusCode = 422;
    err.errorType = 'https://api.library.local/errors/invalid-status-transition';
    err.title = 'Invalid Status Transition';
    throw err;
  }

  const previousStatus = copy.status;
  copy.status = targetStatus;
  copy.updatedAt = new Date().toISOString();
  if (comment) {
    copy.comment = comment;
  }

  return {
    inventoryNumber: copy.inventoryNumber,
    bookId: copy.bookId,
    previousStatus,
    status: copy.status,
    updatedAt: copy.updatedAt,
  };
}

/**
 * Archive book with domain invariant: all copies must be LOST (REQ-F-004)
 */
function archiveBook(id) {
  const book = books.find((b) => b.id === id);
  if (!book) {
    const err = new Error(`Книгу з ID ${id} не знайдено.`);
    err.statusCode = 404;
    err.errorType = 'https://api.library.local/errors/not-found';
    err.title = 'Not Found';
    throw err;
  }

  const bookCopies = copies.filter((c) => c.bookId === id);
  const activeCopies = bookCopies.filter((c) => c.status !== CopyStatus.LOST);

  if (activeCopies.length > 0) {
    const err = new Error(
      'Неможливо заархівувати книгу: не всі примірники мають статус LOST (знайдено примірники в обігу/ремонті).'
    );
    err.statusCode = 422;
    err.errorType = 'https://api.library.local/errors/archive-precondition-failed';
    err.title = 'Cannot Archive Book';
    throw err;
  }

  book.isArchived = true;
  book.archivedAt = new Date().toISOString();

  return {
    id: book.id,
    title: book.title,
    isArchived: true,
    archivedAt: book.archivedAt,
  };
}

/**
 * Unarchive book (REQ-F-004)
 */
function unarchiveBook(id) {
  const book = books.find((b) => b.id === id);
  if (!book) {
    const err = new Error(`Книгу з ID ${id} не знайдено.`);
    err.statusCode = 404;
    err.errorType = 'https://api.library.local/errors/not-found';
    err.title = 'Not Found';
    throw err;
  }

  book.isArchived = false;
  book.unarchivedAt = new Date().toISOString();

  return {
    id: book.id,
    isArchived: false,
    unarchivedAt: book.unarchivedAt,
  };
}

/**
 * Reset in-memory store to initial state
 */
function resetStore() {
  books = JSON.parse(JSON.stringify(initialBooks));
  copies = JSON.parse(JSON.stringify(initialCopies));
}

module.exports = {
  CopyStatus,
  TitleAvailability,
  searchBooks,
  getBookById,
  getBookCopies,
  updateCopyStatus,
  archiveBook,
  unarchiveBook,
  resetStore,
};
