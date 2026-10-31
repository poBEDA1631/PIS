const request = require('supertest');
const app = require('../src/app');
const BookRepository = require('../src/repositories/bookRepository');
const { LIBRARIAN_TOKEN, READER_TOKEN } = require('./helpers/auth');

describe('REQ-F-ADD-001: Списання фізичного примірника книги (DECOMMISSIONED / Soft Delete)', () => {
  const inventoryInRepair = 'INV-1004';
  const inventoryLost = 'INV-1006';
  const inventoryAvailable = 'INV-1001';
  const inventoryBorrowed = 'INV-1003';

  afterAll(() => {
    BookRepository.reset();
  });

  describe('BDD Сценарій 4.1: Успішне списання примірника з ремонту та втрати', () => {
    test('Cause: бібліотекар списує примірник зі статусу IN_REPAIR -> Effect: HTTP 200, статус стає DECOMMISSIONED', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'DECOMMISSIONED',
          comment: 'Залито водою, відновленню не підлягає',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inventoryNumber', inventoryInRepair);
      expect(response.body).toHaveProperty('status', 'DECOMMISSIONED');
      expect(response.body).toHaveProperty('previousStatus', 'IN_REPAIR');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('Cause: бібліотекар списує примірник зі статусу LOST -> Effect: HTTP 200, статус стає DECOMMISSIONED', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryLost}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'DECOMMISSIONED',
          comment: 'Остаточно списано за актом втрати фонду',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inventoryNumber', inventoryLost);
      expect(response.body).toHaveProperty('status', 'DECOMMISSIONED');
      expect(response.body).toHaveProperty('previousStatus', 'LOST');
    });
  });

  describe('BDD Сценарій 4.2: Інваріанти переходу — блокування списання з недозволених статусів', () => {
    test('Cause: спроба списати примірник зі статусу AVAILABLE -> Effect: відхиляється з HTTP 422 ProblemDetails', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryAvailable}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'DECOMMISSIONED',
          comment: 'Спроба прямого списання з полиці',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('type', 'https://api.library.local/errors/invalid-status-transition');
      expect(response.body).toHaveProperty('title', 'Invalid Status Transition');
      expect(response.body.status).toBe(422);
      expect(response.body.detail).toMatch(/DECOMMISSIONED|списан/i);
    });

    test('Cause: спроба списати примірник зі статусу BORROWED -> Effect: відхиляється з HTTP 422 ProblemDetails', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryBorrowed}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'DECOMMISSIONED',
          comment: 'Спроба списати примірник на руках у читача',
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe(422);
    });

    test('Cause: спроба змінити статус примірника з DECOMMISSIONED на AVAILABLE (термінальний стан) -> Effect: HTTP 422', async () => {
      // Ensure copy is in DECOMMISSIONED
      await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({ status: 'DECOMMISSIONED' });

      // Attempt forbidden reverse transition from terminal status
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .set('Authorization', LIBRARIAN_TOKEN)
        .send({
          status: 'AVAILABLE',
          comment: 'Спроба повернути списаний примірник на полицю',
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe(422);
    });
  });

  describe('Негативні сценарії: безпека та розмежування прав (REQ-NF-003)', () => {
    test('Cause: спроба списання без авторизації -> Effect: HTTP 401 Unauthorized', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .send({ status: 'DECOMMISSIONED' });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe(401);
    });

    test('Cause: спроба списання читачем -> Effect: HTTP 403 Forbidden', async () => {
      const response = await request(app)
        .patch(`/api/v1/copies/${inventoryInRepair}/status`)
        .set('Authorization', READER_TOKEN)
        .send({ status: 'DECOMMISSIONED' });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe(403);
    });
  });
});
