const request = require('supertest');
const app = require('../src/app');
const { LIBRARIAN_TOKEN, READER_TOKEN } = require('./helpers/auth');

describe('REQ-F-003: Управління статусом примірника (включаючи IN_REPAIR)', () => {
  const inventoryAvailable = 'INV-1002';
  const inventoryBorrowed = 'INV-1003';
  const inventoryInRepair = 'INV-1004';
  const nonExistentInventory = 'INV-999999';

  describe('BDD Сценарій 2: Переведення примірника в IN_REPAIR та блокування бронювання', () => {
    test('Cause: бібліотекар переводить примірник AVAILABLE у статус IN_REPAIR -> Effect: HTTP 200, статус стає IN_REPAIR', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryAvailable}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'IN_REPAIR',
          comment: 'Виявлено пошкодження палітурки, передано на реставрацію',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inventoryNumber', inventoryAvailable);
      expect(response.body).toHaveProperty('status', 'IN_REPAIR');
      expect(response.body).toHaveProperty('previousStatus', 'AVAILABLE');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('Cause: спроба встановити статус RESERVED для примірника у статусі IN_REPAIR -> Effect: відхиляється з HTTP 422 ProblemDetails', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'RESERVED',
          comment: 'Спроба забронювати примірник',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('type', 'https://api.library.local/errors/invalid-status-transition');
      expect(response.body).toHaveProperty('title', 'Invalid Status Transition');
      expect(response.body.status).toBe(422);
      expect(response.body.detail).toMatch(/ремонт|IN_REPAIR/i);
    });
  });

  describe('Позитивні сценарії: дозволені переходи життєвого циклу', () => {
    test('Cause: перехід BORROWED -> IN_REPAIR бібліотекарем -> Effect: HTTP 200, успішна зміна статусу', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryBorrowed}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'IN_REPAIR',
          comment: 'Повернуто читачем з відірваною сторінкою',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_REPAIR');
    });

    test('Cause: перехід IN_REPAIR -> AVAILABLE після реставрації -> Effect: HTTP 200, повернення книги у фонд', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'AVAILABLE',
          comment: 'Книгу відреставровано та повернуто на полицю',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('AVAILABLE');
    });
  });

  describe('Негативні сценарії: валідація, безпека (REQ-NF-003) та 404', () => {
    test('Cause: спроба зміни статусу без заголовка авторизації -> Effect: HTTP 401 Unauthorized', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryAvailable}/status`)
        .send({ status: 'IN_REPAIR' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe(401);
    });

    test('Cause: спроба зміни статусу читачем (без прав бібліотекаря) -> Effect: HTTP 403 Forbidden', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryAvailable}/status`)
        .set('Authorization', READER_TOKEN)
        .send({ status: 'IN_REPAIR' });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe(403);
    });

    test('Cause: передано недозволений статус примірника -> Effect: HTTP 400 Bad Request', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryAvailable}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({ status: 'DESTROYED' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(400);
    });

    test('Cause: спроба змінити статус неіснуючого інвентарного номера -> Effect: HTTP 404 Not Found', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${nonExistentInventory}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({ status: 'IN_REPAIR' });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe(404);
    });
  });
});
