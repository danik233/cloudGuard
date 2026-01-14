const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Alert routes
router.post('/alerts', alertController.createAlert);
router.get('/alerts', alertController.getAlerts);
router.get('/alerts/:id', alertController.getAlertById);
router.put('/alerts/:id/status', alertController.updateAlertStatus);

// Audit log routes
router.get('/audit-logs', alertController.getAuditLogs);

module.exports = router;