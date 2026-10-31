const CopyService = require('../services/copyService');
const { handleControllerError } = require('../middleware/problemDetails');
const { validateCopyStatus } = require('../utils/validators');
const { logger, logStatusChange } = require('../logger');

/**
 * Controller for updating physical copy status (REQ-F-003, REQ-NF-002, REQ-NF-003)
 */
const updateCopyStatus = (req, res) => {
  const { inventoryNumber } = req.params;
  const { status, comment } = req.body;

  try {
    validateCopyStatus(status);

    const result = CopyService.updateStatus(inventoryNumber, status, comment);

    logStatusChange({
      inventoryNumber: result.inventoryNumber,
      previousStatus: result.previousStatus,
      newStatus: result.status,
      performedBy: req.user ? req.user.name : 'librarian',
      reason: comment,
    });

    return res.status(200).json(result);
  } catch (err) {
    logger.warn(`Status update rejected for copy "${inventoryNumber}": ${err.message}`);
    return handleControllerError(res, req, err);
  }
};

module.exports = {
  updateCopyStatus,
};
