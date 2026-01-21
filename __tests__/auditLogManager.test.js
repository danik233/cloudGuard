const AuditLogManager = require('../back/services/AuditLogManager');

describe('AuditLogManager - Unit Testing', () => {
  let audit;

  beforeEach(() => {
    audit = new AuditLogManager();
  });

  // Normal operation tests (slide 17)
  describe('Normal Operation', () => {
    test('log() should create log entry with timestamp', () => {
      const entry = audit.log({
        action: 'CREATE_ALERT',
        alertId: 'test-123',
        severity: 'High'
      });

      expect(entry.id).toBeDefined();
      expect(entry.action).toBe('CREATE_ALERT');
      expect(entry.alertId).toBe('test-123');
      expect(entry.severity).toBe('High');
      expect(entry.timestamp).toBeDefined();
    });

    test('log() should use provided timestamp if given', () => {
      const customTimestamp = '2024-01-01T12:00:00.000Z';
      
      const entry = audit.log({
        action: 'UPDATE_ALERT',
        alertId: 'test-456',
        timestamp: customTimestamp
      });

      expect(entry.timestamp).toBe(customTimestamp);
    });

    test('getLogs() should return all logs', () => {
      audit.log({ action: 'CREATE_ALERT', alertId: '1' });
      audit.log({ action: 'UPDATE_ALERT', alertId: '2' });
      audit.log({ action: 'GET_ALERTS' });

      const logs = audit.getLogs();
      expect(logs.length).toBe(3);
    });

    test('getLogs() should return logs sorted by timestamp (newest first)', () => {
      audit.log({
        action: 'CREATE_ALERT',
        alertId: '1',
        timestamp: '2024-01-01T10:00:00.000Z'
      });

      audit.log({
        action: 'UPDATE_ALERT',
        alertId: '2',
        timestamp: '2024-01-01T12:00:00.000Z'
      });

      const logs = audit.getLogs();
      expect(logs[0].action).toBe('UPDATE_ALERT');
      expect(logs[1].action).toBe('CREATE_ALERT');
    });

    test('clear() should remove all logs', () => {
      audit.log({ action: 'CREATE_ALERT', alertId: '1' });
      audit.log({ action: 'UPDATE_ALERT', alertId: '2' });

      audit.clear();

      const logs = audit.getLogs();
      expect(logs.length).toBe(0);
    });
  });

  // Sequence testing (slide 22)
  describe('Sequence Testing', () => {
    test('should handle empty log collection', () => {
      const logs = audit.getLogs();
      expect(logs.length).toBe(0);
      expect(logs).toEqual([]);
    });

    test('should handle single log entry', () => {
      audit.log({ action: 'CREATE_ALERT', alertId: '1' });
      
      const logs = audit.getLogs();
      expect(logs.length).toBe(1);
    });

    test('should handle multiple log entries', () => {
      for (let i = 0; i < 5; i++) {
        audit.log({ action: 'CREATE_ALERT', alertId: `${i}` });
      }

      const logs = audit.getLogs();
      expect(logs.length).toBe(5);
    });

    test('should enforce maximum log limit', () => {
      const maxLogs = audit.maxLogs;
      
      // Add more than max logs
      for (let i = 0; i < maxLogs + 10; i++) {
        audit.log({ action: 'TEST_ACTION', index: i });
      }

      const logs = audit.getLogs();
      expect(logs.length).toBe(maxLogs);
    });

    test('should remove oldest logs when exceeding limit', () => {
      const maxLogs = audit.maxLogs;
      
      // Add first log
      audit.log({
        action: 'FIRST_LOG',
        timestamp: '2024-01-01T10:00:00.000Z'
      });

      // Fill to maximum
      for (let i = 1; i < maxLogs + 5; i++) {
        audit.log({ action: `LOG_${i}` });
      }

      const logs = audit.getLogs();
      
      // First log should be removed
      const hasFirstLog = logs.some(log => log.action === 'FIRST_LOG');
      expect(hasFirstLog).toBe(false);
      expect(logs.length).toBe(maxLogs);
    });
  });

  // Filter testing - Partition testing (slide 18, 19)
  describe('Filter Partitioning', () => {
    beforeEach(() => {
      audit.log({
        action: 'CREATE_ALERT',
        alertId: 'alert-1',
        timestamp: '2024-01-01T10:00:00.000Z'
      });

      audit.log({
        action: 'UPDATE_ALERT_STATUS',
        alertId: 'alert-1',
        timestamp: '2024-01-01T11:00:00.000Z'
      });

      audit.log({
        action: 'CREATE_ALERT',
        alertId: 'alert-2',
        timestamp: '2024-01-01T12:00:00.000Z'
      });

      audit.log({
        action: 'GET_ALERTS',
        timestamp: '2024-01-01T13:00:00.000Z'
      });
    });

    test('should filter by action', () => {
      const createLogs = audit.getLogs({ action: 'CREATE_ALERT' });
      expect(createLogs.length).toBe(2);
      createLogs.forEach(log => {
        expect(log.action).toBe('CREATE_ALERT');
      });

      const updateLogs = audit.getLogs({ action: 'UPDATE_ALERT_STATUS' });
      expect(updateLogs.length).toBe(1);
      expect(updateLogs[0].action).toBe('UPDATE_ALERT_STATUS');
    });

    test('should filter by alertId', () => {
      const alert1Logs = audit.getLogs({ alertId: 'alert-1' });
      expect(alert1Logs.length).toBe(2);
      alert1Logs.forEach(log => {
        expect(log.alertId).toBe('alert-1');
      });

      const alert2Logs = audit.getLogs({ alertId: 'alert-2' });
      expect(alert2Logs.length).toBe(1);
      expect(alert2Logs[0].alertId).toBe('alert-2');
    });

    test('should filter by startDate', () => {
      const logsAfter11 = audit.getLogs({
        startDate: '2024-01-01T11:00:00.000Z'
      });

      expect(logsAfter11.length).toBe(3);
    });

    test('should filter by endDate', () => {
      const logsBefore12 = audit.getLogs({
        endDate: '2024-01-01T12:00:00.000Z'
      });

      expect(logsBefore12.length).toBe(3);
    });

    test('should filter by date range', () => {
      const logsInRange = audit.getLogs({
        startDate: '2024-01-01T11:00:00.000Z',
        endDate: '2024-01-01T12:00:00.000Z'
      });

      expect(logsInRange.length).toBe(2);
    });

    test('should filter by multiple criteria', () => {
      const filtered = audit.getLogs({
        action: 'CREATE_ALERT',
        alertId: 'alert-1'
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].action).toBe('CREATE_ALERT');
      expect(filtered[0].alertId).toBe('alert-1');
    });

    test('should return empty array for non-matching filter', () => {
      const logs = audit.getLogs({ action: 'NON_EXISTENT_ACTION' });
      expect(logs.length).toBe(0);
      expect(logs).toEqual([]);
    });
  });

  // Guideline-based testing (slide 23)
  describe('Guideline-Based Testing', () => {
    test('should handle repeated same input', () => {
      for (let i = 0; i < 10; i++) {
        audit.log({
          action: 'REPEATED_ACTION',
          alertId: 'same-alert'
        });
      }

      const logs = audit.getLogs({ action: 'REPEATED_ACTION' });
      expect(logs.length).toBe(10);
    });

    test('should handle large number of logs efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        audit.log({ action: `ACTION_${i}` });
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should generate unique IDs for each log entry', () => {
      const log1 = audit.log({ action: 'TEST_1' });
      const log2 = audit.log({ action: 'TEST_2' });

      expect(log1.id).not.toBe(log2.id);
    });
  });
});