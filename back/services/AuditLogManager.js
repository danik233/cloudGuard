class AuditLogManager {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(logEntry) {
    const entry = {
      id: Date.now() + Math.random(),
      ...logEntry,
      timestamp: logEntry.timestamp || new Date().toISOString()
    };

    this.logs.push(entry);
  
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(`[AUDIT] ${entry.action}:`, entry);
    return entry;
  }

  getLogs(filter = {}) {
    let results = [...this.logs];

    if (filter.action) {
      results = results.filter(log => log.action === filter.action);
    }
    if (filter.alertId) {
      results = results.filter(log => log.alertId === filter.alertId);
    }
    if (filter.startDate) {
      results = results.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }
    if (filter.endDate) {
      results = results.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return results;
  }

  clear() {
    this.logs = [];
  }
}

module.exports = AuditLogManager;
