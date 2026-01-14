class AlertRepository {
  constructor() {
    // In-memory storage (replace with MongoDB in production)
    this.alerts = [];
  }

  async save(alert) {
    if (!alert || !alert.id) {
      throw new Error('Invalid alert: missing id');
    }

    const existingIndex = this.alerts.findIndex(a => a.id === alert.id);
    if (existingIndex !== -1) {
      throw new Error(`Alert with id ${alert.id} already exists`);
    }

    this.alerts.push(alert);
    return alert;
  }

  async findByID(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    return alert || null;
  }

  async findAll(filter = {}) {
    let results = [...this.alerts];

    if (filter.severity) {
      results = results.filter(a => a.severity === filter.severity);
    }
    if (filter.status) {
      results = results.filter(a => a.status === filter.status);
    }
    if (filter.category) {
      results = results.filter(a => a.category === filter.category);
    }

    // Sort by creation date (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return results;
  }

  async updateStatus(alertId, status) {
    const alertIndex = this.alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    this.alerts[alertIndex].status = status;
    this.alerts[alertIndex].updatedAt = new Date().toISOString();

    return this.alerts[alertIndex];
  }

  async delete(alertId) {
    const initialLength = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    return this.alerts.length < initialLength;
  }

  async count() {
    return this.alerts.length;
  }
}

module.exports = AlertRepository;