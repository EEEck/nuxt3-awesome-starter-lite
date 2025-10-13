/**
 * Reusable UploadZone Component
 * Extracted from wizard templates for consistent upload UI across the app
 * 
 * Features:
 * - Drag & drop file uploads
 * - Click to browse functionality  
 * - Customizable accept types and messaging
 * - Consistent styling with hover/active states
 */

export class UploadZone {
    constructor(options = {}) {
        this.options = {
            id: options.id || 'uploadZone',
            inputId: options.inputId || 'fileInput',
            accept: options.accept || '.json',
            icon: options.icon || 'upload',
            iconClass: options.iconClass || 'w-10 h-10 text-blue-400',
            title: options.title || 'Upload File',
            description: options.description || 'Drag and drop your file here or click to browse',
            formatHint: options.formatHint || '',
            ...options
        };
    }

    /**
     * Generate the HTML for the upload zone
     * @returns {string} HTML template string
     */
    render() {
        return `
            <div class="upload-zone" id="${this.options.id}">
                <div class="flex flex-col items-center gap-3">
                    <i data-lucide="${this.options.icon}" class="${this.options.iconClass}"></i>
                    <div class="text-center">
                        <p class="text-white text-lg font-medium mb-1">${this.options.title}</p>
                        <p class="text-sm text-gray-400">${this.options.description}</p>
                        ${this.options.formatHint ? `
                            <div class="text-sm text-gray-400 mt-2">
                                ${this.options.formatHint}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <input type="file" id="${this.options.inputId}" accept="${this.options.accept}" class="hidden">
            </div>
        `;
    }

    /**
     * Setup drag & drop and click functionality after the component is rendered
     * Call this after adding the component HTML to the DOM
     */
    setupEventListeners() {
        const zone = document.getElementById(this.options.id);
        const input = document.getElementById(this.options.inputId);

        if (zone && input) {
            // Click to browse
            zone.addEventListener('click', () => input.click());

            // Drag & drop functionality  
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));

            // File input change
            if (this.options.onFileSelect) {
                input.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.options.onFileSelect(e.target.files[0]);
                    }
                });
            }
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('active');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('active');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('active');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && this.options.onFileSelect) {
            this.options.onFileSelect(files[0]);
        }
    }
}

/**
 * Convenience function for quick upload zone creation
 * @param {Object} options - Upload zone configuration
 * @returns {string} HTML template string
 */
export function createUploadZone(options = {}) {
    const uploadZone = new UploadZone(options);
    return uploadZone.render();
}

// Export default for common usage patterns
export default UploadZone;