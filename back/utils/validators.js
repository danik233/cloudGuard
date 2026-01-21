const Alert = require('../models/Alert');

class Validators {
  static validateFinding(finding) {
    const errors = [];

    // Check if finding exists first
    if (!finding) {
      errors.push('Finding type is required');
      return {
        isValid: false,
        errors
      };
    }

    if (!finding.type) {
      errors.push('Finding type is required');
    }

    if (finding.severity && !Alert.SEVERITIES.includes(finding.severity)) {
      errors.push(`Invalid severity. Must be one of: ${Alert.SEVERITIES.join(', ')}`);
    }

    if (finding.category && !Alert.CATEGORIES.includes(finding.category)) {
      errors.push(`Invalid category. Must be one of: ${Alert.CATEGORIES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateStatus(status) {
    return Alert.STATUSES.includes(status);
  }
}

module.exports = Validators;