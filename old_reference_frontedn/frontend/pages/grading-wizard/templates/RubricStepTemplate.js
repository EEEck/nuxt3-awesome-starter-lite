/**
 * Rubric Step Template - Wizard Step 2  
 * UPLOAD ONLY - no editing features
 */

export function getRubricStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Upload Rubric</h2>
                <p>Upload your grading rubric file</p>
            </div>

            <div class="step-body">
                <div class="card">
                  <div class="card-header">
                    <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                      <span class="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm rounded-full">2</span>
                      Upload Your Rubric
                    </h2>
                  </div>

                  <!-- Upload Primary, Create Secondary -->
                  <div class="mb-6">
                    <div class="mb-4">
                      <div class="upload-zone" id="rubricUploadZone" style="padding: 2rem;">
                        <div class="flex flex-col items-center gap-3">
                          <i data-lucide="upload" class="w-10 h-10 text-blue-400"></i>
                          <div class="text-center">
                            <p class="text-white text-lg font-medium mb-1">Upload Rubric (JSON)</p>
                            <p class="text-sm text-gray-400">Drag and drop your rubric file here or click to browse</p>
                          </div>
                        </div>
                        <input type="file" id="rubricFileInput" accept=".json" class="hidden">
                      </div>
                    </div>
                    
                    <!-- File Upload Status -->
                    <div id="rubricUploadStatus" class="hidden mb-4">
                      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div class="flex items-center gap-2 text-green-400">
                          <i data-lucide="check-circle" class="w-5 h-5"></i>
                          <span class="font-medium">Rubric Uploaded Successfully</span>
                        </div>
                        <div id="uploadedFileName" class="text-green-200 text-sm mt-1">
                          <!-- Filename will be populated here -->
                        </div>
                      </div>
                    </div>
                    
                    <div class="text-center">
                      <button id="createNewRubricBtn" class="text-sm text-gray-400 hover:text-white transition-colors underline">
                        Or create a new rubric from scratch
                      </button>
                    </div>
                  </div>

                  <!-- Simple Upload Success Display (NO EDITING) -->
                  <div id="rubricSection" class="hidden">
                    <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                      <div class="flex items-center justify-center gap-3 mb-3">
                        <i data-lucide="check-circle" class="w-8 h-8 text-green-400"></i>
                        <h3 class="text-green-400 font-medium text-lg">Rubric Uploaded Successfully</h3>
                      </div>
                      <p class="text-green-200 mb-4" id="rubricStatusText">Ready to proceed to editing</p>
                      <div class="text-sm text-gray-400">
                        Click "Next" to review and edit your rubric
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
    `;
}