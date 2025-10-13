/**
 * Modular Scan Processor
 * Main orchestrator class that coordinates all services and maintains identical behavior
 * to the original monolithic implementation.
 */

// Import all services
import FileManagement from '/pages/scan-processor/services/FileManagement.js';
import DocumentProcessing from '/pages/scan-processor/services/DocumentProcessing.js';
import PDFService from '/pages/scan-processor/services/PDFService.js';
import RenderingService from '/pages/scan-processor/services/RenderingService.js';
import EnterpriseViewer from '/pages/scan-processor/services/EnterpriseViewer.js';
import EventManagement from '/pages/scan-processor/services/EventManagement.js';
import SessionManagement from '/pages/scan-processor/services/SessionManagement.js';
import UndoRedo from '/pages/scan-processor/services/UndoRedo.js';
import CardEditing from '/pages/scan-processor/services/CardEditing.js';
import QuestionManagement from '/pages/scan-processor/services/QuestionManagement.js';
import DataStore from '/components/DataStore.js';
import EventDelegation from '/pages/scan-processor/services/EventDelegation.js';

// Import templates
import ModeSelectionTemplate from '/pages/scan-processor/templates/ModeSelectionTemplate.js';
import MainStepsTemplate from '/pages/scan-processor/templates/MainStepsTemplate.js';

// Import shared dependencies
import DocumentState from '/services/DocumentState.js';
import { eventBus } from '/utils/EventBus.js';

export default class ScanProcessor {
    constructor() {
        // Use DataStore singleton as single source of truth (Step 6A)
        this.dataStore = DataStore;
        
        // Legacy properties for backward compatibility (will be removed)
        this.historyTimeout = null;
        
        // Initialize services
        this.fileManagement = new FileManagement();
        this.documentProcessing = new DocumentProcessing();
        this.pdfService = new PDFService();
        this.renderingService = new RenderingService();
        this.enterpriseViewer = new EnterpriseViewer();
        this.eventManagement = new EventManagement();
        this.sessionManagement = new SessionManagement();
        this.undoRedo = new UndoRedo();
        this.cardEditing = new CardEditing();
        this.questionManagement = new QuestionManagement();
        
        // EventDelegation enabled for Patch 4
        this.eventDelegation = new EventDelegation();
        
        // DataStore delegation getters/setters (Step 6A)  
        // These delegate to DataStore for backward compatibility
        Object.defineProperty(this, 'currentStep', {
            get: () => this.dataStore.getCurrentStep(),
            set: (value) => this.dataStore.setCurrentStep(value)
        });
        
        Object.defineProperty(this, 'processedData', {
            get: () => this.dataStore.getProcessedData(),
            set: (value) => this.dataStore.setProcessedData(value)
        });
        
        Object.defineProperty(this, 'uploadType', {
            get: () => this.dataStore.getUploadType(),
            set: (value) => this.dataStore.setUploadType(value)
        });
        
        // Initialize templates
        this.modeSelectionTemplate = new ModeSelectionTemplate();
        this.mainStepsTemplate = new MainStepsTemplate();
        
        // Initialize document state
        this.documentState = new DocumentState();
        
        // Set up document state observers for SSOT pattern
        this.documentState.onDataChange = (data) => {
            this.processedData = data;
        };
        
        // Expose DataStore globally for debugging (development only)
        window.dataStore = this.dataStore;
        
        // Phase 1 Test: Subscribe to EventBus events
        this.setupEventBusListeners();
    }

