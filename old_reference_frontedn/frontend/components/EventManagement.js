/**
 * Shared Event Management Service
 * Common event handling patterns extracted from scan processor
 * Adapted for use by both scan processor and grading hub
 */
import { eventBus } from '/utils/EventBus.js';

export default class BaseEventManagement {
    constructor() {
        this._bound = false;
    }

    /**
     * Update button state (common pattern)
     */
    updateButtonState(buttonId, disabled) {
        const button = document.getElementById(buttonId);
        if (button) button.disabled = disabled;
    }

    /**
     * Show error modal (common pattern)
     */
    showErrorModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 style="color: var(--accent-red);">
                        <i data-lucide="alert-circle" class="w-5 h-5 inline mr-2"></i>
                        ${title}
                    </h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p class="text-gray-300">${message}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary modal-close">OK</button>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(modal);

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Close handlers
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Show success message (common pattern)
     */
    showSuccessMessage(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-green-400"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to document
        document.body.appendChild(toast);

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto remove
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    /**
     * Show loading state (common pattern)
     */
    showLoading(containerId, message = 'Processing...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingHtml = `
            <div class="loading-state text-center py-8">
                <div class="spinner mx-auto mb-4"></div>
                <p class="text-gray-400">${message}</p>
            </div>
        `;

        container.innerHTML = loadingHtml;
    }

    /**
     * Hide loading state (common pattern)
     */
    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingElement = container.querySelector('.loading-state');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    /**
     * Initialize icons (common pattern)
     */
    initializeIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this._bound = false;
    }
}

/**
 * Grading Hub Event Management
 * Extends BaseEventManagement with grading-specific event handling
 */
export class GradingEventManagement extends BaseEventManagement {
    constructor() {
        super();
        this.setupGradingEvents();
    }

    setupGradingEvents() {
        // Page navigation events
        eventBus.on('grading:navigate-to-setup', this.navigateToSetup.bind(this));
        eventBus.on('grading:navigate-to-interface', this.navigateToInterface.bind(this));
        
        // Profile events
        eventBus.on('grading:profile-selected', this.handleProfileSelected.bind(this));
        
        // Grading workflow events
        eventBus.on('grading:start-batch', this.handleStartBatch.bind(this));
        eventBus.on('grading:show-results', this.handleShowResults.bind(this));
        
        // UI update events
        eventBus.on('grading:update-progress', this.updateProgress.bind(this));
        eventBus.on('grading:show-error', this.showGradingError.bind(this));
    }

    navigateToSetup() {
        eventBus.emit('grading:page-change', { page: 'rubric-setup' });
    }

    navigateToInterface() {
        eventBus.emit('grading:page-change', { page: 'grading-interface' });
    }

    handleProfileSelected(data) {
        console.log('🔄 Profile selected:', data.profile?.name);
        // Update UI to reflect profile selection
        eventBus.emit('ui:profile-selected', data);
    }

    handleStartBatch(data) {
        console.log('🔄 Starting batch grading...');
        this.showLoading('grading-results', 'Processing student submissions...');
    }

    handleShowResults(data) {
        console.log('🔄 Showing grading results');
        this.hideLoading('grading-results');
        eventBus.emit('ui:render-results', data);
    }

    updateProgress(data) {
        const progressBar = document.getElementById('grading-progress');
        if (progressBar) {
            progressBar.style.width = `${data.percentage}%`;
            progressBar.setAttribute('aria-valuenow', data.percentage);
        }

        const progressText = document.getElementById('grading-progress-text');
        if (progressText) {
            progressText.textContent = data.message || `${data.percentage}% complete`;
        }
    }

    showGradingError(data) {
        this.showErrorModal(
            'Grading Error',
            data.message || 'An error occurred during grading. Please try again.'
        );
    }

    /**
     * Update grading-specific button states
     */
    updateGradingButtons(canStart, hasResults) {
        this.updateButtonState('start-grading-btn', !canStart);
        this.updateButtonState('export-results-btn', !hasResults);
        this.updateButtonState('save-session-btn', !hasResults);
    }

    /**
     * Show grading completion message
     */
    showGradingComplete(resultsCount) {
        this.showSuccessMessage(
            `Grading complete! Processed ${resultsCount} student submissions.`
        );
    }
}