// API Service
const API = {
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Get alerts with filters
    async getAlerts(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.severity && filters.severity !== 'all') {
            params.append('severity', filters.severity);
        }
        if (filters.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }
        if (filters.category && filters.category !== 'all') {
            params.append('category', filters.category);
        }

        const query = params.toString();
        return this.request(`/alerts${query ? '?' + query : ''}`);
    },

    // Create new alert
    async createAlert(finding) {
        return this.request('/alerts', {
            method: 'POST',
            body: JSON.stringify(finding)
        });
    },

    // Update alert status
    async updateAlertStatus(alertId, status) {
        return this.request(`/alerts/${alertId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    // Get audit logs
    async getAuditLogs(filters = {}) {
        const params = new URLSearchParams(filters);
        const query = params.toString();
        return this.request(`/audit-logs${query ? '?' + query : ''}`);
    }
};