    // EventBus setup - Phase 1 + Phase 2 events
    setupEventBusListeners() {
        // Phase 1 events (existing)
        eventBus.on('ui:change-step', (newStep) => {
            console.log('📡 EventBus: Step change event received:', newStep);
            this.currentStep = newStep;
            this.render();
        });
        
        eventBus.on('ui:browse-files', (fileInput) => {
            console.log('📡 EventBus: Browse files event received, clicking file input');
            fileInput.click();
        });
        
        eventBus.on('file:selected', (file) => {
            console.log('📡 EventBus Test: File selected via EventBus:', file?.name);
            // Phase 2: Pass uploadType instead of context
            this.fileManagement.handleFileSelect(file, this.uploadType);
        });

        // Phase 2: Handle file upload completion
        eventBus.on('file:uploaded', (data) => {
            console.log('📡 EventBus: File uploaded event received:', data.file?.name);
            const hasFile = data.file !== null;
            const hasUploadType = data.uploadType !== null;
            const canProceed = hasFile && hasUploadType;
            
            eventBus.emit('ui:update-button', {
                id: 'next-btn',
                disabled: !canProceed
            });
            
            eventBus.emit('ui:update-button', {
                id: 'next-btn-top', 
                disabled: !canProceed
            });
        });
        
        eventBus.on('debug:info', () => {
            console.log('📡 EventBus Debug Info:', eventBus.getDebugInfo());
        });

        // Phase 2 events - FileManagement decoupling
        eventBus.on('ui:show-error', (data) => {
            console.log('📡 EventBus: Show error modal via EventBus:', data.title);
            this.eventManagement.showErrorModal(data.title, data.message);
        });

        eventBus.on('ui:update-button', (data) => {
            console.log('📡 EventBus: Update button via EventBus:', data.id, 'disabled:', data.disabled);
            const button = document.getElementById(data.id);
            if (button) button.disabled = data.disabled;
        });

        // Phase 2: UndoRedo service events
        eventBus.on('state:request-current', (data) => {
            console.log('📡 EventBus: Current state requested for:', data.requestId);
            if (data.callback && this.processedData) {
                data.callback(this.processedData);
            }
        });

        eventBus.on('state:request-original', (data) => {
            console.log('📡 EventBus: Original state requested for:', data.requestId);
            if (data.callback && this.documentState) {
                const originalData = this.documentState.getOriginalData();
                data.callback(originalData);
            }
        });

        eventBus.on('state:restore', (data) => {
            console.log('📡 EventBus: Restoring state via EventBus');
            if (data.data) {
                this.processedData = data.data; // This triggers the setter
            }
        });

        eventBus.on('state:update', (data) => {
            console.log('📡 EventBus: Updating state via EventBus');
            if (data.data && this.documentState) {
                this.documentState.updateData(data.data);
            }
        });

        eventBus.on('ui:render-cards', () => {
            console.log('📡 EventBus: Rendering cards via EventBus');
            // Use setTimeout to ensure processedData is fully updated before rendering
            setTimeout(() => {
                this.renderingService.renderCardBasedReview();
            }, 0);
        });

        eventBus.on('ui:show-revert-feedback', (data) => {
            console.log('📡 EventBus: Showing revert feedback:', data.success);
            const revertBtn = document.getElementById('revert-original');
            if (revertBtn) {
                const originalText = revertBtn.innerHTML;
                console.log('🔄 Original button text:', originalText);
                if (data.success) {
                    revertBtn.innerHTML = '<i data-lucide="check" class="btn-icon"></i>Reverted!';
                } else {
                    revertBtn.innerHTML = '<i data-lucide="info" class="btn-icon"></i>Already Original';
                }
                setTimeout(() => {
                    console.log('🔄 Resetting button text to:', originalText);
                    revertBtn.innerHTML = originalText;
                }, 2000);
            }
        });

        // Phase 2: EventManagement button events
        eventBus.on('action:undo', () => {
            console.log('📡 EventBus: Undo action via EventBus');
            this.undo();
        });

        eventBus.on('action:redo', () => {
            console.log('📡 EventBus: Redo action via EventBus');
            this.redo();
        });

        eventBus.on('action:download-json', () => {
            console.log('📡 EventBus: Download JSON via EventBus');
            this.downloadModifiedJson();
        });

        eventBus.on('action:save-session', () => {
            console.log('📡 EventBus: Save session via EventBus');
            this.saveSession();
        });

        // Phase 2: Step 5D - RenderingService decoupling events
        eventBus.on('ui:load-image-in-viewer', (data) => {
            console.log('📡 EventBus: Load image in viewer via EventBus');
            this.renderingService.loadImageInViewer(data.viewerContainer);
        });

        eventBus.on('data:get-processed-data', (data) => {
            console.log('📡 EventBus: Get processed data via EventBus');
            if (data.callback) {
                data.callback(this.processedData, this.uploadType);
            }
        });

        eventBus.on('file:get-display-data', (data) => {
            console.log('📡 EventBus: Get file display data via EventBus');
            if (data.callback) {
                data.callback({
                    selectedFile: this.fileManagement.getSelectedFile(),
                    uploadedImageUrl: this.fileManagement.getUploadedImageUrl(),
                    deferredImageFile: this.fileManagement.deferredImageFile
                });
            }
        });

        eventBus.on('file:set-uploaded-image-url', (data) => {
            console.log('📡 EventBus: Set uploaded image URL via EventBus');
            this.fileManagement.uploadedImageUrl = data.imageUrl;
        });

        eventBus.on('ui:get-current-step', (data) => {
            console.log('📡 EventBus: Get current step via EventBus');
            if (data.callback) {
                data.callback(this.currentStep);
            }
        });

        eventBus.on('ui:update-undo-redo-buttons', () => {
            console.log('📡 EventBus: Update undo/redo buttons via EventBus');
            this.updateUndoRedoButtons();
        });

        eventBus.on('ui:update-validation-progress', () => {
            console.log('📡 EventBus: Update validation progress via EventBus');
            this.cardEditing.updateValidationProgress();
        });

        eventBus.on('template:create-student-name-card', (data) => {
            console.log('📡 EventBus: Create student name card via EventBus');
            if (data.callback) {
                const cardHtml = this.renderingService.cardTemplates.createStudentNameCard(this.processedData);
                data.callback(cardHtml);
            }
        });

        eventBus.on('template:create-student-answer-card', (data) => {
            console.log('📡 EventBus: Create student answer card via EventBus');
            if (data.callback) {
                const cardHtml = this.renderingService.cardTemplates.createStudentAnswerCard(data.questionId, data.answer, this.processedData);
                data.callback(cardHtml);
            }
        });

        eventBus.on('template:create-rubric-question-card', (data) => {
            console.log('📡 EventBus: Create rubric question card via EventBus');
            if (data.callback) {
                const cardHtml = this.renderingService.cardTemplates.createRubricQuestionCard(data.question, this.processedData);
                data.callback(cardHtml);
            }
        });

        // Phase 2: Step 5C - SessionManagement decoupling events
        eventBus.on('data:save-session', async (data) => {
            console.log('📡 EventBus: Save document state via EventBus');
            try {
                await this.documentState.save();
                if (data.callback) {
                    data.callback(true);
                }
            } catch (error) {
                console.error('Failed to save document state:', error);
                if (data.callback) {
                    data.callback(false);
                }
            }
        });

        eventBus.on('data:reset-session', () => {
            console.log('📡 EventBus: Reset document state via EventBus');
            this.documentState.reset();
        });

        eventBus.on('file:reset-state', () => {
            console.log('📡 EventBus: Reset file management state via EventBus');
            this.fileManagement.uploadedImageUrl = null;
            this.fileManagement.selectedFile = null;
            this.fileManagement.pdfPageCount = null;
            this.uploadType = null;
        });

        eventBus.on('ui:reset-session', () => {
            console.log('📡 EventBus: Reset UI session state via EventBus');
            // Any UI-specific session reset logic can go here
        });

        eventBus.on('data:clear-url-document-id', () => {
            console.log('📡 EventBus: Clear URL document ID via EventBus');
            // Simplified MVP: URL functionality removed, keeping event for compatibility
        });

        eventBus.on('data:export-json', (data) => {
            console.log('📡 EventBus: Export JSON via EventBus:', data.filename);
            this.documentState.exportAsJSON(data.filename);
        });

        eventBus.on('session:start-grading', (data) => {
            console.log('📡 EventBus: Start grading workflow via EventBus:', data.uploadType);
            // Enhanced integration with grading hub workflow
            if (data.uploadType === 'rubric') {
                // Store rubric data for grading hub
                localStorage.setItem('uploadedRubric', JSON.stringify(this.processedData));
                localStorage.setItem('scanProcessorSource', 'rubric');
                localStorage.setItem('scanProcessorData', JSON.stringify({
                    originalFile: this.fileManagement.getSelectedFile()?.name,
                    processedAt: new Date().toISOString(),
                    extractedQuestions: (this.processedData.questions || []).length
                }));
                
                // Navigate to grading wizard with context
                window.location.hash = '#grading-wizard?source=scan-processor&type=rubric';
            } else {
                // Store student answers for grading wizard  
                localStorage.setItem('uploadedAnswers', JSON.stringify(this.processedData));
                localStorage.setItem('scanProcessorSource', 'student');
                localStorage.setItem('scanProcessorData', JSON.stringify({
                    originalFile: this.fileManagement.getSelectedFile()?.name,
                    processedAt: new Date().toISOString(),
                    studentName: this.processedData.student_name,
                    extractedAnswers: Object.keys(this.processedData.answers || {}).length
                }));
                
                // Navigate to grading wizard with context
                window.location.hash = '#grading-wizard?source=scan-processor&type=student';
            }
            
            if (data.callback) {
                data.callback(true);
            }
        });

        eventBus.on('card:save-visual-editor-changes', () => {
            console.log('📡 EventBus: Save visual editor changes via EventBus');
            // This will be handled by CardEditing service in Step 5E
            console.log('saveVisualEditorChanges called - will be handled by CardEditing service');
        });

        eventBus.on('action:revert-original', () => {
            console.log('📡 EventBus: Revert to original via EventBus');
            this.revertToOriginal();
        });

        eventBus.on('navigation:next', () => {
            console.log('📡 EventBus: Next step via EventBus');
            this.nextStep();
        });

        eventBus.on('navigation:previous', () => {
            console.log('📡 EventBus: Previous step via EventBus');
            this.previousStep();
        });

        eventBus.on('upload:type-selected', (data) => {
            console.log('📡 EventBus: Upload type selected via EventBus:', data.uploadType);
            this.uploadType = data.uploadType;
            this.updateDebugPrompt();
            this.updateNextButton();
            // Update visual selection without full re-render
            this.updateUploadTypeSelection(data.uploadType);
        });

        eventBus.on('file:remove', () => {
            console.log('📡 EventBus: File removal via EventBus');
            this.fileManagement.selectedFile = null;
            document.getElementById('file-preview').style.display = 'none';
            document.getElementById('file-input').value = '';
            this.updateNextButton();
        });

        // Phase 2: Complex EventManagement events - PDF Service
        eventBus.on('pdf:show-document-picker', () => {
            console.log('📡 EventBus: Show document picker via EventBus');
            this.pdfService.showDocumentPicker();
        });

        eventBus.on('pdf:show-preview', (data) => {
            console.log('📡 EventBus: Show PDF preview via EventBus:', data.file?.name);
            this.pdfService.showPdfPreview(data.file);
        });

        eventBus.on('pdf:hide-preview', () => {
            console.log('📡 EventBus: Hide PDF preview via EventBus');
            this.pdfService.hidePdfPreview();
        });

        eventBus.on('pdf:hide-document-picker', () => {
            console.log('📡 EventBus: Hide document picker via EventBus');
            this.pdfService.hideDocumentPicker();
        });

        // Phase 2: Step 5A - PDFService decoupling events
        eventBus.on('pdf:load-document', (data) => {
            console.log('📡 EventBus: Load document via EventBus:', data.documentId);
            this.pdfService.loadDocument(data.documentId);
        });

        eventBus.on('data:load-document', async (data) => {
            console.log('📡 EventBus: Document state load requested:', data.documentId);
            try {
                await this.documentState.load(data.documentId);
                const documentData = this.documentState.getCurrentData();
                this.processedData = documentData; // Sync with loaded data
                if (data.callback) {
                    data.callback(documentData);
                }
            } catch (error) {
                console.error('Failed to load document state:', error);
                if (data.callback) {
                    data.callback(null);
                }
            }
        });

        eventBus.on('file:restore-image', (data) => {
            console.log('📡 EventBus: Restore image URL via EventBus');
            this.fileManagement.uploadedImageUrl = data.imageUrl;
        });

        eventBus.on('pdf:document-loaded', (data) => {
            console.log('📡 EventBus: Document loaded, transitioning to review via EventBus');
            this.uploadType = data.uploadType;
            this.processedData = data.documentData; // Fix: Set processedData from loaded document
            this.currentStep = 'review';
            this.render();
            setTimeout(() => {
                this.renderCardBasedReview();
                this.eventManagement.showReviewButtons();
                this.eventManagement.attachReviewEventListeners(this);
            }, 100);
        });

        eventBus.on('ui:show-error-modal', (data) => {
            console.log('📡 EventBus: Show error modal via EventBus:', data.title);
            this.eventManagement.showErrorModal(data.title, data.message);
        });

        // Phase 2: Complex EventManagement events - File Management
        // Note: file:handle-select removed - now handled via file:selected

        eventBus.on('file:validate-page-range', (data) => {
            console.log('📡 EventBus: Validate page range via EventBus:', data.pageRange);
            this.fileManagement.validatePageRange(data.pageRange);
        });

        // Phase 2: Complex EventManagement events - Enterprise Viewer
        eventBus.on('ui:toggle-mobile-mode', () => {
            console.log('📡 EventBus: Toggle mobile mode via EventBus');
            this.enterpriseViewer.toggleMobileMode();
        });

        eventBus.on('ui:initialize-enterprise-viewer', () => {
            console.log('📡 EventBus: Initialize enterprise viewer via EventBus');
            // Ensure viewer has proper context for DOM manipulation
            setTimeout(() => {
                this.enterpriseViewer.initializeEnterpriseViewer();
            }, 50);
        });

        eventBus.on('ui:initialize-draggable-separator', () => {
            console.log('📡 EventBus: Initialize draggable separator via EventBus');
            // Ensure separator has proper context for DOM manipulation  
            setTimeout(() => {
                this.enterpriseViewer.initializeDraggableSeparator();
            }, 50);
        });

        // Phase 2: Complex EventManagement events - Question Management
        eventBus.on('question:remove', (data) => {
            console.log('📡 EventBus: Remove question via EventBus:', data.questionId);
            this.questionManagement.removeQuestion(data.questionId);
        });

        eventBus.on('question:add-criterion', (data) => {
            console.log('📡 EventBus: Add criterion via EventBus:', data.questionId);
            this.questionManagement.addCriterionToQuestion(data.questionId);
        });

        eventBus.on('question:remove-criterion', (data) => {
            console.log('📡 EventBus: Remove criterion via EventBus:', data.questionId, data.criterionIndex);
            this.questionManagement.removeCriterionFromQuestion(data.questionId, data.criterionIndex);
        });

        eventBus.on('question:update-criteria', (data) => {
            console.log('📡 EventBus: Update criteria via EventBus:', data.questionId);
            this.questionManagement.updateCriteriaInProcessedData(data.questionId);
        });

        // Phase 2: Complex EventManagement events - Card Actions
        // NOTE: card:action events are now handled directly by CardEditing service

        eventBus.on('card:update-field', (data) => {
            console.log('📡 EventBus: Update field via EventBus:', data.questionId, data.field);
            this.cardEditing.updateFieldInProcessedData(data.questionId, data.field, data.value);
        });

        // Phase 2: Complex EventManagement events - Processing
        eventBus.on('processing:start-document', (data) => {
            console.log('📡 EventBus: Start document processing via EventBus:', data.uploadType);
            this.documentProcessing.processDocument(data.uploadType);
        });

        // Phase 2: Step 5B - DocumentProcessing decoupling events
        eventBus.on('file:collect-page-selection', (data) => {
            console.log('📡 EventBus: Collect page selection data via EventBus');
            const pageSelectionData = this.fileManagement.collectPageSelectionData();
            if (data.callback) {
                data.callback(pageSelectionData);
            }
        });

        eventBus.on('file:get-selected', (data) => {
            console.log('📡 EventBus: Get selected file via EventBus');
            const selectedFile = this.fileManagement.getSelectedFile();
            if (data.callback) {
                data.callback(selectedFile);
            }
        });

        eventBus.on('processing:get-default-prompt', (data) => {
            console.log('📡 EventBus: Get default prompt via EventBus:', data.uploadType);
            const defaultPrompt = this.getDefaultPrompt(data.uploadType);
            if (data.callback) {
                data.callback(defaultPrompt);
            }
        });

        eventBus.on('data:initialize-document', async (data) => {
            console.log('📡 EventBus: Initialize document state via EventBus');
            try {
                this.documentState.initialize(data.result, data.uploadType, data.selectedFile);
                if (data.callback) {
                    data.callback(true);
                }
            } catch (error) {
                console.error('Failed to initialize document state:', error);
                if (data.callback) {
                    data.callback(false);
                }
            }
        });

        eventBus.on('data:save-document', async () => {
            console.log('📡 EventBus: Save document via EventBus');
            try {
                await this.documentState.save();
            } catch (error) {
                console.error('Failed to save document:', error);
            }
        });

        eventBus.on('processing:retry-document', () => {
            console.log('📡 EventBus: Retry document processing via EventBus');
            this.documentProcessing.processDocument(this.uploadType);
        });

        eventBus.on('ui:show-review-buttons', () => {
            console.log('📡 EventBus: Show review buttons via EventBus');
            this.eventManagement.showReviewButtons();
        });

        eventBus.on('ui:attach-review-listeners', () => {
            console.log('📡 EventBus: Attach review listeners via EventBus');
            this.eventManagement.attachReviewEventListeners(this);
        });

        eventBus.on('ui:attach-card-listeners', () => {
            console.log('📡 EventBus: Attach card listeners via EventBus');
            this.eventManagement.attachCardEventListeners(this);
        });

        // Phase 2: State management events
        eventBus.on('state:save-requested', () => {
            console.log('📡 EventBus: Save state requested via EventBus');
            this.saveState();
        });

        // Phase 2: Viewer control events (fix for missing handlers)
        eventBus.on('viewer:zoom-in', () => {
            console.log('📡 EventBus: Zoom in via EventBus');
            this.enterpriseViewer.zoomIn();
        });

        eventBus.on('viewer:zoom-out', () => {
            console.log('📡 EventBus: Zoom out via EventBus');
            this.enterpriseViewer.zoomOut();
        });

        eventBus.on('viewer:fit-width', () => {
            console.log('📡 EventBus: Fit to width via EventBus');
            this.enterpriseViewer.fitToWidth();
        });

        eventBus.on('viewer:fit-height', () => {
            console.log('📡 EventBus: Fit to height via EventBus');
            this.enterpriseViewer.fitToHeight();
        });

        eventBus.on('viewer:reset-zoom', () => {
            console.log('📡 EventBus: Reset zoom via EventBus');
            this.enterpriseViewer.resetZoom();
        });
    }

