/**
 * Card Templates
 * Exact copy from monolithic scan processor with onclick handlers adapted for modular structure
 */

export default class CardTemplates {
    constructor() {
        // This class provides all card template methods
    }

    createStudentNameCard(processedData) {
        const studentName = processedData.student_name || '';
        const nameConfidence = processedData.name_confidence || 0.0;
        const nameNeedsReview = !studentName || studentName === 'Unknown Student' || nameConfidence < 0.7;
        
        return `
            <div class="question-card bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border-2 border-blue-500/50 p-6 mb-6 ${nameNeedsReview ? 'border-yellow-500/70' : ''}" data-question-id="student-info">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <i data-lucide="user" class="w-6 h-6 text-blue-400"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">Student Information</h3>
                            <p class="text-sm text-gray-300">Primary identification for this worksheet</p>
                        </div>
                    </div>
                    ${nameNeedsReview ? `
                        <div class="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-yellow-400"></i>
                            <span class="text-xs text-yellow-300 font-medium">Verify Name</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                        <i data-lucide="user-check" class="w-4 h-4 inline mr-1"></i>
                        Student Name *
                    </label>
                    <input type="text" value="${studentName}" 
                           class="input w-full text-lg font-medium ${nameNeedsReview ? 'border-yellow-500/50 bg-yellow-500/5' : ''}" 
                           data-field="student_name" 
                           placeholder="Enter student name">
                    <div class="flex items-center justify-between mt-2">
                        <div class="text-xs text-gray-500">
                            <i data-lucide="scan-line" class="w-3 h-3 inline mr-1"></i>
                            AI extracted: "${studentName || 'Name not found'}"
                        </div>
                        ${nameConfidence > 0 ? `
                            <div class="text-xs ${nameConfidence >= 0.7 ? 'text-green-400' : nameConfidence >= 0.5 ? 'text-yellow-400' : 'text-red-400'}">
                                Confidence: ${Math.round(nameConfidence * 100)}%
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${nameNeedsReview ? `
                    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <div class="flex items-start gap-2">
                            <i data-lucide="info" class="w-4 h-4 text-yellow-400 mt-0.5"></i>
                            <div class="text-sm text-yellow-200">
                                <strong>Action Required:</strong> Please verify or enter the student's name. 
                                This information is critical for proper record keeping.
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div class="flex items-center gap-2">
                            <i data-lucide="check-circle" class="w-4 h-4 text-green-400"></i>
                            <div class="text-sm text-green-200">
                                Student identified successfully
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    createStudentAnswerCard(questionId, answer, processedData) {
        // Use custom question text if available, otherwise show placeholder
        const customQuestionText = processedData?.customQuestions?.[questionId];
        const questionText = customQuestionText || `Question for ${questionId} (click Edit to add question text)`;
        const qIndex = parseInt(questionId.replace(/[^\d]/g, '')) - 1; // Extract numeric index
        
        // Check if this question needs review based on confidence
        const questionNeedsReview = processedData?.question_needs_review?.[questionId] || false;
        const questionConfidence = processedData?.question_confidence?.[questionId] || 0.0;
        
        return `
            <div class="question-card bg-gray-800 rounded-lg border border-gray-600 p-4 ${questionNeedsReview ? 'flagged' : ''}" data-question-id="${questionId}" data-question-index="${qIndex}">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-white font-medium">${questionId}</h4>
                    <button class="btn btn-secondary text-sm" data-action="remove-question" data-question-id="${questionId}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        Remove Question
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Question ID</label>
                        <input type="text" value="${questionId}" class="input w-full" data-field="question_id">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Max Points</label>
                        <input type="number" value="1" class="input w-20" data-field="max_points" min="0">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm text-gray-400 mb-1">Question Text</label>
                    <textarea class="input w-full h-20" data-field="question_text" placeholder="Enter the question text...">${questionText}</textarea>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm text-gray-400 mb-1">Student Answer</label>
                    <input type="text" value="${answer || ''}" class="input w-full" data-field="student_answer" placeholder="Enter or edit student answer">
                    <div class="text-xs text-gray-500 mt-1">
                        <i data-lucide="info" class="w-3 h-3 inline mr-1"></i>
                        AI extracted: "${answer || 'No answer detected'}"
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm text-gray-400">Grading Criteria</label>
                        <button class="btn btn-secondary text-xs" data-action="add-criterion" data-question-id="${questionId}">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                            Add Criterion
                        </button>
                    </div>
                    <div class="space-y-2 criteria-container">
                        <div class="criterion-card bg-gray-700 rounded p-3" data-criterion-index="0">
                            <div class="flex items-center gap-3">
                                <input type="text" value="Correct answer based on extracted response" 
                                       placeholder="Criterion name" class="input flex-1 text-sm" 
                                       data-field="criterion">
                                <input type="number" value="1" 
                                       class="input w-16 text-sm" data-field="max_points" min="0">
                                <span class="text-gray-400 text-xs">pts</span>
                                <button class="btn btn-secondary text-xs" data-action="remove-criterion" data-question-id="${questionId}" data-criterion-index="0">
                                    <i data-lucide="x" class="w-3 h-3"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-primary text-sm" data-action="accept">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        Accept
                    </button>
                    <button class="btn ${questionNeedsReview ? 'btn-warning' : 'btn-secondary'} text-sm" data-action="flag" ${questionNeedsReview ? 'data-auto-flagged="true"' : ''}>
                        <i data-lucide="flag" class="w-4 h-4"></i>
                        ${questionNeedsReview ? 'Flagged for Review' : 'Flag for Review'}
                        ${questionNeedsReview ? '<span class="text-xs ml-1">(Low Confidence)</span>' : ''}
                    </button>
                </div>
            </div>
        `;
    }

    createRubricQuestionCard(question, processedData) {
        const index = processedData.questions.indexOf(question);
        const questionId = question.question_id || `Q${index + 1}`;
        const maxPoints = question.max_points || 1;
        const qIndex = index;
        
        // Check if this question needs review based on confidence
        const questionNeedsReview = processedData?.question_needs_review?.[questionId] || false;
        const questionConfidence = processedData?.question_confidence?.[questionId] || 0.0;

        return `
            <div class="question-card bg-gray-800 rounded-lg border border-gray-600 p-4 ${questionNeedsReview ? 'flagged' : ''}" data-question-id="${questionId}" data-question-index="${qIndex}">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="text-white font-medium">Question ${index + 1}</h4>
                    <button class="btn btn-secondary text-sm" data-action="remove-question" data-question-id="${questionId}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        Remove Question
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Question ID</label>
                        <input type="text" value="${questionId}" class="input w-full" data-field="question_id">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Max Points</label>
                        <input type="number" value="${maxPoints}" class="input w-20" data-field="max_points" min="0">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm text-gray-400 mb-1">Question Text</label>
                    <textarea class="input w-full h-20" data-field="question_text" placeholder="Enter the question text...">${question.question_text || ''}</textarea>
                </div>
                
                <div class="mb-3">
                    <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm text-gray-400">Grading Criteria</label>
                        <button class="btn btn-secondary text-xs" data-action="add-criterion" data-question-id="${questionId}">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                            Add Criterion
                        </button>
                    </div>
                    <div class="space-y-2 criteria-container">
                        ${(question.criteria || [{criterion: 'Default criterion', max_points: maxPoints}]).map((criterion, cIndex) => `
                            <div class="criterion-card bg-gray-700 rounded p-3" data-criterion-index="${cIndex}">
                                <div class="flex items-center gap-3">
                                    <input type="text" value="${criterion.criterion || 'Default criterion'}" 
                                           placeholder="Criterion name" class="input flex-1 text-sm" 
                                           data-field="criterion">
                                    <input type="number" value="${criterion.max_points || 1}" 
                                           class="input w-16 text-sm" data-field="max_points" min="0">
                                    <span class="text-gray-400 text-xs">pts</span>
                                    <button class="btn btn-secondary text-xs" data-action="remove-criterion" data-question-id="${questionId}" data-criterion-index="${cIndex}">
                                        <i data-lucide="x" class="w-3 h-3"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-primary text-sm" data-action="accept">
                        <i data-lucide="check" class="w-4 h-4"></i>
                        Accept
                    </button>
                    <button class="btn ${questionNeedsReview ? 'btn-warning' : 'btn-secondary'} text-sm" data-action="flag" ${questionNeedsReview ? 'data-auto-flagged="true"' : ''}>
                        <i data-lucide="flag" class="w-4 h-4"></i>
                        ${questionNeedsReview ? 'Flagged for Review' : 'Flag for Review'}
                        ${questionNeedsReview ? '<span class="text-xs ml-1">(Low Confidence)</span>' : ''}
                    </button>
                </div>
            </div>
        `;
    }
}