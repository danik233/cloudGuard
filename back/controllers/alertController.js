const AlertManager = require('../services/AlertManager');
const AlertRepository = require('../repositories/AlertRepository');
const AuditLogManager = require('../services/AuditLogManager');

// Initialize services (singleton pattern)
const alertRepository = new AlertRepository();
const auditLogManager = new AuditLogManager();
const alertManager = new AlertManager(alertRepository, auditLogManager);

class AlertController {
  async createAlert(req, res, next) {
    try {
      const finding = req.body;
      const alert = await alertManager.createAlert(finding);
      res.status(201).json(alert);
    } catch (error) {
      next(error);
    }
  }

  async getAlerts(req, res, next) {
    try {
      const filter = {
        severity: req.query.severity,
        status: req.query.status,
        category: req.query.category
      };
      const alerts = await alertManager.getAlerts(filter);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  }

  async getAlertById(req, res, next) {
    try {
      const alert = await alertRepository.findByID(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  async updateAlertStatus(req, res, next) {
    try {
      const { status } = req.body;
      const alert = await alertManager.updateAlertStatus(req.params.id, status);
      res.json(alert);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const filter = {
        action: req.query.action,
        alertId: req.query.alertId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      const logs = auditLogManager.getLogs(filter);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();