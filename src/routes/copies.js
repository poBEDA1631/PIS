const express = require('express');
const router = express.Router();
const copiesController = require('../controllers/copiesController');
const { requireLibrarian } = require('../middleware/auth');

// PATCH /api/v1/copies/:inventoryNumber/status - Зміна статусу фізичного примірника [REQ-F-003, REQ-NF-002, REQ-NF-003]
router.patch('/:inventoryNumber/status', requireLibrarian, copiesController.updateCopyStatus);

module.exports = router;
