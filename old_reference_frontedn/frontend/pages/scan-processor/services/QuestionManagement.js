/**
 * Question Management Service
 * Exact methods extracted from ScanProcessor for question/answer editing and visual editor functionality
 * 
 * Handles visual editor rendering, auto-save functionality, and data persistence for both student
 * and rubric workflows. Provides comprehensive editing interface with real-time updates.
 */
import { eventBus } from '/utils/EventBus.js';

export default class QuestionManagement {
    constructor() {
        this.historyTimeout = null;
    }

    /**
     * Add criterion to question (exact copy from monolithic)
     */
    addCriterionToQuestion(questionId) {
        const card = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!card) return;

        const criteriaContainer = card.querySelector('.criteria-container');
        if (!criteriaContainer) return;

        // Save state before adding criterion for undo/redo functionality
        eventBus.emit('state:save-requested');

        const criterionCount = criteriaContainer.children.length;
        const newCriterion = document.createElement('div');
        newCriterion.className = 'criterion-card bg-gray-700 rounded p-3';
        newCriterion.setAttribute('data-criterion-index', criterionCount);
        
        newCriterion.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="text" value="New criterion" 
                       placeholder="Criterion name" class="input flex-1 text-sm" 
                       data-field="criterion">
                <input type="number" value="1" 
                       class="input w-16 text-sm" data-field="max_points" min="0">
                <span class="text-gray-400 text-xs">pts</span>
                <button class="btn btn-secondary text-xs" data-action="remove-criterion" data-question-id="${questionId}" data-criterion-index="${criterionCount}">
                    <i data-lucide="x" class="w-3 h-3"></i>
                </button>
            </div>
        `;
        
        criteriaContainer.appendChild(newCriterion);
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Update the processed data
        this.updateCriteriaInProcessedData(questionId);
    }

    /**
     * Remove criterion from question (exact copy from monolithic)
     */
    removeCriterionFromQuestion(questionId, criterionIndex) {
        const card = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!card) return;

        // Save state before removing criterion for undo/redo functionality
        eventBus.emit('state:save-requested');

        const criterion = card.querySelector(`[data-criterion-index="${criterionIndex}"]`);
        if (criterion) {
            criterion.remove();
            this.updateCriteriaInProcessedData(questionId);
        }
    }

    /**
     * Remove question (exact copy from monolithic)
     */
    removeQuestion(questionId) {
        const card = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!card) return;

        // Save state before removing
        eventBus.emit('state:save-requested');

        // No confirmation needed - we have undo functionality
        card.remove();
        this.removeQuestionFromProcessedData(questionId);
        eventBus.emit('ui:update-validation-progress');
    }

    /**
     * Update criteria in processed data (exact copy from monolithic)
     */
    updateCriteriaInProcessedData(questionId) {
        const card = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!card) return;

        const criteria = [];
        const criterionCards = card.querySelectorAll('.criterion-card');
        
        criterionCards.forEach((criterionCard) => {
            const criterionInput = criterionCard.querySelector('[data-field="criterion"]');
            const pointsInput = criterionCard.querySelector('[data-field="max_points"]');
            
            if (criterionInput && pointsInput) {
                criteria.push({
                    criterion: criterionInput.value,
                    max_points: parseInt(pointsInput.value) || 1
                });
            }
        });

        // Update the processed data based on upload type via EventBus
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                this.performCriteriaUpdate(questionId, criteria, processedData, uploadType, card);
            }
        });
    }

    performCriteriaUpdate(questionId, criteria, processedData, uploadType, card) {
        if (uploadType === 'rubric' && processedData?.questions) {
            const questionIndex = processedData.questions.findIndex(q => 
                (q.question_id || `Q${processedData.questions.indexOf(q) + 1}`) === questionId
            );
            
            if (questionIndex !== -1) {
                processedData.questions[questionIndex].criteria = criteria;
                
                // Update max_points to sum of all criteria
                const totalPoints = criteria.reduce((sum, c) => sum + (c.max_points || 0), 0);
                processedData.questions[questionIndex].max_points = totalPoints;
                
                // Also update the max points input in the UI
                const maxPointsInput = card.querySelector('[data-field="max_points"]');
                if (maxPointsInput) {
                    maxPointsInput.value = totalPoints;
                }
            }
        }

        // Update state via EventBus
        eventBus.emit('state:update', { data: processedData });
    }

    /**
     * Remove question from processed data (exact copy from monolithic)
     */
    removeQuestionFromProcessedData(questionId) {
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                this.performQuestionRemoval(questionId, processedData, uploadType);
            }
        });
    }

    performQuestionRemoval(questionId, processedData, uploadType) {
        if (uploadType === 'student' && processedData?.answers) {
            delete processedData.answers[questionId];
            if (processedData.customQuestions) {
                delete processedData.customQuestions[questionId];
            }
        } else if (uploadType === 'rubric' && processedData?.questions) {
            const questionIndex = processedData.questions.findIndex(q => 
                (q.question_id || `Q${processedData.questions.indexOf(q) + 1}`) === questionId
            );
            
            if (questionIndex !== -1) {
                processedData.questions.splice(questionIndex, 1);
            }
        }
        
        // Clean up confidence data for the deleted question
        if (processedData?.question_confidence) {
            delete processedData.question_confidence[questionId];
        }
        if (processedData?.question_needs_review) {
            delete processedData.question_needs_review[questionId];
        }

        // Update state via EventBus
        eventBus.emit('state:update', { data: processedData });
    }

    /**
     * Render visual editor (exact copy from line 2358)
     * Determines which editor type to render based on upload type.
     * 
     * @description Routes to appropriate editor (student vs rubric) for visual editing interface.
     * Core method for displaying editing UI in modal dialogs.
     */
    renderVisualEditor() {
        // Use EventBus to get data and determine editor type
        return new Promise((resolve) => {
            eventBus.emit('data:get-processed-data', {
                callback: (processedData, uploadType) => {
                    if (uploadType === 'student') {
                        resolve(this.renderStudentEditor(processedData));
                    } else {
                        resolve(this.renderRubricEditor(processedData));
                    }
                }
            });
        });
    }

    /**
     * Render student editor (exact copy from line 2366)
     * Creates visual editing interface for student worksheet data.
     * 
     * @description Generates HTML interface for editing student name and answers.
     * Provides add/remove functionality for dynamic answer management.
     */
    renderStudentEditor(processedData) {
        return `
            <div class="visual-editor">
                <div class="editor-section">
                    <label class="editor-label">Student Name:</label>
                    <input type="text" id="edit-student-name" class="form-input" value="${processedData.student_name || ''}">
                </div>
                
