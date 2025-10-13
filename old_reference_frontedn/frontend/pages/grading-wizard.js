/**
 * AI Grading Wizard - Multi-step workflow for automated grading
 * 
 * Architecture:
 * - Extends scan processor wizard framework for navigation
 * - Uses wizard-specific services (_w suffix) for self-contained functionality
 * - Integrates with EventBus + DataStore architecture
 * 
 * Workflow Steps:
 * 1. Profile Selection - Choose teacher profile for personalized grading
 * 2. Rubric Upload - Upload grading rubric (JSON format)
 * 3. Rubric Edit - Review and modify rubric with AI assistance
 * 4. Answers Upload - Upload student responses (JSON format)
 * 5. Grading Process - Automated AI grading with progress tracking
 * 
 * @author TeacherAI System
 * @version 2.0 (Wizard Architecture)
 */

import { eventBus } from '/utils/EventBus.js';
import { gradingDataStore } from '/components/DataStore.js';
import BaseWizardFileUploadService, { AnswersUploadService } from '/components/FileUploadService.js';

// Import ONLY wizard-specific services (self-contained)
import WizardRubricService from '/components/RubricService_w.js';
import WizardGradingService from '/components/GradingService_w.js';
import ProfileService from '/components/ProfileService_w.js';

// Import step templates
import { getProfileStepTemplate } from './grading-wizard/templates/ProfileStepTemplate.js';
import { getRubricStepTemplate } from './grading-wizard/templates/RubricStepTemplate.js';
import { getRubricEditStepTemplate } from './grading-wizard/templates/RubricEditStepTemplate.js';
import { getAnswersStepTemplate } from './grading-wizard/templates/AnswersStepTemplate.js';
import { getGradingStepTemplate } from './grading-wizard/templates/GradingStepTemplate.js';


/**
 * Main GradingWizard class implementing step-by-step AI grading workflow
 * Follows EventBus + DataStore architecture for clean service communication
 */
export default class GradingWizard {
    constructor() {
        // Step configuration (centralized metadata)
        this.stepConfig = [
            {
                id: 'profile',
                title: 'Profile',
                description: 'Choose your teaching profile to customize AI grading behavior',
                template: () => getProfileStepTemplate(),
                validation: () => !!this.dataStore.getSelectedProfile(),
                setup: () => {
                    this.profileService.setupProfileSelection();
                }
            },
            {
                id: 'rubric', 
                title: 'Upload',
                description: 'Upload your grading rubric file',
                template: () => getRubricStepTemplate(),
                validation: () => {
                    const rubric = this.fileUploadService.wizardRubric || this.dataStore.getCurrentRubric();
                    return !!rubric;
                },
                setup: () => {
                    this.fileUploadService.setupFileUploads();
                    this.setupSimpleUploadDisplay();
                }
            },
            {
                id: 'rubric-edit',
                title: 'Edit', 
                description: 'Review and fine-tune your rubric with AI assistance',
                template: () => getRubricEditStepTemplate(),
                validation: () => !!this.dataStore.getCurrentRubric(),
                setup: () => {
                    // Move rubric from temporary storage to DataStore (now safe to trigger events)
                    if (this.fileUploadService.wizardRubric) {
                        this.dataStore.setCurrentRubric(this.fileUploadService.wizardRubric);
                    }
                    
                    // Show the rubric and setup editing
                    this.rubricService.renderRubric();
                    this.getElement('rubricSection')?.classList.remove('hidden');
                    this.rubricService.setupRubricEditingControls();
                    
                    // Setup AI feedback functionality  
                    this.setupAIFeedbackForWizard();
                    
                    // Auto-trigger AI feedback and question type detection when step loads
                    setTimeout(() => {
                        this.triggerAIFeedback();
                        this.rubricService.detectQuestionTypes();
                    }, 500);
                }
            },
            {
                id: 'answers',
                title: 'Answers',
                description: 'Upload JSON files containing student responses to your exam questions',
                template: () => getAnswersStepTemplate(),
                validation: () => !!this.dataStore.getStudentAnswers(),
                setup: () => {
                    this.answersUploadService.setupFileUploads();
                }
            },
            {
                id: 'grading',
                title: 'Grading',
                description: 'Your rubric and student answers are being processed by AI',
                template: () => getGradingStepTemplate(),
                validation: () => !!this.dataStore.getGradingResults(),
                setup: () => {
                    this.gradingService.setupGradingProcess();
                    // Auto-start grading when step loads
                    setTimeout(() => {
                        this.gradingService.startGrading();
                    }, 500);
                }
            }
        ];
        
        // Workflow state management (now using config)
        this.currentStep = 'profile';
        this.steps = this.stepConfig.map(config => config.id);
        
        // Shared data store (Single Source of Truth pattern)
        this.dataStore = gradingDataStore;
        
        // Initialize wizard services and event handling
        this.initializeServices();
        this.setupEventListeners();
        this.init();
    }

