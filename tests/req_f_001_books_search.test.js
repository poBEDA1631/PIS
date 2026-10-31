const request = require('supertest');
const app = require('../src/app');

describe('REQ-F-001: Пошук та фільтрація книг у каталозі', () => {
  describe('BDD Сценарій 1: Пошук книги за частковою назвою', () => {
    test('Cause: запит з query="Кобз" -> Effect: повертається книга "Кобзар" з availabilityStatus=AVAILABLE', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ query: 'Кобз' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const book = response.body.data.find((b) => b.title.includes('Кобзар'));
      expect(book).toBeDefined();
      expect(book.author).toBe('Тарас Шевченко');
      expect(book.availabilityStatus).toBe('AVAILABLE');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('Позитивні сценарії: пошук за автором, ISBN та фільтрація за жанром', () => {
    test('Cause: запит з query="шевченко" (case-insensitive) -> Effect: повертаються книги автора "Тарас Шевченко"', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ query: 'шевченко' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((book) => {
        const matchesAuthor = book.author.toLowerCase().includes('шевченко');
        const matchesTitle = book.title.toLowerCase().includes('шевченко');
        expect(matchesAuthor || matchesTitle).toBe(true);
      });
    });

    test('Cause: запит за точним 13-значним ISBN -> Effect: повертається єдиний точний бібліографічний запис', async () => {
      const targetIsbn = '9789660100001';
      const response = await request(app)
        .get('/api/v1/books')
        .query({ isbn: targetIsbn });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].isbn).toBe(targetIsbn);
    });

    test('Cause: фільтрація за жанром "Поезія" -> Effect: повертаються тільки книги жанру "Поезія"', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ genre: 'Поезія' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((book) => {
        expect(book.genre).toBe('Поезія');
      });
    });

    test('Cause: пошук за рядком, якого немає в каталозі -> Effect: повертається HTTP 200 з порожнім списком data=[]', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ query: 'НевідомаКнигаЯкоїНеІснує12345' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.totalItems).toBe(0);
    });
  });

  describe('Негативні сценарії: валідація вхідних параметрів (RFC 7807)', () => {
    test('Cause: передано некоректний ISBN -> Effect: повертається HTTP 400 ProblemDetails', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ isbn: 'невалідний-isbn-!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('title');
      expect(response.body.status).toBe(400);
      expect(response.body).toHaveProperty('detail');
      expect(response.body).toHaveProperty('instance');
    });
  });
});
