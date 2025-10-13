/**
 * Mode Selection Template
 * Exact HTML template extracted from render() method (lines 81-178)
 */
export function getModeSelectionTemplate() {
    return `
                <div class="scan-processor-container">
                    <div class="page-header text-center">
                        <h1>Document Processing Pipeline</h1>
                        <p>Initialize AI-powered document analysis and grading workflow</p>
                    </div>

                    <div class="mode-selection-container c-mode-container">
                        <!-- Primary Band: Start New Evaluation -->
                        <div class="primary-mode-band" style="
                            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
                            border: 2px solid rgba(59, 130, 246, 0.4);
                            border-radius: 16px;
                            padding: 2.5rem;
                            margin-bottom: 1.5rem;
                            text-align: center;
                            transition: all 0.3s ease;
                        ">
                            <div class="u-flex-center-gap">
                                <i data-lucide="eye" class="c-icon--large c-icon--blue"></i>
                                <i data-lucide="zap" class="c-icon--large c-icon--green"></i>
                                <i data-lucide="cpu" class="c-icon--large c-icon--yellow"></i>
                            </div>
                            <h2 class="c-heading--primary">Start New Grading</h2>
                            <p class="c-text--secondary">Upload student worksheets and rubrics for AI-powered analysis</p>
                            <button class="btn btn-primary c-btn--xl" id="start-btn">
                                <i data-lucide="upload" class="u-icon-margin"></i>
                                Upload Documents
                            </button>
                        </div>

                        <!-- Divider -->
                        <div style="text-align: center; margin: 2.5rem 0;">
                            <div style="
                                display: inline-block;
                                background: rgba(55, 65, 81, 0.8);
                                border: 1px solid rgba(75, 85, 99, 0.4);
                                border-radius: 20px;
                                padding: 0.75rem 1.5rem;
                                color: #9ca3af;
                                font-size: 1rem;
                                font-weight: 500;
                            ">or</div>
                        </div>

                        <!-- Secondary Band: Resume Session -->
                        <div class="secondary-mode-band" style="
                            background: rgba(55, 65, 81, 0.3);
                            border: 1px solid rgba(75, 85, 99, 0.3);
                            border-radius: 12px;
                            padding: 1.5rem;
                            text-align: center;
                            transition: all 0.3s ease;
                            cursor: pointer;
                        " id="resume-session-band">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                                <div style="font-size: 1.5rem;">🔄</div>
                                <div style="text-align: left;">
                                    <h3 style="color: #d1d5db; font-size: 1.1rem; margin: 0; font-weight: 500;">Load Existing Session</h3>
                                    <p style="color: #9ca3af; margin: 0; font-size: 0.9rem;">Access previously processed documents</p>
                                </div>
                                <button class="btn btn-secondary" style="margin-left: auto;" id="continue-btn">Load Session</button>
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
                </div>
            `;
}

// Export as class for consistency with services
export default class ModeSelectionTemplate {
    render() {
        return getModeSelectionTemplate();
    }
}