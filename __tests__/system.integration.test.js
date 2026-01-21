const AlertManager = require('../back/services/AlertManager');
const AlertRepository = require('../back/repositories/AlertRepository');
const AuditLogManager = require('../back/services/AuditLogManager');

// System Testing - Testing component interactions (slide 29, 30, 31)
describe('System Integration Testing', () => {
  let repo;
  let audit;
  let manager;

  beforeEach(() => {
    repo = new AlertRepository();
    audit = new AuditLogManager();
    manager = new AlertManager(repo, audit);
  });

  // Use case testing (slide 31, 32)
  describe('Use Case: Complete Alert Lifecycle', () => {
    test('should handle complete alert workflow from creation to resolution', async () => {
      // Step 1: Create alert
      const created = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Suspicious S3 bucket access'
      });

      expect(created.status).toBe('New');
      expect(created.severity).toBe('High');

      // Step 2: Security team acknowledges alert
      const acknowledged = await manager.updateAlertStatus(created.id, 'Acknowledged');
      expect(acknowledged.status).toBe('Acknowledged');

      // Step 3: Investigation begins
      const inProgress = await manager.updateAlertStatus(created.id, 'In-Progress');
      expect(inProgress.status).toBe('In-Progress');

      // Step 4: Issue resolved
      const resolved = await manager.updateAlertStatus(created.id, 'Resolved');
      expect(resolved.status).toBe('Resolved');

      // Verify audit trail exists for all steps
      const createLogs = audit.getLogs({ action: 'CREATE_ALERT', alertId: created.id });
      expect(createLogs.length).toBe(1);

      const statusLogs = audit.getLogs({ action: 'UPDATE_ALERT_STATUS', alertId: created.id });
      expect(statusLogs.length).toBe(3); // Acknowledged, In-Progress, Resolved
    });

    test('should handle alert triage workflow with filtering', async () => {
      // Multiple alerts created
      await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Critical S3 issue'
      });

      await manager.createAlert({
        type: 'rule-violation',
        severity: 'Medium',
        category: 'IAM',
        description: 'IAM policy violation'
      });

      await manager.createAlert({
        type: 'anomaly',
        severity: 'Low',
        category: 'Network',
        description: 'Minor network anomaly'
      });

      // Security analyst retrieves high severity alerts
      const highAlerts = await manager.getAlerts({ severity: 'High' });
      expect(highAlerts.length).toBe(1);
      expect(highAlerts[0].severity).toBe('High');

      // Verify audit log for query
      const queryLogs = audit.getLogs({ action: 'GET_ALERTS' });
      expect(queryLogs.length).toBeGreaterThan(0);
    });
  });

  // Component interaction testing (slide 29)
  describe('Component Interactions', () => {
    test('AlertManager should correctly interact with Repository', async () => {
      const alert = await manager.createAlert({
        type: 'cve',
        severity: 'High',
        category: 'CVE',
        description: 'Critical vulnerability detected'
      });

      // Verify data was stored in repository
      const stored = await repo.findByID(alert.id);
      expect(stored).not.toBeNull();
      expect(stored.id).toBe(alert.id);
      expect(stored.description).toBe('Critical vulnerability detected');
    });

    test('AlertManager should correctly interact with AuditLogManager', async () => {
      const alert = await manager.createAlert({
        type: 'anomaly',
        severity: 'Medium',
        category: 'Activity',
        description: 'Unusual activity detected'
      });

      // Verify audit log was created
      const logs = audit.getLogs({ alertId: alert.id });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('CREATE_ALERT');
    });

    test('should transfer correct data between components', async () => {
      const inputData = {
        type: 'rule-violation',
        severity: 'High',
        category: 'IAM',
        description: 'Unauthorized access attempt'
      };

      const alert = await manager.createAlert(inputData);

      // Verify data integrity through the chain
      expect(alert.severity).toBe(inputData.severity);
      expect(alert.category).toBe(inputData.category);
      expect(alert.description).toBe(inputData.description);

      const fromRepo = await repo.findByID(alert.id);
      expect(fromRepo.severity).toBe(inputData.severity);
      expect(fromRepo.category).toBe(inputData.category);

      const auditLogs = audit.getLogs({ alertId: alert.id });
      expect(auditLogs[0].severity).toBe(inputData.severity);
      expect(auditLogs[0].category).toBe(inputData.category);
    });
  });

  // Testing system with multiple alerts (slide 33)
  describe('System Testing Policies', () => {
    test('should handle multiple concurrent operations', async () => {
      // Create multiple alerts
      const alert1 = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Alert 1'
      });

      const alert2 = await manager.createAlert({
        type: 'cve',
        severity: 'Medium',
        category: 'CVE',
        description: 'Alert 2'
      });

      const alert3 = await manager.createAlert({
        type: 'rule-violation',
        severity: 'Low',
        category: 'IAM',
        description: 'Alert 3'
      });

      // Update different alerts
      await manager.updateAlertStatus(alert1.id, 'Acknowledged');
      await manager.updateAlertStatus(alert2.id, 'Acknowledged');
      await manager.updateAlertStatus(alert3.id, 'Resolved');

      // Verify all operations completed successfully
      const all = await manager.getAlerts();
      expect(all.length).toBe(3);

      const ack1 = await repo.findByID(alert1.id);
      expect(ack1.status).toBe('Acknowledged');

      const ack2 = await repo.findByID(alert2.id);
      expect(ack2.status).toBe('Acknowledged');

      const resolved = await repo.findByID(alert3.id);
      expect(resolved.status).toBe('Resolved');
    });

    test('should test combinations of operations', async () => {
      // Create
      const alert = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Test alert'
      });

      // Update status
      await manager.updateAlertStatus(alert.id, 'Acknowledged');

      // Query
      const filtered = await manager.getAlerts({ status: 'Acknowledged' });
      expect(filtered.length).toBe(1);

      // Update again
      await manager.updateAlertStatus(alert.id, 'In-Progress');

      // Query with different filter
      const inProgress = await manager.getAlerts({ status: 'In-Progress' });
      expect(inProgress.length).toBe(1);
      expect(inProgress[0].id).toBe(alert.id);
    });

    test('should handle operations with correct and incorrect input', async () => {
      // Correct input
      const validAlert = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Valid alert'
      });

      expect(validAlert).toBeDefined();
      expect(validAlert.id).toBeDefined();

      // Incorrect input - should fail gracefully
      await expect(manager.createAlert(null))
        .rejects
        .toThrow();

      await expect(manager.createAlert({}))
        .rejects
        .toThrow();

      // System should still work after errors
      const anotherValid = await manager.createAlert({
        type: 'cve',
        severity: 'Medium',
        category: 'CVE',
        description: 'Another valid alert'
      });

      expect(anotherValid).toBeDefined();
    });
  });

  // Regression testing scenario (slide 34)
  describe('Regression Testing', () => {
    test('should not break existing functionality after new operations', async () => {
      // Initial state
      const alert1 = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Initial alert'
      });

      const initialCount = await repo.count();
      expect(initialCount).toBe(1);

      // New operation
      await manager.updateAlertStatus(alert1.id, 'Acknowledged');

      // Verify old functionality still works
      const found = await repo.findByID(alert1.id);
      expect(found).not.toBeNull();
      expect(found.description).toBe('Initial alert');

      const count = await repo.count();
      expect(count).toBe(1); // Count should not change

      // Add more alerts - old ones should remain
      await manager.createAlert({
        type: 'cve',
        severity: 'Medium',
        category: 'CVE',
        description: 'New alert'
      });

      const stillThere = await repo.findByID(alert1.id);
      expect(stillThere).not.toBeNull();
      expect(stillThere.description).toBe('Initial alert');
    });
  });

  // Emergent behavior testing (slide 29)
  describe('Emergent System Behavior', () => {
    test('should maintain data consistency across components', async () => {
      const alert = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Consistency test'
      });

      // Update through manager
      await manager.updateAlertStatus(alert.id, 'Acknowledged');

      // Check consistency in repository
      const fromRepo = await repo.findByID(alert.id);
      expect(fromRepo.status).toBe('Acknowledged');

      // Check audit trail consistency
      const logs = audit.getLogs({ alertId: alert.id });
      const updateLog = logs.find(log => log.action === 'UPDATE_ALERT_STATUS');
      expect(updateLog.newStatus).toBe('Acknowledged');
    });

    test('should handle cascading operations correctly', async () => {
      const alert = await manager.createAlert({
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Cascade test'
      });

      // Each operation should cascade properly
      await manager.updateAlertStatus(alert.id, 'Acknowledged');
      await manager.updateAlertStatus(alert.id, 'In-Progress');
      await manager.updateAlertStatus(alert.id, 'Resolved');

      // Verify final state
      const final = await repo.findByID(alert.id);
      expect(final.status).toBe('Resolved');

      // Verify complete audit trail
      const allLogs = audit.getLogs({ alertId: alert.id });
      expect(allLogs.length).toBe(4); // CREATE + 3 updates
    });
  });
});