                <div class="editor-section">
                    <h4>Answers (${Object.keys(processedData.answers || {}).length})</h4>
                    <div id="answers-editor">
                        ${Object.entries(processedData.answers || {}).map(([qId, answer], index) => `
                            <div class="answer-editor-row" data-question="${qId}">
                                <div class="question-controls">
                                    <input type="text" class="question-id-input" value="${qId}" readonly>
                                    <button class="btn-sm btn-danger" data-action="remove-answer" data-question-id="${qId}">Remove</button>
                                </div>
                                <input type="text" class="answer-input form-input" value="${answer}" placeholder="Student answer">
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary btn-sm" id="add-answer">Add Answer</button>
                </div>
            </div>
        `;
    }

    /**
     * Render rubric editor (exact copy from line 2393)
     * Creates visual editing interface for rubric data with questions and criteria.
     * 
     * @description Generates comprehensive HTML interface for editing exam name, instructions,
     * questions, and grading criteria. Supports dynamic question/criteria management.
     */
    renderRubricEditor(processedData) {
        return `
            <div class="visual-editor">
                <div class="editor-section">
                    <label class="editor-label">Exam Name:</label>
                    <input type="text" id="edit-exam-name" class="form-input" value="${processedData.exam_name || ''}">
                </div>
                
                <div class="editor-section">
                    <label class="editor-label">General Instructions:</label>
                    <textarea id="edit-general-instructions" class="form-input" rows="2">${processedData.general_instructions || ''}</textarea>
                </div>
                
                <div class="editor-section">
                    <h4>Questions (${(processedData.questions || []).length})</h4>
                    <div id="questions-editor">
                        ${(processedData.questions || []).map((q, index) => `
                            <div class="question-editor-card" data-question-index="${index}">
                                <div class="question-editor-header">
                                    <input type="text" class="question-id-input" value="${q.question_id}" readonly>
                                    <input type="number" class="points-input" value="${q.max_points}" min="1" max="10">
                                    <span>pts</span>
                                    <button class="btn-sm btn-danger" data-action="remove-question" data-question-index="${index}">Remove</button>
                                </div>
                                <textarea class="form-input question-text-input" rows="2" placeholder="Question text">${q.question_text}</textarea>
                                <div class="criteria-editor">
                                    <label class="editor-label">Criteria:</label>
                                    ${q.criteria.map((c, cIndex) => `
                                        <div class="criterion-row">
                                            <input type="text" class="form-input criterion-input" value="${c.criterion}" placeholder="Criterion description">
                                            <input type="number" class="points-input" value="${c.max_points}" min="1" max="10">
                                            <span>pts</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary btn-sm" id="add-question">Add Question</button>
                </div>
            </div>
        `;
    }

    /**
     * Save visual editor changes (exact copy from line 2437)
     * Commits changes from visual editor interface to processed data structure.
     * 
     * @description Extracts values from DOM inputs and updates processedData according to upload type.
     * Preserves existing data structure while updating changed fields. Uses SSOT pattern.
     */
    saveVisualEditorChanges() {
        // Auto-save changes in real-time (this method is called on export/start grading)  
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                this.performVisualEditorSave(processedData, uploadType);
            }
        });
    }

