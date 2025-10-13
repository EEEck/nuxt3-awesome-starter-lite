/**
 * Grading Step Template - Wizard Step 5  
 * Exact copy of grading hub processing + results sections
 */

export function getGradingStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>AI Grading in Progress</h2>
                <p>Your rubric and student answers are being processed by AI</p>
            </div>

            <div class="step-body">
                <!-- Processing Status - Exact copy from MainTemplate.js -->
                <div id="processingSection" class="card">
                    <div class="flex items-center gap-3 mb-3">
                        <i data-lucide="cpu" class="w-5 h-5 text-teal-400 pulse"></i>
                        <span class="text-white font-medium">AI Processing</span>
                    </div>
                    <div class="progress-bar mb-2">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span id="progressText" class="text-gray-400">Processing: 0/0 students</span>
                        <span id="currentStudent" class="text-gray-400">Initializing...</span>
                    </div>
                </div>

                <!-- Results - Exact copy from MainTemplate.js -->
                <div class="card" id="resultsCard" style="display: none;">
                    <div class="card-header">
                        <div class="flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                                <span class="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-sm rounded-full">5</span>
                                Grading Complete
                            </h2>
                            <div class="flex gap-2">
                                <button id="toggleResultsBtn" class="btn btn-secondary">
                                    <i data-lucide="chevron-down" class="w-4 h-4" id="toggleIcon"></i>
                                    Show Results
                                </button>
                                <button id="exportResultsBtn" class="btn btn-primary">
                                    <i data-lucide="download" class="w-4 h-4"></i>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Expandable Results Section -->
                    <div id="resultsContent" class="hidden">
                        <!-- Single Question Results -->
                        <div id="singleQuestionResults" class="overflow-x-auto">
                            <table id="resultsTable" class="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Total Score</th>
                                        <th>Confidence</th>
                                        <th>Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Single question results will be populated here -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Multi-Question Exam Results -->
                        <div id="multiQuestionResults" class="hidden space-y-6">
                            <!-- Multi-question results will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Grade Editing Modal - Exact copy from MainTemplate.js -->
                <div id="gradeEditModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                    <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-white">Edit Grade</h3>
                            <button onclick="closeGradeEditor()" class="text-gray-400 hover:text-white p-1">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                        
                        <div id="gradeEditContent" class="space-y-4">
                            <!-- Content will be populated by openGradeEditor -->
                        </div>
                        
                        <div class="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                            <button onclick="saveGradeChanges()" class="btn btn-primary">
                                <i data-lucide="save" class="w-4 h-4 mr-2"></i>
                                Save Changes
                            </button>
                            <button onclick="closeGradeEditor()" class="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}