/**
 * Grading Service
 * Handles grading logic and API calls
 */

import { eventBus } from '/utils/EventBus.js';
import { gradingDataStore } from '/components/DataStore.js';

export default class GradingService {
  constructor() {
    this.dataStore = gradingDataStore;
    console.log('✅ WizardGradingService: Ready for self-contained grading');
    
    // Listen for grading completion to render results (EventBus only)
    eventBus.on('wizard:grading-complete', (data) => {
      this.renderResults(data.results);
    });
  }

  setupGradingProcess() {
    // Only setup event listeners for buttons that exist
    const startBtn = document.getElementById('startGradingBtn');
    const exportBtn = document.getElementById('exportResultsBtn');
    const toggleBtn = document.getElementById('toggleResultsBtn');
    const toggleDataBtn = document.getElementById('toggleStudentDataBtn');
    
    if (startBtn) startBtn.addEventListener('click', () => this.startGrading());
    if (exportBtn) exportBtn.addEventListener('click', () => this.exportResults());
    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleResults());
    if (toggleDataBtn) toggleDataBtn.addEventListener('click', () => this.toggleStudentData());
  }

  toggleResults() {
    const content = document.getElementById('resultsContent');
    const btn = document.getElementById('toggleResultsBtn');
    
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      btn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i> Hide Results';
    } else {
      content.classList.add('hidden');
      btn.innerHTML = '<i data-lucide="chevron-down" class="w-4 h-4"></i> Show Results';
    }
    lucide.createIcons();
  }

  toggleStudentData() {
    const content = document.getElementById('studentDataContent');
    const btn = document.getElementById('toggleStudentDataBtn');
    
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      this.renderStudentDataPreview();
      btn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i> Hide Student Data';
    } else {
      content.classList.add('hidden');
      btn.innerHTML = '<i data-lucide="chevron-down" class="w-4 h-4"></i> Show Student Data';
    }
    lucide.createIcons();
  }

  async startGrading() {
    // Get data from DataStore (SSOT)
    const currentRubric = this.dataStore.getCurrentRubric();
    const studentAnswers = this.dataStore.getStudentAnswers();
    const selectedProfile = this.dataStore.getSelectedProfile();

    // Clean validation using DataStore
    if (!currentRubric || !studentAnswers || studentAnswers.length === 0) {
      alert('Please create a rubric and upload student answers first.');
      return;
    }

    console.log('🎯 Starting grading with DataStore data:', {
      rubric: currentRubric?.exam_name,
      students: studentAnswers?.length,
      profile: selectedProfile?.name,
      hasRubric: !!currentRubric,
      hasAnswers: !!studentAnswers,
      hasProfile: !!selectedProfile
    });

    try {
      // Show progress UI
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      const currentStudentText = document.getElementById('currentStudent');
      
      if (progressText) progressText.textContent = `Starting grading for ${studentAnswers.length} students...`;
      if (currentStudentText) currentStudentText.textContent = 'Processing...';

      // Use DataStore data for API call
      const examSubmissions = this.validateAndFormatExamSubmissions(studentAnswers, currentRubric);
      console.log('🎯 Exam submissions:', examSubmissions);
      if (!examSubmissions) return;

      const gradingContext = this.buildGradingContext(selectedProfile);
      console.log('🎯 Grading context:', gradingContext);

      // Start progress animation
      if (progressFill) {
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 2;
          if (progress <= 90) progressFill.style.width = `${progress}%`;
        }, 100);
        
        // Clear interval after API call
        setTimeout(() => clearInterval(progressInterval), 5000);
      }

      const response = await fetch('/api/grade/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exam_rubric: currentRubric,
          submissions: examSubmissions,
          grading_context: gradingContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Grading failed: ${errorData.detail || response.statusText}`);
      }

      this.gradingResults = await response.json();
      
      // Complete progress
      if (progressFill) progressFill.style.width = '100%';
      if (progressText) progressText.textContent = `Completed: ${studentAnswers.length} students graded`;
      if (currentStudentText) currentStudentText.textContent = 'Complete!';
      
      // Show results
      setTimeout(() => {
        const processingSection = document.getElementById('processingSection');
        const resultsCard = document.getElementById('resultsCard');
        
        if (processingSection) processingSection.classList.add('hidden');
        if (resultsCard) resultsCard.style.display = 'block';
        
        // Results will be rendered via EventBus listener (wizard:grading-complete)
      }, 1000);
      
      // Store results in DataStore (SSOT)
      this.dataStore.setGradingResults(this.gradingResults);
      
      console.log('🎯 Grading complete:', this.gradingResults.length, 'results');
      
      // Emit the completion event
      eventBus.emit('wizard:grading-complete', { results: this.gradingResults });
      
    } catch (error) {
      console.error('🚨 FULL Grading error:', error);
      console.error('🚨 Error message:', error.message);
      console.error('🚨 Error stack:', error.stack);
      alert('Error grading submissions: ' + error.message);
    }
  }

  async gradeExam(progressFill, progressText, currentStudentText, total) {
    // Validate student answers format for exam mode
    const examSubmissions = this.validateAndFormatExamSubmissions();
    if (!examSubmissions) return;

    // Build grading context
    const gradingContext = this.buildGradingContext();

    // Start progress simulation
    const totalSteps = window.currentExamRubric.questions.length * total;
    let currentStep = 0;
    let progressComplete = false;

    // Run progress simulation concurrently with API call
    const progressSimulation = (async () => {
      for (const question of window.currentExamRubric.questions) {
        for (let i = 0; i < total; i++) {
          if (progressComplete) break;
          currentStep++;
          const progress = (currentStep / totalSteps) * 100;
          progressFill.style.width = `${progress}%`;
          progressText.textContent = `Processing: ${question.question_id} for ${total} students`;
          const studentName = examSubmissions[i]?.student_name || `Student ${i+1}`;
          currentStudentText.textContent = `Grading: ${studentName}`;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (progressComplete) break;
      }
    })();

    // Make API call
    const apiCall = (async () => {
      const response = await fetch('/api/grade/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          exam_rubric: window.currentExamRubric,
          submissions: examSubmissions,
          grading_context: gradingContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Exam grading failed: ${errorData.detail || response.statusText}`);
      }

      return await response.json();
    })();

    // Wait for API call to complete
    this.gradingResults = await apiCall;
    progressComplete = true;

    // Ensure progress shows 100%
    progressFill.style.width = '100%';
    progressText.textContent = `Completed: ${total} students graded`;

    // Wizard handles its own result storage - no auto-save needed
  }

  buildGradingContext(selectedProfile = null) {
    // Safe DOM access for wizard - elements may not exist
    const subjectSelect = document.getElementById('subjectAreaSelect');
    const gradeLevelSelect = document.getElementById('gradeLevelSelect');  
    const instructionsInput = document.getElementById('gradingInstructionsInput');
    
    const subject = subjectSelect?.value || '';
    const gradeLevel = gradeLevelSelect?.value || '';
    const instructions = instructionsInput?.value?.trim() || '';
    
    const context = {};
    if (subject) context.subject_area = subject;
    if (gradeLevel) context.grade_level = gradeLevel;
    if (instructions) context.grading_instructions = instructions;
    
    // Enhance with profile-specific instructions  
    if (selectedProfile) {
      context.profile_name = selectedProfile.name;
      context.profile_subject = selectedProfile.subject_area;
      context.profile_grade_level = selectedProfile.grade_level;
      
      // Add general profile instructions
      if (selectedProfile.general_instructions) {
        const profileInstructions = selectedProfile.general_instructions;
        context.grading_instructions = instructions 
          ? `${instructions}\n\nProfile Instructions: ${profileInstructions}`
          : profileInstructions;
      }
      
      // Add question-specific type instructions
      const questionTypeInstructions = this.buildQuestionTypeInstructions(selectedProfile, this.dataStore.getCurrentRubric());
      if (questionTypeInstructions) {
        context.question_type_instructions = questionTypeInstructions;
      }
    }
    
    return Object.keys(context).length > 0 ? context : null;
  }

  buildQuestionTypeInstructions(selectedProfile, currentRubric) {
    if (!selectedProfile || !currentRubric) {
      return null;
    }

    const instructions = {};
    
    currentRubric.questions.forEach(question => {
      // Try to find a matching question type for this question
      const questionText = (question.question_text || '').toLowerCase();
      const criteria = question.criteria.map(c => c.criterion.toLowerCase()).join(' ');
      const combinedText = questionText + ' ' + criteria;
      
      const matchedType = selectedProfile.question_types.find(type => {
        const typeKeywords = type.name.toLowerCase().split(' ');
        const descKeywords = type.description.toLowerCase().split(' ');
        
        return typeKeywords.some(keyword => combinedText.includes(keyword)) ||
               descKeywords.some(keyword => combinedText.includes(keyword));
      });
      
      if (matchedType) {
        // If it's a custom type, we may need to get the custom prompt from the backend
        if (matchedType.isCustom && matchedType.backendId) {
          instructions[question.question_id] = {
            type_name: matchedType.name,
            instructions: matchedType.description,
            is_custom: true
          };
        } else {
          // For standard types, use the description
          instructions[question.question_id] = {
            type_name: matchedType.name,
            instructions: matchedType.description,
            is_custom: false
          };
        }
      }
    });
    
    return Object.keys(instructions).length > 0 ? instructions : null;
  }

  validateAndFormatExamSubmissions(studentAnswers, currentRubric) {
    try {
      const examSubmissions = studentAnswers.map(student => {
        const studentName = student.student_name || student.name || 'Unknown';
        
        // Check if student data has answers object (exam format)
        if (student.answers && typeof student.answers === 'object') {
          return {
            student_name: studentName,
            answers: student.answers
          };
        } else if (student.answer || student.response) {
          // Convert single answer format to exam format
          // Use the first question ID from the rubric
          const firstQuestionId = currentRubric.questions[0].question_id;
          return {
            student_name: studentName,
            answers: {
              [firstQuestionId]: student.answer || student.response || ''
            }
          };
        } else {
          alert(`Student data format error: No answer found for ${studentName}. Expected 'answers' object or 'answer'/'response' field.`);
          return null;
        }
      });

      if (examSubmissions.includes(null)) {
        return null;
      }

      return examSubmissions;
    } catch (error) {
      console.error('Submission validation error:', error);
      alert('Error validating student submissions. Please check the format.');
      return null;
    }
  }

  renderStudentDataPreview() {
    const tbody = document.querySelector('#studentDataTable tbody');
    tbody.innerHTML = window.studentAnswers.map(student => {
      const studentName = student.student_name || student.name || 'Unknown';
      
      // Handle both exam format (with answers object) and legacy format
      let answerText = '';
      let answerCount = 0;
      
      if (student.answers && typeof student.answers === 'object') {
        // Exam format - show summary of all answers
        const answerEntries = Object.entries(student.answers);
        answerCount = answerEntries.length;
        
        if (answerEntries.length === 1) {
          // Single question - show the answer
          answerText = answerEntries[0][1];
        } else {
          // Multiple questions - show summary
          answerText = answerEntries.map(([qId, answer]) => 
            `${qId}: ${answer.substring(0, 50)}${answer.length > 50 ? '...' : ''}`
          ).join(' | ');
        }
      } else {
        // Legacy format
        answerText = student.answer || student.response || '';
        answerCount = answerText ? 1 : 0;
      }
      
      const preview = answerText.length > 150 ? answerText.substring(0, 150) + '...' : answerText;
      const totalChars = answerText.length;
      
      return `
        <tr>
          <td class="font-medium">${studentName}</td>
          <td class="max-w-md">
            <div class="text-sm text-gray-300" title="${answerText}">
              ${preview || '<em class="text-gray-500">No answers</em>'}
            </div>
          </td>
          <td class="text-sm text-gray-400">
            ${answerCount} ${answerCount === 1 ? 'answer' : 'answers'}, ${totalChars} chars
          </td>
        </tr>
      `;
    }).join('');
  }

  renderResults(gradingResults) {
    console.log('🎯 WIZARD: renderResults called with:', gradingResults.length, 'results');
    
    // Get the current rubric from DataStore
    const currentRubric = this.dataStore.getCurrentRubric();
    
    const tbody = document.querySelector('#resultsTable tbody');
    if (!tbody) {
      console.warn('🎯 WIZARD: Results table tbody not found');
      return;
    }
    
    if (gradingResults.length > 0 && gradingResults[0].question_grades) {
      tbody.innerHTML = gradingResults.map(result => {
        const totalScore = result.total_score || 0;
        const maxScore = currentRubric ? currentRubric.questions.reduce((sum, q) => sum + q.max_points, 0) : 100;
        const confidence = result.overall_confidence || 0;
        const confidenceClass = confidence >= 0.75 ? 'confidence-high' : 
                                confidence >= 0.6 ? 'confidence-medium' : 'confidence-low';
        const confidenceIcon = confidence >= 0.75 ? '🟢' : confidence >= 0.6 ? '🟡' : '🔴';
        
        return `
          <tr class="exam-result-row cursor-pointer hover:bg-gray-700 transition-colors" data-student-name="${result.student_name}">
            <td class="font-medium">
              <div class="flex items-center gap-2">
                <i data-lucide="chevron-right" class="w-4 h-4 exam-toggle-icon transition-transform"></i>
                ${result.student_name}
              </div>
            </td>
            <td class="font-mono total-score">${totalScore}/${maxScore}</td>
            <td class="${confidenceClass}">
              ${confidenceIcon} ${Math.round(confidence * 100)}%
            </td>
            <td class="max-w-md text-sm text-gray-400">
              <span>${(result.question_grades || []).length} questions</span>
            </td>
          </tr>
        `;
      }).join('');
    }
    
    // Add click event listeners for expandable rows
    document.querySelectorAll('.exam-result-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // Don't toggle if clicking on edit buttons
        if (e.target.closest('.grade-edit-btn, .edit-controls')) {
          return;
        }
        
        const studentName = row.dataset.studentName;
        this.toggleExamDetails(studentName, row, gradingResults, currentRubric);
      });
    });
    
    lucide.createIcons();
    console.log('🎯 WIZARD: Results rendered successfully');
  }

  toggleExamDetails(studentName, rowElement, gradingResults, currentRubric) {
    const existingDetailRow = document.querySelector(`[data-detail-for="${studentName}"]`);
    const toggleIcon = rowElement.querySelector('.exam-toggle-icon');
    
    if (existingDetailRow) {
      // Close existing details
      existingDetailRow.remove();
      toggleIcon.style.transform = 'rotate(0deg)';
    } else {
      // Open details
      const result = gradingResults.find(r => r.student_name === studentName);
      if (result) {
        const detailRow = document.createElement('tr');
        detailRow.setAttribute('data-detail-for', studentName);
        detailRow.innerHTML = `
          <td colspan="4" class="p-0 bg-gray-800">
            ${this.renderExamDetails(result, currentRubric)}
          </td>
        `;
        
        rowElement.parentNode.insertBefore(detailRow, rowElement.nextSibling);
        toggleIcon.style.transform = 'rotate(90deg)';
        lucide.createIcons();
      }
    }
  }

  renderExamDetails(result, currentRubric) {
    if (!result.question_grades || result.question_grades.length === 0) {
      return '<div class="text-gray-400 text-sm p-4">No question details available</div>';
    }
    
    return `
      <div class="p-4 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Detailed Question Breakdown</h3>
          <div class="text-sm text-gray-400">
            ${result.total_score}/${currentRubric ? currentRubric.questions.reduce((sum, q) => sum + q.max_points, 0) : result.total_score} points (${Math.round((result.total_score / (currentRubric ? currentRubric.questions.reduce((sum, q) => sum + q.max_points, 0) : result.total_score)) * 100)}%)
          </div>
        </div>
        
        <div class="space-y-4">
          ${result.question_grades.map(qGrade => {
            const scorePercentage = (qGrade.score / qGrade.max_points) * 100;
            const scoreClass = scorePercentage >= 80 ? 'text-green-400' : 
                              scorePercentage >= 60 ? 'text-yellow-400' : 'text-red-400';
            const confidenceClass = (qGrade.confidence || 0) >= 0.75 ? 'text-green-400' : 
                                   (qGrade.confidence || 0) >= 0.6 ? 'text-yellow-400' : 'text-red-400';
            
            return `
              <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-white text-base mb-1">${qGrade.question_id}</h4>
                    ${qGrade.question_text ? `<p class="text-sm text-gray-300 mb-2">${qGrade.question_text}</p>` : ''}
                  </div>
                  <div class="text-right ml-4">
                    <div class="flex items-center gap-2 justify-end">
                      <div class="text-lg font-mono font-bold ${scoreClass}">
                        ${qGrade.score}/${qGrade.max_points}
                      </div>
                    </div>
                  </div>
                </div>
                
                ${qGrade.breakdown && qGrade.breakdown.length > 0 ? `
                  <div class="mb-3">
                    <h5 class="text-sm font-medium text-gray-300 mb-2">Criterion Breakdown:</h5>
                    <div class="space-y-1">
                      ${qGrade.breakdown.map(criterion => `
                        <div class="flex items-center justify-between text-xs bg-gray-800 rounded px-2 py-1">
                          <span class="text-gray-300">${criterion.criterion}</span>
                          <span class="font-mono text-gray-200">
                            ${criterion.points_awarded}/${criterion.max_points}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${qGrade.feedback ? `
                  <div class="mb-3">
                    <h5 class="text-sm font-medium text-gray-300 mb-1">Feedback:</h5>
                    <div class="text-sm text-gray-200 bg-gray-800 rounded p-2 leading-relaxed">
                      ${qGrade.feedback}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  exportResults() {
    const currentRubric = this.dataStore.getCurrentRubric();
    const gradingResults = this.dataStore.getGradingResults() || this.gradingResults || [];
    
    const questionIds = currentRubric ? currentRubric.questions.map(q => q.question_id) : [];
    const headers = ['Student', 'Total Score', 'Max Score', 'Overall Confidence', 'Overall Feedback'];
    
    // Add headers for each question
    questionIds.forEach(qId => {
      headers.push(`${qId} Score`, `${qId} Max`, `${qId} Confidence`, `${qId} Feedback`);
    });
    
    const csv = [
      headers.join(','),
      ...gradingResults.map(result => {
        const maxScore = currentRubric ? currentRubric.questions.reduce((sum, q) => sum + q.max_points, 0) : 100;
        const row = [
          result.student_name,
          result.total_score || 0,
          maxScore,
          Math.round((result.overall_confidence || 0) * 100) + '%',
          `"${(result.overall_feedback || '').replace(/"/g, '""')}"`
        ];
        
        // Add data for each question
        questionIds.forEach(qId => {
          const qGrade = (result.question_grades || []).find(qg => qg.question_id === qId);
          if (qGrade) {
            row.push(
              qGrade.score || 0,
              qGrade.max_points || 0,
              Math.round((qGrade.confidence || 0) * 100) + '%',
              `"${(qGrade.feedback || '').replace(/"/g, '""')}"`
            );
          } else {
            row.push('N/A', 'N/A', 'N/A', '""');
          }
        });
        
        return row.join(',');
      })
    ].join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grading_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}