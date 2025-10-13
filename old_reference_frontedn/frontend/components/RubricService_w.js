/**
 * Wizard Rubric Service - Tailored for wizard workflow
 * Uses EventBus + DataStore + UndoRedo with wizard-specific behavior
 */

import UndoRedo from '/components/UndoRedo.js';
import { eventBus } from '/utils/EventBus.js';
import { gradingDataStore } from '/components/DataStore.js';

export default class WizardRubricService {
  constructor() {
    this.undoRedo = new UndoRedo();
    this.dataStore = gradingDataStore;
    this.setupEventBus();
  }

  setupEventBus() {
    // Clean EventBus integration - DataStore is SSOT
    eventBus.on('state:request-current', (data) => {
      const rubric = this.dataStore.getCurrentRubric();
      if (data.callback && rubric) {
        data.callback(rubric);
      }
    });

    eventBus.on('state:restore', (data) => {
      if (data.data) {
        this.dataStore.setCurrentRubric(data.data);
      }
    });

    eventBus.on('ui:render-cards', () => {
      this.renderRubric();
    });

    // Single render trigger from DataStore changes
    eventBus.on('grading:rubric-changed', () => {
      this.renderRubric();
      this.updateRubricSummary();
    });

    // Handle rubric actions via EventBus (clean modular communication)
    eventBus.on('rubric:remove-question', (data) => {
      this.removeQuestion(data.questionIndex);
    });

    eventBus.on('rubric:add-criterion', (data) => {
      this.addCriterion(data.questionIndex);
    });

    eventBus.on('rubric:remove-criterion', (data) => {
      this.removeCriterion(data.questionIndex, data.criterionIndex);
    });
  }

  // Clean action methods with proper state management
  removeQuestion(questionIndex) {
    const rubric = this.dataStore.getCurrentRubric();
    if (!rubric || rubric.questions.length <= 1) return;
    
    this.undoRedo.saveState();
    rubric.questions.splice(questionIndex, 1);
    
    // Update question IDs
    rubric.questions.forEach((q, i) => {
      q.question_id = `Q${i + 1}`;
    });
    
    this.dataStore.setCurrentRubric(rubric);
  }

  addCriterion(questionIndex) {
    const rubric = this.dataStore.getCurrentRubric();
    if (!rubric || !rubric.questions[questionIndex]) return;
    
    this.undoRedo.saveState();
    rubric.questions[questionIndex].criteria.push({
      criterion: '',
      max_points: 0
    });
    
    this.dataStore.setCurrentRubric(rubric);
  }

  removeCriterion(questionIndex, criterionIndex) {
    const rubric = this.dataStore.getCurrentRubric();
    if (!rubric || !rubric.questions[questionIndex]) return;
    if (rubric.questions[questionIndex].criteria.length <= 1) return;
    
    this.undoRedo.saveState();
    rubric.questions[questionIndex].criteria.splice(criterionIndex, 1);
    
    this.dataStore.setCurrentRubric(rubric);
  }

  // Helper method to render question type options - SIMPLE VERSION
  renderQuestionTypeOptions(selectedTypeId = '') {
    const profile = this.dataStore.getSelectedProfile();
    
    // Fallback to basic types if no profile
    const questionTypes = profile?.question_types || [
      { id: 'multiple_choice', name: 'Multiple Choice' },
      { id: 'short_answer', name: 'Short Answer' },
      { id: 'essay', name: 'Essay' },
      { id: 'math_problem', name: 'Math Problem' },
      { id: 'true_false', name: 'True/False' }
    ];

    return questionTypes.map(type => {
      const isSelected = selectedTypeId === type.id;
      return `<option value="${type.id}" ${isSelected ? 'selected' : ''}>${type.name}</option>`;
    }).join('');
  }

