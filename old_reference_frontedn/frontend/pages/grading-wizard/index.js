/**
 * Grading Wizard Entry Point
 * Initializes the wizard-based grading workflow
 */

import GradingWizard from '../grading-wizard.js';

// Initialize wizard when page loads
export function initializeGradingWizard() {
    console.log('🧙‍♂️ Initializing Grading Wizard from index');
    return new GradingWizard();
}

// Export for use by main app router
export default initializeGradingWizard;