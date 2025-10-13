/**
 * Review Step Template
 * Extracted from MainStepsTemplate for true wizard page structure
 */
export function getReviewStepTemplate(uploadType, processedData, renderConfidenceIndicator) {
    return `
        <div class="scan-processor-container">
            <div class="page-header">
                <h1>Document Scan Processor</h1>
                <p>Convert scanned student worksheets and rubrics to digital format</p>
            </div>

            <!-- Review Step Content -->
            <div class="step-content active" id="review-step">
                <div class="review-section">
                    <!-- Top Action Area -->
                    <div class="top-action-area" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <button class="btn btn-secondary" id="back-btn-top">
                            <i data-lucide="arrow-left" class="btn-icon"></i>
                            Back to Process
                        </button>
                        <div class="top-actions">
                            <button class="btn btn-ghost" id="save-progress-btn">
                                <i data-lucide="save" class="btn-icon"></i>
                                Save Progress
                            </button>
                            <button class="btn btn-primary" id="export-btn">
                                <i data-lucide="download" class="btn-icon"></i>
                                Export JSON
                            </button>
                        </div>
                    </div>

                    <div class="review-layout">
                        <!-- Left Panel: Document Viewer -->
                        <div class="document-panel">
                            <div class="panel-header">
                                <h4>Original Document</h4>
                                <div class="viewer-controls">
                                    <button class="btn btn-ghost btn-sm" id="zoom-out">
                                        <i data-lucide="zoom-out" class="btn-icon"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm" id="zoom-in">
                                        <i data-lucide="zoom-in" class="btn-icon"></i>
                                    </button>
                                    <button class="btn btn-ghost btn-sm" id="toggle-fullscreen">
                                        <i data-lucide="maximize" class="btn-icon"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="document-viewer" id="document-viewer">
                                <!-- Document content will be populated by JavaScript -->
                            </div>
                        </div>

                        <!-- Right Panel: Extracted Data -->
                        <div class="data-panel">
                            <div class="panel-header">
                                <h4>Extracted Data</h4>
                                <div class="data-controls">
                                    <button class="btn btn-ghost btn-sm" id="undo-btn" disabled>
                                        <i data-lucide="undo" class="btn-icon"></i>
                                        Undo
                                    </button>
                                    <button class="btn btn-ghost btn-sm" id="redo-btn" disabled>
                                        <i data-lucide="redo" class="btn-icon"></i>
                                        Redo
                                    </button>
                                    <button class="btn btn-ghost btn-sm" id="revert-original">
                                        <i data-lucide="rotate-ccw" class="btn-icon"></i>
                                        Revert to Original
                                    </button>
                                </div>
                            </div>

                            <!-- Validation Progress -->
                            <div class="validation-progress">
                                <div class="progress-header">
                                    <span class="progress-label">Validation Progress</span>
                                    <span class="progress-count" id="validation-progress">0/0 validated</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" id="validation-progress-fill" style="width: 0%"></div>
                                </div>
                            </div>

                            <!-- Cards Container -->
                            <div class="cards-container" id="cards-container">
                                <!-- Question cards will be populated by JavaScript -->
                                ${processedData ? renderCards(processedData, uploadType, renderConfidenceIndicator) : '<div class="no-data">No data processed yet</div>'}
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="back-btn">Back</button>
                        <button class="btn btn-success" id="finish-btn">
                            <i data-lucide="check" class="btn-icon"></i>
                            Finish & Export
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- PDF Preview Modal -->
        <div class="modal" id="pdf-preview-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>PDF Preview</h3>
                    <button class="modal-close" id="close-pdf-preview">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body" id="pdf-preview-container">
                    <!-- PDF preview content -->
                </div>
            </div>
        </div>

        <!-- Document Picker Modal -->
        <div class="modal" id="document-picker-modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Load Saved Document</h3>
                    <button class="modal-close" id="close-document-picker">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="document-list-loading" class="loading-state">
                        <div class="spinner"></div>
                        <p>Loading saved documents...</p>
                    </div>
                    <div id="document-list-container" style="display: none;">
                        <div id="document-list"></div>
                        <div id="no-documents-message" style="display: none;">
                            <p>No saved documents found.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCards(processedData, uploadType, renderConfidenceIndicator) {
    if (!processedData) return '<div class="no-data">No data to display</div>';
    
    // This is a placeholder - the actual rendering will be handled by RenderingService
    return '<div class="cards-placeholder">Cards will be rendered by RenderingService</div>';
}