/**
 * Document Processing Service
 * Exact methods extracted from ScanProcessor for document processing, validation, and API communication
 */
import { eventBus } from '/utils/EventBus.js';

export default class DocumentProcessing {
    constructor() {
        this.pageSelectionData = null;
    }

    /**
     * Process document (exact copy from line 934)
     */
    async processDocument(uploadType) {
        // IMPORTANT: Collect form data BEFORE render() which resets the DOM
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('file:collect-page-selection', {
            callback: (pageSelectionData) => {
                this.pageSelectionData = pageSelectionData;
            }
        });
        
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('ui:step-change', 'process');
        eventBus.emit('ui:render');
        
        // Hide next buttons during processing since it auto-advances
        const nextBtn = document.getElementById('next-btn');
        const nextBtnTop = document.getElementById('next-btn-top');
        if (nextBtn) nextBtn.style.display = 'none';
        if (nextBtnTop) nextBtnTop.style.display = 'none';

        const endpoint = uploadType === 'student' 
            ? '/api/process-student-scan' 
            : '/api/process-rubric-scan';

        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                this.updateProcessingStatus('processing', 'AI Vision Processing', 
                    retryCount > 0 ? `Advanced retry ${retryCount}/${maxRetries} - Deploying enhanced neural networks` : 'Processing multi-page document... This may take up to 2 minutes for high-quality results');

                const formData = new FormData();
                // Phase 2 Complete: EventBus-only approach
                let selectedFile = null;
                eventBus.emit('file:get-selected', {
                    callback: (file) => { selectedFile = file; }
                });
                formData.append('file', selectedFile);
                
                // Add custom instructions if provided
                const customInstructions = document.getElementById('custom-instructions')?.value?.trim();
                if (customInstructions) {
                    formData.append('custom_instructions', customInstructions);
                }

                // Add debug prompt if provided (for testing)
                const debugPrompt = document.getElementById('debug-prompt')?.value?.trim();
                // Phase 2 Complete: EventBus-only approach
                let defaultPrompt = null;
                eventBus.emit('processing:get-default-prompt', {
                    uploadType,
                    callback: (prompt) => { defaultPrompt = prompt; }
                });
                if (debugPrompt && debugPrompt !== defaultPrompt) {
                    formData.append('debug_prompt', debugPrompt);
                }

                // Add page selection for PDFs (using pre-collected data to avoid DOM reset issues)
                if (this.pageSelectionData) {
                    if (this.pageSelectionData.type === 'custom' && this.pageSelectionData.customPages) {
                        formData.append('pages', this.pageSelectionData.customPages);
                    }
                }
                // 'all' is the default, so we don't need to send it

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout for multi-page processing

                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage;
                    
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.detail || errorData.message || 'Unknown error occurred';
                    } catch {
                        errorMessage = errorText || `Server error: ${response.status} ${response.statusText}`;
                    }

