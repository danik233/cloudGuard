const { v4: uuidv4 } = require('uuid');

class Alert {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.severity = data.severity;
    this.category = data.category;
    this.status = data.status || 'New';
    this.description = data.description;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  static get SEVERITIES() {
    return ['High', 'Medium', 'Low'];
  }

  static get CATEGORIES() {
    return ['IAM', 'S3', 'Network', 'Activity', 'CVE'];
  }

  static get STATUSES() {
    return ['New', 'Acknowledged', 'In-Progress',  'Resolved'];
  }

  static get STATE_TRANSITIONS() {
    return {
      'New': ['Acknowledged', 'Resolved'],
      'Acknowledged': ['In-Progress', 'Resolved'],
      'In-Progress': ['Resolved'],
      'Resolved': []
    };
  }

  toJSON() {
    return {
      id: this.id,
      severity: this.severity,
      category: this.category,
      status: this.status,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Alert;