/**
 * DocumentState - Single Source of Truth for document data
 * Follows frontend best practices: centralized state, minimal backend sync
 */
import DocumentAPI from './DocumentAPI.js';

class DocumentState {
    constructor() {
        this.api = new DocumentAPI();
        this.reset();
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.documentId = null;
        this.originalData = null;  // Keep for restore functionality
        this.currentData = null;   // Single source of truth
        this.uploadType = null;    // 'student' or 'rubric'
        this.selectedFile = null;
        this.hasUnsavedChanges = false;
        this.metadata = {};
    }

    /**
     * Initialize with new document data (from OpenAI processing)
     */
    initialize(data, uploadType, selectedFile) {
        // Create complete document with unified schema
        const completeDocument = this._createCompleteDocument(data, null, uploadType, selectedFile);
        this.originalData = JSON.parse(JSON.stringify(completeDocument));
        this.currentData = JSON.parse(JSON.stringify(completeDocument));
        this.uploadType = uploadType;
        this.selectedFile = selectedFile;
        this.hasUnsavedChanges = false;
        this.documentId = null; // Will be set when saved
        console.log('DocumentState initialized with data');
    }

    /**
     * Create complete document following unified schema
     */
    _createCompleteDocument(contentData, existingDocument = null, uploadType = 'rubric', selectedFile = null) {
        const now = new Date().toISOString();
        return {
            // Content (user-editable)
            exam_name: contentData.exam_name || '',
            general_instructions: contentData.general_instructions || '',
            questions: contentData.questions || [],
            answers: contentData.answers || {},
            student_name: contentData.student_name || '',
            
            // Metadata (system-managed) 
            document_id: existingDocument?.document_id || null,
            original_filename: existingDocument?.original_filename || selectedFile?.name || 'unknown.pdf',
            upload_type: existingDocument?.upload_type || uploadType,
            created_at: existingDocument?.created_at || now,
            updated_at: now,
            processing_status: existingDocument?.processing_status || 'completed',
            confidence: existingDocument?.confidence || contentData.confidence || 0.9,
            edit_count: (existingDocument?.edit_count || 0),
            
            // Additional metadata
            last_downloaded: existingDocument?.last_downloaded || null,
            pages_processed: existingDocument?.pages_processed || contentData.pages_processed || 1,
            extraction_method: existingDocument?.extraction_method || contentData.extraction_method || 'ai_vision',
            custom_instructions: existingDocument?.custom_instructions || contentData.custom_instructions || '',
            debug_prompt: existingDocument?.debug_prompt || contentData.debug_prompt || '',
            
            // Backup (for restore)
            original_data: existingDocument?.original_data || JSON.parse(JSON.stringify(contentData))
        };
    }

    /**
     * Update current data (when user makes edits)
     */
    updateData(newData) {
        // Maintain unified schema - merge new content with existing metadata
        const updatedDocument = this._createCompleteDocument(newData, this.currentData);
        updatedDocument.edit_count = (this.currentData?.edit_count || 0) + 1;
        this.currentData = updatedDocument;
        this.hasUnsavedChanges = true;
        console.log('DocumentState updated with new data');
        
        // Trigger observer callback to update processedData
        if (this.onDataChange) {
            this.onDataChange(this.currentData);
        }
    }

    /**
     * Get current data (SSOT for all UI)
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * Get original data (for restore functionality)
     */
    getOriginalData() {
        return this.originalData;
    }

    /**
     * Restore to original data
     */
    restore() {
        if (this.originalData) {
            this.currentData = JSON.parse(JSON.stringify(this.originalData));
            this.hasUnsavedChanges = true;
            console.log('DocumentState restored to original data');
        }
    }

    /**
     * Save to backend (user-controlled)
     */
    async save() {
        try {
            if (this.documentId) {
                // Update existing document - send complete document
                this.currentData.document_id = this.documentId; // Ensure ID is set
                await this.api.update(this.documentId, this.currentData);
                console.log('Document updated successfully');
            } else {
                // Create new document - send complete document
                const result = await this.api.save(this.currentData);
                this.documentId = result.document_id;
                this.currentData.document_id = result.document_id; // Update SSOT
                // Note: No automatic URL updating - user must explicitly load documents
                console.log('New document created with ID:', this.documentId);
            }
            
            this.hasUnsavedChanges = false;
            return this.documentId;
        } catch (error) {
            console.error('Save failed:', error);
            throw error;
        }
    }

    /**
     * Load document from backend by ID
     */
    async load(documentId) {
        try {
            const document = await this.api.load(documentId);
            
            // Load complete document - unified schema everywhere
            this.documentId = document.document_id;
            this.currentData = document; // Complete document is SSOT
            this.originalData = document.original_data || document; // Backup for restore (fallback for old format)
            this.uploadType = document.upload_type;
            this.hasUnsavedChanges = false;
            
            console.log('Document loaded successfully:', documentId);
            return true;
        } catch (error) {
            console.error('Load failed:', error);
            throw error;
        }
    }

    /**
     * Try to load from URL (only when explicitly requested)
     */
    async loadFromUrl() {
        const documentId = this.api.parseDocumentIdFromUrl();
        if (!documentId) return false;

        try {
            await this.load(documentId);
            return true;
        } catch (error) {
            console.warn('Failed to load document from URL:', error);
            this.api.clearUrlDocumentId();
            return false;
        }
    }

    /**
     * Get shareable URL
     */
    getShareableUrl() {
        return this.documentId ? this.api.createShareableUrl(this.documentId) : null;
    }

    /**
     * Export current data as JSON
     */
    exportAsJSON(filename) {
        const dataStr = JSON.stringify(this.currentData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Clear URL document ID
     */
    clearUrlDocumentId() {
        this.api.clearUrlDocumentId();
    }

    /**
     * Get metadata
     */
    getMetadata() {
        return this.metadata;
    }

    /**
     * Get upload type
     */
    getUploadType() {
        return this.uploadType;
    }

    /**
     * Check if has unsaved changes
     */
    hasChanges() {
        return this.hasUnsavedChanges;
    }

}

export default DocumentState;