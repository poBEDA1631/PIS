/**
 * Базові статуси примірників книги згідно зі специфікацією spec/openapi.yaml та spec/addendum_01_decommission.md
 */
const { CopyStatus } = require('./domain/constants');

class BookCopy {
  constructor(inventoryNumber, status = CopyStatus.AVAILABLE) {
    this.inventoryNumber = inventoryNumber;
    this.status = status;
  }

  isAvailable() {
    return this.status === CopyStatus.AVAILABLE;
  }

  isDecommissioned() {
    return this.status === CopyStatus.DECOMMISSIONED;
  }

  updateStatus(newStatus) {
    if (!Object.values(CopyStatus).includes(newStatus)) {
      throw new Error(`Неприпустимий статус згідно зі специфікацією: ${newStatus}`);
    }
    this.status = newStatus;
  }
}

module.exports = { CopyStatus, BookCopy };
