const AlertManager = require('../back/services/AlertManager');
const AlertRepository = require('../back/repositories/AlertRepository');
const AuditLogManager = require('../back/services/AuditLogManager');

describe('AlertManager', () => {
  test('createAlert() should create alert with status New', async () => {
    const repo = new AlertRepository();
    const audit = new AuditLogManager();
    const manager = new AlertManager(repo, audit);

    const saved = await manager.createAlert({
      type: 'anomaly',
      severity: 'High',
      category: 'S3',
      description: 'Test finding'
    });

    expect(saved.status).toBe('New');
    expect(saved.severity).toBe('High');
    expect(saved.category).toBe('S3');
  });

  test('updateAlertStatus() should reject invalid transition', async () => {
    const repo = new AlertRepository();
    const audit = new AuditLogManager();
    const manager = new AlertManager(repo, audit);

    const created = await manager.createAlert({
      type: 'anomaly',
      severity: 'High',
      category: 'S3',
      description: 'Test finding'
    });

    // invalid: New -> In-Progress (must go through Acknowledged)
    await expect(manager.updateAlertStatus(created.id, 'In-Progress'))
      .rejects
      .toThrow('Invalid status transition');
  });
});