    /**
     * Initialize all wizard-specific services with EventBus integration
     * Uses _w suffix services for self-contained functionality
     */
    initializeServices() {
        // File upload services for different steps
        this.fileUploadService = new BaseWizardFileUploadService();
        this.answersUploadService = new AnswersUploadService();
        
        // Core wizard services (self-contained with _w suffix)
        this.gradingService = new WizardGradingService();
        this.profileService = new ProfileService();
        this.rubricService = new WizardRubricService();
    }

    /**
     * Setup EventBus listeners for step-specific workflow events
     * Handles navigation state updates and cross-step communication
     */
    setupEventListeners() {
        // Step completion events - enable Next button without auto-advancing
        eventBus.on('wizard:profile-selected', () => {
            if (this.currentStep === 'profile') {
                this.updateNavigationButtons();
            }
        });

        eventBus.on('wizard:rubric-ready', () => {
            if (this.currentStep === 'rubric') {
                this.updateNavigationButtons();
            }
        });

        eventBus.on('wizard:start-grading', () => {
            this.nextStep();
        });

        eventBus.on('wizard:grading-complete', (data) => {
            console.log('🧙‍♂️ Grading complete:', data.results.length, 'results');
            this.updateNavigationButtons();
        });

        eventBus.on('answers:loaded', () => {
            if (this.currentStep === 'answers') {
                this.updateNavigationButtons();
            }
        });

        // Bridge legacy events to wizard workflow
        eventBus.on('profile:selected', (data) => {
            if (data.profile && this.currentStep === 'profile') {
                eventBus.emit('wizard:profile-selected', data);
                this.updateNavigationButtons();
            }
        });

        eventBus.on('rubric:loaded', () => {
            if (this.currentStep === 'rubric') {
                this.updateNavigationButtons();
            }
        });

        eventBus.on('grading:rubric-changed', () => {
            const rubric = this.dataStore.getCurrentRubric();
            if (this.currentStep === 'rubric') {
                if (rubric) {
                    eventBus.emit('wizard:rubric-ready', { rubric });
                }
                this.updateNavigationButtons();
            }
            if (this.currentStep === 'rubric-edit') {
                this.updateNavigationButtons();
            }
        });
    }

    // =============================================================================
    // DOM UTILITIES
    // =============================================================================
    
    getContainer() {
        return document.getElementById('content') || document.getElementById('main-content');
    }

    getElement(id) {
        return document.getElementById(id);
    }

    // =============================================================================
    // INITIALIZATION & RENDERING
    // =============================================================================

    async init() {
        this.render();
    }