  // AI question type detection - simple approach
  async detectQuestionTypes() {
    console.log('🎯 Starting AI question type detection');
    const currentRubric = this.dataStore.getCurrentRubric();
    const profile = this.dataStore.getSelectedProfile();
    
    if (!currentRubric || !profile) {
      console.log('Missing rubric or profile for detection');
      return;
    }

    try {
      const response = await fetch('/api/question-types/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_rubric: currentRubric,
          profile: profile
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.question_types) {
          console.log('🎯 AI detection results:', data.question_types);
          
          // Show summary of all detection results
          this.displayQuestionTypeMatches(data.question_types);
          
          // Apply AI suggestions to dropdowns
          data.question_types.forEach(detection => {
            const dropdown = document.getElementById(`questionType_${detection.question_index}`);
            if (dropdown && detection.detected_type) {
              const confidencePercent = Math.round(detection.confidence * 100);
              
              // Update selection if confidence is good (≥40%)
              if (detection.confidence >= 0.4) {
                dropdown.value = detection.detected_type.id;
                // Note: Don't trigger change event - let user accept/modify the AI suggestion
              }
              
              // Add color coding for uncertainty
              if (confidencePercent < 70) {
                dropdown.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
                dropdown.style.borderColor = '#f59e0b';
                dropdown.title = `AI suggested with ${confidencePercent}% confidence - please review`;
              } else {
                dropdown.style.borderColor = '#10b981';
                dropdown.title = `AI suggested with ${confidencePercent}% confidence`;
              }
              
              // Show confidence info below the dropdown
              const commentEl = document.getElementById(`autoDetectionComment_${detection.question_index}`);
              if (commentEl) {
                commentEl.textContent = `AI detected: ${detection.detected_type.name} (${confidencePercent}% confidence)`;
                commentEl.classList.remove('hidden');
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error detecting question types:', error);
    }
  }

  // Original working method from grading hub
  displayQuestionTypeMatches(detectedTypes) {
    // Add or update question type suggestions in the rubric section
    let suggestionsHtml = `
      <div class="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div class="flex items-center gap-2 mb-3">
          <i data-lucide="zap" class="w-4 h-4 text-blue-400"></i>
          <h4 class="text-sm font-medium text-blue-400">AI Question Type Suggestions</h4>
        </div>
        <div class="space-y-2">
    `;

    detectedTypes.forEach(detection => {
      if (detection.detected_type || detection.detectedType) {
        const detectedType = detection.detected_type || detection.detectedType;
        const questionId = `Q${(detection.question_index || 0) + 1}`;
        const confidencePercent = Math.round(detection.confidence * 100);
        suggestionsHtml += `
          <div class="flex items-center justify-between p-2 bg-gray-700/50 rounded">
            <div class="flex-1">
              <div class="text-sm text-white">${questionId}: ${detectedType.name}</div>
              <div class="text-xs text-gray-400">${detectedType.description}</div>
            </div>
            <div class="text-xs text-blue-400">${confidencePercent}% match</div>
          </div>
        `;
      } else {
        const questionId = `Q${(detection.question_index || 0) + 1}`;
        suggestionsHtml += `
          <div class="flex items-center justify-between p-2 bg-gray-700/50 rounded">
            <div class="flex-1">
              <div class="text-sm text-gray-400">${questionId}: No specific type detected</div>
              <div class="text-xs text-gray-500">Will use general grading approach</div>
            </div>
          </div>
        `;
      }
    });

    suggestionsHtml += `
        </div>
        <div class="mt-3 pt-3 border-t border-gray-600">
          <p class="text-xs text-gray-400">These suggestions will be used to enhance AI grading with profile-specific instructions.</p>
        </div>
      </div>
    `;

    // Insert suggestions after rubric content
    const rubricContent = document.getElementById('rubricContent');
    
    // Remove existing suggestions
    const existingSuggestions = rubricContent.querySelector('.question-type-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }
    
    // Add new suggestions
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'question-type-suggestions';
    suggestionsDiv.innerHTML = suggestionsHtml;
    rubricContent.appendChild(suggestionsDiv);
    
    lucide.createIcons();
  }

  setupRubricManagement() {
    console.log('🔧 RubricService.setupRubricManagement() called');
    
    // Setup file upload functionality (always available)
    console.log('🔧 About to call setupFileUploads()');
    this.setupFileUploads();
    console.log('🔧 setupFileUploads() call completed');
    
    // Setup create new rubric button (always available)
    const createBtn = document.getElementById('createNewRubricBtn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.createNewRubric());
    }
    
    // Don't setup editing controls here - they don't exist yet
    // They'll be set up after rubric is loaded in setupRubricEditingControls()
  }
  
  setupRubricEditingControls() {
    console.log('🔧 Setting up rubric editing controls after rubric load');
    
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const downloadBtn = document.getElementById('downloadRubricBtn');
    const totalQuestionsInput = document.getElementById('totalQuestionsInput');
    const generalInstructionsInput = document.getElementById('generalInstructionsInput');
    
    if (addQuestionBtn) {
      addQuestionBtn.addEventListener('click', () => this.addNewQuestion());
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadRubric());
    }
    if (totalQuestionsInput) {
      totalQuestionsInput.addEventListener('change', (e) => this.handleTotalQuestionsChange(e));
    }
    if (generalInstructionsInput) {
      generalInstructionsInput.addEventListener('input', () => this.updateRubricFromInputs());
    }
    
    // Setup total points tooltip
    const totalPointsDisplay = document.getElementById('totalPointsDisplay');
    const pointsTooltip = document.getElementById('pointsTooltip');
    
    totalPointsDisplay.addEventListener('mouseenter', () => {
      pointsTooltip.classList.remove('hidden');
    });
    
    totalPointsDisplay.addEventListener('mouseleave', () => {
      pointsTooltip.classList.add('hidden');
    });
    
    // Setup rubric collapse toggle (only if it exists)
    const toggleBtn = document.getElementById('toggleRubricBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleRubricSection());
    }
  }
  
  handleTotalQuestionsChange(e) {
    const rubric = this.dataStore.getCurrentRubric();
    if (!rubric) return;
    
    this.undoRedo.saveState();
    const newTotal = parseInt(e.target.value) || 1;
    const currentTotal = rubric.questions.length;
    
    if (newTotal === currentTotal) return;
    
    if (newTotal > currentTotal) {
      // Add new questions
      for (let i = currentTotal; i < newTotal; i++) {
        rubric.questions.push({
          question_id: `Q${i + 1}`,
          question_text: '',
          max_points: 10,
          criteria: [{ criterion: '', max_points: 10 }]
        });
      }
    } else if (newTotal < currentTotal) {
      // Remove questions - no confirmation dialog, use undo instead
      rubric.questions = rubric.questions.slice(0, newTotal);
    }
    
    this.dataStore.setCurrentRubric(rubric); // DataStore is SSOT
    this.renderRubric();
    this.updateRubricSummary();
  }

  toggleRubricSection() {
    const content = document.getElementById('rubricContent');
    const icon = document.querySelector('.rubric-toggle-icon');
    
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
    } else {
      content.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
    }
  }
  
  updateTotalPointsDisplay() {
    const currentRubric = this.dataStore.getCurrentRubric();
    if (!currentRubric) {
      document.getElementById('totalPointsDisplay').value = 0;
      return;
    }
    
    const totalPoints = currentRubric.questions.reduce((sum, q) => sum + q.max_points, 0);
    document.getElementById('totalPointsDisplay').value = totalPoints;
  }

  updateRubricSummary() {
    const currentRubric = this.dataStore.getCurrentRubric();
    if (!currentRubric) return;
    
    const statusText = document.getElementById('rubricStatusText');
    const questionCount = currentRubric.questions.length;
    const totalPoints = currentRubric.questions.reduce((sum, q) => sum + q.max_points, 0);
    const examName = currentRubric.exam_name || currentRubric.rubric_name || 'Untitled Exam';
    
    statusText.textContent = `${examName} - ${questionCount} question${questionCount !== 1 ? 's' : ''}, ${totalPoints} points total`;
    
    // Also update the total points display
    this.updateTotalPointsDisplay();
  }
  
  createNewRubric() {
    this.undoRedo.saveState(); // Save state before modification
    
    // Create new exam rubric (single question by default)
    const newRubric = {
      exam_name: '',
      general_instructions: '',
      questions: [
        {
          question_id: 'Q1',
          question_text: '',
          max_points: 10,
          criteria: [{ criterion: '', max_points: 10 }]
        }
      ]
    };
    
    // Update DataStore (SSOT)
    this.dataStore.setCurrentRubric(newRubric);
    
    this.renderRubric();
    document.getElementById('rubricSection').classList.remove('hidden');
    this.updateRubricSummary();
    
    // Setup toggle button event listener after rubric section is shown
    const toggleBtn = document.getElementById('toggleRubricBtn');
    if (toggleBtn && !toggleBtn.onclick) {
      toggleBtn.addEventListener('click', () => this.toggleRubricSection());
    }
    
    // Auto-trigger AI feedback and question type detection
    setTimeout(() => {
      getAIFeedback(true); // Pass true to indicate auto-trigger
    }, 500);
  }
  
  addNewQuestion() {
    const currentRubric = this.dataStore.getCurrentRubric();
    if (!currentRubric) return;
    
    this.undoRedo.saveState(); // Save state before modification
    
    const questionNumber = currentRubric.questions.length + 1;
    const updatedRubric = JSON.parse(JSON.stringify(currentRubric)); // Deep copy
    updatedRubric.questions.push({
      question_id: `Q${questionNumber}`,
      question_text: '',
      max_points: 10,
      criteria: [{ criterion: '', max_points: 10 }]
    });
    
    // Update DataStore (SSOT)
    this.dataStore.setCurrentRubric(updatedRubric);
    
    document.getElementById('totalQuestionsInput').value = updatedRubric.questions.length;
    this.renderRubric();
    this.updateRubricSummary();
  }

  renderRubric() {
    // MODERNIZED: Get rubric from DataStore instead of global variable
    const currentExamRubric = this.dataStore.getCurrentRubric();
    if (!currentExamRubric) return;
    
    // Update exam name and general instructions inputs
    document.getElementById('examNameInput').value = currentExamRubric.exam_name || '';
    document.getElementById('generalInstructionsInput').value = currentExamRubric.general_instructions || '';
    document.getElementById('totalQuestionsInput').value = currentExamRubric.questions.length;
    
    const container = document.getElementById('questionsContainer');
    container.innerHTML = currentExamRubric.questions.map((question, qIndex) => `
      <div class="question-card bg-gray-800 rounded-lg border border-gray-600 p-4" data-question-index="${qIndex}">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-white font-medium">Question ${qIndex + 1}</h4>
          <button class="btn btn-secondary text-sm" onclick="removeQuestion(${qIndex})">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
            Remove Question
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Question ID</label>
            <input type="text" value="${question.question_id}" class="input w-full" data-field="question_id">
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Max Points</label>
            <input type="number" value="${question.max_points}" class="input w-20" data-field="max_points" min="0">
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Question Type</label>
            <select class="input w-full question-type-dropdown" id="questionType_${qIndex}" data-question-index="${qIndex}">
              ${this.renderQuestionTypeOptions(question.question_type)}
            </select>
            <div class="text-xs text-gray-500 mt-1 hidden" id="autoDetectionComment_${qIndex}">
              <!-- Auto-detection comment will appear here -->
            </div>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-1">Question Text</label>
          <textarea class="input w-full h-20" data-field="question_text" placeholder="Enter the question text...">${question.question_text}</textarea>
        </div>
        
        <div class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm text-gray-400">Grading Criteria</label>
            <button class="btn btn-secondary text-xs" onclick="addCriterionToQuestion(${qIndex})">
              <i data-lucide="plus" class="w-3 h-3"></i>
              Add Criterion
            </button>
          </div>
          <div class="space-y-2">
            ${question.criteria.map((criterion, cIndex) => `
              <div class="criterion-card bg-gray-700 rounded p-3" data-criterion-index="${cIndex}">
                <div class="flex items-center gap-3">
                  <input type="text" value="${criterion.criterion}" 
                         placeholder="Criterion name" class="input flex-1 text-sm" 
                         data-field="criterion">
                  <input type="number" value="${criterion.max_points}" 
                         class="input w-16 text-sm" data-field="max_points" min="0">
                  <span class="text-gray-400 text-xs">pts</span>
                  <button class="btn btn-secondary text-xs" onclick="removeCriterionFromQuestion(${qIndex}, ${cIndex})">
                    <i data-lucide="x" class="w-3 h-3"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
    
    // Add event listeners for ALL inputs and dropdowns - same treatment for everything
    container.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('change', (e) => {
        
        // Clean up AI styling if user manually changes question type dropdown
        if (e.target.classList.contains('question-type-dropdown')) {
          e.target.style.backgroundColor = '';
          e.target.style.borderColor = '';
          e.target.title = 'Question type selected manually';
          
          // Hide the AI comment
          const questionIndex = e.target.dataset.questionIndex;
          const commentEl = document.getElementById(`autoDetectionComment_${questionIndex}`);
          if (commentEl) {
            commentEl.classList.add('hidden');
          }
        }
        
        this.updateRubricFromInputs();
      });
    });
    
    // No automatic detection in renderRubric - it's handled separately when rubric is loaded
    
    // Update total points display
    this.updateTotalPointsDisplay();
    
    lucide.createIcons();
    
    // Add undo/redo buttons to existing interface
    this.addUndoRedoButtons();
    
  }

  addUndoRedoButtons() {
    const buttonArea = document.querySelector('#addQuestionBtn')?.parentElement;
    if (!buttonArea || document.getElementById('undo-btn')) return;
    
    const undoBtn = document.createElement('button');
    undoBtn.id = 'undo-btn';
    undoBtn.className = 'btn btn-secondary text-sm';
    undoBtn.innerHTML = '<i data-lucide="undo-2" class="w-4 h-4"></i>';
    undoBtn.onclick = () => this.undoRedo.undo();
    
    const redoBtn = document.createElement('button');
    redoBtn.id = 'redo-btn';
    redoBtn.className = 'btn btn-secondary text-sm';
    redoBtn.innerHTML = '<i data-lucide="redo-2" class="w-4 h-4"></i>';
    redoBtn.onclick = () => this.undoRedo.redo();
    
    buttonArea.insertBefore(undoBtn, document.getElementById('downloadRubricBtn'));
    buttonArea.insertBefore(redoBtn, document.getElementById('downloadRubricBtn'));
    
    if (window.lucide) lucide.createIcons();
  }
  
  updateRubricFromInputs() {
    const currentRubric = this.dataStore.getCurrentRubric();
    if (!currentRubric) return;
    
    this.undoRedo.saveState(); // Save state before modification
    
    // Create a deep copy to avoid direct mutation
    const updatedRubric = JSON.parse(JSON.stringify(currentRubric));
    
    // Update exam name and general instructions
    updatedRubric.exam_name = document.getElementById('examNameInput').value.trim();
    updatedRubric.general_instructions = document.getElementById('generalInstructionsInput').value.trim();
    
    // Update questions with validation
    const questionCards = document.querySelectorAll('.question-card');
    let validationErrors = [];
    
    updatedRubric.questions = Array.from(questionCards).map((card, index) => {
      const qIndex = parseInt(card.dataset.questionIndex);
      const questionIdInput = card.querySelector('[data-field="question_id"]');
      const questionTextInput = card.querySelector('[data-field="question_text"]');
      const maxPointsInput = card.querySelector('[data-field="max_points"]');
      const questionTypeDropdown = card.querySelector('.question-type-dropdown');
      
      const criteriaCards = card.querySelectorAll('.criterion-card');
      const criteria = Array.from(criteriaCards).map((criterionCard, cIndex) => {
        const criterionInput = criterionCard.querySelector('[data-field="criterion"]');
        const pointsInput = criterionCard.querySelector('[data-field="max_points"]');
        const points = parseInt(pointsInput.value) || 0;
        const criterionName = criterionInput.value.trim();
        
        // Validate criterion points
        if (points < 0) {
          validationErrors.push(`Question ${index + 1}, Criterion ${cIndex + 1}: Points cannot be negative`);
          pointsInput.style.borderColor = '#ef4444';
          setTimeout(() => pointsInput.style.borderColor = '', 3000);
        } else {
          pointsInput.style.borderColor = '';
        }
        
        // Validate criterion name
        if (!criterionName) {
          validationErrors.push(`Question ${index + 1}, Criterion ${cIndex + 1}: Criterion name cannot be empty`);
          criterionInput.style.borderColor = '#ef4444';
          setTimeout(() => criterionInput.style.borderColor = '', 3000);
        } else {
          criterionInput.style.borderColor = '';
        }
        
        return {
          criterion: criterionName,
          max_points: Math.max(0, points) // Ensure non-negative
        };
      });
      
      const questionMaxPoints = parseInt(maxPointsInput.value) || 0;
      const criteriaSum = criteria.reduce((sum, c) => sum + c.max_points, 0);
      
      // Validate question max points
      if (questionMaxPoints < 0) {
        validationErrors.push(`Question ${index + 1}: Max points cannot be negative`);
        maxPointsInput.style.borderColor = '#ef4444';
        setTimeout(() => maxPointsInput.style.borderColor = '', 3000);
      } else {
        maxPointsInput.style.borderColor = '';
      }
      
      // Validate question total vs criteria sum
      if (questionMaxPoints !== criteriaSum && criteriaSum > 0) {
        validationErrors.push(`Question ${index + 1}: Total points (${questionMaxPoints}) doesn't match sum of criteria (${criteriaSum})`);
        maxPointsInput.style.borderColor = '#f59e0b';
        setTimeout(() => maxPointsInput.style.borderColor = '', 3000);
      }
      
      // Validate question ID and text
      const questionId = questionIdInput.value.trim();
      const questionText = questionTextInput.value.trim();
      
      if (!questionId) {
        validationErrors.push(`Question ${index + 1}: Question ID cannot be empty`);
        questionIdInput.style.borderColor = '#ef4444';
        setTimeout(() => questionIdInput.style.borderColor = '', 3000);
      } else {
        questionIdInput.style.borderColor = '';
      }
      
      if (!questionText) {
        validationErrors.push(`Question ${index + 1}: Question text cannot be empty`);
        questionTextInput.style.borderColor = '#ef4444';
        setTimeout(() => questionTextInput.style.borderColor = '', 3000);
      } else {
        questionTextInput.style.borderColor = '';
      }
      
      return {
        question_id: questionId,
        question_text: questionText,
        max_points: Math.max(0, questionMaxPoints), // Ensure non-negative
        question_type: questionTypeDropdown ? questionTypeDropdown.value : null,
        criteria: criteria
      };
    });
    
    // Show validation summary if there are errors
    if (validationErrors.length > 0) {
      this.showRubricValidationSummary(validationErrors);
    } else {
      this.hideRubricValidationSummary();
    }
    
    // Update DataStore (SSOT)
    this.dataStore.setCurrentRubric(updatedRubric);
    
    // Update total points display immediately
    this.updateTotalPointsDisplay();
  }

  showRubricValidationSummary(errors) {
    let summaryDiv = document.getElementById('rubricValidationSummary');
    if (!summaryDiv) {
      summaryDiv = document.createElement('div');
      summaryDiv.id = 'rubricValidationSummary';
      summaryDiv.className = 'mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg';
      
      const rubricContent = document.getElementById('rubricContent');
      rubricContent.insertBefore(summaryDiv, rubricContent.firstChild);
    }
    
    summaryDiv.innerHTML = `
      <div class="flex items-start gap-2">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-red-400 mt-0.5"></i>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-red-300 mb-2">Rubric Validation Issues:</h4>
          <ul class="text-xs text-red-200 space-y-1">
            ${errors.slice(0, 5).map(error => `<li>• ${error}</li>`).join('')}
            ${errors.length > 5 ? `<li class="text-red-300">• ... and ${errors.length - 5} more issues</li>` : ''}
          </ul>
        </div>
      </div>
    `;
    
    lucide.createIcons();
  }

  hideRubricValidationSummary() {
    const summaryDiv = document.getElementById('rubricValidationSummary');
    if (summaryDiv) {
      summaryDiv.remove();
    }
  }


  hideRubricValidationSummary() {
    const summaryDiv = document.getElementById('rubricValidationSummary');
    if (summaryDiv) {
      summaryDiv.remove();
    }
  }

  downloadRubric() {
    const currentRubric = this.dataStore.getCurrentRubric();
    const blob = new Blob([JSON.stringify(currentRubric, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rubric.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  setupFileUploads() {
    // Setup rubric file upload (moved from GradingHubCore for proper encapsulation)
    const rubricZone = document.getElementById('rubricUploadZone');
    const rubricInput = document.getElementById('rubricFileInput');

    console.log('🔧 RubricService.setupFileUploads() called');
    console.log('📁 rubricUploadZone found:', !!rubricZone);
    console.log('📄 rubricFileInput found:', !!rubricInput);

    if (rubricZone && rubricInput) {
      console.log('✅ Setting up file upload listeners');
      
      rubricZone.addEventListener('click', () => {
        console.log('🖱️ Upload zone clicked, triggering file input');
        rubricInput.click();
      });
      
      rubricZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('active');
      });
      
      rubricZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('active');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          console.log('📁 File dropped:', files[0].name);
          this.processRubricFile(files[0]);
        }
      });
      
      rubricInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('📄 File selected:', file.name);
          this.processRubricFile(file);
        }
      });
      
      console.log('✅ File upload listeners attached successfully');
    } else {
      console.error('❌ Upload elements not found - DOM may not be ready');
    }
  }

  async processRubricFile(file) {
    try {
      const text = await file.text();
      const rubricData = JSON.parse(text);
      
      let currentExamRubric;
      if (Array.isArray(rubricData)) {
        currentExamRubric = {
          exam_name: "Single Question Assignment",
          questions: [{
            question_id: "Q1",
            question_text: "Question",
            max_points: rubricData.reduce((sum, item) => sum + item.max_points, 0),
            criteria: rubricData
          }]
        };
      } else if (rubricData.questions && Array.isArray(rubricData.questions)) {
        currentExamRubric = rubricData;
      } else {
        alert('Invalid rubric format. Expected exam format with questions array.');
        return;
      }
      
      // Store in DataStore (SSOT pattern)
      this.dataStore.setCurrentRubric(currentExamRubric);
      
      // Show upload success with filename
      this.showRubricUploadSuccess(file.name);
      
      // Render rubric display
      this.renderRubric();
      document.getElementById('rubricSection').classList.remove('hidden');
      this.updateRubricSummary();
      
      // Setup editing controls now that the rubric interface is rendered
      this.setupRubricEditingControls();
      
      // Emit events for other services
      eventBus.emit('rubric:loaded', { rubric: currentExamRubric });
      
    } catch (error) {
      alert('Error parsing rubric file. Please ensure it\'s valid JSON.');
    }
  }

  showRubricUploadSuccess(filename) {
    const statusElement = document.getElementById('rubricUploadStatus');
    const filenameElement = document.getElementById('uploadedFileName');
    
    if (statusElement && filenameElement) {
      filenameElement.textContent = `File: ${filename}`;
      statusElement.classList.remove('hidden');
    }
  }
}