/**
 * File Management Service
 * Exact methods extracted from ScanProcessor for file handling, validation, and PDF operations
 */
import { eventBus } from '/utils/EventBus.js';

export default class FileManagement {
    constructor() {
        this.selectedFile = null;
        this.pdfPageCount = null;
        this.uploadedImageUrl = null;
        this.deferredImageFile = null;
    }

    /**
     * Handle file selection (exact copy from line 729)
     */
    handleFileSelect(file, uploadType = null) {        
        if (!file) {
            return;
        }

        // Enhanced file validation
        const validationResult = this.validateFile(file);
        if (!validationResult.valid) {
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('ui:show-error', {
                title: 'File Validation Error',
                message: validationResult.error
            });
            return;
        }

        this.selectedFile = file;
        
        // Show/hide PDF page selector based on file type
        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const pageSelector = document.getElementById('pdf-page-selector');
        if (pageSelector) {
            pageSelector.style.display = isPDF ? 'block' : 'none';
        }

        // Detect PDF page count for validation
        if (isPDF) {
            this.detectPdfPageCount(file);
        } else {
            this.pdfPageCount = null;
        }
        
        this.showFilePreview(file);
        
        // Phase 2 Complete: EventBus-only approach - trigger button state update
        eventBus.emit('file:uploaded', { file, uploadType });
    }

    /**
     * Validate file (exact copy from line 759)
     */
    validateFile(file) {
        // File type validation
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            return {
                valid: false,
                error: `Unsupported file type "${fileExtension}". Please select a PDF, JPEG, or PNG file.`
            };
        }

