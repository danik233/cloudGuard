// UI Components
const Components = {
    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, CONFIG.NOTIFICATION_DURATION);
    },

    // Show/hide loading spinner
    setLoading(isLoading) {
        const spinner = document.getElementById('loadingSpinner');
        const alertsList = document.getElementById('alertsList');
        const emptyState = document.getElementById('emptyState');

        if (isLoading) {
            spinner.classList.remove('hidden');
            alertsList.classList.add('hidden');
            emptyState.classList.add('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    },

    // Get status icon SVG
    getStatusIcon(status) {
        const icons = {
            'New': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
            'Acknowledged': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
            'In-Progress': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
            'Resolved': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        };
        return icons[status] || icons['New'];
    },

    // Render alert card
    renderAlertCard(alert) {
        const statusClass = String(alert.status)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const severityClass = String(alert.severity)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        return `
                <article class="alert-card alert-card--premium severity-${severityClass}" data-alert-id="${alert.id}">
             <div class="alert-hero">
              <div class="alert-hero-row">
             <div class="chips">
             <span class="chip chip-sev ${severityClass}">${alert.severity.toUpperCase()}</span>
                <span class="chip chip-cat">${alert.category}</span>
             <span class="chip chip-status status-${statusClass}">${alert.status}</span>
             </div>

             <svg class="alert-icon status-${statusClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${this.getStatusIcon(alert.status)}
             </svg>
             </div>

             <h3 class="alert-title">${alert.description}</h3>
             <p class="alert-meta">Created: ${new Date(alert.createdAt).toLocaleString()}</p>
             </div>

             <div class="alert-footer">
             <div class="alert-actions premium-actions">
          ${this.renderAlertActions(alert)}
        </div>
      </div>
    </article>
  `;
},


    // Render action buttons based on status
    renderAlertActions(alert) {
        const actions = [];

        if (alert.status === 'New') {
            actions.push(`
                <button class="btn btn-warning" onclick="App.updateStatus('${alert.id}', 'Acknowledged')">
                    Acknowledge
                </button>
            `);
        }

        if (alert.status === 'Acknowledged') {
            actions.push(`
                <button class="btn btn-info" onclick="App.updateStatus('${alert.id}', 'In-Progress')">
                    Start Working
                </button>
            `);
        }

        if (alert.status === 'In-Progress' || alert.status === 'Acknowledged') {
            actions.push(`
                <button class="btn btn-success" onclick="App.updateStatus('${alert.id}', 'Resolved')">
                    Resolve
                </button>
            `);
        }

        return actions.join('');
    },

    // Render alerts list
    renderAlerts(alerts) {
        const alertsList = document.getElementById('alertsList');
        const emptyState = document.getElementById('emptyState');

        if (alerts.length === 0) {
            alertsList.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        alertsList.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        alertsList.innerHTML = alerts.map(alert => this.renderAlertCard(alert)).join('');
    }
};