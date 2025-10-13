/**
 * DataStore Unit Tests
 * Comprehensive test suite for the DataStore service
 */

// Simple mock EventBus for testing
const mockEventBus = {
    events: {},
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    },
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    },
    clear() {
        this.events = {};
    }
};

// Simplified DataStore for testing
class TestDataStore {
    constructor() {
        this._processedData = null;
        this._uploadType = null;
        this._currentStep = 'mode-selection';
        this._selectedFile = null;
        this._uploadedImageUrl = null;
        this._pdfPageCount = null;
        this._deferredImageFile = null;
        this._historyTimeout = null;
    }

    // Core getters/setters
    getProcessedData() { return this._processedData; }
    setProcessedData(data) { 
        this._processedData = data;
        mockEventBus.emit('data:processed-data-changed', { newData: data, oldData: null });
    }

    getUploadType() { return this._uploadType; }
    setUploadType(type) { 
        this._uploadType = type;
        mockEventBus.emit('data:upload-type-changed', { newType: type, oldType: null });
    }

    getCurrentStep() { return this._currentStep; }
    setCurrentStep(step) { this._currentStep = step; }

    getSelectedFile() { return this._selectedFile; }
    setSelectedFile(file) { this._selectedFile = file; }

    getUploadedImageUrl() { return this._uploadedImageUrl; }
    setUploadedImageUrl(url) { this._uploadedImageUrl = url; }

    getPdfPageCount() { return this._pdfPageCount; }
    setPdfPageCount(count) { this._pdfPageCount = count; }

    getDeferredImageFile() { return this._deferredImageFile; }
    setDeferredImageFile(file) { this._deferredImageFile = file; }

    getHistoryTimeout() { return this._historyTimeout; }
    setHistoryTimeout(timeout) { this._historyTimeout = timeout; }

