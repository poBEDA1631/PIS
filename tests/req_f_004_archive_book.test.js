const request = require('supertest');
const app = require('../src/app');
const { LIBRARIAN_TOKEN, READER_TOKEN } = require('./helpers/auth');

describe('REQ-F-004: Архівування картки книги (isArchived)', () => {
  const bookWithAllLostCopies = 'b1a2c3d4-0000-0000-0000-000000000003'; // "Стародавня історія"
  const bookWithActiveCopies = 'b1a2c3d4-0000-0000-0000-000000000001';   // "Кобзар" (has AVAILABLE)
  const nonExistentBookId = '00000000-0000-0000-0000-000000000000';

  describe('BDD Сценарій 3: Архівування та приховування з публічного пошуку', () => {
    test('Cause: бібліотекар архівує книгу, у якої всі примірники LOST -> Effect: HTTP 200, isArchived=true', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${bookWithAllLostCopies}/archive`)
        .set('Authorization', LIBRARIAN_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', bookWithAllLostCopies);
      expect(response.body).toHaveProperty('isArchived', true);
      expect(response.body).toHaveProperty('archivedAt');
    });

    test('Cause: читач шукає заархівовану книгу в публічному каталозі -> Effect: книга НЕ відображається у результатах (data=[])', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ query: 'Стародавня історія' });

      expect(response.status).toBe(200);
      const found = response.body.data.some((b) => b.id === bookWithAllLostCopies);
      expect(found).toBe(false);
    });

    test('Cause: бібліотекар переглядає архівні книги (isArchived=true) -> Effect: HTTP 200, заархівована книга видима у списку', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ isArchived: 'true' })
        .set('Authorization', LIBRARIAN_TOKEN);

      expect(response.status).toBe(200);
      const found = response.body.data.some((b) => b.id === bookWithAllLostCopies);
      expect(found).toBe(true);
    });
  });

  describe('Інваріант та бізнес-правило: заборона архівування за наявності активних примірників', () => {
    test('Cause: спроба заархівувати книгу, де не всі примірники LOST -> Effect: відхиляється з HTTP 422 ProblemDetails', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${bookWithActiveCopies}/archive`)
        .set('Authorization', LIBRARIAN_TOKEN);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('type', 'https://api.library.local/errors/archive-precondition-failed');
      expect(response.body).toHaveProperty('title', 'Cannot Archive Book');
      expect(response.body.status).toBe(422);
      expect(response.body.detail).toMatch(/LOST/i);
    });
  });

  describe('Управління архівом: відновлення книги бібліотекарем', () => {
    test('Cause: бібліотекар викликає unarchive для книги -> Effect: HTTP 200, isArchived=false', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${bookWithAllLostCopies}/unarchive`)
        .set('Authorization', LIBRARIAN_TOKEN);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', bookWithAllLostCopies);
      expect(response.body).toHaveProperty('isArchived', false);
      expect(response.body).toHaveProperty('unarchivedAt');
    });
  });

  describe('Негативні сценарії: безпека (REQ-NF-003) та 404', () => {
    test('Cause: спроба архівування без авторизації -> Effect: HTTP 401 Unauthorized', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${bookWithAllLostCopies}/archive`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe(401);
    });

    test('Cause: спроба архівування читачем -> Effect: HTTP 403 Forbidden', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${bookWithAllLostCopies}/archive`)
        .set('Authorization', READER_TOKEN);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe(403);
    });

    test('Cause: звичайний користувач намагається запросити isArchived=true -> Effect: HTTP 403 Forbidden', async () => {
      const response = await request(app)
        .get('/api/v1/books')
        .query({ isArchived: 'true' });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe(403);
    });

    test('Cause: спроба заархівувати неіснуючу книгу -> Effect: HTTP 404 Not Found', async () => {
      const response = await request(app)
        .post(`/api/v1/books/${nonExistentBookId}/archive`)
        .set('Authorization', LIBRARIAN_TOKEN);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(404);
    });
  });
});
