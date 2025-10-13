/**
 * DocumentAPI - Simple HTTP client for document operations
 * Handles only API calls, no state management
 */
class DocumentAPI {
    constructor() {
        this.baseUrl = '/api/processed-documents';
    }

    /**
     * Save new document to backend
     */
    async save(documentData) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documentData)
        });

        if (!response.ok) {
            throw new Error(`Save failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Update existing document
     */
    async update(documentId, updates) {
        const response = await fetch(`${this.baseUrl}/${documentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Update failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Load document by ID
     */
    async load(documentId) {
        const response = await fetch(`${this.baseUrl}/${documentId}`);

        if (!response.ok) {
            throw new Error(`Load failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create shareable URL for document
     */
    createShareableUrl(documentId) {
        return `${window.location.origin}${window.location.pathname}#scan-processor?doc=${documentId}`;
    }

    /**
     * Parse document ID from URL
     */
    parseDocumentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        return urlParams.get('doc');
    }

    /**
     * Update URL with document ID
     */
    updateUrlWithDocumentId(documentId) {
        const url = new URL(window.location);
        url.hash = `#scan-processor?doc=${documentId}`;
        window.history.replaceState({}, '', url);
    }

    /**
     * Clear document ID from URL
     */
    clearUrlDocumentId() {
        const url = new URL(window.location);
        url.hash = '#scan-processor';
        window.history.replaceState({}, '', url);
    }
}

export default DocumentAPI;