    // Main lifecycle methods (exact same signatures as original)
    
    async init() {
        // Register globally for onclick handlers
        window.scanProcessor = this;
        
        // Phase 1 Test: Expose EventBus for testing
        window.eventBus = eventBus;
        window.testEventBus = () => {
            console.log('🧪 Testing EventBus...');
            eventBus.emit('debug:info');
            console.log('🧪 EventBus test complete. Check console for EventBus debug info.');
        };
        
        this.render();
        this.eventManagement.attachEventListeners(this);
        
        // Bind store events for reactive UI updates (Patch 5)
        this.bindStoreEvents();
        
        // Check for document ID in URL for session restoration
        await this.loadFromUrlIfPresent();
    }

    render() {
        const container = document.getElementById('scan-processor-container');
        if (!container) return;

        if (this.currentStep === 'mode-selection') {
            container.innerHTML = this.modeSelectionTemplate.render();
        } else {
            container.innerHTML = this.mainStepsTemplate.render(this);
        }
        
        // HACK: Initialize icons after DOM update (TODO: Move to dedicated IconService)
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Re-attach event listeners since DOM was recreated with innerHTML
        this.eventManagement.attachEventListeners(this);
    }

    bindStoreEvents() {
        eventBus.on('data:card-updated', ({ id, card }) => this.updateCardDom(id, card));
        eventBus.on('data:current-step-changed', ({ step }) => this.updateSidebar(step));
    }

