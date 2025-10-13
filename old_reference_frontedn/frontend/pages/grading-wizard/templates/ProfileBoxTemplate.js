/**
 * Reusable Profile Selection Box Template
 * Extracted from MainTemplate.js for reuse across grading hub and wizard
 * 
 * This template creates the exact same profile selection UI component
 * that works with the existing ProfileService, DataStore, and EventBus
 */

export function getProfileBoxTemplate() {
  return `
    <!-- Profile Selection -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <i data-lucide="user-check" class="w-5 h-5 text-green-400"></i>
          Grading Profile
        </h2>
      </div>
      
      <div class="space-y-4">
        <div class="text-sm text-gray-400 mb-3">
          <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
          Select a profile to enable smart question type detection and personalized grading
        </div>
        
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-300 mb-2">Select Profile (Optional)</label>
            <select id="profileSelect" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
              <option value="">No profile selected - use default grading</option>
            </select>
          </div>
          <div class="pt-6">
            <button id="createProfileBtn" class="btn btn-primary">
              <i data-lucide="plus" class="w-4 h-4"></i>
              Create Profile
            </button>
          </div>
        </div>
        
        <div id="selectedProfileInfo" class="hidden p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-medium text-white mb-1" id="profileInfoName"></h4>
              <p class="text-sm text-gray-400 mb-2" id="profileInfoDetails"></p>
              <p class="text-xs text-gray-500" id="profileInfoInstructions"></p>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-400 mb-1">Question Types</div>
              <div class="text-sm font-medium text-blue-400" id="profileInfoTypes"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export as class for consistency with other templates
export default class ProfileBoxTemplate {
  render() {
    return getProfileBoxTemplate();
  }
}