const { CopyStatus } = require('../domain/constants');
const { InvalidStatusTransitionError } = require('../domain/errors');
const { validateCopyStatus } = require('../utils/validators');

/**
 * Domain service enforcing CopyStatus lifecycle transitions (REQ-F-003, REQ-NF-002)
 */
class CopyStatusService {
  /**
   * Validates target status format and checks allowed domain transitions
   * @param {string} currentStatus
   * @param {string} targetStatus
   */
  static validateTransition(currentStatus, targetStatus) {
    validateCopyStatus(targetStatus);

    // Business Invariant: IN_REPAIR -> RESERVED is strictly forbidden
    if (currentStatus === CopyStatus.IN_REPAIR && targetStatus === CopyStatus.RESERVED) {
      throw new InvalidStatusTransitionError(
        'Бронювання примірника в ремонті (IN_REPAIR -> RESERVED) заборонено.'
      );
    }

    return true;
  }
}

module.exports = CopyStatusService;
