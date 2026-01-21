const Validators = require('../back/utils/validators');

describe('Validators - Unit Testing', () => {
  
  // Normal operation tests (slide 17)
  describe('validateFinding - Normal Operation', () => {
    test('should validate correct finding with all fields', () => {
      const finding = {
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Test finding'
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should validate finding with only required fields', () => {
      const finding = {
        type: 'cve'
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should validate finding with valid severity', () => {
      const severities = ['High', 'Medium', 'Low'];
      
      severities.forEach(severity => {
        const finding = {
          type: 'anomaly',
          severity: severity
        };

        const result = Validators.validateFinding(finding);
        expect(result.isValid).toBe(true);
      });
    });

    test('should validate finding with valid category', () => {
      const categories = ['IAM', 'S3', 'Network', 'Activity', 'CVE'];
      
      categories.forEach(category => {
        const finding = {
          type: 'anomaly',
          category: category
        };

        const result = Validators.validateFinding(finding);
        expect(result.isValid).toBe(true);
      });
    });
  });

  // Abnormal inputs and error detection (slide 17, 23)
  describe('validateFinding - Defect Testing', () => {
    test('should reject finding without type', () => {
      const finding = {
        severity: 'High',
        category: 'S3'
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Finding type is required');
    });

    test('should reject finding with invalid severity', () => {
      const finding = {
        type: 'anomaly',
        severity: 'Critical' // Invalid - not in SEVERITIES
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid severity');
    });

    test('should reject finding with invalid category', () => {
      const finding = {
        type: 'anomaly',
        category: 'Database' // Invalid - not in CATEGORIES
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid category');
    });

    test('should accumulate multiple errors', () => {
      const finding = {
        // Missing type
        severity: 'Invalid',
        category: 'Invalid'
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(3); // type, severity, category
    });

    test('should handle null input', () => {
      const result = Validators.validateFinding(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Finding type is required');
    });

    test('should handle undefined input', () => {
      const result = Validators.validateFinding(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Finding type is required');
    });

    test('should handle empty object', () => {
      const result = Validators.validateFinding({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Finding type is required');
    });
  });

  // Partition testing (slide 18, 19)
  describe('validateFinding - Equivalence Partitioning', () => {
    describe('Severity Partitions', () => {
      test('should accept High severity (valid partition)', () => {
        const finding = { type: 'anomaly', severity: 'High' };
        const result = Validators.validateFinding(finding);
        expect(result.isValid).toBe(true);
      });

      test('should accept Medium severity (valid partition)', () => {
        const finding = { type: 'anomaly', severity: 'Medium' };
        const result = Validators.validateFinding(finding);
        expect(result.isValid).toBe(true);
      });

      test('should accept Low severity (valid partition)', () => {
        const finding = { type: 'anomaly', severity: 'Low' };
        const result = Validators.validateFinding(finding);
        expect(result.isValid).toBe(true);
      });

      test('should reject invalid severity (invalid partition)', () => {
        const invalidSeverities = ['Critical', 'Minor', 'Info', 'high', 'HIGH'];
        
        invalidSeverities.forEach(severity => {
          const finding = { type: 'anomaly', severity: severity };
          const result = Validators.validateFinding(finding);
          expect(result.isValid).toBe(false);
        });
      });
    });

    describe('Category Partitions', () => {
      const validCategories = ['IAM', 'S3', 'Network', 'Activity', 'CVE'];
      
      validCategories.forEach(category => {
        test(`should accept ${category} category (valid partition)`, () => {
          const finding = { type: 'anomaly', category: category };
          const result = Validators.validateFinding(finding);
          expect(result.isValid).toBe(true);
        });
      });

      test('should reject invalid categories (invalid partition)', () => {
        const invalidCategories = ['Database', 'API', 'EC2', 'iam', 's3'];
        
        invalidCategories.forEach(category => {
          const finding = { type: 'anomaly', category: category };
          const result = Validators.validateFinding(finding);
          expect(result.isValid).toBe(false);
        });
      });
    });
  });

  // validateStatus method testing
  describe('validateStatus - Normal Operation', () => {
    test('should validate correct statuses', () => {
      const validStatuses = ['New', 'Acknowledged', 'In-Progress', 'Resolved'];
      
      validStatuses.forEach(status => {
        const result = Validators.validateStatus(status);
        expect(result).toBe(true);
      });
    });

    test('should reject invalid statuses', () => {
      const invalidStatuses = ['Pending', 'Closed', 'Open', 'new', 'RESOLVED'];
      
      invalidStatuses.forEach(status => {
        const result = Validators.validateStatus(status);
        expect(result).toBe(false);
      });
    });

    test('should reject null status', () => {
      const result = Validators.validateStatus(null);
      expect(result).toBe(false);
    });

    test('should reject undefined status', () => {
      const result = Validators.validateStatus(undefined);
      expect(result).toBe(false);
    });

    test('should reject empty string status', () => {
      const result = Validators.validateStatus('');
      expect(result).toBe(false);
    });
  });

  // Guideline-based testing (slide 23)
  describe('Guideline-Based Testing', () => {
    test('should handle case-sensitive validation correctly', () => {
      // Correct case
      expect(Validators.validateStatus('New')).toBe(true);
      
      // Wrong case - should be rejected
      expect(Validators.validateStatus('new')).toBe(false);
      expect(Validators.validateStatus('NEW')).toBe(false);
      expect(Validators.validateStatus('NeW')).toBe(false);
    });

    test('should handle whitespace in input', () => {
      const finding = {
        type: 'anomaly',
        severity: ' High ',
        category: ' S3 '
      };

      const result = Validators.validateFinding(finding);
      // Should fail because exact match is required
      expect(result.isValid).toBe(false);
    });

    test('should handle special characters in type', () => {
      const specialChars = ['@anomaly', 'anomaly!', 'ano#maly', 'anomaly$'];
      
      specialChars.forEach(type => {
        const finding = { type: type };
        const result = Validators.validateFinding(finding);
        // Type itself is not validated, only presence is checked
        expect(result.isValid).toBe(true);
      });
    });
  });

  // Boundary testing
  describe('Boundary Testing', () => {
    test('should handle very long type string', () => {
      const finding = {
        type: 'a'.repeat(1000),
        severity: 'High',
        category: 'S3'
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(true);
    });

    test('should handle finding with many fields', () => {
      const finding = {
        type: 'anomaly',
        severity: 'High',
        category: 'S3',
        description: 'Test',
        extra1: 'value1',
        extra2: 'value2',
        extra3: 'value3'
      };

      const result = Validators.validateFinding(finding);
      expect(result.isValid).toBe(true);
    });
  });
});