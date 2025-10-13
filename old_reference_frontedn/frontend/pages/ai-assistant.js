/**
 * AI Assistant page with simplified grading profile generator
 */
export function renderAIAssistant(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white mb-2">AI Assistant</h1>
        <p class="text-gray-400">Create intelligent grading profiles with question-type specific instructions for consistent, efficient assessment.</p>
      </div>

      <!-- Quick Start Templates -->
      <div class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-semibold text-white flex items-center gap-2">
            <i data-lucide="zap" class="w-5 h-5 text-yellow-400"></i>
            Quick Start
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button class="template-btn" data-template="elementary_science">
            <div class="text-center p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
              <i data-lucide="microscope" class="w-8 h-8 text-green-400 mx-auto mb-2"></i>
              <div class="font-medium text-white text-sm">Elementary Science</div>
              <div class="text-xs text-gray-400">K-5 • Multiple Choice, True/False</div>
            </div>
          </button>
          
          <button class="template-btn" data-template="middle_school_stem">
            <div class="text-center p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
              <i data-lucide="atom" class="w-8 h-8 text-blue-400 mx-auto mb-2"></i>
              <div class="font-medium text-white text-sm">Middle School STEM</div>
              <div class="text-xs text-gray-400">6-8 • Short Answer, Math Problems</div>
            </div>
          </button>
          
          <button class="template-btn" data-template="high_school_biology">
            <div class="text-center p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
              <i data-lucide="dna" class="w-8 h-8 text-purple-400 mx-auto mb-2"></i>
              <div class="font-medium text-white text-sm">High School Biology</div>
              <div class="text-xs text-gray-400">9-12 • Essays, Lab Analysis</div>
            </div>
          </button>
          
          <button class="template-btn" data-template="blank">
            <div class="text-center p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
              <i data-lucide="plus" class="w-8 h-8 text-gray-400 mx-auto mb-2"></i>
              <div class="font-medium text-white text-sm">Start from Scratch</div>
              <div class="text-xs text-gray-400">Custom profile</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Existing Profiles -->
        <div class="lg:col-span-1">
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                <i data-lucide="folder" class="w-5 h-5 text-blue-400"></i>
                My Profiles
              </h2>
            </div>
            
            <div id="profilesList" class="space-y-3">
              <!-- Profiles will be loaded here -->
              <div class="text-gray-400 text-sm text-center py-8">
                No profiles yet. Create your first profile!
              </div>
            </div>
            
          </div>
        </div>

        <!-- Simplified Profile Creator -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="card-header">
              <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                <i data-lucide="settings" class="w-5 h-5 text-blue-400"></i>
                <span id="creatorTitle">Create New Grading Profile</span>
              </h2>
            </div>

            <!-- Simple 2-Step Interface -->
            <div class="mb-6">
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <div id="step1-indicator" class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</div>
                  <span class="text-white">Profile Info</span>
                </div>
                <div class="w-8 h-px bg-gray-600"></div>
                <div class="flex items-center gap-2">
                  <div id="step2-indicator" class="w-6 h-6 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center text-xs">2</div>
                  <span class="text-gray-400">Question Types</span>
                </div>
              </div>
            </div>

            <!-- Step 1: Profile Information -->
            <div id="step1" class="profile-step">
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Profile Name</label>
                  <input type="text" id="profileName" placeholder="e.g., '8th Grade Biology Midterm'" 
                         class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none">
                </div>
                
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Subject Area</label>
                    <select id="subjectArea" class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                      <option value="">Select subject...</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="science">Science</option>
                      <option value="biology">Biology</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="physics">Physics</option>
                      <option value="english">English Language Arts</option>
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                      <option value="computer_science">Computer Science</option>
                      <option value="art">Art</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Grade Level</label>
                    <select id="gradeLevel" class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                      <option value="">Select grade...</option>
                      <option value="elementary">Elementary (K-5)</option>
                      <option value="middle_school">Middle School (6-8)</option>
                      <option value="high_school">High School (9-12)</option>
                      <option value="college">College/University</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">School Type</label>
                    <select id="schoolType" class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                      <option value="public">Public School</option>
                      <option value="private">Private School</option>
                      <option value="charter">Charter School</option>
                      <option value="homeschool">Homeschool</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <!-- Smart Suggestions -->
                <div id="smartSuggestions" class="hidden bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <i data-lucide="lightbulb" class="w-5 h-5 text-blue-500 mt-0.5"></i>
                    <div class="flex-1">
                      <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Suggested for this subject & grade:</h4>
                      <div id="suggestedTypes" class="text-sm text-blue-700 dark:text-blue-300 mb-3"></div>
                      <button id="applySuggestions" class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors">
                        Quick Add These Types
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">General Grading Instructions</label>
                  <textarea id="generalInstructions" rows="3" 
                            placeholder="e.g., 'Focus on scientific reasoning. Award partial credit for correct methodology even if final answer is incorrect.'"
                            class="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"></textarea>
                  <div class="text-xs text-gray-500 mt-1">These instructions apply to all question types in this profile.</div>
                </div>
              </div>
              
              <div class="flex justify-end mt-6">
                <button id="step1NextBtn" class="btn btn-primary">
                  Next: Add Question Types
                  <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>
                </button>
              </div>
            </div>

            <!-- Step 2: Question Types -->
            <div id="step2" class="profile-step hidden">
              <div class="space-y-6">
                
                <!-- Preset Question Types -->
                <div>
                  <h4 class="text-lg font-medium text-white mb-3">Select Question Types You Use</h4>
                  <div id="presetTypes" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <!-- Preset types will be populated here -->
                  </div>
                  <div class="text-xs text-gray-500">Each type has optimized AI grading instructions built-in.</div>
                </div>
                
                <!-- Custom Question Types -->
                <div class="border-t border-gray-700 pt-6">
                  <h4 class="text-lg font-medium text-white mb-3">Add Custom Question Types</h4>
                  <div class="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
                    <div class="space-y-4">
                      <div>
                        <input type="text" id="customTypeName" placeholder="Type name (e.g., 'Lab Report Analysis')" 
                               class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400">
                      </div>
                      <div class="flex gap-3">
                        <textarea id="customTypeInstructions" rows="3" placeholder="Grading instructions for this question type..."
                                  class="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"></textarea>
                        <button id="addCustomTypeBtn" class="btn btn-secondary px-6 whitespace-nowrap self-start">
                          <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                          Add Custom Type
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Selected Types Summary -->
                <div>
                  <h4 class="text-lg font-medium text-white mb-3">Your Question Types (<span id="typeCount">0</span>)</h4>
                  <div id="selectedTypes" class="space-y-2 min-h-[120px] max-h-[300px] overflow-y-auto bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                    <div class="text-gray-400 text-sm text-center py-8">
                      No question types selected yet
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-between mt-6">
                <button id="step2BackBtn" class="btn btn-secondary">
                  <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
                  Back to Profile Info
                </button>
                <button id="saveProfileBtn" class="btn btn-primary" disabled>
                  <i data-lucide="save" class="w-4 h-4 mr-2"></i>
                  Save Profile
                </button>
              </div>
            </div>

            <!-- Success Message -->
            <div id="successMessage" class="profile-step hidden">
              <div class="text-center py-8">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i data-lucide="check" class="w-8 h-8 text-white"></i>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">Profile Created Successfully!</h3>
                <p class="text-gray-400 mb-6">Your grading profile is ready to use with rubrics.</p>
                <div class="flex gap-3 justify-center">
                  <button id="createAnotherBtn" class="btn btn-secondary">
                    <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize the wizard
  initializeProfileWizard();
  loadExistingProfiles();
  
  // Initialize icons
  lucide.createIcons();
}

