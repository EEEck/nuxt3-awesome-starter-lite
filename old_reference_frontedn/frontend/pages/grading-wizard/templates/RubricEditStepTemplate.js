/**
 * Rubric Edit Step Template - Wizard Step 3
 * Contains only the editing interface (no upload)
 */

export function getRubricEditStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Review & Edit Rubric</h2>
                <p>Review and fine-tune your rubric with AI assistance</p>
            </div>

            <div class="step-body">
                <!-- Rubric Display (editing only) -->
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
                    
                    <!-- Collapsible Rubric Content -->
                    <div id="rubricContent">
                        <!-- Exam Information -->
                        <div id="examInfoSection" class="mb-6">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-white font-medium">Exam Information</h3>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label class="block text-sm text-gray-400 mb-1">Exam Name</label>
                                    <input type="text" id="examNameInput" class="input w-full" placeholder="e.g., Biology Midterm or Single Question Assignment">
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-400 mb-1">Total Questions</label>
                                    <input type="number" id="totalQuestionsInput" class="input w-20" min="1" value="1">
                                </div>
                                <div>
                                    <label class="block text-sm text-gray-400 mb-1">Total Points</label>
                                    <div class="relative">
                                        <input type="number" id="totalPointsDisplay" class="input w-20 bg-gray-700 cursor-help" readonly value="0" 
                                               title="Auto-calculated from question points">
                                        <div id="pointsTooltip" class="absolute bottom-full left-0 mb-2 hidden bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 border border-gray-600">
                                            <div>Automatically calculated from the max points of all questions</div>
                                            <div class="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm text-gray-400 mb-1">General Instructions</label>
                                <textarea id="generalInstructionsInput" class="input w-full h-20" placeholder="e.g., Correct form based on clue or context (verb tense, negation, vocabulary)"></textarea>
                            </div>
                        </div>

                        <!-- Current Rubric -->
                        <div class="mb-6">
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-white font-medium" id="rubricTitle">Current Rubric</h3>
                                <div class="flex gap-2">
                                    <button id="addQuestionBtn" class="btn btn-secondary text-sm">
                                        <i data-lucide="plus" class="w-4 h-4"></i>
                                        Add Question
                                    </button>
                                    <button id="downloadRubricBtn" class="btn btn-secondary text-sm">
                                        <i data-lucide="download" class="w-4 h-4"></i>
                                        Download
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Questions Container -->
                            <div id="questionsContainer" class="space-y-6">
                                <!-- Questions will be rendered here -->
                            </div>
                        </div>
                    </div> <!-- End collapsible rubric content -->
                    
                    <!-- AI Feedback Section (Outside Collapsible Area) -->
                    <div class="mt-4 p-4 bg-gray-800 rounded-lg border border-teal-500/30">
                        <div class="flex items-center gap-2 mb-3">
                            <i data-lucide="bot" class="w-5 h-5 text-teal-400"></i>
                            <span class="text-teal-400 font-medium">Get AI Feedback on Rubric</span>
                        </div>
                        <div class="flex gap-3 mb-4">
                            <input 
                                type="text" 
                                id="aiPromptInput" 
                                placeholder="Tell AI what to focus on (e.g., 'Make it more focused on critical thinking')"
                                class="input flex-1"
                            >
                            <button id="getAiFeedbackBtn" class="btn btn-ai">
                                <i data-lucide="sparkles" class="w-4 h-4"></i>
                                Get Feedback
                            </button>
                        </div>

                        <!-- AI Feedback Display -->
                        <div id="aiFeedbackSection" class="hidden">
                            <div class="ai-feedback-header">
                                <i data-lucide="lightbulb" class="w-5 h-5"></i>
                                <span>AI Suggestions</span>
                            </div>
                            <div id="aiFeedbackContent" class="text-gray-300 leading-relaxed mb-4 p-3 bg-gray-900 rounded border-l-4 border-teal-500">
                                <!-- AI feedback will appear here -->
                            </div>
                            <div class="flex justify-end">
                                <button id="dismissFeedbackBtn" class="btn btn-secondary text-sm">
                                    <i data-lucide="x" class="w-4 h-4"></i>
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}