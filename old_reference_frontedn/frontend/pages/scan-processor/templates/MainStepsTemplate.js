/**
 * Main Steps Template (Upload/Process/Review)
 * Exact HTML template extracted from render() method (lines 182-510)
 */
export function getMainStepsTemplate(currentStep, uploadType, processedData, renderConfidenceIndicator, getDefaultPrompt) {
    return `
            <div class="scan-processor-container">
                <div class="page-header">
                    <h1>Document Scan Processor</h1>
                    <p>Convert scanned student worksheets and rubrics to digital format</p>
                </div>

                <!-- Step Navigation -->
                <div class="step-nav">
                    <div class="step ${currentStep === 'upload' ? 'active' : ''}" data-step="upload">
                        <div class="step-number">1</div>
                        <div class="step-title">Upload</div>
                    </div>
                    <div class="step ${currentStep === 'process' ? 'active' : ''}" data-step="process">
                        <div class="step-number">2</div>
                        <div class="step-title">Process</div>
                    </div>
                    <div class="step ${currentStep === 'review' ? 'active' : ''}" data-step="review">
                        <div class="step-number">3</div>
                        <div class="step-title">Review</div>
                    </div>
                </div>

                <!-- Upload Step -->
                <div class="step-content ${currentStep === 'upload' ? 'active' : ''}" id="upload-step">
                    <div class="upload-section">
                        <!-- Back to Mode Selection -->
                        <div class="top-action-area" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <button class="btn btn-secondary" id="back-to-mode-selection">
                                <i data-lucide="arrow-left" class="btn-icon"></i>
                                Back to Mode Selection
                            </button>
                            <button class="btn btn-primary" id="next-btn-top" disabled>Next</button>
                        </div>
                        
                        <div class="upload-type-selector">
                            <div class="upload-type ${uploadType === 'student' ? 'selected' : ''}" 
                                 data-type="student">
                                <div class="upload-icon">📝</div>
                                <h3>Student Worksheet</h3>
                                <p>Scanned student answers to extract responses</p>
                            </div>
                            <div class="upload-type ${uploadType === 'rubric' ? 'selected' : ''}" 
                                 data-type="rubric">
                                <div class="upload-icon">📋</div>
                                <h3>Rubric/Answer Key</h3>
                                <p>Teacher rubric with correct answers and scoring</p>
                            </div>
                        </div>

                        <div class="file-upload-area">
                            <input type="file" id="file-input" accept=".pdf,.jpg,.jpeg,.png" hidden>
                            <div class="upload-dropzone" id="upload-dropzone">
                                <div class="upload-icon-large">📁</div>
                                <h3>Drop your file here or click to browse</h3>
                                <p>Supports PDF, JPEG, PNG formats</p>
                                <button class="btn btn-primary" id="browse-btn">Browse Files</button>
                            </div>
                        </div>

                        <!-- PDF Page Selection (only shows for PDFs) -->
                        <div id="pdf-page-selector" class="page-selector-section" style="display: none; margin-top: 1.5rem;">
                            <div class="form-group">
                                <label for="page-selection-type" class="form-label">
                                    📄 Pages to Process
                                </label>
                                <select id="page-selection-type" class="form-input">
                                    <option value="all">All Pages</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                                
                                <!-- Custom range input (hidden by default) -->
                                <div id="custom-range-input" style="display: none; margin-top: 0.5rem;">
                                    <div class="relative">
                                        <input type="text" id="custom-pages" class="form-input" 
                                               placeholder="Examples: 1-3 (pages 1 to 3), 2,4,6 (specific pages), 1,3-5 (mixed ranges)"
                                               style="font-family: monospace;">
                                    </div>
                                    <div id="range-validation" class="mt-1" style="display: none;">
                                        <!-- Validation messages will appear here -->
                                    </div>
                                </div>
                                
                                <!-- PDF Preview Button -->
                                <div style="margin-top: 0.75rem;">
                                    <button type="button" id="preview-pdf-btn" class="btn btn-secondary btn-sm">
                                        <i data-lucide="eye" class="w-4 h-4"></i>
                                        Preview PDF Pages
                                    </button>
                                </div>
                                
                                <div class="form-help">
                                    Preview your PDF to see which pages contain the content you want to process.
                                </div>
                            </div>
                        </div>

                        <!-- PDF Preview Modal -->
                        <div id="pdf-preview-modal" class="modal-overlay" style="display: none;">
                            <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
                                <div class="modal-header">
                                    <h3>PDF Preview</h3>
                                    <button class="modal-close" id="close-pdf-preview">
                                        <i data-lucide="x" class="w-5 h-5"></i>
                                    </button>
                                </div>
                                <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                                    <div id="pdf-preview-container" class="space-y-4">
                                        <!-- PDF pages will be rendered here -->
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn btn-primary" id="close-pdf-preview-btn">Done</button>
                                </div>
                            </div>
                        </div>

                        <!-- Document Picker Modal -->
                        <div id="document-picker-modal" class="modal-overlay" style="display: none;">
                            <div class="modal-content" style="max-width: 600px;">
                                <div class="modal-header">
                                    <h3>Load Previous Document</h3>
                                    <button class="modal-close" id="close-document-picker">
                                        <i data-lucide="x" class="w-5 h-5"></i>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div id="document-list-loading" class="text-center py-4">
                                        <i data-lucide="loader" class="w-6 h-6 animate-spin mx-auto mb-2"></i>
                                        <p>Loading saved documents...</p>
                                    </div>
                                    <div id="document-list-container" style="display: none;">
                                        <div class="space-y-2" id="document-list">
                                            <!-- Documents will be loaded here -->
                                        </div>
                                        <div id="no-documents-message" style="display: none;" class="text-center py-8 text-gray-500">
                                            <i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                                            <p>No saved documents found.</p>
                                            <p class="text-sm">Process a document first to see it here.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn btn-secondary" id="cancel-document-picker">Cancel</button>
                                </div>
                            </div>
                        </div>

                        <div class="custom-instructions-section" style="margin-top: 1.5rem;">
                            <div class="form-group">
                                <label for="custom-instructions" class="form-label">
                                    Additional Instructions (Optional)
                                </label>
                                <textarea 
                                    id="custom-instructions" 
                                    class="form-input" 
                                    rows="3" 
                                    placeholder="Add specific instructions for the AI processing (e.g., 'Look for chemistry formulas', 'Student wrote in cursive', 'Questions are in Spanish')"></textarea>
                                <div class="form-help">
                                    These instructions will be added to the AI prompt to improve extraction accuracy.
                                </div>
                            </div>
                        </div>

                        <div class="debug-section" style="margin-top: 1.5rem;">
                            <div class="form-group">
                                <label for="debug-prompt" class="form-label debug-label">
                                    🔧 Debug: Full System Prompt (Remove in Production)
                                </label>
                                <textarea 
                                    id="debug-prompt" 
                                    class="form-input debug-input" 
                                    rows="6" 
                                    placeholder="Full AI system prompt will appear here when you select document type...">${getDefaultPrompt()}</textarea>
                                <div class="form-help">
                                    Edit this prompt for testing. Changes will be sent directly to the AI.
                                </div>
                            </div>
                        </div>

                        <div class="file-preview" id="file-preview" style="display: none;">
                            <div class="preview-header">
                                <h4>Selected File</h4>
                                <button class="btn btn-secondary" id="remove-file">Remove</button>
                            </div>
                            <div class="preview-content">
                                <div class="file-info" id="file-info"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Processing Step -->
                <div class="step-content ${currentStep === 'process' ? 'active' : ''}" id="process-step">
                    <div class="processing-section">
                        <div class="processing-status">
                            <div class="status-icon-container">
                                <i data-lucide="brain" class="status-icon" id="status-icon"></i>
                            </div>
                            <h3 id="status-title">AI Vision Processing</h3>
                            <p id="status-message">Multi-page processing can take 1-2 minutes for high-quality results. Please wait...</p>
                            <div class="processing-details" id="processing-details">
                                <div class="detail-item">
                                    <i data-lucide="eye" class="detail-icon"></i>
                                    <span>Computer Vision Analysis</span>
                                </div>
                                <div class="detail-item">
                                    <i data-lucide="zap" class="detail-icon"></i>
                                    <span>Neural Text Recognition</span>
                                </div>
                                <div class="detail-item">
                                    <i data-lucide="cpu" class="detail-icon"></i>
                                    <span>Contextual Understanding</span>
                                </div>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progress-fill"></div>
                                </div>
                                <div class="progress-text" id="progress-text">Initializing AI models...</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Review Step - New Card-Based Validation -->
                <div class="step-content ${currentStep === 'review' ? 'active' : ''}" id="review-step">
                    <div class="review-container">
                        <!-- Header with actions -->
                        <div class="review-header">
                            <div class="header-info">
                                <h3>Review Extracted Data</h3>
                                <p>Verify AI-extracted answers and make corrections as needed</p>
                                ${processedData ? renderConfidenceIndicator(processedData, uploadType) : ''}
                            </div>
                            <div class="header-actions">
                                <!-- Save status indicator -->
                                <div class="save-status" id="save-status" style="display: none; margin-bottom: 0.75rem;">
                                    <span class="save-indicator" id="save-indicator">
                                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                                        <span id="save-text">Saved</span>
                                    </span>
                                </div>
                                
                                <!-- 2x2 Button Grid -->
                                <div class="button-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; width: 100%;">
                                    <!-- First row: Save | Download -->
                                    <button class="btn btn-secondary btn-sm" id="save-session" title="Save current session">
                                        <i data-lucide="bookmark" class="btn-icon"></i>
                                        Save
                                    </button>
                                    <button class="btn btn-primary" id="download-json" title="Download JSON for Grading Hub">
                                        <i data-lucide="download" class="btn-icon"></i>
                                        Download JSON
                                    </button>
                                    
                                    <!-- Second row: Mobile | Revert -->
                                    <button class="btn btn-secondary btn-sm" id="mobile-mode-toggle" title="Toggle Mobile Mode">
                                        <i data-lucide="smartphone" class="btn-icon"></i>
                                        Mobile
                                    </button>
                                    <button class="btn btn-secondary" id="revert-original" title="Revert to original AI-extracted data">
                                        <i data-lucide="rotate-ccw" class="btn-icon"></i>
                                        Revert to Original
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Main content area -->
                        <div class="review-content">
                            <!-- Left: Document viewer -->
                            <div class="review-left" id="review-left">
                                <div class="document-viewer">
                                    <div class="viewer-header">
                                        <h4>Original Document</h4>
                                        <div class="viewer-controls">
                                            <button class="btn-icon" id="zoom-out" title="Zoom Out">−</button>
                                            <span class="zoom-level" id="zoom-level">100%</span>
                                            <button class="btn-icon" id="zoom-in" title="Zoom In">+</button>
                                            <button class="btn-icon" id="fit-width" title="Fit Width">⟷</button>
                                            <button class="btn-icon" id="fit-height" title="Fit Height">↕</button>
                                            <button class="btn-icon" id="reset-zoom" title="Reset">⌂</button>
                                        </div>
                                    </div>
                                    <div class="enterprise-viewer" id="enterprise-viewer">
                                        <div class="viewer-container" id="viewer-container">
                                            <!-- Document image will be loaded here -->
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Draggable Separator -->
                            <div class="review-separator" id="review-separator"></div>

                            <!-- Right: Question cards -->
                            <div class="review-right" id="review-right">
                                <div class="cards-header">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <h4>Answer Validation</h4>
                                        <div style="display: flex; gap: 0.25rem;">
                                            <button class="btn btn-ghost" id="undo-btn" title="Undo last change" style="padding: 0.5rem; min-width: 40px;">
                                                <i data-lucide="undo-2" style="width: 18px; height: 18px;"></i>
                                            </button>
                                            <button class="btn btn-ghost" id="redo-btn" title="Redo last undone change" style="padding: 0.5rem; min-width: 40px;">
                                                <i data-lucide="redo-2" style="width: 18px; height: 18px;"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="validation-progress" id="validation-progress">
                                        <span>0 of 0 reviewed</span>
                                    </div>
                                </div>
                                <div class="question-cards-container" id="question-cards-container">
                                    <!-- Question cards will be rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="btn btn-secondary" id="back-btn" style="display: none;">Back</button>
                    <button class="btn btn-primary" id="next-btn" disabled>Next</button>
                </div>
            </div>
        `;
}

// Export as class for consistency with services
export default class MainStepsTemplate {
    render(context) {
        return getMainStepsTemplate(
            context.currentStep, 
            context.uploadType, 
            context.processedData, 
            context.renderingService.renderConfidenceIndicator.bind(context.renderingService),
            () => context.sessionManagement.getDefaultPrompt(context)
        );
    }
}