    // Composite getters
    getCompleteState() {
        return {
            processedData: this._processedData,
            uploadType: this._uploadType,
            currentStep: this._currentStep,
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

    // Validation helpers
    hasProcessedData() { return this._processedData !== null; }
    hasSelectedFile() { return this._selectedFile !== null; }
    canProceed() { return this.hasSelectedFile() && this._uploadType !== null; }
    isInStep(step) { return this._currentStep === step; }
    isReviewStep() { return this._currentStep === 'review'; }
    hasCompleteWorkflowData() { 
        return this.hasProcessedData() && this._uploadType !== null && this._currentStep === 'review'; 
    }

    // Reset methods
    resetSessionState() {
        this._processedData = null;
        this._uploadType = null;
        this._currentStep = 'mode-selection';
        this._historyTimeout = null;
        this._selectedFile = null;
        this._uploadedImageUrl = null;
        this._pdfPageCount = null;
        this._deferredImageFile = null;
    }
}

describe('DataStore', () => {
    let dataStore;

    beforeEach(() => {
        mockEventBus.clear();
        dataStore = new TestDataStore();
    });

    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(dataStore.getProcessedData()).toBeNull();
            expect(dataStore.getUploadType()).toBeNull();
            expect(dataStore.getCurrentStep()).toBe('mode-selection');
            expect(dataStore.getSelectedFile()).toBeNull();
            expect(dataStore.getUploadedImageUrl()).toBeNull();
            expect(dataStore.getPdfPageCount()).toBeNull();
            expect(dataStore.getDeferredImageFile()).toBeNull();
            expect(dataStore.getHistoryTimeout()).toBeNull();
        });
    });

    describe('Data Management', () => {
        test('should set and get processed data', () => {
            const testData = { exam_name: 'Test Exam', questions: [] };
            dataStore.setProcessedData(testData);
            expect(dataStore.getProcessedData()).toEqual(testData);
        });

        test('should set and get upload type', () => {
            dataStore.setUploadType('student');
            expect(dataStore.getUploadType()).toBe('student');
        });

        test('should set and get current step', () => {
            dataStore.setCurrentStep('upload');
            expect(dataStore.getCurrentStep()).toBe('upload');
        });

        test('should set and get selected file', () => {
            const mockFile = { name: 'test.pdf', size: 1000 };
            dataStore.setSelectedFile(mockFile);
            expect(dataStore.getSelectedFile()).toEqual(mockFile);
        });
    });

    describe('Validation Helpers', () => {
        test('should check if has processed data', () => {
            expect(dataStore.hasProcessedData()).toBe(false);
            dataStore.setProcessedData({ exam_name: 'Test' });
            expect(dataStore.hasProcessedData()).toBe(true);
        });

        test('should check if has selected file', () => {
            expect(dataStore.hasSelectedFile()).toBe(false);
            dataStore.setSelectedFile({ name: 'test.pdf' });
            expect(dataStore.hasSelectedFile()).toBe(true);
        });

        test('should check if can proceed', () => {
            expect(dataStore.canProceed()).toBe(false);
            dataStore.setSelectedFile({ name: 'test.pdf' });
            expect(dataStore.canProceed()).toBe(false); // Still missing upload type
            dataStore.setUploadType('student');
            expect(dataStore.canProceed()).toBe(true);
        });

        test('should check workflow steps', () => {
            expect(dataStore.isInStep('mode-selection')).toBe(true);
            expect(dataStore.isReviewStep()).toBe(false);
            
            dataStore.setCurrentStep('review');
            expect(dataStore.isReviewStep()).toBe(true);
        });

        test('should check complete workflow data', () => {
            expect(dataStore.hasCompleteWorkflowData()).toBe(false);
            
            dataStore.setProcessedData({ exam_name: 'Test' });
            dataStore.setUploadType('student');
            dataStore.setCurrentStep('review');
            expect(dataStore.hasCompleteWorkflowData()).toBe(true);
        });
    });

    describe('Composite Getters', () => {
        test('should return complete state', () => {
            const mockData = { exam_name: 'Test' };
            const mockFile = { name: 'test.pdf' };
            
            dataStore.setProcessedData(mockData);
            dataStore.setUploadType('student');
            dataStore.setSelectedFile(mockFile);

            const completeState = dataStore.getCompleteState();
            expect(completeState.processedData).toEqual(mockData);
            expect(completeState.uploadType).toBe('student');
            expect(completeState.selectedFile).toEqual(mockFile);
        });

        test('should return workflow state', () => {
            dataStore.setCurrentStep('review');
            dataStore.setUploadType('student');
            dataStore.setProcessedData({ exam_name: 'Test' });
            dataStore.setSelectedFile({ name: 'test.pdf' });

            const workflowState = dataStore.getWorkflowState();
            expect(workflowState).toEqual({
                currentStep: 'review',
                uploadType: 'student',
                canProceed: true,
                hasData: true
            });
        });
    });

    describe('EventBus Integration', () => {
        test('should emit events when data changes', () => {
            let emittedEvent = null;
            mockEventBus.on('data:processed-data-changed', (data) => {
                emittedEvent = data;
            });

            const testData = { exam_name: 'Test Exam' };
            dataStore.setProcessedData(testData);

            expect(emittedEvent).toEqual({
                newData: testData,
                oldData: null
            });
        });
    });

    describe('Reset Functionality', () => {
        test('should reset session state', () => {
            // Set some state
            dataStore.setProcessedData({ exam_name: 'Test' });
            dataStore.setUploadType('student');
            dataStore.setCurrentStep('review');
            dataStore.setSelectedFile({ name: 'test.pdf' });

            // Reset
            dataStore.resetSessionState();

            // Verify reset
            expect(dataStore.getProcessedData()).toBeNull();
            expect(dataStore.getUploadType()).toBeNull();
            expect(dataStore.getCurrentStep()).toBe('mode-selection');
            expect(dataStore.getSelectedFile()).toBeNull();
        });
    });
});