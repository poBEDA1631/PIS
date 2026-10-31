const { CopyStatus, TitleAvailability } = require('../domain/constants');

/**
 * Pure domain service for calculating TitleAvailability and CopiesSummary (REQ-F-002, REQ-F-ADD-001)
 */
class AvailabilityService {
  /**
   * Computes aggregated availability status and summary from copy array
   * @param {Array} copies
   * @returns {{ availabilityStatus: string, copiesSummary: object }}
   */
  static calculate(copies = []) {
    const total = copies.length;
    const available = copies.filter((c) => c.status === CopyStatus.AVAILABLE).length;
    const borrowed = copies.filter((c) => c.status === CopyStatus.BORROWED).length;
    const reserved = copies.filter((c) => c.status === CopyStatus.RESERVED).length;
    const inRepair = copies.filter((c) => c.status === CopyStatus.IN_REPAIR).length;
    const lost = copies.filter((c) => c.status === CopyStatus.LOST).length;
    const decommissioned = copies.filter((c) => c.status === CopyStatus.DECOMMISSIONED).length;

    const copiesSummary = {
      total,
      available,
      borrowed,
      reserved,
      inRepair,
      lost,
      decommissioned,
    };

    let availabilityStatus;
    if (available > 0) {
      availabilityStatus = TitleAvailability.AVAILABLE;
    } else if (total > 0 && (lost + decommissioned) === total) {
      availabilityStatus = TitleAvailability.OUT_OF_STOCK;
    } else if (total === 0) {
      availabilityStatus = TitleAvailability.OUT_OF_STOCK;
    } else {
      availabilityStatus = TitleAvailability.UNAVAILABLE;
    }

    return { availabilityStatus, copiesSummary };
  }
}

module.exports = AvailabilityService;
