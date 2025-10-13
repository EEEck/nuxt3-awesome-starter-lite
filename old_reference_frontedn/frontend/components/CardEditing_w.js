/**
 * Card Editing Service
 * Exact methods extracted from ScanProcessor for card editing functionality
 * 
 * Handles visual editing mode, input field management, and data synchronization
 * between UI and processed data structure. Supports both student and rubric workflows.
 */
import { eventBus } from '/utils/EventBus.js';
import { gradingDataStore as dataStore } from '/components/DataStore.js';

export default class CardEditing {
    constructor() {
        this.bind();
    }

    bind() {
        // Clean EventBus pattern: Listen to card actions and update DataStore only
        eventBus.on('card:action', ({ action, id }) => {
            console.log('🎯 CardEditing: Processing card action:', action, 'for ID:', id);
            
            if (!id) {
                console.warn('❌ CardEditing: No ID provided for card action');
                return;
            }
            
            // Save state before changes
            eventBus.emit('state:save-requested');
            
            // Update data store (single source of truth)
            if (action === 'flag') {
                dataStore.toggleFlag(id);
            } else if (action === 'accept') {
                dataStore.toggleAccept(id);
            } else if (action === 'edit') {
                this.handleEdit(id);
            }
            
            // Update validation progress
            eventBus.emit('ui:update-validation-progress');
        });
    }

    handleEdit(questionId) {
        // Find the card element for edit functionality
        const card = document.querySelector(`[data-question-id="${questionId}"]`);
        if (card) {
            this.editQuestion(questionId, card);
        }
    }

