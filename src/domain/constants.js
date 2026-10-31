/**
 * Domain constants according to spec/openapi.yaml and spec/glossary.md
 */

const CopyStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  BORROWED: 'BORROWED',
  RESERVED: 'RESERVED',
  IN_REPAIR: 'IN_REPAIR',
  LOST: 'LOST',
});

const TitleAvailability = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
});

const ProblemTypes = Object.freeze({
  BAD_REQUEST: 'https://api.library.local/errors/bad-request',
  INVALID_ISBN: 'https://api.library.local/errors/invalid-isbn',
  INVALID_COPY_STATUS: 'https://api.library.local/errors/invalid-copy-status',
  UNAUTHORIZED: 'https://api.library.local/errors/unauthorized',
  FORBIDDEN: 'https://api.library.local/errors/forbidden',
  NOT_FOUND: 'https://api.library.local/errors/not-found',
  INVALID_STATUS_TRANSITION: 'https://api.library.local/errors/invalid-status-transition',
  ARCHIVE_PRECONDITION_FAILED: 'https://api.library.local/errors/archive-precondition-failed',
  INTERNAL_SERVER_ERROR: 'https://api.library.local/errors/internal-server-error',
});

const ISBN_REGEX = /^(97[89])?\d{9}[\dX]$/i;

module.exports = {
  CopyStatus,
  TitleAvailability,
  ProblemTypes,
  ISBN_REGEX,
};