        // File size validation (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size (${this.formatFileSize(file.size)}) exceeds the 50MB limit. Please use a smaller file.`
            };
        }

        // Minimum file size validation (1KB)
        const minSize = 1024; // 1KB in bytes
        if (file.size < minSize) {
            return {
                valid: false,
                error: `File size (${this.formatFileSize(file.size)}) is too small. Please select a valid document.`
            };
        }

        // File name validation
        if (file.name.length > 255) {
            return {
                valid: false,
                error: 'File name is too long. Please rename the file to be shorter than 255 characters.'
            };
        }

        // Check for potentially problematic characters in filename
        const problematicChars = /[<>:"|?*]/;
        if (problematicChars.test(file.name)) {
            return {
                valid: false,
                error: 'File name contains invalid characters. Please remove characters like < > : " | ? *'
            };
        }

        return { valid: true };
    }

    /**
     * Show file preview (exact copy from line 860)
     */
    showFilePreview(file) {
        const preview = document.getElementById('file-preview');
        const fileInfo = document.getElementById('file-info');
        
        // Performance optimization: Defer image URL creation for large files
        if (file.size > 10 * 1024 * 1024) { // > 10MB
            // Don't create blob URL immediately for large files
            this.uploadedImageUrl = null;
            this.deferredImageFile = file;
        } else {
            // Create image URL for preview in editor
            this.uploadedImageUrl = URL.createObjectURL(file);
            this.deferredImageFile = null;
        }
        
        // Show performance warning for large files
        const sizeWarning = file.size > 20 * 1024 * 1024 ? 
            '<div class="text-xs text-yellow-400 mt-1">⚠️ Large file detected - processing may take longer</div>' : '';
        
        fileInfo.innerHTML = `
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                    <span class="file-type">${file.type || 'Unknown'}</span>
                </div>
                ${sizeWarning}
            </div>
        `;
        
        preview.style.display = 'block';
    }

    /**
     * Format file size (exact copy from line 2705)
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Detect PDF page count (exact copy from line 3144)
     */
    async detectPdfPageCount(file) {
        try {
            // Use our backend API to get page count efficiently
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/pdf-page-count', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.pdfPageCount = result.page_count;
            } else {
                console.warn('PDF page count API failed with status:', response.status);
                const errorText = await response.text();
                console.warn('Error details:', errorText);
                
                // Enhanced fallback logic for better page count estimation
                const fileSizeKB = file.size / 1024;
                let estimatedPages;
                
                if (fileSizeKB < 50) {
                    // Very small files - likely 1 page
                    estimatedPages = 1;
                } else if (fileSizeKB < 150) {
                    // Small files - likely 1-2 pages
                    estimatedPages = Math.max(1, Math.ceil(fileSizeKB / 100));
                } else if (fileSizeKB < 500) {
                    // Medium files - use conservative estimate
                    estimatedPages = Math.max(2, Math.ceil(fileSizeKB / 120));
                } else {
                    // Large files - assume more efficient compression
                    estimatedPages = Math.max(3, Math.ceil(fileSizeKB / 150));
                }
                
                this.pdfPageCount = estimatedPages;
                
                // Show a warning to the user about estimation
                this.showPageCountWarning(estimatedPages);
            }
        } catch (error) {
            console.warn('Could not detect PDF page count:', error);
            // Enhanced fallback: estimate from file size with better logic
            const fileSizeKB = file.size / 1024;
            let estimatedPages;
            
            if (fileSizeKB < 50) {
                estimatedPages = 1;
            } else if (fileSizeKB < 150) {
                estimatedPages = Math.max(1, Math.ceil(fileSizeKB / 100));
            } else if (fileSizeKB < 500) {
                estimatedPages = Math.max(2, Math.ceil(fileSizeKB / 120));
            } else {
                estimatedPages = Math.max(3, Math.ceil(fileSizeKB / 150));
            }
            
            this.pdfPageCount = estimatedPages;
            this.showPageCountWarning(estimatedPages);
        }
        
        // Page count detection complete
    }

    /**
     * Show page count warning (exact copy from line 3209)
     */
    showPageCountWarning(estimatedPages) {
        // Add a subtle warning banner about page count estimation
        const pageSelector = document.getElementById('pdf-page-selector');
        if (pageSelector) {
            // Remove any existing warning
            const existingWarning = pageSelector.querySelector('.page-count-warning');
            if (existingWarning) {
                existingWarning.remove();
            }
            
            // Add new warning
            const warning = document.createElement('div');
            warning.className = 'page-count-warning';
            warning.innerHTML = `
                <div class="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 mt-2">
                    <div class="flex items-center gap-2">
                        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                        <span class="font-medium">Page count estimated</span>
                    </div>
                    <p class="mt-1 text-yellow-300">
                        Estimated ${estimatedPages} pages based on file size. 
                        If incorrect, you can still select specific page ranges below.
                    </p>
                </div>
            `;
            pageSelector.appendChild(warning);
            
            // Update icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    /**
     * Validate page range (exact copy from line 3243)
     */
    validatePageRange(rangeInput) {
        const validationDiv = document.getElementById('range-validation');
        const customPagesInput = document.getElementById('custom-pages');
        
        
        if (!validationDiv || !customPagesInput) return true;

        // Clear previous validation
        validationDiv.style.display = 'none';
        customPagesInput.classList.remove('border-red-500', 'border-green-500');
        
        if (!rangeInput) {
            return true; // Empty is valid (will use 'all')
        }

        if (!this.pdfPageCount) {
            console.warn('No PDF page count available for validation');
            return true; // Can't validate without page count
        }

        try {
            // Parse the range using our backend logic (simplified client version)
            const parts = rangeInput.split(',');
            const pageNumbers = [];
            
            for (let part of parts) {
                part = part.trim();
                if (part.includes('-')) {
                    // Range like "1-3"
                    const rangeParts = part.split('-');
                    if (rangeParts.length !== 2) {
                        throw new Error(`Invalid range format: "${part}". Use format like "1-3".`);
                    }
                    
                    const start = parseInt(rangeParts[0].trim());
                    const end = parseInt(rangeParts[1].trim());
                    
                    if (isNaN(start) || isNaN(end)) {
                        throw new Error(`Invalid numbers in range: "${part}"`);
                    }
                    
                    if (start < 1 || end > this.pdfPageCount) {
                        throw new Error(`Range "${part}" is outside PDF bounds (1-${this.pdfPageCount}).`);
                    }
                    
                    if (start > end) {
                        throw new Error(`Invalid range "${part}": start page must be ≤ end page.`);
                    }
                    
                    for (let i = start; i <= end; i++) {
                        pageNumbers.push(i);
                    }
                } else {
                    // Single page like "5"
                    const pageNum = parseInt(part);
                    if (isNaN(pageNum)) {
                        throw new Error(`Invalid page number: "${part}"`);
                    }
                    
                    if (pageNum < 1 || pageNum > this.pdfPageCount) {
                        throw new Error(`Page ${pageNum} is outside PDF bounds (1-${this.pdfPageCount}).`);
                    }
                    
                    pageNumbers.push(pageNum);
                }
            }
            
            // Success - show valid feedback
            customPagesInput.classList.add('border-green-500');
            validationDiv.innerHTML = `
                <div class="text-green-400 text-xs">
                    ✓ Valid range: ${pageNumbers.length} page(s) selected
                </div>
            `;
            validationDiv.style.display = 'block';
            return true;
            
        } catch (error) {
            // Error - show invalid feedback
            customPagesInput.classList.add('border-red-500');
            validationDiv.innerHTML = `
                <div class="text-red-400 text-xs">
                    ✗ ${error.message}
                </div>
            `;
            validationDiv.style.display = 'block';
            return false;
        }
    }

    /**
     * Collect page selection data (exact copy from line 3350)
     */
    collectPageSelectionData() {
        // Collect page selection data before DOM gets reset by render()
        const pageSelectionTypeElement = document.getElementById('page-selection-type');
        const customPagesElement = document.getElementById('custom-pages');
        
        if (!pageSelectionTypeElement) {
            return { type: 'all', customPages: null };
        }
        
        const selectionType = pageSelectionTypeElement.value;
        const customPages = customPagesElement?.value?.trim() || null;
        
        return {
            type: selectionType,
            customPages: customPages
        };
    }

    /**
     * Cleanup file resources
     */
    cleanup() {
        // Release blob URLs to free memory
        if (this.uploadedImageUrl) {
            URL.revokeObjectURL(this.uploadedImageUrl);
            this.uploadedImageUrl = null;
        }
    }

    /**
     * Get current selected file
     */
    getSelectedFile() {
        return this.selectedFile;
    }

    /**
     * Get current PDF page count
     */
    getPdfPageCount() {
        return this.pdfPageCount;
    }

    /**
     * Get uploaded image URL
     */
    getUploadedImageUrl() {
        return this.uploadedImageUrl;
    }
}