                    throw new Error(errorMessage);
                }

                const result = await response.json();
                
                // Validate the response structure
                const validationResult = this.validateProcessingResult(result, uploadType);
                if (!validationResult.valid) {
                    throw new Error(`Invalid response format: ${validationResult.error}`);
                }


                // Phase 2 Complete: EventBus-only approach - initialize document state
                eventBus.emit('data:initialize-document', {
                    result,
                    uploadType,
                    selectedFile,
                    callback: async (success) => {
                        if (success) {
                            // Auto-save the document
                            eventBus.emit('data:save-document');
                            
                            this.updateProcessingStatus('success', 'AI Processing Complete!', 'Advanced neural networks have successfully extracted and structured your document content');
                            this.showResults();
                        } else {
                            throw new Error('Failed to initialize document state');
                        }
                    }
                });
                return; // Success, exit retry loop

            } catch (error) {
                console.error(`Processing error (attempt ${retryCount + 1}):`, error);
                
                if (error.name === 'AbortError') {
                    this.handleProcessingError('Request Timeout', 'The processing request timed out. Please try again with a smaller file or check your connection.', retryCount < maxRetries);
                } else if (error.message.includes('Failed to fetch')) {
                    this.handleProcessingError('Network Error', 'Unable to connect to the processing server. Please check your internet connection and try again.', retryCount < maxRetries);
                } else if (error.message.includes('413') || error.message.includes('too large')) {
                    this.handleProcessingError('File Too Large', 'The file is too large to process. Please use a smaller file (under 50MB).', false);
                    return; // Don't retry for file size errors
                } else if (error.message.includes('422') || error.message.includes('validation')) {
                    this.handleProcessingError('Invalid File', 'The file format is not supported or the file is corrupted. Please try a different file.', false);
                    return; // Don't retry for validation errors
                } else {
                    this.handleProcessingError('Processing Failed', error.message, retryCount < maxRetries);
                }

                retryCount++;
                
                if (retryCount <= maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
                }
            }
        }
    }

    /**
     * Validate processing result (exact copy from line 1053)
     */
    validateProcessingResult(result, uploadType) {
        if (!result || typeof result !== 'object') {
            return { valid: false, error: 'Response is not a valid object' };
        }

        if (uploadType === 'student') {
            if (!result.student_name) {
                return { valid: false, error: 'Missing student_name field' };
            }
            if (!result.answers || typeof result.answers !== 'object') {
                return { valid: false, error: 'Missing or invalid answers field' };
            }
            if (Object.keys(result.answers).length === 0) {
                return { valid: false, error: 'No answers were extracted from the document' };
            }
        } else {
            if (!result.exam_name) {
                return { valid: false, error: 'Missing exam_name field' };
            }
            if (!result.questions || !Array.isArray(result.questions)) {
                return { valid: false, error: 'Missing or invalid questions field' };
            }
            if (result.questions.length === 0) {
                return { valid: false, error: 'No questions were extracted from the document' };
            }
            
            // Validate question structure
            for (let i = 0; i < result.questions.length; i++) {
                const q = result.questions[i];
                if (!q.question_id || !q.question_text || !q.criteria) {
                    return { valid: false, error: `Question ${i + 1} has invalid structure` };
                }
            }
        }

        return { valid: true };
    }

    /**
     * Handle processing error (exact copy from line 1091)
     */
    handleProcessingError(title, message, canRetry) {
        if (canRetry) {
            this.updateProcessingStatus('retry', title, message);
        } else {
            this.updateProcessingStatus('error', title, message);
            
            // Show detailed error modal after a brief delay
            setTimeout(() => {
                this.showProcessingErrorModal(title, message);
            }, 2000);
        }
    }

    /**
     * Show processing error modal (exact copy from line 1104)
     */
    showProcessingErrorModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 style="color: var(--accent-red);">
                        <i data-lucide="alert-triangle" class="w-5 h-5 inline mr-2"></i>
                        ${title}
                    </h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                        <p class="text-gray-300 mb-3">${message}</p>
                    </div>
                    
                    <div class="space-y-3">
                        <h4 class="text-white font-medium">Troubleshooting Tips:</h4>
                        <ul class="text-sm text-gray-400 space-y-2 ml-4">
                            <li>• Ensure the document has clear, readable text</li>
                            <li>• Try a higher quality scan or image</li>
                            <li>• Make sure the file is not corrupted</li>
                            <li>• Check that your internet connection is stable</li>
                            <li>• Reduce file size if it's very large</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="back-to-upload">Back to Upload</button>
                    <button class="btn btn-primary" id="try-again">Try Again</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle modal actions
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#back-to-upload').addEventListener('click', () => {
            modal.remove();
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('ui:step-change', 'upload');
            eventBus.emit('ui:render');
        });
        modal.querySelector('#try-again').addEventListener('click', () => {
            modal.remove();
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('processing:retry-document');
        });
        
        // Initialize icons for the modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Update processing status (exact copy from line 1159)
     */
    updateProcessingStatus(status, title, message) {
        const statusIcon = document.getElementById('status-icon');
        const statusTitle = document.getElementById('status-title');
        const statusMessage = document.getElementById('status-message');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        // Update icon using Lucide icons
        if (status === 'success') {
            statusIcon.setAttribute('data-lucide', 'check-circle');
            statusIcon.style.color = 'var(--accent-green)';
            statusIcon.style.animation = 'none';
            progressFill.style.width = '100%';
            progressFill.style.background = 'linear-gradient(90deg, var(--accent-green), var(--accent-teal))';
            if (progressText) progressText.textContent = 'Processing complete! Preparing results...';
        } else if (status === 'error') {
            statusIcon.setAttribute('data-lucide', 'alert-circle');
            statusIcon.style.color = 'var(--accent-red)';
            statusIcon.style.animation = 'none';
            progressFill.style.width = '100%';
            progressFill.style.background = 'var(--accent-red)';
            if (progressText) progressText.textContent = 'Processing failed. Please try again.';
        } else if (status === 'retry') {
            statusIcon.setAttribute('data-lucide', 'refresh-cw');
            statusIcon.style.color = 'var(--accent-yellow)';
            statusIcon.style.animation = 'spin 2s linear infinite';
            progressFill.style.width = '75%';
            progressFill.style.background = 'linear-gradient(90deg, var(--accent-yellow), var(--accent-teal))';
            if (progressText) progressText.textContent = 'Retrying with advanced processing algorithms...';
        } else if (status === 'processing') {
            statusIcon.setAttribute('data-lucide', 'brain');
            statusIcon.style.color = 'var(--accent-blue)';
            statusIcon.style.animation = 'pulse 2s infinite';
            progressFill.style.width = '60%';
            progressFill.style.background = 'linear-gradient(90deg, var(--accent-blue), var(--accent-teal))';
            if (progressText) progressText.textContent = 'Analyzing document structure and extracting content...';
        }

        statusTitle.textContent = title;
        statusMessage.textContent = message;
        
        // Re-initialize Lucide icons for the updated icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Show results (exact copy from line 1206)
     */
    showResults() {
        setTimeout(() => {
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('ui:step-change', 'review');
            eventBus.emit('ui:render');
            eventBus.emit('ui:render-cards');
            eventBus.emit('ui:show-review-buttons');
            eventBus.emit('ui:attach-review-listeners');
            
            // Processing complete - ready for user edits
        }, 2000);
    }

    /**
     * Show review buttons (exact copy from line 1218)
     */
    showReviewButtons() {
        // Hide Next button since we're in review mode and processing is complete
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.style.display = 'none';
        
        // Hide back button as well since we don't want to go back to processing
        const backBtn = document.getElementById('back-btn');
        if (backBtn) backBtn.style.display = 'none';
    }
}