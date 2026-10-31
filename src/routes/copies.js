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

// PATCH /api/v1/copies/:inventoryNumber/status - Зміна статусу фізичного примірника [REQ-F-003, REQ-NF-002, REQ-NF-003]
router.patch('/:inventoryNumber/status', notImplemented('updateCopyStatus'));

module.exports = router;
