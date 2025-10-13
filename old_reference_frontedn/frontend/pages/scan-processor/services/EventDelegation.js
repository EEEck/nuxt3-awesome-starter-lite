/**
 * Centralized Event Delegation Service
 * 
 * Replaces scattered addEventListener calls with a single event delegation system.
 * Handles ALL DOM interactions and emits appropriate EventBus events.
 */
import { eventBus } from '/utils/EventBus.js';

export default class EventDelegation {
    constructor() {
        this.setupEventDelegation();
    }

    setupEventDelegation() {
        // Single click handler for ALL click interactions
        document.addEventListener('click', this.handleClick.bind(this));
        
        // Single change handler for ALL input/select changes
        document.addEventListener('change', this.handleChange.bind(this));
        
        // Single input handler for real-time input changes
        document.addEventListener('input', this.handleInput.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // File drag/drop
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
        
        console.log('✅ Event delegation system initialized');
    }

    handleClick(e) {
        const target = e.target;
        const button = target.closest('button');
        const uploadTypeElement = target.closest('.upload-type[data-type]');
        const id = target.id || button?.id;
        
        // Upload type selection
        if (uploadTypeElement) {
            const uploadType = uploadTypeElement.dataset.type;
            eventBus.emit('upload:type-selected', { uploadType });
            return;
        }
        
        // Card action buttons (accept, flag, edit, remove-question, add-criterion, remove-criterion)
        if (button?.dataset.action) {
            const action = button.dataset.action;
            const card = button.closest('.question-card');
            const questionId = card?.dataset.questionId || button.dataset.questionId;
            
            if (action === 'remove-question') {
                eventBus.emit('question:remove', { questionId });
                return;
            }
            
            if (action === 'add-criterion') {
                eventBus.emit('question:add-criterion', { questionId });
                return;
            }
            
            if (action === 'remove-criterion') {
                const criterionIndex = parseInt(button.dataset.criterionIndex);
                eventBus.emit('question:remove-criterion', { questionId, criterionIndex });
                return;
            }
            
            if (action === 'remove-answer') {
                eventBus.emit('answer:remove', { questionId });
                return;
            }
            
            // Standard card actions (flag, accept, edit)
            eventBus.emit('card:action', { action, id: questionId });
            return;
        }
        
        // Navigation buttons
        switch (id) {
            case 'start-btn':
                eventBus.emit('ui:change-step', 'upload');
                break;
            case 'continue-btn':
                eventBus.emit('pdf:show-document-picker');
                break;
            case 'back-to-mode-selection':
                eventBus.emit('ui:change-step', 'mode-selection');
                break;
            case 'browse-btn':
                const fileInput = document.getElementById('file-input');
                eventBus.emit('ui:browse-files', fileInput);
                break;
            case 'remove-file':
                eventBus.emit('file:remove');
                break;
            case 'next-btn':
            case 'next-btn-top':
                eventBus.emit('navigation:next');
                break;
            case 'back-btn':
                eventBus.emit('navigation:previous');
                break;
            case 'preview-pdf-btn':
                // Get the current file from file input
                const currentFileInput = document.getElementById('file-input');
                const file = currentFileInput?.files[0] || null;
                eventBus.emit('pdf:show-preview', { file });
                break;
            case 'close-pdf-preview':
            case 'close-pdf-preview-btn':
                eventBus.emit('pdf:hide-preview');
                break;
            case 'close-document-picker':
            case 'cancel-document-picker':
                eventBus.emit('pdf:hide-document-picker');
                break;
            case 'mobile-mode-toggle':
                eventBus.emit('ui:toggle-mobile-mode');
                break;
            case 'download-json':
            case 'download-json-btn':
                console.log('🔍 Download button clicked:', id);
                eventBus.emit('action:download-json');
                break;
            case 'save-session':
            case 'save-session-btn':
                eventBus.emit('action:save-session');
                break;
            case 'undo-btn':
                eventBus.emit('action:undo');
                break;
            case 'redo-btn':
                eventBus.emit('action:redo');
                break;
            case 'revert-original':
            case 'revert-btn':
                eventBus.emit('action:revert-original');
                break;
            // Viewer controls
            case 'zoom-in':
                eventBus.emit('viewer:zoom-in');
                break;
            case 'zoom-out':
                eventBus.emit('viewer:zoom-out');
                break;
            case 'fit-width':
                eventBus.emit('viewer:fit-width');
                break;
            case 'fit-height':
                eventBus.emit('viewer:fit-height');
                break;
            case 'reset-zoom':
                eventBus.emit('viewer:reset-zoom');
                break;
            case 'resume-session-band':
                eventBus.emit('pdf:show-document-picker');
                break;
        }
        
        // Upload type selection
        if (target.closest('.upload-type')) {
            document.querySelectorAll('.upload-type').forEach(t => t.classList.remove('selected'));
            target.closest('.upload-type').classList.add('selected');
            
            const uploadType = target.closest('.upload-type').dataset.type;
            eventBus.emit('upload:type-selected', { uploadType });
        }
        
        // Document picker items
        if (target.closest('.document-item')) {
            const documentId = target.closest('.document-item').dataset.documentId;
            eventBus.emit('document:selected', { documentId });
        }
        
        // Secondary band click (continue existing)
        if (target.closest('.secondary-band') && !target.closest('button')) {
            const continueBtn = document.getElementById('continue-existing-document');
            if (continueBtn) continueBtn.click();
        }
    }

    handleChange(e) {
        const target = e.target;
        const id = target.id;
        
        // File input changes
        if (id === 'file-input') {
            const file = target.files[0];
            if (file) {
                eventBus.emit('file:selected', file);
            }
            return;
        }
        
        // Page selection changes
        if (id === 'page-selection-type') {
            const customRangeInput = document.getElementById('custom-range-input');
            if (customRangeInput) {
                customRangeInput.style.display = target.value === 'custom' ? 'block' : 'none';
            }
            eventBus.emit('pdf:page-selection-changed', { type: target.value });
            return;
        }
        
        // Question card input changes
        if (target.closest('.question-card')) {
            eventBus.emit('state:save-requested');
            
            const card = target.closest('.question-card');
            const questionId = card.dataset.questionId;
            const field = target.dataset.field;
            
            if (field === 'criterion' || field === 'max_points') {
                eventBus.emit('question:update-criteria', { questionId });
            } else {
                eventBus.emit('card:update-field', { questionId, field, value: target.value });
            }
        }
    }

    handleInput(e) {
        const target = e.target;
        const id = target.id;
        
        // Custom pages input
        if (id === 'custom-pages') {
            eventBus.emit('pdf:pages-input-changed', { value: target.value });
            // Trigger validation
            eventBus.emit('file:validate-page-range', { pageRange: target.value });
        }
        
        // Custom instructions input
        if (id === 'custom-instructions') {
            eventBus.emit('text:instructions-changed', { value: target.value });
        }
        
        // Debug prompt input  
        if (id === 'debug-prompt') {
            eventBus.emit('text:debug-prompt-changed', { value: target.value });
        }
        
        // Question input changes (real-time)
        if (target.closest('.question-card') && target.matches('input, textarea')) {
            // Real-time input handling if needed
        }
    }

    handleKeydown(e) {
        // Undo/Redo shortcuts
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            eventBus.emit('action:undo');
        }
        if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            eventBus.emit('action:redo');
        }
    }

    handleDragOver(e) {
        const dropzone = e.target.closest('#upload-dropzone');
        if (dropzone) {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const dropzone = e.target.closest('#upload-dropzone');
        if (dropzone) {
            dropzone.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        const dropzone = e.target.closest('#upload-dropzone');
        if (dropzone) {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                eventBus.emit('file:selected', file);
            }
        }
    }

    cleanup() {
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('change', this.handleChange);
        document.removeEventListener('input', this.handleInput);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('dragover', this.handleDragOver);
        document.removeEventListener('drop', this.handleDrop);
        document.removeEventListener('dragleave', this.handleDragLeave);
    }
}