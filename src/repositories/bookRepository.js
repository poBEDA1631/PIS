const store = require('./store');

class BookRepository {
  static findAll(filterFn = () => true) {
    return store.books.filter(filterFn);
  }

  static findById(id) {
    return store.books.find((b) => b.id === id) || null;
  }

  static update(id, updates) {
    const book = this.findById(id);
    if (!book) return null;
    Object.assign(book, updates);
    return book;
  }

  static reset() {
    store.resetStore();
  }
}

module.exports = BookRepository;