    render() {
        const container = this.getContainer();
        
        container.innerHTML = `
            <div class="grading-wizard-container">
                <!-- Wizard Header -->
                <div class="wizard-header">
                    <h1>AI Grading Workflow</h1>
                    <p>Step-by-step guided grading with AI assistance</p>
                </div>

                <!-- Step Navigation (scan processor pattern) -->
                <div class="step-nav">
                    ${this.renderStepNavigation()}
                </div>

                <!-- Step Content -->
                <div class="step-content-container">
                    ${this.renderCurrentStep()}
                </div>

                <!-- Action Buttons (same as scan processor) -->
                <div class="action-buttons">
                    ${this.renderNavigationButtons()}
                </div>
            </div>
        `;

        // Setup step-specific functionality after render
        this.setupCurrentStepFunctionality();
        
        // CRITICAL: Re-attach navigation listeners after every render (innerHTML destroys them)
        this.attachNavigationListeners();
        
        // Initialize icons AFTER step content is loaded
        lucide.createIcons();
    }

    renderStepNavigation() {
        return this.steps.map((step, index) => {
            const isActive = step === this.currentStep;
            const isCompleted = this.steps.indexOf(this.currentStep) > index;
            const stepNumber = index + 1;
            
            // Get step title from configuration
            const stepConfig = this.stepConfig.find(config => config.id === step);
            const stepTitle = stepConfig ? stepConfig.title : step;

            return `
                <div class="step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                     data-step="${step}">
                    <div class="step-number">${stepNumber}</div>
                    <div class="step-title">${stepTitle}</div>
                </div>
            `;
        }).join('');
    }

    renderCurrentStep() {
        // Find current step configuration
        const stepConfig = this.stepConfig.find(config => config.id === this.currentStep);
        
        if (stepConfig && stepConfig.template) {
            return stepConfig.template();
        }
        
        // Fallback for unknown steps
        return '<div>Unknown step</div>';
    }

    renderNavigationButtons() {
        const currentIndex = this.steps.indexOf(this.currentStep);
        const isFirstStep = currentIndex === 0;
        const isLastStep = currentIndex === this.steps.length - 1;
        const isGradingStep = this.currentStep === 'grading';
        const isAnswersStep = this.currentStep === 'answers';
        
        const canProceed = this.canProceedFromCurrentStep();

        return `
            ${!isFirstStep ? `
                <button class="btn btn-secondary" id="back-btn" style="display: block;">Back</button>
            ` : `
                <button class="btn btn-secondary" id="back-btn" style="display: none;">Back</button>
            `}
            ${(!isLastStep && !isGradingStep && !isAnswersStep) ? `
                <button class="btn btn-primary" id="next-btn" ${!canProceed ? 'disabled' : ''}>Next</button>
            ` : (isGradingStep || isAnswersStep) ? `` : `
                <button class="btn btn-primary" id="next-btn">Complete</button>
            `}
        `;
    }

    canProceedFromCurrentStep() {
        // Find current step configuration
        const stepConfig = this.stepConfig.find(config => config.id === this.currentStep);
        
        if (stepConfig && stepConfig.validation) {
            return stepConfig.validation();
        }
        
        // Fallback for unknown steps
        return false;
    }

    setupCurrentStepFunctionality() {
        // Find current step configuration and run setup
        const stepConfig = this.stepConfig.find(config => config.id === this.currentStep);
        
        if (stepConfig && stepConfig.setup) {
            stepConfig.setup();
        }
    }

    updateNavigationButtons() {
        const nextBtn = this.getElement('next-btn');
        if (nextBtn) {
            const canProceed = this.canProceedFromCurrentStep();
            nextBtn.disabled = !canProceed;
        }
    }

    getElement(id) {
        return document.getElementById(id);
    }

    async nextStep() {
        const currentIndex = this.steps.indexOf(this.currentStep);
        if (currentIndex < this.steps.length - 1 && this.canProceedFromCurrentStep()) {
            this.currentStep = this.steps[currentIndex + 1];
            this.render();
        }
    }
    
    async triggerAIFeedbackIfRubricExists() {
        const currentRubric = this.dataStore.getCurrentRubric();
        if (currentRubric && window.getAIFeedback) {
            try {
                await window.getAIFeedback(false); // Manual trigger, not auto
            } catch (error) {
                console.warn('AI feedback failed in wizard:', error);
            }
        }
    }

