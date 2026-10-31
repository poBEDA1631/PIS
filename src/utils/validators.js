const { CopyStatus, ISBN_REGEX, ProblemTypes } = require('../domain/constants');
const { ValidationError } = require('../domain/errors');

/**
 * Validates ISBN format (10 or 13 digits)
 */
function validateIsbn(isbn) {
  if (!isbn) return true;
  if (!ISBN_REGEX.test(isbn.trim())) {
    throw new ValidationError(
      'Некоректний формат ISBN (очікується 10 або 13 символів).',
      ProblemTypes.INVALID_ISBN
    );
  }
  return true;
}

/**
 * Validates whether string is an accepted CopyStatus enum value
 */
function validateCopyStatus(status) {
  if (!status) {
    throw new ValidationError('Обов\'язкове поле "status" відсутнє у тілі запиту.');
  }

  const validStatuses = Object.values(CopyStatus);
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      `Неприпустимий статус примірника: ${status}.`,
      ProblemTypes.INVALID_COPY_STATUS
    );
  }
  return true;
}

module.exports = {
  validateIsbn,
  validateCopyStatus,
};
