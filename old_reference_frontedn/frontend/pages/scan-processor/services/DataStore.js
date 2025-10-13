/**
 * DataStore Service
 * Centralized state management for scan processor with reactive updates
 * 
 * This service implements the Single Source of Truth pattern with EventBus
 * integration for reactive updates across all services.
 */
import { eventBus } from '/utils/EventBus.js';

class DataStore {
    constructor() {
        // Core state properties (legacy)
        this._processedData = null;
        this._uploadType = null;
        this._currentStep = 'mode-selection';
        this._selectedFile = null;
        this._uploadedImageUrl = null;
        this._pdfPageCount = null;
        this._deferredImageFile = null;
        this._historyTimeout = null;
        
        // New state object (refactored)
        this._state = {
            currentStep: 'mode-selection',
            processedData: null,
            cardsById: {}
        };
        
        // Setup EventBus listeners for external state updates
        // NOTE: These may be removed once dependency injection is complete
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for external state updates
        eventBus.on('datastore:set-processed-data', (data) => {
            this.setProcessedData(data.processedData);
        });
        
        eventBus.on('datastore:set-upload-type', (data) => {
            this.setUploadType(data.uploadType);
        });
        
        eventBus.on('datastore:set-current-step', (data) => {
            this.setCurrentStep(data.step);
        });

        eventBus.on('datastore:set-selected-file', (data) => {
            this.setSelectedFile(data.file);
        });

        eventBus.on('datastore:set-uploaded-image-url', (data) => {
            this.setUploadedImageUrl(data.imageUrl);
        });
    }

    // Processed Data Management
    getProcessedData() {
        return this._state.processedData;
    }

    setProcessedData(pd) {
        this._state.processedData = pd;
        eventBus.emit('data:processed-data-changed', { processedData: pd });
    }

    // Upload Type Management
    getUploadType() {
        return this._uploadType;
    }

    setUploadType(uploadType) {
        const oldType = this._uploadType;
        this._uploadType = uploadType;
        
        eventBus.emit('data:upload-type-changed', {
            newType: uploadType,
            oldType: oldType
        });
        
        console.log('📊 DataStore: Upload type updated to:', uploadType);
    }

    // Current Step Management
    getCurrentStep() {
        return this._state.currentStep;
    }

    setCurrentStep(step) {
        if (this._state.currentStep === step) return;
        this._state.currentStep = step;
        eventBus.emit('data:current-step-changed', { step });
    }

    // Selected File Management
    getSelectedFile() {
        return this._selectedFile;
    }

    setSelectedFile(file) {
        const oldFile = this._selectedFile;
        this._selectedFile = file;
        
        eventBus.emit('data:selected-file-changed', {
            newFile: file,
            oldFile: oldFile
        });
        
        console.log('📊 DataStore: Selected file updated:', file?.name);
    }

    // Uploaded Image URL Management
    getUploadedImageUrl() {
        return this._uploadedImageUrl;
    }

    setUploadedImageUrl(imageUrl) {
        const oldUrl = this._uploadedImageUrl;
        this._uploadedImageUrl = imageUrl;
        
        eventBus.emit('data:uploaded-image-url-changed', {
            newUrl: imageUrl,
            oldUrl: oldUrl
        });
        
        console.log('📊 DataStore: Uploaded image URL updated');
    }

    // PDF Page Count Management
    getPdfPageCount() {
        return this._pdfPageCount;
    }

    setPdfPageCount(count) {
        this._pdfPageCount = count;
        eventBus.emit('data:pdf-page-count-changed', { count });
        console.log('📊 DataStore: PDF page count updated to:', count);
    }

    // Deferred Image File Management
    getDeferredImageFile() {
        return this._deferredImageFile;
    }

    setDeferredImageFile(file) {
        this._deferredImageFile = file;
        eventBus.emit('data:deferred-image-file-changed', { file });
        console.log('📊 DataStore: Deferred image file updated');
    }

    // History Timeout Management
    getHistoryTimeout() {
        return this._historyTimeout;
    }

    setHistoryTimeout(timeout) {
        this._historyTimeout = timeout;
        eventBus.emit('data:history-timeout-changed', { timeout });
        console.log('📊 DataStore: History timeout updated');
    }

