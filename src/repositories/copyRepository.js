const store = require('./store');

class CopyRepository {
  static findByInventoryNumber(inventoryNumber) {
    return store.copies.find((c) => c.inventoryNumber === inventoryNumber) || null;
  }

  static findByBookId(bookId) {
    return store.copies.filter((c) => c.bookId === bookId);
  }

  static update(inventoryNumber, updates) {
    const copy = this.findByInventoryNumber(inventoryNumber);
    if (!copy) return null;
    Object.assign(copy, updates);
    return copy;
  }
}

module.exports = CopyRepository;
