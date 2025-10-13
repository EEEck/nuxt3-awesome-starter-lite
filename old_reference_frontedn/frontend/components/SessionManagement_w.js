/**
 * Session Management Service
 * Exact methods extracted from ScanProcessor for session save/load, export, and grading integration
 */
import { eventBus } from '/utils/EventBus.js';

export default class SessionManagement {
    constructor() {
        // This service manages session persistence and workflow transitions
    }

    /**
     * Save session (exact copy from line 2065)
     */
    async saveSession() {
        // Update document state and save
        this.saveVisualEditorChanges();
        
        // Phase 2 Complete: EventBus-only approach - Simplified MVP version
        eventBus.emit('data:save-session', {
            callback: (success) => {
                if (success) {
                    console.log('Document saved successfully');
                    this.showSessionSavedFeedback('Session saved successfully!');
                } else {
                    this.showSessionSavedFeedback('Failed to save session. Please try again.');
                }
            }
        });
    }

    /**
     * Start new session (exact copy from line 2083)
     */
    startNewSession() {
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('data:reset-session');
        eventBus.emit('file:reset-state');
        eventBus.emit('ui:reset-session');
        eventBus.emit('data:clear-url-document-id');
        eventBus.emit('ui:step-change', 'upload');
        eventBus.emit('ui:render');
        console.log('Started new session');
    }

    /**
     * Show session saved feedback (exact copy from line 2101)
     */
    showSessionSavedFeedback(message) {
        const saveBtn = document.getElementById('save-session');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = `<i data-lucide="check" class="btn-icon"></i>Saved!`;
            saveBtn.classList.remove('btn-secondary');
            saveBtn.classList.add('btn-success');
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.classList.remove('btn-success');
                saveBtn.classList.add('btn-secondary');
            }, 2000);
        }
        
        console.log(message);
    }

    /**
     * Download modified JSON (exact copy from line 2119)
     */
    downloadModifiedJson(uploadType) {
        // Save any changes first and update persistence service
        this.saveVisualEditorChanges();
        
        // Download current state from persistence service
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${uploadType}_${timestamp}`;
        this.exportAsJSON(filename);
        
        // Show brief success feedback
        const downloadBtn = document.getElementById('download-json');
        if (downloadBtn) {
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = `<i data-lucide="check" class="btn-icon"></i>Downloaded!`;
            downloadBtn.classList.remove('btn-secondary');
            downloadBtn.classList.add('btn-success');
            
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.classList.remove('btn-success');
                downloadBtn.classList.add('btn-secondary');
                lucide.createIcons();
            }, 2000);
        }
    }

    /**
     * Export as JSON (exact copy from line 2146)
     */
    exportAsJSON(filename) {
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('data:export-json', { filename });
    }

    /**
     * Download file (exact copy from line 2152)
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Start grading (exact copy from line 2164)
     */
    startGrading(uploadType) {
        // Save any changes first
        this.saveVisualEditorChanges();
        
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('session:start-grading', {
            uploadType,
            callback: (success) => {
                if (success) {
                    // Show transition feedback
                    this.showTransitionFeedback();
                }
            }
        });
        
    }

    /**
     * Show transition feedback (exact copy from line 2200)
     */
    showTransitionFeedback() {
        // Show a brief loading state before navigation
        const startBtn = document.getElementById('start-grading');
        if (startBtn) {
            const originalText = startBtn.innerHTML;
            startBtn.innerHTML = '<i data-lucide="loader" class="btn-icon animate-spin"></i>Transitioning to Grading Hub...';
            startBtn.disabled = true;
            
            // Brief delay to show feedback, then navigate
            setTimeout(() => {
                if (startBtn) {
                    startBtn.innerHTML = originalText;
                    startBtn.disabled = false;
                }
            }, 1500);
        }
    }

    /**
     * Save visual editor changes (helper method to be implemented in CardEditing service)
     */
    saveVisualEditorChanges() {
        // Phase 2 Complete: EventBus-only approach
        eventBus.emit('card:save-visual-editor-changes');
    }

    /**
     * Get default prompt (helper method)
     */
    getDefaultPrompt(uploadType) {
        if (uploadType === 'student') {
            return `You are an AI assistant specialized in extracting student responses from scanned worksheets.

TASK: Extract student information and answers from the uploaded document.

INSTRUCTIONS:
1. Extract the student's name from the document
2. Identify all question-answer pairs
3. Extract the exact text of each student response
4. Use clear question identifiers (Q1, Q2, etc. or as labeled)
5. Preserve the original wording of student responses

OUTPUT FORMAT:
{
  "student_name": "Full Name",
  "answers": {
    "Q1": "Student's exact answer text",
    "Q2": "Student's exact answer text"
  },
  "confidence": 0.85,
  "confidence_justification": "Clear handwriting and well-structured document"
}

Focus on accuracy and completeness. If text is unclear, note it in the answer.`;
        } else {
            return `You are an AI assistant specialized in extracting rubric information from scanned documents.

TASK: Extract grading rubric structure and criteria from the uploaded document.

INSTRUCTIONS:
1. Extract the exam/assignment name
2. Identify all questions and their point values
3. Extract grading criteria for each question
4. Capture any general instructions

OUTPUT FORMAT:
{
  "exam_name": "Assignment Name",
  "general_instructions": "Any general grading instructions",
  "questions": [
    {
      "question_id": "Q1",
      "question_text": "Full question text",
      "max_points": 5,
      "criteria": [
        {
          "criterion": "Criterion description",
          "max_points": 3
        }
      ]
    }
  ],
  "confidence": 0.90,
  "confidence_justification": "Well-structured rubric with clear point allocations"
}

Focus on extracting complete grading criteria and point distributions.`;
        }
    }
}