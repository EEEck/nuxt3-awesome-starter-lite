/**
 * PDF Service
 * Exact methods extracted from ScanProcessor for PDF preview, document picker, and document loading
 */
import { eventBus } from '/utils/EventBus.js';

export default class PDFService {
    constructor() {
        // This service manages PDF-related functionality
    }

    /**
     * Show PDF preview (exact copy from line 2931)
     */
    async showPdfPreview(selectedFile) {
        if (!selectedFile || selectedFile.type !== 'application/pdf') {
            return;
        }

        const modal = document.getElementById('pdf-preview-modal');
        const container = document.getElementById('pdf-preview-container');
        
        modal.style.display = 'flex';
        container.innerHTML = '<div class="loading-message text-center py-8 text-white">Loading PDF preview...</div>';

        try {
            // Simple fallback preview using the existing viewer logic
            // Create a temporary object URL for the PDF
            const pdfUrl = URL.createObjectURL(selectedFile);
            
            // Use iframe for basic PDF preview (simpler than PDF.js)
            container.innerHTML = `
                <div class="pdf-preview-wrapper">
                    <p class="text-white mb-4">PDF Preview - ${selectedFile.name}</p>
                    <iframe src="${pdfUrl}" 
                            style="width: 100%; height: 500px; border: 2px solid #374151; border-radius: 8px; background: white;">
                        <p>Your browser doesn't support PDF preview. You can still process the file normally.</p>
                    </iframe>
                    <p class="text-sm text-gray-400 mt-2">
                        Use the page selection above to choose which pages to process.
                    </p>
                </div>
            `;
            
            // Clean up URL after modal is closed
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
            
        } catch (error) {
            console.error('Error showing PDF preview:', error);
            container.innerHTML = `
                <div class="error-message text-center py-8">
                    <p class="text-white">Unable to preview PDF. You can still process it normally.</p>
                    <p class="text-sm text-gray-400 mt-2">Error: ${error.message}</p>
                </div>
            `;
        }
    }

    /**
     * Hide PDF preview (exact copy from line 2975)
     */
    hidePdfPreview() {
        const modal = document.getElementById('pdf-preview-modal');
        modal.style.display = 'none';
    }

    /**
     * Show document picker (exact copy from line 2980)
     */
    async showDocumentPicker() {
        const modal = document.getElementById('document-picker-modal');
        const loadingDiv = document.getElementById('document-list-loading');
        const containerDiv = document.getElementById('document-list-container');
        const listDiv = document.getElementById('document-list');
        const noDocsDiv = document.getElementById('no-documents-message');
        
        if (!modal) {
            console.error('Document picker modal not found in DOM');
            return;
        }
        
        // Show modal and loading state with explicit styling
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '9999';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        loadingDiv.style.display = 'block';
        containerDiv.style.display = 'none';
        
        try {
            // Fetch all saved documents from backend
            const response = await fetch('/api/processed-documents');
            if (!response.ok) {
                throw new Error(`Failed to fetch documents: ${response.statusText}`);
            }
            
            const documents = await response.json();
            
            // Hide loading, show container
            loadingDiv.style.display = 'none';
            containerDiv.style.display = 'block';
            
            if (documents.length === 0) {
                // No documents found
                listDiv.innerHTML = '';
                noDocsDiv.style.display = 'block';
            } else {
                // Show documents list
                noDocsDiv.style.display = 'none';
                this.renderDocumentList(documents, listDiv);
            }
            
            // Initialize icons
            lucide.createIcons();
            
        } catch (error) {
            console.error('Failed to load documents:', error);
            loadingDiv.style.display = 'none';
            containerDiv.style.display = 'block';
            listDiv.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-2"></i>
                    <p>Failed to load documents</p>
                    <p class="text-sm">${error.message}</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    /**
     * Hide document picker (exact copy from line 3048)
     */
    hideDocumentPicker() {
        const modal = document.getElementById('document-picker-modal');
        modal.style.display = 'none';
    }

    /**
     * Render document list (exact copy from line 3053)
     */
    renderDocumentList(documents, container) {
        container.innerHTML = documents.map(doc => {
            const uploadTypeIcon = doc.upload_type === 'student' ? '📝' : '📋';
            const uploadTypeLabel = doc.upload_type === 'student' ? 'Student' : 'Rubric';
            
            // Truncate filename to first 15 characters
            const shortFilename = doc.original_filename.length > 15 
                ? doc.original_filename.substring(0, 15) + '...'
                : doc.original_filename;
            
            // Format last modified date
            const lastModified = new Date(doc.updated_at).toLocaleString();
            
            return `
                <div class="document-item p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                     data-document-id="${doc.document_id}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="text-xl">${uploadTypeIcon}</div>
                            <div>
                                <h4 class="font-medium text-white">${shortFilename}</h4>
                                <p class="text-sm text-gray-400">${uploadTypeLabel}</p>
                            </div>
                        </div>
                        <div class="text-right text-sm text-gray-400">
                            <p>Modified:</p>
                            <p>${lastModified}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add click event listeners to each document item
        container.querySelectorAll('.document-item').forEach(item => {
            item.addEventListener('click', () => {
                const documentId = item.dataset.documentId;
                // Phase 2 Complete: EventBus-only approach
                eventBus.emit('pdf:load-document', { documentId });
            });
        });
    }

    /**
     * Load document (exact copy from line 3095)
     */
    async loadDocument(documentId) {
        try {
            // Hide the document picker modal
            this.hideDocumentPicker();
            
            // Phase 2 Complete: EventBus-only approach - request document load
            eventBus.emit('data:load-document', { 
                documentId,
                callback: async (documentData) => {
                    if (!documentData) {
                        throw new Error('Failed to load document data');
                    }
                    
                    // Continue with image restoration
                    this.handleDocumentImageRestoration(documentData);
                }
            });
            
        } catch (error) {
            console.error('Failed to load document:', error);
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('ui:show-error-modal', { 
                title: 'Load Error', 
                message: `Failed to load document: ${error.message}` 
            });
        }
    }
    
    /**
     * Handle document image restoration (helper method)
     */
    handleDocumentImageRestoration(documentData) {
        // Check for image in main data, original_data, or processed_page_images
        let imageBase64 = documentData.image_base64 || 
                         documentData.original_data?.image_base64 ||
                         documentData.original_data?.processed_page_images?.[0]?.image_base64;
        
        if (imageBase64) {
            // Convert base64 back to blob URL for display
            const base64Data = imageBase64.startsWith('data:') 
                ? imageBase64 
                : `data:image/jpeg;base64,${imageBase64}`;
            
            const byteCharacters = atob(base64Data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('file:restore-image', { imageUrl: URL.createObjectURL(blob) });
        }
        
        // Phase 2 Complete: EventBus-only approach - trigger UI update
        eventBus.emit('pdf:document-loaded', { 
            documentData,
            uploadType: documentData.upload_type || 'student'
        });
            
        console.log('Document loaded successfully, skipped to review stage:', documentData?.document_id);
    }

    /**
     * Set up click handlers for document items (helper method)
     */
    setupDocumentClickHandlers(container) {
        container.querySelectorAll('.document-item').forEach(item => {
            item.addEventListener('click', () => {
                const documentId = item.dataset.documentId;
                // Phase 2 Complete: EventBus-only approach
                eventBus.emit('pdf:load-document', { documentId });
            });
        });
    }
}