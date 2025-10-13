/**
 * Answers Step Template - Wizard Step 3
 * Exact copy of grading hub student answers upload section for consistency
 */

export function getAnswersStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Upload Student Answers</h2>
                <p>Upload JSON files containing student responses to your exam questions</p>
            </div>

            <div class="step-body">
                <!-- Student Answers Upload - Exact copy from MainTemplate.js -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                            <span class="flex items-center justify-center w-6 h-6 bg-yellow-500 text-white text-sm rounded-full">3</span>
                            Upload Student Answers
                        </h2>
                    </div>

                    <div class="upload-zone" id="jsonUploadZone">
                        <div class="flex flex-col items-center gap-3">
                            <i data-lucide="file-text" class="w-8 h-8 text-gray-400"></i>
                            <div class="text-center">
                                <p class="text-white font-medium">Upload Student Answers (JSON)</p>
                                <div id="formatHintSingle" class="text-sm text-gray-400">
                                    Expected format: [{"student_name": "John", "answer": "..."}]
                                </div>
                                <div id="formatHintExam" class="text-sm text-gray-400 hidden">
                                    Expected format: [{"student_name": "John", "answers": {"q1": "...", "q2": "..."}}]
                                </div>
                            </div>
                        </div>
                        <input type="file" id="jsonFileInput" accept=".json" class="hidden">
                    </div>

                    <!-- JSON Loaded - Ready to Grade -->
                    <div id="readyToGradeSection" class="hidden mt-6">
                        <div class="flex items-center justify-between p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                            <div class="flex items-center gap-3">
                                <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
                                <div>
                                    <p class="text-white font-medium">Student answers loaded</p>
                                    <p class="text-sm text-gray-400" id="studentCount">0 students ready for grading</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button id="toggleStudentDataBtn" class="btn btn-secondary">
                                    <i data-lucide="chevron-down" class="w-4 h-4"></i>
                                    Show Student Data
                                </button>
                                <button id="startGradingBtn" class="btn btn-success">
                                    <i data-lucide="play" class="w-4 h-4"></i>
                                    Start Grading
                                </button>
                            </div>
                        </div>

                        <!-- Expandable Student Data Preview -->
                        <div id="studentDataContent" class="hidden mt-4">
                            <div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
                                <h4 class="text-white font-medium mb-3">Student Data Preview</h4>
                                <div class="overflow-x-auto">
                                    <table id="studentDataTable" class="table">
                                        <thead>
                                            <tr>
                                                <th>Student Name</th>
                                                <th>Answer Preview</th>
                                                <th>Character Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- Student data will be populated here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}