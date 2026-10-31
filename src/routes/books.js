const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const { requireLibrarian } = require('../middleware/auth');

// GET /api/v1/books - Пошук та фільтрація книг [REQ-F-001, REQ-F-004]
router.get('/', booksController.searchBooks);

// GET /api/v1/books/:id - Отримання картки книги з агрегованим станом [REQ-F-002]
router.get('/:id', booksController.getBookById);

// GET /api/v1/books/:id/copies - Отримання списку примірників книги [REQ-F-002]
router.get('/:id/copies', booksController.getBookCopies);

// POST /api/v1/books/:id/archive - Архівування картки книги [REQ-F-004, REQ-NF-003]
router.post('/:id/archive', requireLibrarian, booksController.archiveBook);

// POST /api/v1/books/:id/unarchive - Відновлення книги з архіву [REQ-F-004, REQ-NF-003]
router.post('/:id/unarchive', requireLibrarian, booksController.unarchiveBook);

module.exports = router;
