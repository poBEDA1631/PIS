const express = require('express');
const router = express.Router();

/**
 * Stub handler returning 501 Not Implemented for Red Phase
 */
const notImplemented = (operationName) => (req, res) => {
  res.status(501).json({
    type: 'https://api.library.local/errors/not-implemented',
    title: 'Not Implemented',
    status: 501,
    detail: `Операція ${operationName} ще не реалізована (Red Phase - TDD).`,
    instance: req.originalUrl,
  });
};

// GET /api/v1/books - Пошук та фільтрація книг [REQ-F-001, REQ-F-004]
router.get('/', notImplemented('searchBooks'));

// GET /api/v1/books/:id - Отримання картки книги з агрегованим станом [REQ-F-002]
router.get('/:id', notImplemented('getBookById'));

// GET /api/v1/books/:id/copies - Отримання списку примірників книги [REQ-F-002]
router.get('/:id/copies', notImplemented('getBookCopies'));

// POST /api/v1/books/:id/archive - Архівування картки книги [REQ-F-004, REQ-NF-003]
router.post('/:id/archive', notImplemented('archiveBook'));

// POST /api/v1/books/:id/unarchive - Відновлення книги з архіву [REQ-F-004, REQ-NF-003]
router.post('/:id/unarchive', notImplemented('unarchiveBook'));

module.exports = router;
