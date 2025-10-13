/**
 * Reusable StatusCard Component  
 * Extracted from wizard templates for consistent status displays
 *
 * Features:
 * - Success, error, warning, and info variants
 * - Consistent icons and styling
 * - Customizable titles and messages
 * - Action buttons support
 */

export class StatusCard {
    constructor(options = {}) {
        this.options = {
            type: options.type || 'success', // success, error, warning, info
            title: options.title || '',
            message: options.message || '',
            icon: options.icon || this.getDefaultIcon(options.type),
            actions: options.actions || [], // Array of {text, onClick, class}
            id: options.id || `statusCard_${Date.now()}`,
            ...options
        };
    }

    getDefaultIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'alert-circle', 
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'info';
    }

    getTypeClasses(type) {
        const classes = {
            success: {
                container: 'bg-green-900/20 border-green-500/30',
                icon: 'text-green-400',
                title: 'text-green-300',
                message: 'text-green-200'
            },
            error: {
                container: 'bg-red-900/20 border-red-500/30', 
                icon: 'text-red-400',
                title: 'text-red-300',
                message: 'text-red-200'
            },
            warning: {
                container: 'bg-yellow-900/20 border-yellow-500/30',
                icon: 'text-yellow-400', 
                title: 'text-yellow-300',
                message: 'text-yellow-200'
            },
            info: {
                container: 'bg-blue-900/20 border-blue-500/30',
                icon: 'text-blue-400',
                title: 'text-blue-300', 
                message: 'text-blue-200'
            }
        };
        return classes[type] || classes.info;
    }

    /**
     * Generate the HTML for the status card
     * @returns {string} HTML template string
     */
    render() {
        const typeClasses = this.getTypeClasses(this.options.type);
        
        return `
            <div class="border rounded-lg p-4 ${typeClasses.container}" id="${this.options.id}">
                <div class="flex items-center gap-3">
                    <i data-lucide="${this.options.icon}" class="w-6 h-6 ${typeClasses.icon}"></i>
                    <div class="flex-1">
                        ${this.options.title ? `
                            <div class="font-medium ${typeClasses.title}">${this.options.title}</div>
                        ` : ''}
                        ${this.options.message ? `
                            <div class="text-sm ${typeClasses.message}">${this.options.message}</div>
                        ` : ''}
                    </div>
                    ${this.renderActions()}
                </div>
            </div>
        `;
    }

    renderActions() {
        if (!this.options.actions || this.options.actions.length === 0) {
            return '';
        }

        return `
            <div class="flex gap-2">
                ${this.options.actions.map(action => `
                    <button class="${action.class || 'btn btn-secondary btn-sm'}" 
                            onclick="${action.onClick || ''}"
                            ${action.id ? `id="${action.id}"` : ''}>
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * Setup event listeners after the component is rendered
     * Call this after adding the component HTML to the DOM  
     */
    setupEventListeners() {
        // Actions are handled via onclick attributes for simplicity
        // For more complex interactions, extend this method
    }
}

/**
 * Convenience functions for common status card types
 */
export function createSuccessCard(title, message, actions = []) {
    return new StatusCard({
        type: 'success',
        title,
        message,
        actions
    }).render();
}

export function createErrorCard(title, message, actions = []) {
    return new StatusCard({
        type: 'error', 
        title,
        message,
        actions
    }).render();
}

export function createWarningCard(title, message, actions = []) {
    return new StatusCard({
        type: 'warning',
        title, 
        message,
        actions
    }).render();
}

export function createInfoCard(title, message, actions = []) {
    return new StatusCard({
        type: 'info',
        title,
        message, 
        actions
    }).render();
}

// Export default
export default StatusCard;