    updateCardDom(id, card) {
        console.log('🎨 UI: Updating card DOM for:', id, card);
        const el = document.querySelector(`[data-question-id="${id}"]`);
        if (!el) {
            console.warn('❌ UI: Card element not found for ID:', id);
            return;
        }
        
        // Update card outline classes (CSS from Patch 6)
        el.classList.toggle('is-flagged', !!card.flagged);
        el.classList.toggle('is-accepted', !!card.accepted);
        
        // Update button states and appearance
        const flagBtn = el.querySelector('[data-action="flag"]');
        const acceptBtn = el.querySelector('[data-action="accept"]');
        
        if (flagBtn) {
            flagBtn.setAttribute('aria-pressed', String(!!card.flagged));
            if (card.flagged) {
                flagBtn.classList.remove('btn-secondary');
                flagBtn.classList.add('btn-warning');
                flagBtn.innerHTML = '<i data-lucide="flag" class="w-4 h-4"></i>Flagged for Review';
            } else {
                flagBtn.classList.remove('btn-warning');
                flagBtn.classList.add('btn-secondary');
                flagBtn.innerHTML = '<i data-lucide="flag" class="w-4 h-4"></i>Flag for Review';
            }
        }
        
        if (acceptBtn) {
            acceptBtn.setAttribute('aria-pressed', String(!!card.accepted));
            if (card.accepted) {
                acceptBtn.classList.remove('btn-primary');
                acceptBtn.classList.add('btn-success');
                acceptBtn.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i>Accepted';
            } else {
                acceptBtn.classList.remove('btn-success');
                acceptBtn.classList.add('btn-primary');
                acceptBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>Accept';
            }
        }
        
        // Re-initialize icons after innerHTML changes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('✅ UI: Card DOM updated successfully');
    }

