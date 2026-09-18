/**
 * Базові статуси примірників книги згідно зі специфікацією spec/system_concept.md
 */
const CopyStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  BORROWED: 'BORROWED',
  RESERVED: 'RESERVED',
  LOST: 'LOST',
});

class BookCopy {
  constructor(inventoryNumber, status = CopyStatus.AVAILABLE) {
    this.inventoryNumber = inventoryNumber;
    this.status = status;
  }

  isAvailable() {
    return this.status === CopyStatus.AVAILABLE;
  }

  updateStatus(newStatus) {
    if (!Object.values(CopyStatus).includes(newStatus)) {
      throw new Error(`Неприпустимий статус згідно зі специфікацією: ${newStatus}`);
    }
    this.status = newStatus;
  }
}

module.exports = { CopyStatus, BookCopy };
