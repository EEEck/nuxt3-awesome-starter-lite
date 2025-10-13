/**
 * Upload Step Template
 * Extracted from MainStepsTemplate for true wizard page structure
 */
export function getUploadStepTemplate(uploadType, getDefaultPrompt) {
    return `
        <div class="scan-processor-container">
            <div class="page-header">
                <h1>Document Scan Processor</h1>
                <p>Convert scanned student worksheets and rubrics to digital format</p>
            </div>

            <!-- Upload Step Content -->
            <div class="step-content active" id="upload-step">
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
                            <p>Teacher rubric to create grading criteria</p>
                        </div>
                    </div>

                    <!-- File Upload Zone (conditionally shown) -->
                    <div class="upload-zone ${uploadType ? '' : 'hidden'}" id="upload-dropzone">
                        <input type="file" id="file-input" accept=".pdf,.jpg,.jpeg,.png" hidden>
                        <div class="upload-content" id="upload-content">
                            <i data-lucide="upload" class="upload-icon"></i>
                            <h4>Drop your ${uploadType || 'document'} here or click to browse</h4>
                            <p>Supported formats: PDF, JPEG, PNG (max 50MB)</p>
                            <button class="btn btn-primary" id="browse-btn">Browse Files</button>
                        </div>
                    </div>

                    <!-- File Preview (hidden by default) -->
                    <div class="file-preview hidden" id="file-preview">
                        <div class="file-info" id="file-info">
                            <!-- File details populated by JavaScript -->
                        </div>
                        <button class="btn btn-secondary" id="remove-file-btn">
                            <i data-lucide="x" class="btn-icon"></i>
                            Remove File
                        </button>
                    </div>

                    <!-- PDF Page Selection (hidden by default) -->
                    <div class="pdf-page-selector hidden" id="pdf-page-selector" style="display: none;">
                        <h4>Select Pages to Process</h4>
                        <div class="page-selection-options">
                            <div class="form-group">
                                <label for="page-selection-type" class="form-label">Page Selection:</label>
                                <select id="page-selection-type" class="form-input">
                                    <option value="all">All pages</option>
                                    <option value="custom">Custom range</option>
                                </select>
                            </div>
                            
                            <div class="form-group hidden" id="custom-range-input">
                                <label for="custom-pages" class="form-label">Page Range:</label>
                                <input type="text" id="custom-pages" class="form-input" 
                                       placeholder="e.g., 1-3, 5, 7-9">
                                <div class="form-help">Enter page numbers and ranges separated by commas</div>
                                <div id="range-validation" class="form-validation"></div>
                            </div>
                        </div>
                        
                        <button class="btn btn-secondary" id="preview-pdf-btn">
                            <i data-lucide="eye" class="btn-icon"></i>
                            Preview PDF
                        </button>
                    </div>

                    <!-- Custom Instructions Section -->
                    <div class="custom-instructions ${uploadType ? '' : 'hidden'}" id="custom-instructions">
                        <h4>Custom Processing Instructions (Optional)</h4>
                        <textarea id="custom-prompt" class="form-input" rows="4" 
                                  placeholder="Enter any specific instructions for AI processing..."></textarea>
                        
                        <!-- Debug: Show Default Prompt -->
                        <details class="debug-section" style="margin-top: 1rem;">
                            <summary class="text-sm text-gray-400 cursor-pointer">🔧 View Default AI Prompt</summary>
                            <div class="debug-content" style="background: #1a1a1a; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                                <pre class="text-xs text-gray-300" style="white-space: pre-wrap;">${getDefaultPrompt()}</pre>
                            </div>
                        </details>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="back-btn" style="display: none;">Back</button>
                        <button class="btn btn-primary" id="next-btn" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}