    updateSidebar(step) {
        const items = document.querySelectorAll('[data-step]');
        items.forEach(li => li.classList.toggle('active', li.dataset.step === step));
    }

    updateUploadTypeSelection(uploadType) {
        // Update visual selection without full re-render
        const uploadTypes = document.querySelectorAll('.upload-type');
        uploadTypes.forEach(element => {
            const isSelected = element.dataset.type === uploadType;
            element.classList.toggle('selected', isSelected);
        });
    }

    // Navigation methods (delegate to EventManagement)
    async nextStep() {
        await this.eventManagement.nextStep(this);
    }

    previousStep() {
        this.eventManagement.previousStep(this);
    }

    // File handling methods (delegate to FileManagement)
    handleFileSelect(file) {
        return this.fileManagement.handleFileSelect(file, this);
    }

    validateFile(file) {
        return this.fileManagement.validateFile(file);
    }

    // Document processing methods (delegate to DocumentProcessing)
    async processDocument() {
        return await this.documentProcessing.processDocument(this);
    }

    // PDF methods (delegate to PDFService)
    showPdfPreview(file) {
        this.pdfService.showPdfPreview(file);
    }

    showDocumentPicker() {
        this.pdfService.showDocumentPicker(this);
    }

    loadDocument(documentId) {
        return this.pdfService.loadDocument(documentId, this);
    }