function initializeProfileWizard() {
  // Predefined question types with built-in AI instructions
  const presetQuestionTypes = [
    {
      id: 'multiple_choice',
      name: 'Multiple Choice',
      description: 'Exact answers only, no partial credit',
      icon: 'check-circle',
      subjects: ['all']
    },
    {
      id: 'short_answer',
      name: 'Short Answer',
      description: 'Partial credit for correct concepts',
      icon: 'message-square',
      subjects: ['all']
    },
    {
      id: 'essay',
      name: 'Essay/Long Response',
      description: 'Evaluates structure, evidence, clarity',
      icon: 'file-text',
      subjects: ['english', 'history', 'geography']
    },
    {
      id: 'math_problem',
      name: 'Math Problems',
      description: 'Credit for method + work shown',
      icon: 'calculator',
      subjects: ['mathematics', 'physics', 'chemistry']
    },
    {
      id: 'fill_blank',
      name: 'Fill in the Blank',
      description: 'Accepts equivalent answers',
      icon: 'edit-3',
      subjects: ['all']
    },
    {
      id: 'true_false',
      name: 'True/False',
      description: 'Full credit for correct choice',
      icon: 'toggle-left',
      subjects: ['all']
    },
    {
      id: 'lab_analysis',
      name: 'Lab Analysis',
      description: 'Evaluates hypothesis and methodology',
      icon: 'flask',
      subjects: ['science', 'biology', 'chemistry', 'physics']
    },
    {
      id: 'diagram_interpretation',
      name: 'Diagram/Chart Analysis',
      description: 'Visual data interpretation skills',
      icon: 'bar-chart-3',
      subjects: ['science', 'geography', 'mathematics']
    },
    {
      id: 'code_review',
      name: 'Code Review',
      description: 'Programming logic and syntax',
      icon: 'code',
      subjects: ['computer_science']
    }
  ];

  // Smart suggestions based on subject/grade combinations
  const smartSuggestions = {
    'biology': {
      'elementary': ['multiple_choice', 'short_answer', 'diagram_interpretation'],
      'middle_school': ['multiple_choice', 'short_answer', 'lab_analysis', 'diagram_interpretation'], 
      'high_school': ['short_answer', 'essay', 'lab_analysis', 'diagram_interpretation'],
      'college': ['essay', 'lab_analysis', 'diagram_interpretation']
    },
    'mathematics': {
      'elementary': ['multiple_choice', 'fill_blank', 'math_problem'],
      'middle_school': ['multiple_choice', 'short_answer', 'math_problem'],
      'high_school': ['short_answer', 'math_problem'],
      'college': ['math_problem', 'essay']
    },
    'english': {
      'elementary': ['multiple_choice', 'short_answer', 'fill_blank'],
      'middle_school': ['short_answer', 'essay'],
      'high_school': ['essay', 'short_answer'],
      'college': ['essay']
    },
    'science': {
      'elementary': ['multiple_choice', 'true_false', 'short_answer'],
      'middle_school': ['multiple_choice', 'short_answer', 'lab_analysis'],
      'high_school': ['short_answer', 'lab_analysis', 'diagram_interpretation'],
      'college': ['essay', 'lab_analysis']
    }
  };

  // Profile templates for quick start
  const profileTemplates = {
    'elementary_science': {
      name: 'Elementary Science',
      subject_area: 'science',
      grade_level: 'elementary',
      school_type: 'public',
      general_instructions: 'Focus on basic scientific concepts and observation skills. Use simple language in feedback.',
      question_types: ['multiple_choice', 'true_false', 'short_answer']
    },
    'middle_school_stem': {
      name: 'Middle School STEM',
      subject_area: 'science',
      grade_level: 'middle_school', 
      school_type: 'public',
      general_instructions: 'Encourage scientific reasoning and problem-solving. Award partial credit for showing work.',
      question_types: ['short_answer', 'math_problem', 'lab_analysis']
    },
    'high_school_biology': {
      name: 'High School Biology',
      subject_area: 'biology',
      grade_level: 'high_school',
      school_type: 'public', 
      general_instructions: 'Focus on biological processes and scientific terminology. Evaluate depth of understanding.',
      question_types: ['short_answer', 'essay', 'lab_analysis', 'diagram_interpretation']
    }
  };

  // Current state
  let currentStep = 1;
  let selectedTypes = new Map();
  let profileData = {};
  let isEditingProfile = false;
  let editingProfileId = null;

  // Function to attach event listeners to preset type elements
  function attachPresetTypeListeners() {
    // Preset type selection
    document.querySelectorAll('.preset-type input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const typeId = e.target.dataset.type;
        const type = presetQuestionTypes.find(t => t.id === typeId);
        
        if (e.target.checked) {
          selectedTypes.set(typeId, type);
        } else {
          selectedTypes.delete(typeId);
        }
        
        updateSelectedTypesDisplay();
      });
    });

    // Info buttons
    document.querySelectorAll('.question-type-info').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const typeId = btn.dataset.type;
        const type = presetQuestionTypes.find(t => t.id === typeId);
        if (type) {
          showQuestionTypeDetails(type);
        }
      });
    });
  }

  // Populate preset types
  const presetContainer = document.getElementById('presetTypes');
  presetContainer.innerHTML = presetQuestionTypes.map(type => `
    <label class="flex items-start gap-3 p-3 border border-gray-600 rounded-lg hover:border-blue-500 cursor-pointer transition-colors preset-type" data-type-id="${type.id}">
      <input type="checkbox" class="mt-1 text-blue-500" data-type="${type.id}">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <i data-lucide="${type.icon}" class="w-4 h-4 text-blue-400"></i>
          <span class="font-medium text-white">${type.name}</span>
          <button class="question-type-info text-gray-400 hover:text-white ml-auto" data-type="${type.id}" title="Show details">
            <i data-lucide="help-circle" class="w-3 h-3"></i>
          </button>
        </div>
        <p class="text-sm text-gray-400">${type.description}</p>
      </div>
    </label>
  `).join('');

  // Attach initial preset type listeners
  attachPresetTypeListeners();

  // Template selection
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Template button clicked:', btn.dataset.template);
      const template = btn.dataset.template;
      if (template === 'blank') {
        resetProfileForm();
      } else {
        loadTemplate(template);
      }
      goToStep(1);
    });
  });

  function loadTemplate(templateName) {
    console.log('Loading template:', templateName);
    resetProfileForm();
    
    const templates = {
      elementary_science: {
        name: 'Elementary Science Profile',
        subject_area: 'science',
        grade_level: 'elementary',
        school_type: 'public',
        general_instructions: 'Focus on basic scientific concepts and encourage curiosity. Award partial credit for effort and understanding.',
        question_types: ['multiple_choice', 'true_false', 'short_answer', 'fill_blank']
      },
      middle_school_stem: {
        name: 'Middle School STEM Profile',
        subject_area: 'science',
        grade_level: 'middle_school',
        school_type: 'public',
        general_instructions: 'Emphasize scientific method and mathematical reasoning. Look for step-by-step work and logical thinking.',
        question_types: ['short_answer', 'math_problem', 'lab_analysis', 'diagram_interpretation']
      },
      high_school_biology: {
        name: 'High School Biology Profile',
        subject_area: 'biology',
        grade_level: 'high_school',
        school_type: 'public',
        general_instructions: 'Evaluate biological understanding, experimental design, and scientific writing. Expect detailed explanations.',
        question_types: ['essay', 'lab_analysis', 'short_answer', 'diagram_interpretation']
      }
    };
    
    const template = templates[templateName];
    if (!template) return;
    
    // Fill in Step 1 form
    document.getElementById('profileName').value = template.name;
    document.getElementById('subjectArea').value = template.subject_area;
    document.getElementById('gradeLevel').value = template.grade_level;
    document.getElementById('schoolType').value = template.school_type;
    document.getElementById('generalInstructions').value = template.general_instructions;
    
    // Select the appropriate question types
    selectedTypes.clear();
    console.log('Template question types:', template.question_types);
    console.log('Available preset types:', presetQuestionTypes.map(t => t.id));
    
    template.question_types.forEach(typeId => {
      const type = presetQuestionTypes.find(t => t.id === typeId);
      console.log(`Looking for type ${typeId}:`, type);
      
      if (type) {
        selectedTypes.set(typeId, {
          id: typeId,
          name: type.name,
          description: type.description,
          isCustom: false
        });
      } else {
        console.warn(`Question type not found: ${typeId}`);
      }
    });
    
    console.log('Selected types after template load:', Array.from(selectedTypes.keys()));
    
    // Use requestAnimationFrame to ensure DOM is ready for checkbox updates
    requestAnimationFrame(() => {
      template.question_types.forEach(typeId => {
        if (selectedTypes.has(typeId)) {
          const checkbox = document.querySelector(`input[data-type="${typeId}"]`);
          console.log(`Checkbox for ${typeId}:`, checkbox);
          if (checkbox) {
            checkbox.checked = true;
          } else {
            console.warn(`Checkbox not found for type: ${typeId}`);
          }
        }
      });
      
      updateSelectedTypesDisplay();
    });
  }

  function resetProfileForm() {
    // Reset Step 1 form
    document.getElementById('profileName').value = '';
    document.getElementById('subjectArea').value = '';
    document.getElementById('gradeLevel').value = '';
    document.getElementById('schoolType').value = '';
    document.getElementById('generalInstructions').value = '';
    
    // Reset selected types
    selectedTypes.clear();
    
    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    
    // Reset global variables
    profileData = {};
    isEditingProfile = false;
    editingProfileId = null;
    
    // Update displays
    updateSelectedTypesDisplay();
    
    // Go to step 1
    goToStep(1);
  }

  // Step navigation
  document.getElementById('step1NextBtn').addEventListener('click', () => {
    if (validateStep1()) {
      goToStep(2);
    }
  });

  document.getElementById('step2BackBtn').addEventListener('click', () => goToStep(1));
  
  // Smart suggestions for subject/grade combination
  document.getElementById('subjectArea').addEventListener('change', updateSmartSuggestions);
  document.getElementById('gradeLevel').addEventListener('change', updateSmartSuggestions);
  
  document.getElementById('applySuggestions').addEventListener('click', () => {
    applySuggestedTypes();
  });

  // Preset type selection
  presetContainer.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      const typeId = e.target.dataset.type;
      const typeData = presetQuestionTypes.find(t => t.id === typeId);
      
      if (e.target.checked) {
        selectedTypes.set(typeId, {
          id: typeId,
          name: typeData.name,
          description: typeData.description,
          isCustom: false
        });
      } else {
        selectedTypes.delete(typeId);
      }
      updateSelectedTypesDisplay();
    }
  });

  // Custom type addition
  document.getElementById('addCustomTypeBtn').addEventListener('click', addCustomType);
  document.getElementById('customTypeName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomType();
  });

  // Profile actions
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('createAnotherBtn').addEventListener('click', () => {
    resetProfileForm();
    goToStep(1);
  });

  function loadTemplate(templateKey) {
    const template = profileTemplates[templateKey];
    if (!template) return;
    
    document.getElementById('profileName').value = template.name;
    document.getElementById('subjectArea').value = template.subject_area;
    document.getElementById('gradeLevel').value = template.grade_level;
    document.getElementById('schoolType').value = template.school_type;
    document.getElementById('generalInstructions').value = template.general_instructions;
    
    // Pre-select question types
    selectedTypes.clear();
    template.question_types.forEach(typeId => {
      const typeData = presetQuestionTypes.find(t => t.id === typeId);
      if (typeData) {
        selectedTypes.set(typeId, {
          id: typeId,
          name: typeData.name,
          description: typeData.description,
          isCustom: false
        });
      }
    });
    
    updateSmartSuggestions();
    document.getElementById('creatorTitle').textContent = `Customize: ${template.name}`;
  }
  
  function resetProfileForm() {
    document.getElementById('profileName').value = '';
    document.getElementById('subjectArea').value = '';
    document.getElementById('gradeLevel').value = '';
    document.getElementById('schoolType').value = 'public';
    document.getElementById('generalInstructions').value = '';
    
    // Clear selected types
    selectedTypes.clear();
    
    // Uncheck all preset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    
    // Clear custom type inputs
    document.getElementById('customTypeName').value = '';
    document.getElementById('customTypeInstructions').value = '';
    
    updateSelectedTypesDisplay();
    updateSmartSuggestions();
    document.getElementById('creatorTitle').textContent = 'Create New Grading Profile';
    isEditingProfile = false;
    editingProfileId = null;
  }
  
  function updateSmartSuggestions() {
    const subject = document.getElementById('subjectArea').value;
    const grade = document.getElementById('gradeLevel').value;
    const suggestionsContainer = document.getElementById('smartSuggestions');
    const suggestedTypesContainer = document.getElementById('suggestedTypes');
    
    if (!subject || !grade) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    // Get suggestions for this subject/grade combination
    const suggestions = smartSuggestions[subject]?.[grade] || smartSuggestions['science']?.[grade] || [];
    
    if (suggestions.length === 0) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    const suggestedNames = suggestions.map(id => {
      const type = presetQuestionTypes.find(t => t.id === id);
      return type ? type.name : id;
    }).join(', ');
    
    suggestedTypesContainer.textContent = suggestedNames;
    suggestionsContainer.classList.remove('hidden');
    
    // Store suggestions for applying later
    suggestionsContainer.dataset.suggestions = JSON.stringify(suggestions);
  }
  
  function applySuggestedTypes() {
    const suggestionsContainer = document.getElementById('smartSuggestions');
    const suggestions = JSON.parse(suggestionsContainer.dataset.suggestions || '[]');
    
    suggestions.forEach(typeId => {
      const typeData = presetQuestionTypes.find(t => t.id === typeId);
      if (typeData && !selectedTypes.has(typeId)) {
        selectedTypes.set(typeId, {
          id: typeId,
          name: typeData.name,
          description: typeData.description,
          isCustom: false
        });
      }
    });
    
    // Use requestAnimationFrame to ensure DOM is ready for checkbox updates
    requestAnimationFrame(() => {
      suggestions.forEach(typeId => {
        if (selectedTypes.has(typeId)) {
          const checkbox = document.querySelector(`input[data-type="${typeId}"]`);
          if (checkbox) {
            checkbox.checked = true;
            console.log(`Checkbox checked for ${typeId}`);
          } else {
            console.warn(`Checkbox not found for type: ${typeId}`);
          }
        }
      });
      
      updateSelectedTypesDisplay();
    });
    
    suggestionsContainer.classList.add('hidden');
  }
  
  function validateStep1() {
    console.log('=== VALIDATE STEP 1 DEBUG ===');
    const name = document.getElementById('profileName').value.trim();
    const subject = document.getElementById('subjectArea').value;
    const grade = document.getElementById('gradeLevel').value;
    
    console.log('Validation inputs:', { name, subject, grade });

    if (!name || !subject || !grade) {
      console.log('Validation failed: missing required fields');
      showValidationError('Please fill in all required fields (name, subject, and grade level).');
      return false;
    }

    profileData = {
      name,
      subject_area: subject,
      grade_level: grade,
      school_type: document.getElementById('schoolType').value,
      general_instructions: document.getElementById('generalInstructions').value.trim()
    };
    
    console.log('Validation passed, profileData set:', profileData);
    return true;
  }
  
  function showValidationError(message) {
    // Simple validation feedback - could be enhanced with better UI
    const existingAlert = document.querySelector('.validation-alert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.className = 'validation-alert bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4';
    alert.innerHTML = `
      <div class="flex items-center gap-2">
        <i data-lucide="alert-circle" class="w-4 h-4"></i>
        <span>${message}</span>
      </div>
    `;
    
    const step1 = document.getElementById('step1');
    step1.insertBefore(alert, step1.firstChild);
    lucide.createIcons();
    
    setTimeout(() => alert.remove(), 5000);
  }

  function showSuccessMessage(message) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.success-alert, .validation-alert');
    if (existingAlert) existingAlert.remove();
    
    const alert = document.createElement('div');
    alert.className = 'success-alert bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4';
    alert.innerHTML = `
      <div class="flex items-center gap-2">
        <i data-lucide="check-circle" class="w-4 h-4"></i>
        <span>${message}</span>
      </div>
    `;
    
    const step2 = document.getElementById('step2');
    step2.insertBefore(alert, step2.firstChild);
    lucide.createIcons();
    
    setTimeout(() => alert.remove(), 5000);
  }

  function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.profile-step').forEach(s => s.classList.add('hidden'));
    
    // Show target step
    document.getElementById(`step${step}`).classList.remove('hidden');
    
    // Update indicators
    for (let i = 1; i <= 2; i++) {
      const indicator = document.getElementById(`step${i}-indicator`);
      if (i < step) {
        indicator.className = 'w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs';
        indicator.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i>';
      } else if (i === step) {
        indicator.className = 'w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs';
        indicator.textContent = i;
      } else {
        indicator.className = 'w-6 h-6 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center text-xs';
        indicator.textContent = i;
      }
    }
    
    currentStep = step;
    lucide.createIcons();
  }

  async function addCustomType() {
    console.log('addCustomType called');
    
    const nameEl = document.getElementById('customTypeName');
    const instructionsEl = document.getElementById('customTypeInstructions');
    
    if (!nameEl || !instructionsEl) {
      console.error('Custom type input elements not found!');
      showValidationError('Error: Input elements not found. Please refresh the page.');
      return;
    }
    
    const name = nameEl.value.trim();
    const instructions = instructionsEl.value.trim();

    console.log('Custom type inputs:', { name, instructions });

    if (!name || !instructions) {
      showValidationError('Please provide both name and instructions for the custom type.');
      return;
    }

    try {
      // Show loading state
      const addBtn = document.getElementById('addCustomTypeBtn');
      const originalText = addBtn.textContent;
      addBtn.textContent = 'Creating...';
      addBtn.disabled = true;

      // Call backend API to create custom type
      const response = await fetch('/api/question-types/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          description: instructions,
          prompt: instructions,
          created_by: 'teacher'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create custom question type');
      }

      const result = await response.json();
      
      // Add to local selected types using the backend-generated ID
      selectedTypes.set(result.type_id, {
        id: result.type_id,
        name: result.name,
        description: result.description,
        instructions: result.description,
        isCustom: true,
        backendId: result.type_id // Track the backend ID
      });

      // Clear inputs
      document.getElementById('customTypeName').value = '';
      document.getElementById('customTypeInstructions').value = '';

      // Show success message
      showSuccessMessage(`Custom question type "${result.name}" created successfully!`);
      
      updateSelectedTypesDisplay();

      // Reset button
      addBtn.textContent = originalText;
      addBtn.disabled = false;

    } catch (error) {
      console.error('Error creating custom type:', error);
      showValidationError(`Failed to create custom type: ${error.message}`);
      
      // Reset button
      const addBtn = document.getElementById('addCustomTypeBtn');
      addBtn.textContent = 'Add Custom Type';
      addBtn.disabled = false;
    }
  }

  function updateSelectedTypesDisplay() {
    const container = document.getElementById('selectedTypes');
    const countElement = document.getElementById('typeCount');
    const saveBtn = document.getElementById('saveProfileBtn');
    
    countElement.textContent = selectedTypes.size;
    
    if (selectedTypes.size === 0) {
      container.innerHTML = `
        <div class="text-gray-400 text-sm text-center py-8">
          <i data-lucide="help-circle" class="w-8 h-8 text-gray-500 mx-auto mb-2"></i>
          <p>No question types selected yet</p>
          <p class="text-xs mt-1">Select types from above to see them here</p>
        </div>
      `;
      saveBtn.disabled = true;
      saveBtn.classList.add('opacity-50', 'cursor-not-allowed');
      lucide.createIcons();
      return;
    }

    container.innerHTML = Array.from(selectedTypes.values()).map(type => `
      <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <i data-lucide="${getTypeIcon(type.id)}" class="w-4 h-4 text-blue-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-white text-sm">${type.name}</span>
              ${type.isCustom ? '<span class="text-xs bg-purple-500 text-white px-2 py-1 rounded">Custom</span>' : ''}
            </div>
            <p class="text-xs text-gray-400 mt-0.5">${type.description || type.instructions}</p>
          </div>
        </div>
        <button class="text-gray-400 hover:text-red-400 transition-colors" onclick="removeSelectedType('${type.id}')" title="Remove">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
    
    saveBtn.disabled = false;
    saveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    lucide.createIcons();
  }
  
  function getTypeIcon(typeId) {
    const type = presetQuestionTypes.find(t => t.id === typeId);
    return type ? type.icon : 'help-circle';
  }

  // Make removeSelectedType globally accessible
  window.removeSelectedType = function(typeId) {
    selectedTypes.delete(typeId);
    
    // Uncheck preset checkbox if it exists
    const checkbox = document.querySelector(`input[data-type="${typeId}"]`);
    if (checkbox) checkbox.checked = false;
    
    updateSelectedTypesDisplay();
  };

  function showReview() {
    const reviewContainer = document.getElementById('profileReview');
    
    reviewContainer.innerHTML = `
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <h4 class="font-medium text-white mb-3">Profile Details</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-400">Name:</span>
            <span class="text-white ml-2">${profileData.name}</span>
          </div>
          <div>
            <span class="text-gray-400">Subject:</span>
            <span class="text-white ml-2">${profileData.subject_area}</span>
          </div>
          <div>
            <span class="text-gray-400">Grade Level:</span>
            <span class="text-white ml-2">${profileData.grade_level}</span>
          </div>
          <div>
            <span class="text-gray-400">Question Types:</span>
            <span class="text-white ml-2">${selectedTypes.size} types</span>
          </div>
        </div>
        ${profileData.general_instructions ? `
          <div class="mt-3">
            <span class="text-gray-400">General Instructions:</span>
            <p class="text-white text-sm mt-1">${profileData.general_instructions}</p>
          </div>
        ` : ''}
      </div>

      <div class="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <h4 class="font-medium text-white mb-3">Question Types (${selectedTypes.size})</h4>
        <div class="space-y-2">
          ${Array.from(selectedTypes.values()).map(type => `
            <div class="text-sm">
              <div class="flex items-center gap-2">
                <span class="font-medium text-white">${type.name}</span>
                ${type.isCustom ? '<span class="text-xs bg-purple-500 text-white px-2 py-1 rounded">Custom</span>' : ''}
              </div>
              <p class="text-gray-400 text-xs mt-1">${type.instructions}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function saveProfile() {
    console.log('=== SAVE PROFILE DEBUG START ===');
    console.log('saveProfile called');
    console.log('selectedTypes:', selectedTypes);
    console.log('profileData:', profileData);
    
    // Debug form values directly
    const formValues = {
      name: document.getElementById('profileName').value,
      subject_area: document.getElementById('subjectArea').value,
      grade_level: document.getElementById('gradeLevel').value,
      school_type: document.getElementById('schoolType').value,
      general_instructions: document.getElementById('generalInstructions').value
    };
    console.log('Form values directly from DOM:', formValues);
    
    if (selectedTypes.size === 0) {
      showValidationError('Please select at least one question type.');
      return;
    }
    
    try {
      // Show loading state
      const saveBtn = document.getElementById('saveProfileBtn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;

      // Use form values directly instead of profileData to avoid validation dependency
      const profileRequest = {
        name: document.getElementById('profileName').value,
        subject_area: document.getElementById('subjectArea').value,
        grade_level: document.getElementById('gradeLevel').value,
        school_type: document.getElementById('schoolType').value,
        general_instructions: document.getElementById('generalInstructions').value,
        question_types: Array.from(selectedTypes.values())
      };
      
      console.log('Profile request data:', profileRequest);

      let response;
      if (isEditingProfile && editingProfileId) {
        // Update existing profile
        console.log('Updating profile:', editingProfileId);
        response = await fetch(`/api/profiles/${editingProfileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileRequest)
        });
      } else {
        // Create new profile
        console.log('Creating new profile');
        response = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileRequest)
        });
      }

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('API error response:', error);
        throw new Error(error.detail || 'Failed to save profile');
      }

      const savedProfile = await response.json();
      console.log('Saved profile response:', savedProfile);
      
      // Show success message
      document.getElementById('step2').classList.add('hidden');
      document.getElementById('successMessage').classList.remove('hidden');
      
      // Store profile for export
      window.currentProfile = savedProfile;
      
      await loadExistingProfiles();

      // Reset button
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;

    } catch (error) {
      console.error('Error saving profile:', error);
      showValidationError(`Failed to save profile: ${error.message}`);
      
      // Reset button
      const saveBtn = document.getElementById('saveProfileBtn');
      saveBtn.textContent = 'Save Profile';
      saveBtn.disabled = false;
    }
  }


  function resetWizard() {
    resetProfileForm();
    goToStep(1);
  }
}

