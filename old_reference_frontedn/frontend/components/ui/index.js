/**
 * UI Components Library - Entry Point
 * Centralized exports for all reusable UI components
 * 
 * Usage Examples:
 * import { UploadZone, StatusCard } from '/components/ui/index.js';
 * import { createSuccessCard } from '/components/ui/index.js';
 */

// Upload components
export { 
    UploadZone, 
    createUploadZone 
} from './UploadZone.js';

// Status components  
export { 
    StatusCard,
    createSuccessCard,
    createErrorCard, 
    createWarningCard,
    createInfoCard
} from './StatusCard.js';

// Future components can be added here:
// export { ActionButton } from './ActionButton.js';
// export { ProgressIndicator } from './ProgressIndicator.js';

/**
 * Quick component factory for common patterns
 */
export const UI = {
    // Upload zones
    createFileUpload: (options) => createUploadZone(options),
    createJsonUpload: () => createUploadZone({
        accept: '.json',
        title: 'Upload JSON File',
        description: 'Drag and drop your JSON file here or click to browse'
    }),
    createRubricUpload: () => createUploadZone({
        id: 'rubricUploadZone',
        inputId: 'rubricFileInput',
        accept: '.json',
        icon: 'upload',
        title: 'Upload Your Rubric',
        description: 'Drag and drop your rubric file here or click to browse'
    }),
    
    // Status cards
    success: (title, message, actions) => createSuccessCard(title, message, actions),
    error: (title, message, actions) => createErrorCard(title, message, actions),
    warning: (title, message, actions) => createWarningCard(title, message, actions),
    info: (title, message, actions) => createInfoCard(title, message, actions),
    
    // File upload success
    uploadSuccess: (filename) => createSuccessCard(
        'File Uploaded Successfully',
        filename ? `${filename} is ready for processing` : 'Ready to proceed to next step'
    )
};

export default UI;