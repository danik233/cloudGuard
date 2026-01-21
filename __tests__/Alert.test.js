const Alert = require('../back/models/Alert');

describe('Alert Model - Unit Testing', () => {
  
  // Testing all operations associated with an object (slide 11)
  describe('Constructor and Object Creation', () => {
    test('should create alert with all required attributes', () => {
      const alert = new Alert({
        severity: 'High',
        category: 'S3',
        status: 'New',
        description: 'Test alert'
      });

      expect(alert.id).toBeDefined();
      expect(alert.severity).toBe('High');
      expect(alert.category).toBe('S3');
      expect(alert.status).toBe('New');
      expect(alert.description).toBe('Test alert');
      expect(alert.createdAt).toBeDefined();
      expect(alert.updatedAt).toBeDefined();
    });

    test('should set default values when not provided', () => {
      const alert = new Alert({
        severity: 'Medium',
        category: 'IAM',
        description: 'Test'
      });

      expect(alert.status).toBe('New');
      expect(alert.metadata).toEqual({});
    });

    test('should use provided id if given', () => {
      const customId = 'custom-123';
      const alert = new Alert({
        id: customId,
        severity: 'Low',
        category: 'Network',
        description: 'Test'
      });

      expect(alert.id).toBe(customId);
    });
  });

  // Setting and interrogating all object attributes (slide 11)
  describe('Attribute Access and Modification', () => {
    test('should allow reading all attributes', () => {
      const alert = new Alert({
        severity: 'High',
        category: 'CVE',
        status: 'Acknowledged',
        description: 'Security vulnerability'
      });

      expect(alert.severity).toBe('High');
      expect(alert.category).toBe('CVE');
      expect(alert.status).toBe('Acknowledged');
      expect(alert.description).toBe('Security vulnerability');
    });

    test('should store and retrieve metadata', () => {
      const metadata = { source: 'scanner', region: 'us-east-1' };
      const alert = new Alert({
        severity: 'Medium',
        category: 'S3',
        description: 'Test',
        metadata: metadata
      });

      expect(alert.metadata).toEqual(metadata);
    });
  });

  // Testing static properties
  describe('Static Constants', () => {
    test('should have correct severity levels', () => {
      expect(Alert.SEVERITIES).toEqual(['High', 'Medium', 'Low']);
    });

    test('should have correct categories', () => {
      expect(Alert.CATEGORIES).toEqual(['IAM', 'S3', 'Network', 'Activity', 'CVE']);
    });

    test('should have correct statuses', () => {
      expect(Alert.STATUSES).toEqual(['New', 'Acknowledged', 'In-Progress', 'Resolved']);
    });

    test('should have correct state transitions', () => {
      const transitions = Alert.STATE_TRANSITIONS;
      
      expect(transitions['New']).toEqual(['Acknowledged', 'Resolved']);
      expect(transitions['Acknowledged']).toEqual(['In-Progress', 'Resolved']);
      expect(transitions['In-Progress']).toEqual(['Resolved']);
      expect(transitions['Resolved']).toEqual([]);
    });
  });

  // Testing toJSON method
  describe('toJSON Method', () => {
    test('should return proper JSON representation', () => {
      const alert = new Alert({
        severity: 'High',
        category: 'IAM',
        description: 'Test alert'
      });

      const json = alert.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('severity', 'High');
      expect(json).toHaveProperty('category', 'IAM');
      expect(json).toHaveProperty('status', 'New');
      expect(json).toHaveProperty('description', 'Test alert');
      expect(json).toHaveProperty('metadata');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
  });

  // Exercising the object in all possible states (slide 11, 14)
  describe('State Transitions', () => {
    test('should support New -> Acknowledged transition', () => {
      const alert = new Alert({
        severity: 'High',
        category: 'S3',
        status: 'New',
        description: 'Test'
      });

      const validTransitions = Alert.STATE_TRANSITIONS['New'];
      expect(validTransitions).toContain('Acknowledged');
    });

    test('should support New -> Resolved transition', () => {
      const alert = new Alert({
        severity: 'High',
        category: 'S3',
        status: 'New',
        description: 'Test'
      });

      const validTransitions = Alert.STATE_TRANSITIONS['New'];
      expect(validTransitions).toContain('Resolved');
    });

    test('should support Acknowledged -> In-Progress transition', () => {
      const validTransitions = Alert.STATE_TRANSITIONS['Acknowledged'];
      expect(validTransitions).toContain('In-Progress');
    });

    test('should support In-Progress -> Resolved transition', () => {
      const validTransitions = Alert.STATE_TRANSITIONS['In-Progress'];
      expect(validTransitions).toContain('Resolved');
    });

    test('should not allow transitions from Resolved state', () => {
      const validTransitions = Alert.STATE_TRANSITIONS['Resolved'];
      expect(validTransitions).toEqual([]);
    });
  });
});