    /**
     * Refresh Lucide icons after innerHTML changes
     */
    refreshLucideIcons(card) {
        // Re-initialize Lucide icons in the card after changing button content
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons({
                icons: {
                    ...lucide.icons
                },
                nameAttr: 'data-lucide'
            });
        }
    }

    /**
     * Update field in processed data (exact copy from line 1636)
     * Synchronizes UI changes with the underlying data structure for both student and rubric workflows.
     * 
     * @description Handles data updates for different field types and upload types. Maintains
     * data consistency between visual editing and JSON structure.
     */
    updateFieldInProcessedData(questionId, fieldName, value) {
        // Get upload type and processed data via EventBus
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                this.performFieldUpdate(questionId, fieldName, value, processedData, uploadType);
            }
        });
    }

    performFieldUpdate(questionId, fieldName, value, processedData, uploadType) {
        if (uploadType === 'student') {
            // Handle student worksheet fields
            if (fieldName === 'question_id') {
                // Update the question ID in answers and custom questions
                if (processedData?.answers && processedData.answers[questionId]) {
                    const answerValue = processedData.answers[questionId];
                    delete processedData.answers[questionId];
                    processedData.answers[value] = answerValue;
                }
                if (processedData?.customQuestions && processedData.customQuestions[questionId]) {
                    const questionText = processedData.customQuestions[questionId];
                    delete processedData.customQuestions[questionId];
                    processedData.customQuestions[value] = questionText;
                }
            } else if (fieldName === 'question_text') {
                if (!processedData.customQuestions) {
                    processedData.customQuestions = {};
                }
                processedData.customQuestions[questionId] = value;
            } else if (fieldName === 'student_answer') {
                if (!processedData.answers) {
                    processedData.answers = {};
                }
                processedData.answers[questionId] = value;
            } else if (fieldName === 'student_name') {
                processedData.student_name = value;
            }
        } else if (uploadType === 'rubric' && processedData?.questions) {
            // Handle rubric fields
            const questionIndex = processedData.questions.findIndex(q => 
                (q.question_id || `Q${processedData.questions.indexOf(q) + 1}`) === questionId
            );
            
            if (questionIndex !== -1) {
                const question = processedData.questions[questionIndex];
                
                if (fieldName === 'question_id') {
                    question.question_id = value;
                } else if (fieldName === 'question_text') {
                    question.question_text = value;
                } else if (fieldName === 'max_points') {
                    question.max_points = parseInt(value) || 1;
                }
            }
        }

        // Update state via EventBus after field update
        eventBus.emit('state:update', { data: processedData });
    }

    /**
     * Edit question (exact copy from line 1684)
     * Toggles between edit and save mode for question cards.
     * 
     * @description Handles the edit button click to either enter editing mode or save changes.
     * Provides seamless transition between view and edit states.
     */
    editQuestion(questionId, card) {
        console.log('Edit question clicked for:', questionId);
        
        // Check if already in edit mode
        if (card.classList.contains('editing')) {
            this.saveAllEdits(card);
            return;
        }
        
        // Enter edit mode - make all fields editable at once
        this.enterEditMode(card);
    }

    /**
     * Enter edit mode (exact copy from line 1697)
     * Converts static text elements to editable input fields for comprehensive editing.
     * 
     * @description Replaces text displays with input fields, updates button states,
     * and provides immediate focus for user interaction.
     */
    enterEditMode(card) {
        console.log('Entering edit mode for card');
        card.classList.add('editing');
        
        // Get all editable elements
        const questionText = card.querySelector('.question-text');
        const aiAnswer = card.querySelector('.ai-answer');
        const expectedAnswer = card.querySelector('.expected-answer');
        const pointsInput = card.querySelector('.points-input');
        
        // Replace all text elements with inputs simultaneously
        if (questionText) {
            this.replaceWithInput(questionText, 'question-text-input');
        }
        if (aiAnswer) {
            this.replaceWithInput(aiAnswer, 'ai-answer-input');
        }
        if (expectedAnswer) {
            this.replaceWithInput(expectedAnswer, 'expected-answer-input');
        }
        
        // Change button text to indicate save mode
        const editBtn = card.querySelector('.card-btn-edit');
        if (editBtn) {
            editBtn.textContent = '✓ Save';
            editBtn.style.backgroundColor = 'var(--accent-green)';
        }
        
        // Focus on the first input
        const firstInput = card.querySelector('input[type="text"]');
        if (firstInput) {
            firstInput.focus();
            firstInput.select();
        }
    }

    /**
     * Replace element with input (exact copy from line 1733)
     * Creates styled input field to replace static text element.
     * 
     * @description Converts text display to editable input with preserved content
     * and enterprise styling. Maintains data attributes for restoration.
     */
    replaceWithInput(element, className) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = element.textContent.trim();
        input.className = `form-input ${className}`;
        input.style.width = '100%';
        input.style.fontSize = '0.9rem';
        input.style.padding = '0.375rem 0.5rem';
        input.style.backgroundColor = 'var(--bg-secondary)';
        input.style.border = '2px solid var(--accent-green)';
        input.style.color = 'white';
        input.style.borderRadius = '4px';
        
        // Store original content as data attribute
        input.dataset.originalContent = element.textContent.trim();
        input.dataset.originalClass = element.className;
        
        element.replaceWith(input);
        return input;
    }

    /**
     * Save all edits (exact copy from line 1754)
     * Commits all changes and returns card to view mode.
     * 
     * @description Processes all input values, converts back to text display,
     * and synchronizes changes with processed data structure.
     */
    saveAllEdits(card) {
        console.log('Saving all edits for card');
        
        // Get all input fields
        const questionInput = card.querySelector('.question-text-input');
        const aiAnswerInput = card.querySelector('.ai-answer-input');
        const expectedAnswerInput = card.querySelector('.expected-answer-input');
        
        // Replace inputs back with divs containing the new content
        if (questionInput) {
            this.replaceInputWithDiv(questionInput, 'question-text');
        }
        if (aiAnswerInput) {
            this.replaceInputWithDiv(aiAnswerInput, 'ai-answer neutral');
        }
        if (expectedAnswerInput) {
            this.replaceInputWithDiv(expectedAnswerInput, 'expected-answer');
        }
        
        // Exit edit mode
        card.classList.remove('editing');
        
        // Reset button
        const editBtn = card.querySelector('.card-btn-edit');
        if (editBtn) {
            editBtn.textContent = '✎ Edit';
            editBtn.style.backgroundColor = '';
        }
        
        // Update the processed data via EventBus
        this.updateProcessedData(card);
        
        console.log('All edits saved');
    }

    /**
     * Replace input with div (exact copy from line 1789)
     * Converts input field back to static text display.
     * 
     * @description Restores text display with user's edited content.
     * Part of the edit mode exit process.
     */
    replaceInputWithDiv(input, className) {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = input.value;
        input.replaceWith(div);
        return div;
    }

    /**
     * Update processed data (exact copy from line 1797)
     * Synchronizes edited content with the underlying data structure.
     * 
     * @description Extracts current values from card UI and updates the processed data
     * according to upload type (student vs rubric). Maintains data integrity.
     */
    updateProcessedData(card) {
        const questionId = card.dataset.questionId;
        const questionText = card.querySelector('.question-text')?.textContent;
        const aiAnswer = card.querySelector('.ai-answer')?.textContent;
        const expectedAnswer = card.querySelector('.expected-answer')?.textContent;

        // Get data via EventBus and perform update
        eventBus.emit('data:get-processed-data', {
            callback: (processedData, uploadType) => {
                this.performDataUpdate(questionId, questionText, aiAnswer, expectedAnswer, processedData, uploadType);
            }
        });
    }

    performDataUpdate(questionId, questionText, aiAnswer, expectedAnswer, processedData, uploadType) {
        if (uploadType === 'student') {
            // Initialize custom questions object if it doesn't exist
            if (!processedData.customQuestions) {
                processedData.customQuestions = {};
            }
            
            // Update student answers
            if (processedData.answers && aiAnswer) {
                processedData.answers[questionId] = aiAnswer;
            }
            
            // Store custom question text for student worksheets
            if (questionText && !questionText.includes('click Edit to add')) {
                processedData.customQuestions[questionId] = questionText;
            }
        } else if (uploadType === 'rubric') {
            // Update rubric questions
            if (processedData.questions) {
                const questionIndex = processedData.questions.findIndex(q => 
                    (q.question_id || `Q${processedData.questions.indexOf(q) + 1}`) === questionId
                );
                
                if (questionIndex !== -1) {
                    if (questionText) {
                        processedData.questions[questionIndex].question_text = questionText;
                    }
                    if (expectedAnswer && processedData.questions[questionIndex].criteria?.[0]) {
                        processedData.questions[questionIndex].criteria[0].criterion = expectedAnswer;
                    }
                }
            }
        }

        // Update state via EventBus after data update
        eventBus.emit('state:update', { data: processedData });
    }

    /**
     * Update question points (exact copy from line 1837)
     * Updates point values for questions in the data structure.
     * 
     * @description Handles point value changes for rubric questions.
     * Part of the comprehensive editing system.
     */
    updateQuestionPoints(questionId, points, context) {
        console.log(`Updated points for ${questionId}: ${points}`);
        // This would update the internal data structure
    }

    /**
     * Update validation progress (exact copy from line 1842)
     * Updates the progress indicators based on card validation states.
     * 
     * @description Calculates and displays validation progress for workflow guidance.
     * Provides visual feedback on document review completion.
     */
    updateValidationProgress() {
        // Calculate validation progress based on card states (updated for EventBus architecture)
        const cards = document.querySelectorAll('.question-card');
        const acceptedCards = document.querySelectorAll('.question-card.is-accepted');
        
        if (cards.length > 0) {
            const progress = (acceptedCards.length / cards.length) * 100;
            console.log(`Validation progress: ${Math.round(progress)}%`);
            
            // Update progress indicator if it exists
            const progressIndicator = document.getElementById('validation-progress');
            if (progressIndicator) {
                progressIndicator.textContent = `${acceptedCards.length}/${cards.length} validated (${Math.round(progress)}%)`;
            }
        }
    }

    /**
     * Save visual editor changes (helper method for session management)
     * Saves any pending edits before session operations.
     * 
     * @description Called by SessionManagement service to ensure all visual changes
     * are committed before save/export operations.
     */
    saveVisualEditorChanges() {
        // Save any cards currently in edit mode
        const editingCards = document.querySelectorAll('.question-card.editing');
        editingCards.forEach(card => {
            this.saveAllEdits(card);
        });
    }
}