async function loadExistingProfiles() {
  try {
    const response = await fetch('/api/profiles');
    if (!response.ok) {
      throw new Error('Failed to load profiles');
    }
    
    const profiles = await response.json();
    const container = document.getElementById('profilesList');
    
    if (profiles.length === 0) {
      container.innerHTML = `
        <div class="text-gray-400 text-sm text-center py-8">
          No profiles yet. Create your first profile!
        </div>
      `;
      return;
    }

    container.innerHTML = profiles.map(profile => `
      <div class="p-3 bg-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-medium text-white text-sm">${profile.name}</h4>
          <div class="flex gap-1">
            <button class="text-gray-400 hover:text-white" onclick="editProfile('${profile.id}')" title="Edit">
              <i data-lucide="edit-2" class="w-3 h-3"></i>
            </button>
            <button class="text-gray-400 hover:text-red-400" onclick="deleteProfile('${profile.id}')" title="Delete">
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        </div>
        <div class="text-xs text-gray-400 mb-2">
          ${profile.subject_area} • ${profile.grade_level}
        </div>
        <div class="text-xs text-gray-500">
          ${profile.question_types.length} question types
        </div>
      </div>
    `).join('');
    
    lucide.createIcons();
  } catch (error) {
    console.error('Error loading profiles:', error);
    const container = document.getElementById('profilesList');
    container.innerHTML = `
      <div class="text-red-400 text-sm text-center py-8">
        Failed to load profiles. Please refresh the page.
      </div>
    `;
  }

  // Load all question types from backend on page load
  loadQuestionTypes();
  
  lucide.createIcons();

  // Function to load all question types from backend
  async function loadQuestionTypes() {
    try {
      const response = await fetch('/api/question-types');
      if (response.ok) {
        const data = await response.json();
        // Merge custom types with preset types for display
        if (data.types) {
          const customTypes = Object.entries(data.types)
            .filter(([id, type]) => type.is_custom)
            .map(([id, type]) => ({
              id: id,
              name: type.name,
              description: type.description,
              icon: type.icon || 'help-circle',
              isCustom: true
            }));
          
          // Add custom types to the global presetQuestionTypes for selection
          presetQuestionTypes.push(...customTypes);
          
          // Refresh the preset types display to include custom types
          updatePresetTypesDisplay();
        }
      }
    } catch (error) {
      console.error('Error loading question types:', error);
    }
  }

  // Function to update the preset types display
  function updatePresetTypesDisplay() {
    const presetContainer = document.getElementById('presetTypes');
    presetContainer.innerHTML = presetQuestionTypes.map(type => `
      <label class="flex items-start gap-3 p-3 border border-gray-600 rounded-lg hover:border-blue-500 cursor-pointer transition-colors preset-type" data-type-id="${type.id}">
        <input type="checkbox" class="mt-1 text-blue-500" data-type="${type.id}">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <i data-lucide="${type.icon}" class="w-4 h-4 text-blue-400"></i>
            <span class="font-medium text-white">${type.name}</span>
            ${type.isCustom ? '<span class="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">Custom</span>' : ''}
            <button class="question-type-info text-gray-400 hover:text-white ml-auto" data-type="${type.id}" title="Show details">
              <i data-lucide="help-circle" class="w-3 h-3"></i>
            </button>
          </div>
          <p class="text-sm text-gray-400">${type.description}</p>
        </div>
      </label>
    `).join('');
    
    // Re-attach event listeners for new elements
    attachPresetTypeListeners();
    lucide.createIcons();
  }

}

