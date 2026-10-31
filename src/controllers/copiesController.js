const dataStore = require('../models/dataStore');
const { sendProblemDetails } = require('../middleware/problemDetails');
const { logger, logStatusChange } = require('../logger');

/**
 * Controller for updating physical copy status (REQ-F-003, REQ-NF-002, REQ-NF-003)
 */
const updateCopyStatus = (req, res) => {
  const { inventoryNumber } = req.params;
  const { status, comment } = req.body;

  if (!status) {
    logger.warn(`Missing required field "status" in request body for copy ${inventoryNumber}`);
    return sendProblemDetails(res, {
      type: 'https://api.library.local/errors/bad-request',
      title: 'Bad Request',
      status: 400,
      detail: 'Обов\'язкове поле "status" відсутнє у тілі запиту.',
      instance: req.originalUrl,
    });
  }

  try {
    const result = dataStore.updateCopyStatus(inventoryNumber, status, comment);

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
    return sendProblemDetails(res, {
      type: err.errorType || 'https://api.library.local/errors/status-update-error',
      title: err.title || 'Status Update Error',
      status: err.statusCode || 500,
      detail: err.message,
      instance: req.originalUrl,
    });
  }
};

module.exports = {
  updateCopyStatus,
};
