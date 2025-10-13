/**
 * Rubric Review Step Template - Wizard Step 2.5
 * EXACT COPY of grading hub rubric section - no new elements!
 */

export function getRubricReviewStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Review Your Rubric</h2>
                <p>Review the uploaded rubric and make any necessary edits</p>
            </div>

            <div class="step-body">
                <!-- Green Success Bar -->
                <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-3">
                        <i data-lucide="check-circle" class="w-6 h-6 text-green-400"></i>
                        <div>
                            <div class="text-green-300 font-medium">Rubric Successfully Uploaded</div>
                            <div id="rubricSummaryText" class="text-green-200 text-sm">
                                <!-- Summary will be populated -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- EXACT COPY: Rubric Section from MainTemplate.js -->
                <div id="rubricSection">
                    <!-- Collapsible Rubric Header -->
                    <div class="mb-4">
                        <button id="toggleRubricBtn" class="flex items-center justify-between w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                            <div class="flex items-center gap-2">
                                <i data-lucide="file-text" class="w-5 h-5 text-blue-400"></i>
                                <span class="text-white font-medium" id="rubricStatusText">Rubric Loaded Successfully</span>
                            </div>
                            <i data-lucide="chevron-down" class="w-5 h-5 text-gray-400 rubric-toggle-icon"></i>
                        </button>
                    </div>

                    <!-- Expanded Rubric Content -->
                    <div id="rubricContent" class="space-y-4">
                        <!-- AI Feedback Button and Input -->
                        <div class="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                            <button id="getAiFeedbackBtn" class="btn btn-secondary">
                                <i data-lucide="sparkles" class="w-4 h-4 mr-2"></i>
                                Get AI Feedback
                            </button>
                            <div class="flex-1">
                                <input type="text" id="aiPromptInput" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="Optional: Ask specific questions about your rubric">
                            </div>
                        </div>

                        <!-- AI Feedback Display -->
                        <div id="aiFeedbackSection" class="hidden">
                            <div class="p-4 bg-gray-800 rounded-lg border border-gray-600">
                                <div class="flex items-start justify-between mb-2">
                                    <h4 class="text-white font-medium">AI Feedback</h4>
                                    <button id="dismissFeedbackBtn" class="text-gray-400 hover:text-white">
                                        <i data-lucide="x" class="w-4 h-4"></i>
                                    </button>
                                </div>
                                <pre id="aiFeedbackContent" class="text-sm text-gray-300 whitespace-pre-wrap"></pre>
                            </div>
                        </div>

                        <!-- Rubric Display Container -->
                        <div id="rubricContainer" class="space-y-4">
                            <!-- Current Rubric Display -->
                            <div id="currentRubricDisplay">
                                <!-- Exam name and basic info -->
                                <div class="mb-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h3 id="examName" class="text-xl font-semibold text-white mb-1">Loading...</h3>
                                            <div class="flex items-center gap-4 text-sm text-gray-400">
                                                <span id="questionsCount">0 questions</span>
                                                <span id="totalPointsDisplay">0 total points</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <button id="addQuestionBtn" class="btn btn-secondary btn-sm">
                                                <i data-lucide="plus" class="w-4 h-4"></i>
                                                Add Question
                                            </button>
                                            <button id="downloadRubricBtn" class="btn btn-secondary btn-sm">
                                                <i data-lucide="download" class="w-4 h-4"></i>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- General Instructions -->
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-300 mb-2">General Instructions</label>
                                    <textarea id="generalInstructionsInput" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" rows="2" placeholder="General instructions for this exam..."></textarea>
                                </div>

                                <!-- Rubric Questions -->
                                <div id="rubricCards" class="space-y-4">
                                    <!-- Question cards will be rendered here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}