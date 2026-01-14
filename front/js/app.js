// Main Application
const App = {
    filters: {
        severity: 'all',
        status: 'all',
        category: 'all'
    },

    async init() {
        this.setupEventListeners();
        await this.loadAlerts();
    },

    setupEventListeners() {
        // Filter change handlers
        document.getElementById('severityFilter').addEventListener('change', (e) => {
            this.filters.severity = e.target.value;
            this.loadAlerts();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.loadAlerts();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.loadAlerts();
        });

        // Create test alert button
        document.getElementById('createTestAlert').addEventListener('click', () => {
            this.createTestAlert();
        });
    },

    async loadAlerts() {
        try {
            Components.setLoading(true);
            const alerts = await API.getAlerts(this.filters);
            Components.renderAlerts(alerts);
        } catch (error) {
            Components.showNotification('Failed to load alerts', 'error');
            console.error('Error loading alerts:', error);
        } finally {
            Components.setLoading(false);
        }
    },

    async updateStatus(alertId, newStatus) {
        try {
            await API.updateAlertStatus(alertId, newStatus);
            Components.showNotification('Alert status updated successfully', 'success');
            await this.loadAlerts();
        } catch (error) {
            Components.showNotification('Failed to update alert status', 'error');
            console.error('Error updating status:', error);
        }
    },

    async createTestAlert() {
        try {
            const testFinding = {
                type: 'anomaly',
                severity: 'High',
                category: 'S3',
                description: `User performed ${Math.floor(Math.random() * 30 + 20)} GetObject calls in 1 minute (threshold: 20)`,
                metadata: {
                    user: 'test-user@example.com',
                    resource: 'sensitive-data-bucket',
                    apiCalls: Math.floor(Math.random() * 30 + 20),
                    threshold: 20,
                    timestamp: new Date().toISOString()
                }
            };

            await API.createAlert(testFinding);
            Components.showNotification('Test alert created successfully', 'success');
            await this.loadAlerts();
        } catch (error) {
            Components.showNotification('Failed to create test alert', 'error');
            console.error('Error creating test alert:', error);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});