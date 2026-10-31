const { CopyStatus } = require('../domain/constants');
const { InvalidStatusTransitionError } = require('../domain/errors');
const { validateCopyStatus } = require('../utils/validators');

/**
 * Domain service enforcing CopyStatus lifecycle transitions (REQ-F-003, REQ-F-ADD-001, REQ-NF-002)
 */
class CopyStatusService {
  /**
   * Validates target status format and checks allowed domain transitions
   * @param {string} currentStatus
   * @param {string} targetStatus
   */
  static validateTransition(currentStatus, targetStatus) {
    validateCopyStatus(targetStatus);

    // Business Invariant: DECOMMISSIONED is terminal state
    if (currentStatus === CopyStatus.DECOMMISSIONED) {
      throw new InvalidStatusTransitionError(
        'Зміна статусу списаного примірника (DECOMMISSIONED є термінальним станом) заборонена.'
      );
    }

    // Business Invariant: transition IN_REPAIR -> RESERVED is strictly forbidden
    if (currentStatus === CopyStatus.IN_REPAIR && targetStatus === CopyStatus.RESERVED) {
      throw new InvalidStatusTransitionError(
        'Бронювання примірника в ремонті (IN_REPAIR -> RESERVED) заборонено.'
      );
    }

    // Business Invariant (REQ-F-ADD-001): transition into DECOMMISSIONED is only allowed from LOST or IN_REPAIR
    if (targetStatus === CopyStatus.DECOMMISSIONED) {
      const allowedSourceStatuses = [CopyStatus.LOST, CopyStatus.IN_REPAIR];
      if (!allowedSourceStatuses.includes(currentStatus)) {
        throw new InvalidStatusTransitionError(
          `Списання примірника (перехід у DECOMMISSIONED) заборонено зі статусу ${currentStatus}. Дозволено лише зі статусів LOST або IN_REPAIR.`
        );
      }
    }

    return true;
  }
}

module.exports = CopyStatusService;
