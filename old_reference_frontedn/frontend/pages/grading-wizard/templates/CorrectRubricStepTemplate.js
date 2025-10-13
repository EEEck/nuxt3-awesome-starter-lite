/**
 * Correct Rubric Step Template
 * Review interface for scanned rubric content
 */
export function getCorrectRubricStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Review Scanned Rubric</h2>
                <p>Review and correct the AI-extracted rubric content</p>
            </div>
            <div class="step-body">
                <div class="processing-section" id="processing-section">
                    <div class="processing-status">
                        <div class="status-icon-container">
                            <i data-lucide="brain" class="status-icon" id="status-icon"></i>
                        </div>
                        <h3 id="status-title">AI Vision Processing</h3>
                        <p id="status-message">Processing your document...</p>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="review-section" id="review-section" style="display: none;">
                    <div class="review-layout">
                        <div class="document-viewer-panel">
                            <div class="viewer-header">
                                <h3>Original Document</h3>
                            </div>
                            <div id="document-viewer" class="document-viewer">
                                <!-- Document will be displayed here -->
                            </div>
                        </div>
                        
                        <div class="cards-panel">
                            <div class="cards-header">
                                <h3>Extracted Content</h3>
                            </div>
                            <div id="cards-container" class="cards-container">
                                <!-- Question cards will be rendered here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}