/**
 * Rendering Service
 * Exact methods extracted from ScanProcessor for rendering cards, confidence indicators, and document display
 */
import { eventBus } from '/utils/EventBus.js';
import CardTemplates from '/pages/scan-processor/templates/CardTemplates.js';

export default class RenderingService {
    constructor() {
        // This service manages all rendering operations
        this.cardTemplates = new CardTemplates();
    }

    /**
     * Render card-based review (exact copy from line 1228)
     */
    renderCardBasedReview() {
        // Load the document image in the viewer
        const viewerContainer = document.getElementById('viewer-container');
        if (viewerContainer) {
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('ui:load-image-in-viewer', { viewerContainer });
        }

        // Initialize the enterprise viewer
        setTimeout(() => {
            // Phase 2 Complete: EventBus-only approach
            eventBus.emit('ui:initialize-enterprise-viewer');
        }, 100);

        // Render question cards
        this.renderQuestionCards();
        
        // Update progress indicator
        this.updateValidationProgress();
    }

    /**
     * Render confidence indicator (exact copy from line 1247)
     */
    renderConfidenceIndicator(processedData, uploadType) {
        if (!processedData) return '';
        
        const confidence = processedData.confidence || 0.0;
        const confidenceLevel = processedData.confidence_level || 'low';
        const needsReview = processedData.needs_review || false;
        const justification = processedData.confidence_justification || 'No confidence information available';
        
        // Add student-specific details for student worksheets
        const studentName = processedData.student_name || 'Unknown Student';
        const nameConfidence = processedData.name_confidence || 0.0;
        const isStudentWorksheet = uploadType === 'student';
        
        // Similar styling to grading hub confidence indicators
        const confidenceColor = confidence >= 0.8 ? 'text-green-400' : 
                                confidence >= 0.6 ? 'text-yellow-400' : 'text-red-400';
        const confidenceIcon = confidence >= 0.8 ? 'check-circle' : 
                              confidence >= 0.6 ? 'alert-triangle' : 'x-circle';
        const confidenceBg = confidence >= 0.8 ? 'bg-green-500/20' : 
                            confidence >= 0.6 ? 'bg-yellow-500/20' : 'bg-red-500/20';
        
        return `
            <div class="confidence-indicator mt-3 p-3 rounded-lg ${confidenceBg} border ${confidence >= 0.8 ? 'border-green-400/30' : confidence >= 0.6 ? 'border-yellow-400/30' : 'border-red-400/30'}">
                <div class="flex items-center gap-2 mb-1">
                    <i data-lucide="${confidenceIcon}" class="w-4 h-4 ${confidenceColor}"></i>
                    <span class="text-sm font-medium text-white">
                        Extraction Confidence: <span class="${confidenceColor}">${Math.round(confidence * 100)}%</span>
                        ${needsReview ? '<span class="text-red-400 ml-2">⚠ Needs Review</span>' : ''}
                    </span>
                </div>
                <p class="text-xs text-gray-300">${justification}</p>
                ${isStudentWorksheet ? `
                    <div class="mt-2 flex items-center justify-between text-xs">
                        <div class="flex items-center gap-4">
                            <span class="text-gray-400">Student: <span class="text-white font-medium">${studentName}</span></span>
                            <span class="text-gray-400">Name Confidence: 
                                <span class="${nameConfidence >= 0.7 ? 'text-green-400' : nameConfidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'} font-medium">
                                    ${Math.round(nameConfidence * 100)}%
                                </span>
                            </span>
                        </div>
                    </div>
                ` : ''}
                ${needsReview ? `
                    <div class="mt-2 text-xs text-red-300 bg-red-500/10 p-2 rounded border border-red-500/20">
                        <i data-lucide="flag" class="w-3 h-3 inline mr-1"></i>
                        This extraction has been flagged for manual review due to low confidence (&lt;70%).
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render question cards (Step 5D.2: Direct template calls, no context dependencies)
     */
    renderQuestionCards() {
        const container = document.getElementById('question-cards-container');
        if (!container) return;

        // Step 5D.2: Use EventBus to get data, call templates with proper parameters
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                if (!processedData) return;

                const cards = [];

                if (uploadType === 'student') {
                    // Add student name card first - pass processedData directly
                    const studentNameCard = this.cardTemplates.createStudentNameCard(processedData);
                    cards.push(studentNameCard);
                    
                    // Student worksheet - show answers as cards
                    const answers = processedData.answers || {};
                    Object.entries(answers).forEach(([questionId, answer]) => {
                        const answerCard = this.cardTemplates.createStudentAnswerCard(questionId, answer, processedData);
                        cards.push(answerCard);
                    });
                } else if (uploadType === 'rubric') {
                    // Rubric - show questions as cards
                    const questions = processedData.questions || [];
                    questions.forEach((question, index) => {
                        const questionCard = this.cardTemplates.createRubricQuestionCard(question, processedData);
                        cards.push(questionCard);
                    });
                }

                container.innerHTML = cards.join('');
                // Emit event to attach card listeners
                eventBus.emit('ui:attach-card-listeners');
            }
        });
    }

    /**
     * Load image in viewer (exact copy from line 1867)
     */
    loadImageInViewer(viewerContainer) {
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('data:get-processed-data', {
            callback: (processedData) => {
                // Check if we have processed page images from API response (priority over PDF iframe)
                if (processedData && processedData.processed_page_images && processedData.processed_page_images.length > 0) {
                    // Display processed page images (shows only the pages that were sent to OpenAI)
                    this.displayProcessedPageImages(viewerContainer, processedData.processed_page_images);
                    return;
                }

                // Get file data via EventBus
                eventBus.emit('file:get-display-data', {
                    callback: (fileData) => {
                        // Check if we have a PDF file that should be displayed (fallback for full PDF)
                        if (fileData.selectedFile && fileData.selectedFile.type === 'application/pdf') {
                            // For PDFs, show the PDF directly using iframe (same as preview modal)
                            const pdfUrl = URL.createObjectURL(fileData.selectedFile);
                            viewerContainer.innerHTML = `
                                <div class="pdf-viewer-wrapper" style="width: 100%; height: 100%; min-height: 600px;">
                                    <div class="text-white text-sm mb-2">PDF Document - ${fileData.selectedFile.name}</div>
                                    <iframe 
                                        src="${pdfUrl}" 
                                        style="width: 100%; height: calc(100% - 30px); border: 2px solid #374151; border-radius: 8px; background: white;"
                                        type="application/pdf">
                                        <p>Your browser doesn't support PDF preview. <a href="${pdfUrl}" target="_blank">Click here to view</a></p>
                                    </iframe>
                                </div>
                            `;
                            
                            // Clean up URL after some time to prevent memory leaks
                            setTimeout(() => URL.revokeObjectURL(pdfUrl), 300000); // 5 minutes
                            return;
                        }
                        
                        this.handleImageDisplay(viewerContainer, fileData);
                    }
                });
            }
        });
    }
    
    /**
     * Handle image display (helper method)
     */
    handleImageDisplay(viewerContainer, fileData) {
        
        // Performance optimization: Load image lazily for large files
        if (fileData.uploadedImageUrl) {
            // Image already loaded
            viewerContainer.innerHTML = `<img id="document-image" src="${fileData.uploadedImageUrl}" alt="Scanned document" draggable="false">`;
        } else if (fileData.deferredImageFile) {
            // Show loading state for large files
            viewerContainer.innerHTML = `
                <div class="loading-image-container" style="display: flex; align-items: center; justify-content: center; min-height: 300px; flex-direction: column; gap: 1rem;">
                    <div class="animate-spin" style="font-size: 2rem;">⏳</div>
                    <div class="text-gray-400">Loading document preview...</div>
                    <div class="text-sm text-gray-500">Large file - this may take a moment</div>
                </div>
            `;
            
            // Load image asynchronously to avoid blocking UI
            setTimeout(() => {
                try {
                    const imageUrl = URL.createObjectURL(fileData.deferredImageFile);
                    eventBus.emit('file:set-uploaded-image-url', { imageUrl });
                    viewerContainer.innerHTML = `<img id="document-image" src="${imageUrl}" alt="Scanned document" draggable="false">`;
                    
                    // Reinitialize viewer controls after image loads
                    setTimeout(() => {
                        eventBus.emit('ui:initialize-enterprise-viewer');
                    }, 100);
                } catch (error) {
                    console.error('Error loading image:', error);
                    viewerContainer.innerHTML = `
                        <div class="error-image-container" style="display: flex; align-items: center; justify-content: center; min-height: 300px; flex-direction: column; gap: 1rem;">
                            <div style="font-size: 2rem;">❌</div>
                            <div class="text-red-400">Failed to load document preview</div>
                            <div class="text-sm text-gray-500">The document will still be processed normally</div>
                        </div>
                    `;
                }
            }, 100);
        } else {
            // No image available
            viewerContainer.innerHTML = `<div class="no-image">No document preview available</div>`;
        }
    }

    /**
     * Display processed page images (exact copy from line 3368)
     */
    displayProcessedPageImages(viewerContainer, pageImages) {
        // Create multi-page viewer for processed pages
        const pageCount = pageImages.length;
        let currentPageIndex = 0;

        const updatePageDisplay = () => {
            const currentPage = pageImages[currentPageIndex];
            const pageImageSrc = `data:image/jpeg;base64,${currentPage.image_base64}`;
            
            viewerContainer.innerHTML = `
                <div class="processed-pages-viewer" style="width: 100%; height: 100%; min-height: 600px;">
                    <!-- Page Navigation Header -->
                    <div class="page-nav-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0.5rem; background: rgba(55, 65, 81, 0.5); border-radius: 8px;">
                        <div class="text-white text-sm">
                            Processed Page ${currentPage.page_number} of Original PDF
                        </div>
                        <div class="page-controls" style="display: flex; gap: 0.5rem; align-items: center;">
                            <button id="prev-page-btn" class="btn btn-secondary btn-sm" ${currentPageIndex === 0 ? 'disabled' : ''}>
                                <i data-lucide="chevron-left" class="w-4 h-4"></i>
                            </button>
                            <span class="text-white text-sm px-2">
                                ${currentPageIndex + 1} of ${pageCount}
                            </span>
                            <button id="next-page-btn" class="btn btn-secondary btn-sm" ${currentPageIndex === pageCount - 1 ? 'disabled' : ''}>
                                <i data-lucide="chevron-right" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Page Image Display -->
                    <div class="page-image-container" style="width: 100%; height: calc(100% - 60px); display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.1); border-radius: 8px; overflow: auto;">
                        <img 
                            src="${pageImageSrc}" 
                            style="max-width: 100%; max-height: 100%; border: 2px solid #374151; border-radius: 8px; background: white; object-fit: contain;"
                            alt="Processed page ${currentPage.page_number}">
                    </div>
                </div>
            `;

            // Add event listeners for navigation buttons
            const prevBtn = viewerContainer.querySelector('#prev-page-btn');
            const nextBtn = viewerContainer.querySelector('#next-page-btn');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (currentPageIndex > 0) {
                        currentPageIndex--;
                        updatePageDisplay();
                    }
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentPageIndex < pageCount - 1) {
                        currentPageIndex++;
                        updatePageDisplay();
                    }
                });
            }

            // Reinitialize Lucide icons for the new buttons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        };

        // Initial display
        updatePageDisplay();
    }

    /**
     * Display extracted data (Step 5D.4: EventBus approach, no context parameter)
     */
    displayExtractedData() {
        const reviewContent = document.getElementById('review-content');
        if (!reviewContent) return;
        
        // Step 5D.4: Use EventBus to check current step and get data
        eventBus.emit('ui:get-current-step', {
            callback: (currentStep) => {
                if (currentStep !== 'review') {
                    console.log('Not in review step, skipping display update');
                    return;
                }
                
                // Save initial state for undo functionality via EventBus
                eventBus.emit('state:save-requested');
                
                // Get processed data via EventBus
                eventBus.emit('data:get-processed-data', {
                    callback: (processedData, uploadType) => {
                        if (!processedData) return;
                        
                        if (uploadType === 'student') {
                            reviewContent.innerHTML = this.renderStudentData(processedData);
                        } else {
                            reviewContent.innerHTML = this.renderRubricData(processedData);
                        }
                        
                        // Update undo/redo button states via EventBus
                        setTimeout(() => eventBus.emit('ui:update-undo-redo-buttons'), 100);
                    }
                });
            }
        });
    }

    /**
     * Render student data (exact copy from line 1961)
     */
    renderStudentData(data) {
        return `
            <div class="data-preview">
                <div class="data-section">
                    <h4>Student Information</h4>
                    <div class="info-item">
                        <label>Name:</label>
                        <span>${data.student_name}</span>
                    </div>
                </div>
                
                <div class="data-section">
                    <h4>Extracted Answers (${Object.keys(data.answers).length})</h4>
                    <div class="answers-grid">
                        ${Object.entries(data.answers).map(([qId, answer]) => `
                            <div class="answer-item">
                                <div class="question-id">${qId}</div>
                                <div class="answer-text">"${answer}"</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render rubric data (exact copy from line 1987)
     */
    renderRubricData(data) {
        return `
            <div class="data-preview">
                <div class="data-section">
                    <h4>Exam Information</h4>
                    <div class="info-item">
                        <label>Exam Name:</label>
                        <span>${data.exam_name}</span>
                    </div>
                    ${data.general_instructions ? `
                        <div class="info-item">
                            <label>Instructions:</label>
                            <span>${data.general_instructions}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="data-section">
                    <h4>Extracted Questions (${data.questions.length})</h4>
                    <div class="questions-list">
                        ${data.questions.map(q => `
                            <div class="question-item">
                                <div class="question-header">
                                    <span class="question-id">${q.question_id}</span>
                                    <span class="question-points">${q.max_points} pts</span>
                                </div>
                                <div class="question-text">${q.question_text}</div>
                                <div class="criteria-list">
                                    ${q.criteria.map(c => `
                                        <div class="criterion">${c.criterion} (${c.max_points} pts)</div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update validation progress (Step 5D.1: EventBus approach, no context parameter)
     */
    updateValidationProgress() {
        const progressElement = document.getElementById('validation-progress');
        if (!progressElement) return;

        // Step 5D.1: Use EventBus to get data instead of context parameter
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                if (!processedData) return;

                let totalQuestions = 0;
                let reviewedQuestions = 0;

                if (uploadType === 'student') {
                    totalQuestions = Object.keys(processedData.answers || {}).length + 1; // +1 for student name
                    // Count reviewed items (this would be updated by card interactions)
                    reviewedQuestions = 0; // This would be calculated based on user interactions
                } else {
                    totalQuestions = (processedData.questions || []).length;
                    reviewedQuestions = 0; // This would be calculated based on user interactions
                }

                progressElement.innerHTML = `<span>${reviewedQuestions} of ${totalQuestions} reviewed</span>`;
            }
        });
    }
}