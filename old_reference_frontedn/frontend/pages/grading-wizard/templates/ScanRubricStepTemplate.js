/**
 * Scan Rubric Step Template 
 * Complete upload interface extracted from MainStepsTemplate.js
 */
export function getScanRubricStepTemplate() {
    // Use function parameter to get default prompt (like scan processor does)
    const getDefaultPrompt = () => {
        return `You are an AI assistant specialized in extracting rubric information from scanned documents.

TASK: Extract grading rubric structure and criteria from the uploaded document.

INSTRUCTIONS:
1. Extract the exam/assignment name
2. Identify all questions and their point values
3. Extract grading criteria for each question
4. Capture any general instructions

OUTPUT FORMAT:
{
  "exam_name": "Assignment Name",
  "general_instructions": "Any general grading instructions",
  "questions": [
    {
      "question_id": "Q1", 
      "question_text": "Full question text",
      "max_points": 5,
      "criteria": [
        {
          "criterion": "Criterion description",
          "max_points": 3
        }
      ]
    }
  ],
  "confidence": 0.90,
  "confidence_justification": "Well-structured rubric with clear point allocations"
}

Focus on extracting complete grading criteria and point distributions.`;
    };

    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Scan Rubric Document</h2>
                <p>Upload your rubric document for AI scanning and processing</p>
            </div>
            <div class="step-body">
                <div class="upload-section">
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
                            <label for="page-selection-type" class="form-label">📄 Pages to Process</label>
                            <select id="page-selection-type" class="form-input">
                                <option value="all">All Pages</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            
                            <div id="custom-range-input" style="display: none; margin-top: 0.5rem;">
                                <div class="relative">
                                    <input type="text" id="custom-pages" class="form-input" 
                                           placeholder="Examples: 1-3 (pages 1 to 3), 2,4,6 (specific pages), 1,3-5 (mixed ranges)"
                                           style="font-family: monospace;">
                                </div>
                                <div id="range-validation" class="mt-1" style="display: none;"></div>
                            </div>
                            
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
        </div>
    `;
}