    // Rendering methods (delegate to RenderingService)
    renderCardBasedReview() {
        this.renderingService.renderCardBasedReview();
    }

    displayExtractedData() {
        this.renderingService.displayExtractedData();
    }

    // Session management methods (delegate to SessionManagement)
    async saveSession() {
        await this.sessionManagement.saveSession();
    }

    downloadModifiedJson() {
        this.sessionManagement.downloadModifiedJson(this.uploadType);
    }

    startGrading() {
        this.sessionManagement.startGrading(this.uploadType);
    }

    startNewSession() {
        this.sessionManagement.startNewSession();
    }

    // Undo/Redo methods (delegate to UndoRedo) - Phase 2 Complete: No context params
    saveState() {
        this.undoRedo.saveState();
    }

    undo() {
        this.undoRedo.undo();
    }

    redo() {
        this.undoRedo.redo();
    }

    revertToOriginal() {
        this.undoRedo.revertToOriginal();
    }

    // Card editing methods (delegate to CardEditing)
    handleCardAction(action, questionId, card) {
        this.cardEditing.handleCardAction(action, questionId, card);
    }

    updateFieldInProcessedData(questionId, fieldName, value) {
        this.cardEditing.updateFieldInProcessedData(questionId, fieldName, value);
    }

    editQuestion(questionId, card) {
        this.cardEditing.editQuestion(questionId, card);
    }