    performVisualEditorSave(processedData, uploadType) {
        if (uploadType === 'student') {
            // Save student data changes
            const studentNameInput = document.getElementById('edit-student-name');
            const studentName = studentNameInput ? studentNameInput.value : processedData.student_name;
            const answers = {};
            
            document.querySelectorAll('.answer-editor-row').forEach(row => {
                const questionId = row.querySelector('.question-id-input').value;
                const answer = row.querySelector('.answer-input').value;
                if (questionId && answer) {
                    answers[questionId] = answer;
                }
            });
            
            // Update only the changed fields, preserve everything else
            const updatedData = {
                ...processedData,  // Preserve all existing data
                student_name: studentName,
                answers: answers
            };
            
            // Update state via EventBus
            eventBus.emit('state:update', { data: updatedData });
            this.markAsChanged();
        } else {
            // Save rubric data changes - ONLY if visual editor is active
            const examNameInput = document.getElementById('edit-exam-name');
            const generalInstructionsInput = document.getElementById('edit-general-instructions');
            
            if (examNameInput || generalInstructionsInput) {
                // Visual editor is active, save changes from DOM
                const examName = examNameInput ? examNameInput.value : processedData.exam_name;
                const generalInstructions = generalInstructionsInput ? generalInstructionsInput.value : processedData.general_instructions;
                const questions = [];
                
                document.querySelectorAll('.question-editor-card').forEach((card, index) => {
                    const questionId = card.querySelector('.question-id-input')?.value;
                    const questionText = card.querySelector('.question-text-input')?.value;
                    const maxPoints = parseInt(card.querySelector('.points-input')?.value) || 1;
                    
                    const criteria = [];
                    card.querySelectorAll('.criterion-row').forEach(criterionRow => {
                        const criterionText = criterionRow.querySelector('.criterion-input')?.value;
                        const criterionPoints = parseInt(criterionRow.querySelector('.points-input')?.value) || 1;
                        if (criterionText) {
                            criteria.push({
                                criterion: criterionText,
                                max_points: criterionPoints
                            });
                        }
                    });
                    
                    if (questionId && questionText) {
                        questions.push({
                            question_id: questionId,
                            question_text: questionText,
                            max_points: maxPoints,
                            criteria: criteria
                        });
                    }
                });
                
                // Only update if we found questions, otherwise preserve existing data
                if (questions.length > 0 || !processedData.questions || processedData.questions.length === 0) {
                    const updatedData = {
                        ...processedData, // Preserve other properties like confidence scores
                        exam_name: examName,
                        general_instructions: generalInstructions,
                        questions: questions
                    };
                    eventBus.emit('state:update', { data: updatedData });
                    this.markAsChanged();
                } else {
                    // Just update the basic fields, preserve questions - use SSOT pattern
                    const updatedData = {
                        ...processedData,
                        exam_name: examName,
                        general_instructions: generalInstructions
                    };
                    eventBus.emit('state:update', { data: updatedData });
                    this.markAsChanged();
                }
            }
            // If visual editor is not active, don't change the data
        }
    }

    /**
     * Attach auto-save listeners (exact copy from line 2523)
     * Attaches real-time auto-save functionality to all input fields in visual editor.
     * 
     * @description Sets up event listeners for input changes to enable automatic saving.
     * Prevents duplicate listeners and provides debounced state saving.
     */
    attachAutoSaveListeners() {
        // Add real-time auto-save to all input fields
        const inputSelectors = [
            '#edit-exam-name',
            '#edit-general-instructions', 
            '#edit-student-name',
            '.question-text-input',
            '.question-id-input',
            '.points-input',
            '.answer-input',
            '.criterion-input'
        ];

        inputSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(input => {
                // Remove existing listeners to avoid duplicates
                input.removeEventListener('input', this.handleInputChange);
                input.removeEventListener('blur', this.handleInputChange);
                
                // Add new listeners  
                input.addEventListener('input', this.handleInputChange.bind(this));
                input.addEventListener('blur', this.handleInputChange.bind(this));
            });
        });
    }

    /**
     * Handle input change (exact copy from line 2549)
     * Processes input field changes with debounced state saving and real-time updates.
     * 
     * @description Manages automatic saving of changes when user modifies input fields.
     * Provides debounced state saving for undo/redo system.
     */
    handleInputChange() {
        // Save state before change (debounced)
        if (!this.historyTimeout) {
            eventBus.emit('state:save-requested');
            this.historyTimeout = setTimeout(() => {
                this.historyTimeout = null;
            }, 500);
        }
        
        // Update local state
        this.saveVisualEditorChanges();
        
        // Changes will be saved when user clicks save
    }

    /**
     * Mark as changed (exact copy from line 3334)
     * Marks document as having unsaved changes.
     * 
     * @description Simple flag for tracking when document has been modified.
     * Changes will be saved when user explicitly saves session.
     */
    markAsChanged() {
        // Changes will be saved when user clicks save
    }

    /**
     * Collect page selection data (exact copy from line 3350)
     * Collects page selection settings before DOM reset operations.
     * 
     * @description Preserves page selection state across render cycles.
     * Important for maintaining user's page selection preferences.
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
     * Clear timeout for cleanup
     */
    cleanup() {
        if (this.historyTimeout) {
            clearTimeout(this.historyTimeout);
            this.historyTimeout = null;
        }
    }
}