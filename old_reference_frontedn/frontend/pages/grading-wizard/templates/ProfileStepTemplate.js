/**
 * Profile Step Template - Wizard Step 1
 * Uses ProfileBoxTemplate (copied to wizard folder)
 */

import { getProfileBoxTemplate } from './ProfileBoxTemplate.js';

export function getProfileStepTemplate() {
    return `
        <div class="wizard-step-content">
            <div class="step-header">
                <h2>Select Teacher Profile</h2>
                <p>Choose your teaching profile to customize AI grading behavior</p>
            </div>

            <div class="step-body">
                <!-- Profile box template -->
                ${getProfileBoxTemplate()}

                <!-- Next Step Preview -->
                <div class="step-preview mt-6">
                    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 class="text-blue-300 font-medium mb-2">
                            <i data-lucide="arrow-right" class="w-4 h-4 inline mr-1"></i>
                            Next: Rubric Setup
                        </h4>
                        <p class="text-blue-200 text-sm">
                            Upload or create your exam rubric with scoring criteria
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}