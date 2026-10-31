const CopyRepository = require('../repositories/copyRepository');
const CopyStatusService = require('./copyStatusService');
const { NotFoundError } = require('../domain/errors');

class CopyService {
  /**
   * Update physical copy status enforcing domain rules (REQ-F-003, REQ-NF-002)
   */
  static updateStatus(inventoryNumber, targetStatus, comment) {
    const copy = CopyRepository.findByInventoryNumber(inventoryNumber);
    if (!copy) {
      throw new NotFoundError(
        `Примірник з інвентарним номером ${inventoryNumber} не знайдено.`
      );
    }

    CopyStatusService.validateTransition(copy.status, targetStatus);

    const previousStatus = copy.status;
    const updatedAt = new Date().toISOString();

    const updates = {
      status: targetStatus,
      updatedAt,
    };
    if (comment) {
      updates.comment = comment;
    }

    CopyRepository.update(inventoryNumber, updates);

    return {
      inventoryNumber: copy.inventoryNumber,
      bookId: copy.bookId,
      previousStatus,
      status: targetStatus,
      updatedAt,
    };
  }
}

module.exports = CopyService;
