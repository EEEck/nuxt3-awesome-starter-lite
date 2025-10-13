/**
 * Event Management Service
 * Exact methods extracted from ScanProcessor for all event handling and DOM interactions
 */
import { eventBus } from '/utils/EventBus.js';

export default class EventManagement {
    constructor() {
        // No DOM listeners here; those live in EventDelegation.
        this._bound = false;
    }

    /**
     * Attach event listeners - CLEANED UP: DOM listeners moved to EventDelegation
     */
    attachEventListeners(context) {
        if (this._bound) return;
        this._bound = true;
        // All DOM event handling moved to EventDelegation service
        // Keep ONLY non-UI orchestration here if needed
        console.log('📡 EventManagement: All DOM listeners handled by EventDelegation');
    }

    /**
     * Attach review event listeners - REFACTORED: DOM listeners moved to EventDelegation
     */
    attachReviewEventListeners(context) {
        setTimeout(() => {
            // Initialize non-DOM functionality only
            eventBus.emit('ui:initialize-enterprise-viewer');
            eventBus.emit('ui:initialize-draggable-separator');
            
            // Initialize icons (non-interactive)
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    }

    /**
     * Attach card event listeners - REFACTORED: All DOM listeners moved to EventDelegation
     */
    attachCardEventListeners(context) {
        console.log('📡 EventManagement: Card event listeners handled by EventDelegation');
        // All card interactions now handled by EventDelegation service
    }

    /**
     * Update next button state (helper for event handlers)
     */
    updateNextButton(context) {
        const nextBtn = document.getElementById('next-btn');
        const nextBtnTop = document.getElementById('next-btn-top');
        
        const hasFile = context.fileManagement.getSelectedFile() !== null;
        const hasUploadType = context.uploadType !== null;
        const canProceed = hasFile && hasUploadType;
        
        if (nextBtn) nextBtn.disabled = !canProceed;
        if (nextBtnTop) nextBtnTop.disabled = !canProceed;
    }

    /**
     * Update debug prompt (helper for event handlers)
     */
    updateDebugPrompt(context) {
        const debugPrompt = document.getElementById('debug-prompt');
        if (debugPrompt) {
            debugPrompt.value = context.getDefaultPrompt();
        }
    }

    /**
     * Show error modal (helper for event handlers)
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
                    <div class="mt-4 text-sm text-gray-400">
                        <p><strong>Supported formats:</strong> PDF, JPEG, PNG</p>
                        <p><strong>Maximum file size:</strong> 50MB</p>
                        <p><strong>Recommended:</strong> High-quality scans with clear text</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary modal-close">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle modal close
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Navigation: Next step
     */
    async nextStep(context) {
        switch (context.currentStep) {
            case 'upload':
                // Phase 2 Complete: EventBus-only approach
                eventBus.emit('processing:start-document', { uploadType: context.uploadType });
                break;
            case 'process':
                // Processing automatically advances to review
                break;
            case 'review':
                // Could implement export or finish workflow
                break;
        }
    }

    /**
     * Navigation: Previous step
     */
    previousStep(context) {
        switch (context.currentStep) {
            case 'upload':
                context.currentStep = 'mode-selection';
                context.render();
                break;
            case 'process':
                context.currentStep = 'upload';
                context.render();
                break;
            case 'review':
                context.currentStep = 'process';
                context.render();
                break;
        }
    }

    /**
     * Show review buttons (exact copy from line 1218)
     * Hides navigation buttons since we're in review mode and processing is complete.
     */
    showReviewButtons() {
        // Hide Next button since we're in review mode and processing is complete
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.style.display = 'none';
        
        // Hide back button as well since we don't want to go back to processing
        const backBtn = document.getElementById('back-btn');
        if (backBtn) backBtn.style.display = 'none';
    }

    /**
     * Cleanup all event listeners
     */
    cleanup() {
        // Note: Most event listeners are attached to DOM elements and will be cleaned up
        // when elements are removed. Document-level listeners would need manual cleanup.
    }
}