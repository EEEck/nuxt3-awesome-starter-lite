/**
 * Review Step Template - Wizard Step 5
 * Reuses ResultsTemplates and editing services in focused layout
 */

export function getReviewStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Review & Export Results</h2>
                <p>Review AI grading results, make corrections, and export your grades</p>
            </div>

            <div class="step-body">
                <!-- Results Overview -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                            <i data-lucide="bar-chart-3" class="w-5 h-5 text-blue-400"></i>
                            Grading Results Overview
                        </h3>
                        
                        <div class="flex items-center gap-2">
                            <button id="exportResultsBtn" class="btn btn-primary btn-sm">
                                <i data-lucide="download" class="btn-icon"></i>
                                Export Results
                            </button>
                            <button id="saveSessionBtn" class="btn btn-secondary btn-sm">
                                <i data-lucide="save" class="btn-icon"></i>
                                Save Session
                            </button>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Summary Statistics -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-gray-800 rounded-lg p-3 text-center">
                                <div class="text-2xl font-bold text-white" id="totalStudents">--</div>
                                <div class="text-sm text-gray-400">Total Students</div>
                            </div>
                            <div class="bg-gray-800 rounded-lg p-3 text-center">
                                <div class="text-2xl font-bold text-green-400" id="avgScoreDisplay">--</div>
                                <div class="text-sm text-gray-400">Average Score</div>
                            </div>
                            <div class="bg-gray-800 rounded-lg p-3 text-center">
                                <div class="text-2xl font-bold text-blue-400" id="avgConfidenceDisplay">--</div>
                                <div class="text-sm text-gray-400">AI Confidence</div>
                            </div>
                            <div class="bg-gray-800 rounded-lg p-3 text-center">
                                <div class="text-2xl font-bold text-yellow-400" id="reviewNeededDisplay">--</div>
                                <div class="text-sm text-gray-400">Need Review</div>
                            </div>
                        </div>

                        <!-- Filter/Search Controls -->
                        <div class="flex items-center gap-4">
                            <div class="flex-1">
                                <input 
                                    type="text" 
                                    id="searchStudents" 
                                    class="form-input" 
                                    placeholder="Search by student name..."
                                >
                            </div>
                            <select id="confidenceFilter" class="form-input">
                                <option value="">All Confidence Levels</option>
                                <option value="high">High Confidence (≥75%)</option>
                                <option value="medium">Medium Confidence (60-74%)</option>
                                <option value="low">Low Confidence (<60%)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Results Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-white">Student Results</h3>
                        <div class="text-sm text-gray-400">
                            Click rows to expand detailed breakdown
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="table w-full" id="resultsTable">
                            <thead>
                                <tr>
                                    <th class="text-left">Student Name</th>
                                    <th class="text-center">Score</th>
                                    <th class="text-center">AI Confidence</th>
                                    <th class="text-left">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Results rows will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Export Options -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                            <i data-lucide="file-down" class="w-5 h-5 text-green-400"></i>
                            Export Options
                        </h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button class="export-option-btn" data-format="csv">
                            <i data-lucide="file-spreadsheet" class="w-6 h-6 text-green-400 mb-2"></i>
                            <div class="font-medium">CSV Export</div>
                            <div class="text-sm text-gray-400">Spreadsheet format</div>
                        </button>
                        
                        <button class="export-option-btn" data-format="json">
                            <i data-lucide="file-json" class="w-6 h-6 text-blue-400 mb-2"></i>
                            <div class="font-medium">JSON Export</div>
                            <div class="text-sm text-gray-400">Raw data format</div>
                        </button>
                        
                        <button class="export-option-btn" data-format="pdf">
                            <i data-lucide="file-text" class="w-6 h-6 text-red-400 mb-2"></i>
                            <div class="font-medium">PDF Report</div>
                            <div class="text-sm text-gray-400">Formatted summary</div>
                        </button>
                    </div>
                </div>

                <!-- Session Management -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                            <i data-lucide="history" class="w-5 h-5 text-purple-400"></i>
                            Session Management
                        </h3>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <button id="saveCurrentSession" class="btn btn-secondary">
                            <i data-lucide="bookmark" class="btn-icon"></i>
                            Save Current Session
                        </button>
                        
                        <button id="newGradingSession" class="btn btn-primary">
                            <i data-lucide="plus" class="btn-icon"></i>
                            Start New Grading Session
                        </button>
                        
                        <div class="flex-1"></div>
                        
                        <div class="text-sm text-gray-400">
                            <i data-lucide="clock" class="w-4 h-4 inline mr-1"></i>
                            Session started: <span id="sessionStartTime">--</span>
                        </div>
                    </div>
                </div>

                <!-- Completion Confirmation -->
                <div class="step-preview mt-6">
                    <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <h4 class="text-green-300 font-medium mb-2">
                            <i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i>
                            Grading Workflow Complete
                        </h4>
                        <p class="text-green-200 text-sm mb-3">
                            Your AI-powered grading session is complete. Review the results above and export when ready.
                        </p>
                        <button id="completeWorkflow" class="btn btn-success">
                            <i data-lucide="flag" class="btn-icon"></i>
                            Mark Workflow Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Grade Editing Modal (reused from grading hub) -->
        <div id="gradeEditModal" class="modal-overlay" style="display: none;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Edit Grade</h3>
                    <button class="modal-close" id="closeGradeEdit">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Grade editing content will be populated here -->
                </div>
            </div>
        </div>
    `;
}