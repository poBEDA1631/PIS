const { ProblemTypes } = require('./constants');

class AppError extends Error {
  constructor(message, statusCode, errorType, title) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.title = title;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, ProblemTypes.NOT_FOUND, 'Not Found');
  }
}

class ValidationError extends AppError {
  constructor(message, errorType = ProblemTypes.BAD_REQUEST) {
    super(message, 400, errorType, 'Bad Request');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Потрібна автентифікація бібліотекаря.') {
    super(message, 401, ProblemTypes.UNAUTHORIZED, 'Unauthorized');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Недостатньо прав для виконання операції.') {
    super(message, 403, ProblemTypes.FORBIDDEN, 'Forbidden');
  }
}

class InvalidStatusTransitionError extends AppError {
  constructor(message = 'Бронювання примірника в ремонті (IN_REPAIR -> RESERVED) заборонено.') {
    super(message, 422, ProblemTypes.INVALID_STATUS_TRANSITION, 'Invalid Status Transition');
  }
}

class ArchivePreconditionError extends AppError {
  constructor(
    message = 'Неможливо заархівувати книгу: не всі примірники мають статус LOST (знайдено примірники в обігу/ремонті).'
  ) {
    super(message, 422, ProblemTypes.ARCHIVE_PRECONDITION_FAILED, 'Cannot Archive Book');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  InvalidStatusTransitionError,
  ArchivePreconditionError,
};
