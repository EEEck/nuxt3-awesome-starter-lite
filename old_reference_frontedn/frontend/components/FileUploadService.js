/**
 * Base Wizard File Upload Service
 * Common file upload functionality for all wizard steps
 * Clean base class for derived services
 */

import { eventBus } from '/utils/EventBus.js';
import { gradingDataStore } from './DataStore.js';

export class BaseWizardFileUploadService {
  constructor() {
    this.eventBus = eventBus;
    this.dataStore = gradingDataStore;
  }

  // Exact copy from GradingHubCore setupFileUploads()
  setupFileUploads() {
    // Rubric upload
    const rubricZone = document.getElementById('rubricUploadZone');
    const rubricInput = document.getElementById('rubricFileInput');

    if (rubricZone && rubricInput) {
      rubricZone.addEventListener('click', () => rubricInput.click());
      rubricZone.addEventListener('dragover', this.handleDragOver);
      rubricZone.addEventListener('drop', this.handleRubricDrop.bind(this));
      rubricInput.addEventListener('change', this.handleRubricUpload.bind(this));
    }

    // JSON upload
    const jsonZone = document.getElementById('jsonUploadZone');
    const jsonInput = document.getElementById('jsonFileInput');

    if (jsonZone && jsonInput) {
      jsonZone.addEventListener('click', () => jsonInput.click());
      jsonZone.addEventListener('dragover', this.handleDragOver);
      jsonZone.addEventListener('drop', this.handleJsonDrop.bind(this));
      jsonInput.addEventListener('change', this.handleJsonUpload.bind(this));
    }
  }

  // Exact copy from GradingHubCore
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('active');
  }

  handleRubricDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
    const files = e.dataTransfer.files;
    if (files.length > 0) this.processRubricFile(files[0]);
  }

  handleJsonDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('active');
    const files = e.dataTransfer.files;
    if (files.length > 0) this.processJsonFile(files[0]);
  }

  handleRubricUpload(e) {
    const file = e.target.files[0];
    if (file) this.processRubricFile(file);
  }

  handleJsonUpload(e) {
    const file = e.target.files[0];
    if (file) this.processJsonFile(file);
  }

  // Wizard-specific rubric processing (no rendering, just store and show filename)
  async processRubricFile(file) {
    try {
      console.log('📋 FileUploadService: Processing rubric file:', file.name);
      const text = await file.text();
      console.log('📋 FileUploadService: File text length:', text.length, 'First 100 chars:', text.substring(0, 100));
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
      
      window.currentExamRubric = currentExamRubric;
      // Wizard: Store rubric temporarily without touching DataStore to avoid events
      this.wizardRubric = currentExamRubric;
      
      // Wizard-specific: Only emit wizard events, no legacy events that trigger rendering
      this.eventBus.emit('rubric:loaded', { rubric: currentExamRubric, filename: file.name });
      this.eventBus.emit('wizard:rubric-uploaded', { rubric: currentExamRubric, filename: file.name });
      
      this.showRubricUploadSuccess(file.name);
      
    } catch (error) {
      alert('Error parsing rubric file. Please ensure it\'s valid JSON.');
    }
  }

  // Exact copy from GradingHubCore processJsonFile() - no changes  
  async processJsonFile(file) {
    try {
      console.log('📄 FileUploadService: Processing JSON file:', file.name);
      const text = await file.text();
      console.log('📄 FileUploadService: File text length:', text.length);
      const studentAnswers = JSON.parse(text);
      
      if (!Array.isArray(studentAnswers)) {
        alert('Student answers must be an array of objects.');
        return;
      }
      
      window.studentAnswers = studentAnswers;
      this.dataStore.setStudentAnswers(studentAnswers);
      
      // Base functionality - just emit event, let derived classes handle UI
      this.eventBus.emit('answers:loaded', { answers: studentAnswers, filename: file.name });
      
    } catch (error) {
      alert('Error parsing JSON file. Please ensure it\'s valid JSON.');
    }
  }


  // Exact copy from GradingHubCore showRubricUploadSuccess()
  showRubricUploadSuccess(filename) {
    const statusElement = document.getElementById('rubricUploadStatus');
    const filenameElement = document.getElementById('uploadedFileName');
    
    if (statusElement && filenameElement) {
      filenameElement.textContent = `File: ${filename}`;
      statusElement.classList.remove('hidden');
    }
  }
}

// Derived class for answers step with student data functionality
export class AnswersUploadService extends BaseWizardFileUploadService {
  // Override processJsonFile to add UI functionality
  async processJsonFile(file) {
    // Call parent method first
    await super.processJsonFile(file);
    
    // Add answers-specific UI functionality
    if (window.studentAnswers && window.studentAnswers.length > 0) {
      const studentCount = document.getElementById('studentCount');
      const readySection = document.getElementById('readyToGradeSection');
      
      if (studentCount && readySection) {
        studentCount.textContent = `${window.studentAnswers.length} students ready for grading`;
        readySection.classList.remove('hidden');
        
        // Setup student data toggle functionality after upload
        this.setupStudentDataToggle();
        
        // Setup start grading button functionality
        this.setupStartGradingButton();
      }
    }
  }

  // Student data toggle functionality - only for answers step
  setupStudentDataToggle() {
    const toggleBtn = document.getElementById('toggleStudentDataBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleStudentData());
    }
  }

  toggleStudentData() {
    const content = document.getElementById('studentDataContent');
    const btn = document.getElementById('toggleStudentDataBtn');
    
    if (content && btn) {
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
  }

  // Student data preview rendering - only for answers step  
  renderStudentDataPreview() {
    const tbody = document.querySelector('#studentDataTable tbody');
    if (!tbody || !window.studentAnswers) return;
    
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

  // Setup start grading button to emit wizard event
  setupStartGradingButton() {
    const startBtn = document.getElementById('startGradingBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        // Emit event for wizard to handle grading start
        this.eventBus.emit('wizard:start-grading');
      });
    }
  }
}

// Export base class as default for backward compatibility
export default BaseWizardFileUploadService;