    // Question management methods (delegate to QuestionManagement)
    renderVisualEditor() {
        return this.questionManagement.renderVisualEditor();
    }

    saveVisualEditorChanges() {
        this.questionManagement.saveVisualEditorChanges();
    }

    attachAutoSaveListeners() {
        this.questionManagement.attachAutoSaveListeners();
    }

    markAsChanged() {
        this.questionManagement.markAsChanged();
    }

    // Card management methods (delegate to QuestionManagement)
    addCriterionToQuestion(questionId) {
        this.questionManagement.addCriterionToQuestion(questionId);
    }

    removeCriterionFromQuestion(questionId, criterionIndex) {
        this.questionManagement.removeCriterionFromQuestion(questionId, criterionIndex);
    }

    removeQuestion(questionId) {
        this.questionManagement.removeQuestion(questionId);
    }

    updateCriteriaInProcessedData(questionId) {
        this.questionManagement.updateCriteriaInProcessedData(questionId);
    }

    removeQuestionFromProcessedData(questionId) {
        this.questionManagement.removeQuestionFromProcessedData(questionId);
    }

    updateValidationProgress() {
        this.cardEditing.updateValidationProgress();
    }

    // Exact monolithic card event handling methods
    attachCardEventListeners() {
        this.eventManagement.attachCardEventListeners(this);
    }

