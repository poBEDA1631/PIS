const request = require('supertest');
const app = require('../src/app');

describe('REQ-F-002: Перегляд картки книги та агрегованого стану доступності (TitleAvailability)', () => {
  const sampleBookIdAvailable = 'b1a2c3d4-0000-0000-0000-000000000001';
  const sampleBookIdUnavailable = 'b1a2c3d4-0000-0000-0000-000000000002';
  const sampleBookIdOutOfStock = 'b1a2c3d4-0000-0000-0000-000000000003';
  const nonExistentBookId = '00000000-0000-0000-0000-000000000000';

  describe('Позитивні сценарії: обчислення агрегованого стану TitleAvailability', () => {
    test('Cause: хоча б один примірник має статус AVAILABLE -> Effect: availabilityStatus="AVAILABLE"', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${sampleBookIdAvailable}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', sampleBookIdAvailable);
      expect(response.body).toHaveProperty('availabilityStatus', 'AVAILABLE');
      expect(response.body).toHaveProperty('copiesSummary');
      expect(response.body.copiesSummary.available).toBeGreaterThan(0);
    });

    test('Cause: усі примірники в BORROWED, RESERVED або IN_REPAIR -> Effect: availabilityStatus="UNAVAILABLE"', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${sampleBookIdUnavailable}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', sampleBookIdUnavailable);
      expect(response.body).toHaveProperty('availabilityStatus', 'UNAVAILABLE');
      expect(response.body.copiesSummary.available).toBe(0);
      expect(
        response.body.copiesSummary.borrowed +
        response.body.copiesSummary.reserved +
        response.body.copiesSummary.inRepair
      ).toBeGreaterThan(0);
    });

    test('Cause: усі примірники мають статус LOST -> Effect: availabilityStatus="OUT_OF_STOCK"', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${sampleBookIdOutOfStock}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', sampleBookIdOutOfStock);
      expect(response.body).toHaveProperty('availabilityStatus', 'OUT_OF_STOCK');
      expect(response.body.copiesSummary.available).toBe(0);
      expect(response.body.copiesSummary.lost).toBe(response.body.copiesSummary.total);
    });

    test('Cause: запит списку примірників книги -> Effect: повертається масив фізичних примірників з інвентарними номерами', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${sampleBookIdAvailable}/copies`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookId', sampleBookIdAvailable);
      expect(response.body).toHaveProperty('copies');
      expect(Array.isArray(response.body.copies)).toBe(true);
      if (response.body.copies.length > 0) {
        const copy = response.body.copies[0];
        expect(copy).toHaveProperty('inventoryNumber');
        expect(copy).toHaveProperty('status');
      }
    });
  });

  describe('Негативні сценарії: обробка неіснуючих ідентифікаторів книги', () => {
    test('Cause: запит картки неіснуючої книги -> Effect: повертається HTTP 404 ProblemDetails', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${nonExistentBookId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('title');
      expect(response.body.status).toBe(404);
      expect(response.body).toHaveProperty('detail');
    });

    test('Cause: запит примірників для неіснуючої книги -> Effect: повертається HTTP 404 ProblemDetails', async () => {
      const response = await request(app)
        .get(`/api/v1/books/${nonExistentBookId}/copies`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(404);
    });
  });
});
