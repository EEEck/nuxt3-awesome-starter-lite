/**
 * Process Step Template
 * Extracted from MainStepsTemplate for true wizard page structure
 */
export function getProcessStepTemplate() {
    return `
        <div class="scan-processor-container">
            <div class="page-header">
                <h1>Document Scan Processor</h1>
                <p>Convert scanned student worksheets and rubrics to digital format</p>
            </div>

            <!-- Process Step Content -->
            <div class="step-content active" id="process-step">
                <div class="process-section">
                    <!-- Top Action Area -->
                    <div class="top-action-area" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <button class="btn btn-secondary" id="back-btn-top">
                            <i data-lucide="arrow-left" class="btn-icon"></i>
                            Back to Upload
                        </button>
                        <button class="btn btn-primary" id="next-btn-top" disabled>Next</button>
                    </div>

                    <div class="process-status">
                        <div class="status-header">
                            <h3>Processing Document</h3>
                            <div class="status-indicator loading" id="status-indicator">
                                <div class="spinner"></div>
                                <span>Initializing...</span>
                            </div>
                        </div>
                        
                        <!-- Progress Steps -->
                        <div class="progress-steps" id="progress-steps">
                            <div class="progress-step" data-step="upload">
                                <div class="step-icon">📁</div>
                                <div class="step-label">Upload</div>
                                <div class="step-status">✓</div>
                            </div>
                            <div class="progress-step" data-step="analyze">
                                <div class="step-icon">🔍</div>
                                <div class="step-label">Analyze</div>
                                <div class="step-status">...</div>
                            </div>
                            <div class="progress-step" data-step="extract">
                                <div class="step-icon">📝</div>
                                <div class="step-label">Extract</div>
                                <div class="step-status">...</div>
                            </div>
                            <div class="progress-step" data-step="format">
                                <div class="step-icon">🎯</div>
                                <div class="step-label">Format</div>
                                <div class="step-status">...</div>
                            </div>
                        </div>

                        <!-- Processing Output/Log -->
                        <div class="processing-output">
                            <h4>Processing Log</h4>
                            <div class="log-container" id="processing-log">
                                <div class="log-entry">
                                    <span class="timestamp">[Starting]</span>
                                    <span class="message">Ready to process document...</span>
                                </div>
                            </div>
                        </div>

                        <!-- Error Display (hidden by default) -->
                        <div class="error-display hidden" id="error-display">
                            <div class="error-content">
                                <i data-lucide="alert-circle" class="error-icon"></i>
                                <div class="error-message">
                                    <h4>Processing Error</h4>
                                    <p id="error-details">An error occurred during processing.</p>
                                </div>
                                <button class="btn btn-secondary" id="retry-btn">
                                    <i data-lucide="refresh-cw" class="btn-icon"></i>
                                    Retry
                                </button>
                            </div>
                        </div>

                        <!-- Success Display (hidden by default) -->
                        <div class="success-display hidden" id="success-display">
                            <div class="success-content">
                                <i data-lucide="check-circle" class="success-icon"></i>
                                <div class="success-message">
                                    <h4>Processing Complete!</h4>
                                    <p>Your document has been successfully processed and is ready for review.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <button class="btn btn-secondary" id="back-btn">Back</button>
                        <button class="btn btn-primary" id="next-btn" disabled>Review Results</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}