    // Enterprise viewer methods (delegate to EnterpriseViewer)
    initializeEnterpriseViewer() {
        this.enterpriseViewer.initializeEnterpriseViewer();
    }

    zoomIn() {
        this.enterpriseViewer.zoomIn();
    }

    zoomOut() {
        this.enterpriseViewer.zoomOut();
    }

    fitToWidth() {
        this.enterpriseViewer.fitToWidth();
    }

    fitToHeight() {
        this.enterpriseViewer.fitToHeight();
    }

    resetZoom() {
        this.enterpriseViewer.resetZoom();
    }

    // Helper methods that maintain exact same logic as original
    
    updateNextButton() {
        this.eventManagement.updateNextButton(this);
    }

    updateDebugPrompt() {
        this.eventManagement.updateDebugPrompt(this);
    }

    getDefaultPrompt(uploadType = this.uploadType) {
        return this.sessionManagement.getDefaultPrompt(uploadType);
    }

    collectPageSelectionData() {
        return this.questionManagement.collectPageSelectionData();
    }

    // Document state integration (SSOT pattern)
    async loadFromUrlIfPresent() {
        const urlParams = new URLSearchParams(window.location.search);
        const documentId = urlParams.get('doc') || window.location.hash.split('doc=')[1]?.split('&')[0];
        
        if (documentId) {
            try {
                await this.documentState.load(documentId);
                if (this.documentState.hasData()) {
                    this.processedData = this.documentState.getCurrentData();
                    this.uploadType = this.processedData.upload_type || 'student';
                    this.currentStep = 'review';
                    this.render();
                }
            } catch (error) {
                console.error('Failed to load document from URL:', error);
            }
        }
    }

    // Cleanup method
    cleanup() {
        this.fileManagement.cleanup();
        this.documentProcessing.cleanup();
        this.pdfService.cleanup();
        this.renderingService.cleanup();
        this.enterpriseViewer.cleanup();
        this.eventManagement.cleanup();
        this.undoRedo.clear();
        this.questionManagement.cleanup();
        
        if (this.documentState) {
            this.documentState.reset();
        }
    }

    // Getter methods for backward compatibility
    getSelectedFile() {
        return this.fileManagement.getSelectedFile();
    }

    getUploadedImageUrl() {
        return this.fileManagement.uploadedImageUrl;
    }

    getPdfPageCount() {
        return this.fileManagement.pdfPageCount;
    }
}