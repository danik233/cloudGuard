const Alert = require('../models/Alert');

class AlertManager {
  constructor(alertRepository, auditLogManager) {
    this.alertRepository = alertRepository;
    this.auditLogManager = auditLogManager;
  }

  async createAlert(finding) {
    if (!finding || !finding.type) {
      throw new Error('Invalid finding: missing required fields');
    }

    const alertData = {
      severity: this._determineSeverity(finding),
      category: this._determineCategory(finding),
      status: 'New',
      description: finding.description || 'Security finding detected',
      metadata: finding.metadata || {}
    };

    const alert = new Alert(alertData);
    const savedAlert = await this.alertRepository.save(alert);

    this.auditLogManager.log({
      action: 'CREATE_ALERT',
      alertId: alert.id,
      severity: alert.severity,
      category: alert.category
    });

    return savedAlert;
  }

  async updateAlertStatus(alertId, newStatus) {
    if (!Alert.STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const currentAlert = await this.alertRepository.findByID(alertId);
    if (!currentAlert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    if (!this._isValidTransition(currentAlert.status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentAlert.status} to ${newStatus}`
      );
    }

    const updatedAlert = await this.alertRepository.updateStatus(alertId, newStatus);

    this.auditLogManager.log({
      action: 'UPDATE_ALERT_STATUS',
      alertId: alertId,
      oldStatus: currentAlert.status,
      newStatus: newStatus
    });

    return updatedAlert;
  }

  async getAlerts(filter = {}) {
    const alerts = await this.alertRepository.findAll(filter);

    this.auditLogManager.log({
      action: 'GET_ALERTS',
      filter: filter,
      count: alerts.length
    });

    return alerts;
  }

  _determineSeverity(finding) {
    if (finding.severity && Alert.SEVERITIES.includes(finding.severity)) {
      return finding.severity;
    }

    const severityMap = {
      'anomaly': 'High',
      'rule-violation': 'Medium',
      'cve': 'High'
    };

    return severityMap[finding.type] || 'Medium';
  }

  _determineCategory(finding) {
    if (finding.category && Alert.CATEGORIES.includes(finding.category)) {
      return finding.category;
    }

    const categoryMap = {
      'anomaly': 'Activity',
      'rule-violation': 'IAM',
      'cve': 'CVE'
    };

    return categoryMap[finding.type] || 'Activity';
  }

  _isValidTransition(currentStatus, newStatus) {
    const validTransitions = Alert.STATE_TRANSITIONS[currentStatus] || [];
    return validTransitions.includes(newStatus);
  }
}

module.exports = AlertManager;