function formatSubjectGrade(subject, grade) {
  const subjectMap = {
    'mathematics': 'Math',
    'science': 'Science', 
    'biology': 'Biology',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
    'english': 'English',
    'computer_science': 'Computer Science'
  };
  
  const gradeMap = {
    'elementary': 'K-5',
    'middle_school': '6-8', 
    'high_school': '9-12',
    'college': 'College'
  };
  
  return `${subjectMap[subject] || subject} • ${gradeMap[grade] || grade}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Global profile management functions
window.useProfile = function(profileId) {
  // TODO: Integrate with Grading Hub
  alert('Profile integration with Grading Hub coming soon!');
};

window.cloneProfile = function(profileId) {
  const profiles = JSON.parse(localStorage.getItem('gradingProfiles') || '[]');
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) return;
  
  loadProfileForEditing(profile, true);
};

window.editProfile = function(profileId) {
  const profiles = JSON.parse(localStorage.getItem('gradingProfiles') || '[]');
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) return;
  
  loadProfileForEditing(profile, false);
};

function loadProfileForEditing(profile, isClone) {
  // Set editing state
  isEditingProfile = !isClone;
  editingProfileId = isClone ? null : profile.id;
  
  // Load profile data into form
  document.getElementById('profileName').value = isClone ? `${profile.name} (Copy)` : profile.name;
  document.getElementById('subjectArea').value = profile.subject_area;
  document.getElementById('gradeLevel').value = profile.grade_level;
  document.getElementById('schoolType').value = profile.school_type || 'public';
  document.getElementById('generalInstructions').value = profile.general_instructions || '';
  
  // Load question types
  selectedTypes.clear();
  profile.question_types.forEach(type => {
    selectedTypes.set(type.id, type);
  });
  
  // Update UI elements
  document.getElementById('creatorTitle').textContent = isClone ? `Clone: ${profile.name}` : `Edit: ${profile.name}`;
  updateSelectedTypesDisplay();
  updateSmartSuggestions();
  goToStep(1);
  
  // Update checkboxes to match selected types
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = selectedTypes.has(cb.dataset.type);
  });
}

window.deleteProfile = async function(profileId) {
  if (confirm('Are you sure you want to delete this profile?')) {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete profile');
      }
      
      await loadExistingProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert(`Failed to delete profile: ${error.message}`);
    }
  }
};