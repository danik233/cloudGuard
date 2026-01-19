const AlertRepository = require('../back/repositories/AlertRepository');
const Alert = require('../back/models/Alert');

describe('AlertRepository', () => {
  test('save() should store a new alert', async () => {
    const repo = new AlertRepository();
    const alert = new Alert({
      severity: 'High',
      category: 'S3',
      status: 'New',
      description: 'Test alert',
      metadata: {}
    });

    const saved = await repo.save(alert);
    expect(saved.id).toBe(alert.id);

    const found = await repo.findByID(alert.id);
    expect(found).not.toBeNull();
    expect(found.description).toBe('Test alert');
  });

  test('updateStatus() should update status and updatedAt', async () => {
    const repo = new AlertRepository();
    const alert = new Alert({
      severity: 'Low',
      category: 'IAM',
      status: 'New',
      description: 'Another alert'
    });

    await repo.save(alert);

    const updated = await repo.updateStatus(alert.id, 'Acknowledged');
    expect(updated.status).toBe('Acknowledged');
    expect(updated.updatedAt).toBeTruthy();
  });
});
