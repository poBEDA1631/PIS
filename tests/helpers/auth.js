/**
 * Test authentication helper constants and utilities
 * Conforming to OpenAPI BearerAuth security scheme
 */
const LIBRARIAN_TOKEN = 'Bearer mock-librarian-jwt-token';
const READER_TOKEN = 'Bearer mock-reader-jwt-token';
const INVALID_TOKEN = 'Bearer invalid-expired-token';

module.exports = {
  LIBRARIAN_TOKEN,
  READER_TOKEN,
  INVALID_TOKEN,
};