    previousStep() {
        const currentIndex = this.steps.indexOf(this.currentStep);
        if (currentIndex > 0) {
            this.currentStep = this.steps[currentIndex - 1];
            this.render();
        }
    }

    attachNavigationListeners() {
        const backBtn = this.getElement('back-btn');
        const nextBtn = this.getElement('next-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.previousStep();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const currentIndex = this.steps.indexOf(this.currentStep);
                const isLastStep = currentIndex === this.steps.length - 1;
                const canProceed = this.canProceedFromCurrentStep();
                
                if (!canProceed) {
                    return;
                }
                
                if (isLastStep) {
                    this.finishWizard();
                } else {
                    this.nextStep();
                }
            });
        }
    }




    setupSimpleUploadDisplay() {
        // Simple upload display - show success message when rubric is uploaded
        const handleRubricUpload = () => {
            if (this.currentStep === 'rubric') {
                const rubric = this.dataStore.getCurrentRubric();
                if (rubric) {
                    const rubricSection = this.getElement('rubricSection');
                    const statusText = this.getElement('rubricStatusText');
                    
                    if (rubricSection && statusText) {
                        statusText.textContent = `${rubric.exam_name || 'Rubric'} uploaded successfully`;
                        rubricSection.classList.remove('hidden');
                    }
                }
            }
        };
        
        // Listen once for the upload
        eventBus.on('rubric:loaded', handleRubricUpload);
    }

    setupAIFeedbackForWizard() {
        // Setup AI feedback buttons
        const getAiFeedbackBtn = this.getElement('getAiFeedbackBtn');
        const dismissFeedbackBtn = this.getElement('dismissFeedbackBtn');
        
        if (getAiFeedbackBtn) {
            getAiFeedbackBtn.addEventListener('click', () => this.triggerAIFeedback());
        }
        
        if (dismissFeedbackBtn) {
            dismissFeedbackBtn.addEventListener('click', () => {
                this.getElement('aiFeedbackSection')?.classList.add('hidden');
            });
        }
    }

    async triggerAIFeedback() {
        const currentRubric = this.dataStore.getCurrentRubric();
        if (!currentRubric) {
            alert('Please create or upload a rubric first.');
            return;
        }

        const btn = this.getElement('getAiFeedbackBtn');
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Getting feedback...';
        btn.disabled = true;

        try {
            const profile = this.dataStore.getSelectedProfile();
            if (!profile) {
                alert('Please select a profile first.');
                return;
            }

            // Call BOTH API endpoints (like the grading hub)
            const clarification = this.getElement('aiPromptInput')?.value || '';
            
            // 1. Rubric Feedback API
            const combinedClarification = clarification 
                ? `${clarification}. Also detect question types with confidence scores.`
                : 'Provide feedback on this rubric and detect question types with confidence scores.';
            
            const feedbackResponse = await fetch('/api/rubric-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    exam_rubric: currentRubric, 
                    clarification: combinedClarification
                })
            });

            // Question type detection is handled separately in triggerInitialQuestionTypeDetection()

            if (!feedbackResponse.ok) {
                const errorData = await feedbackResponse.json().catch(() => ({}));
                throw new Error(`API Error: ${errorData.detail || feedbackResponse.statusText}`);
            }

            const data = await feedbackResponse.json();
            const feedback = data.feedback || data;
            
            const feedbackContent = this.getElement('aiFeedbackContent');
            const feedbackSection = this.getElement('aiFeedbackSection');
            
            if (feedbackContent) {
                feedbackContent.textContent = typeof feedback === 'string' ? feedback : JSON.stringify(feedback, null, 2);
            }
            feedbackSection?.classList.remove('hidden');
            
        } catch (error) {
            console.error('Rubric feedback error:', error);
            alert(`Error getting AI feedback: ${error.message}. Please try again.`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            lucide.createIcons();
        }
    }

    finishWizard() {
        // Simple wizard completion
        alert('Wizard completed! This is where final results would be processed.');
    }
}

// Initialize wizard when page loads
export function initializeGradingWizard() {
    new GradingWizard();
}