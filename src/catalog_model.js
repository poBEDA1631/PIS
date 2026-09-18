/**
 * Базові статуси примірників книги згідно зі специфікацією spec/system_concept.md
 */
const CopyStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  BORROWED: 'BORROWED',
  RESERVED: 'RESERVED',
  LOST: 'LOST',
  IN_REPAIR: 'IN_REPAIR', // Додано людиною на власний розсуд
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
    // Спрощена версія без перевірки допустимості
    this.status = newStatus;
  }
}

module.exports = { CopyStatus, BookCopy };