    // Composite data getters for convenience
    getFileDisplayData() {
        return {
            selectedFile: this._selectedFile,
            uploadedImageUrl: this._uploadedImageUrl,
            deferredImageFile: this._deferredImageFile
        };
    }

    getCompleteState() {
        return {
            processedData: this._state.processedData,
            uploadType: this._uploadType,
            currentStep: this._state.currentStep,
            selectedFile: this._selectedFile,
            uploadedImageUrl: this._uploadedImageUrl,
            pdfPageCount: this._pdfPageCount,
            deferredImageFile: this._deferredImageFile,
            historyTimeout: this._historyTimeout
        };
    }

    getWorkflowState() {
        return {
            currentStep: this._currentStep,
            uploadType: this._uploadType,
            canProceed: this.canProceed(),
            hasData: this.hasProcessedData()
        };
    }

    // State reset methods
    resetFileState() {
        this.setSelectedFile(null);
        this.setUploadedImageUrl(null);
        this.setPdfPageCount(null);
        this.setDeferredImageFile(null);
        console.log('📊 DataStore: File state reset');
    }

    resetSessionState() {
        this.setProcessedData(null);
        this.setUploadType(null);
        this.setCurrentStep('mode-selection');
        this.setHistoryTimeout(null);
        this.resetFileState();
        console.log('📊 DataStore: Session state reset');
    }

    // Validation helpers
    hasProcessedData() {
        return this._processedData !== null;
    }

    hasSelectedFile() {
        return this._selectedFile !== null;
    }

    canProceed() {
        return this.hasSelectedFile() && this._uploadType !== null;
    }

    // Additional workflow validation helpers
    isInStep(step) {
        return this._currentStep === step;
    }

    isProcessingStep() {
        return this._currentStep === 'process';
    }

    isReviewStep() {
        return this._currentStep === 'review';
    }

    isUploadStep() {
        return this._currentStep === 'upload';
    }

    hasCompleteWorkflowData() {
        return this.hasProcessedData() && this._uploadType !== null && this._currentStep === 'review';
    }

    // Debug helper
    debugState() {
        console.log('📊 DataStore Current State:', {
            processedData: !!this._processedData,
            uploadType: this._uploadType,
            currentStep: this._currentStep,
            selectedFile: this._selectedFile?.name,
            hasImageUrl: !!this._uploadedImageUrl,
            pdfPageCount: this._pdfPageCount,
            hasHistoryTimeout: !!this._historyTimeout
        });
        
        console.log('📊 DataStore Workflow Status:', this.getWorkflowState());
    }

    // Cards
    ensureCard(id) {
        if (!this._state.cardsById[id]) {
            this._state.cardsById[id] = { id, flagged: false, accepted: false };
        }
        return this._state.cardsById[id];
    }

    getCard(id) { 
        return this._state.cardsById[id] || null; 
    }

    setCard(id, patch) {
        const prev = this.ensureCard(id);
        const next = { ...prev, ...patch };
        this._state.cardsById[id] = next;
        eventBus.emit('data:card-updated', { id, card: next });
        return next;
    }

    toggleFlag(id) {
        console.log('📊 DataStore: Toggling flag for card:', id);
        const c = this.ensureCard(id);
        const wasFlags = c.flagged;
        const next = { flagged: !c.flagged, accepted: false };
        const result = this.setCard(id, next);
        console.log('📊 DataStore: Flag toggle result:', id, 'flagged:', result.flagged);
        return result;
    }

    toggleAccept(id) {
        console.log('📊 DataStore: Toggling accept for card:', id);
        const c = this.ensureCard(id);
        const wasAccepted = c.accepted;
        const next = { accepted: !c.accepted, flagged: false };
        const result = this.setCard(id, next);
        console.log('📊 DataStore: Accept toggle result:', id, 'accepted:', result.accepted);
        return result;
    }

    // Migration helper - disable EventBus listeners if needed
    disableEventListeners() {
        // Remove all EventBus listeners to prevent conflicts during migration
        eventBus.off('datastore:set-processed-data');
        eventBus.off('datastore:set-upload-type'); 
        eventBus.off('datastore:set-current-step');
        eventBus.off('datastore:set-selected-file');
        eventBus.off('datastore:set-uploaded-image-url');
        console.log('📊 DataStore: EventBus listeners disabled');
    }
}

// Export singleton instance for clean imports across services
export default new DataStore();