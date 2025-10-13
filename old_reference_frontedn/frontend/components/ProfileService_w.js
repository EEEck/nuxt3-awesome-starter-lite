/**
 * Profile Service - Modernized with EventBus and DataStore
 * Handles profile selection and management using SOTA patterns
 * Migrated from direct DOM manipulation to EventBus communication
 */

import { eventBus } from '/utils/EventBus.js';
import { gradingDataStore } from '/components/DataStore.js';
import { GradingEventManagement } from '/components/EventManagement.js';

export default class ProfileService {
  constructor() {
    this.dataStore = gradingDataStore;
    this.eventManagement = new GradingEventManagement();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Profile management events
    eventBus.on('profile:load-all', this.loadProfiles.bind(this));
    eventBus.on('profile:select', this.handleProfileSelection.bind(this));
    eventBus.on('profile:create-new', this.navigateToProfileCreation.bind(this));
    
    // UI update events
    eventBus.on('profile:update-dropdown', this.updateProfileDropdown.bind(this));
    eventBus.on('profile:show-info', this.showProfileInfo.bind(this));
  }

  async setupProfileSelection() {
    // Setup event listeners for DOM elements
    const profileSelect = document.getElementById('profileSelect');
    const createProfileBtn = document.getElementById('createProfileBtn');
    
    console.log('ProfileService setup - profileSelect exists:', !!profileSelect);
    console.log('ProfileService setup - createProfileBtn exists:', !!createProfileBtn);
    
    if (!profileSelect) {
      console.error('Profile select element not found during setup!');
      eventBus.emit('profile:error', { 
        message: 'Profile select element not found in DOM' 
      });
      return;
    }
    
    if (!createProfileBtn) {
      console.error('Create profile button not found during setup!');
    }
    
    // Use EventBus instead of direct event listeners
    profileSelect.addEventListener('change', (e) => {
      eventBus.emit('profile:select', { profileId: e.target.value });
    });
    
    if (createProfileBtn) {
      createProfileBtn.addEventListener('click', () => {
        eventBus.emit('profile:create-new');
      });
    }
    
    // Load profiles on initialization
    console.log('Setting up grading hub - about to load profiles...');
    eventBus.emit('profile:load-all');
    console.log('Grading hub setup complete');
  }

  async loadProfiles() {
    try {
      console.log('📡 MODERNIZED ProfileService: Loading profiles via EventBus pattern...');
      const response = await fetch('/api/profiles');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile API error:', response.status, errorText);
        throw new Error(`Failed to load profiles: ${response.status} ${errorText}`);
      }
      
      const profiles = await response.json();
      console.log('Loaded profiles:', profiles);
      
      // Store in DataStore
      this.dataStore.setAvailableProfiles(profiles);
      console.log('📊 MODERNIZED ProfileService: Stored', profiles.length, 'profiles in DataStore');
      
      // Update UI via EventBus
      eventBus.emit('profile:loaded', { profiles });
      eventBus.emit('profile:update-dropdown', { profiles });
      console.log('📡 MODERNIZED ProfileService: Emitted EventBus events for UI updates');
      
    } catch (error) {
      console.error('Error loading profiles:', error);
      eventBus.emit('profile:error', { 
        message: 'Failed to load profiles. Please refresh or create profiles in AI Assistant.',
        error: error.message 
      });
    }
  }

  updateProfileDropdown(data) {
    const profiles = data.profiles;
    const select = document.getElementById('profileSelect');
    
    if (!select) {
      console.error('Profile select element not found during updateProfileDropdown!');
      console.log('Available elements with id:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
      return;
    }
    
    console.log('Found profile select element, updating with profiles...');
    
    // Clear existing options except the default
    select.innerHTML = '<option value="">No profile selected - use default grading</option>';
    
    // Add profile options
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = `${profile.name} (${profile.subject_area} • ${profile.grade_level})`;
        select.appendChild(option);
      });
      console.log(`Added ${profiles.length} profiles to dropdown`);
    } else {
      console.log('No profiles found');
      // Add helpful message for empty state
      const helpOption = document.createElement('option');
      helpOption.value = '';
      helpOption.textContent = '→ Create profiles in AI Assistant page first';
      helpOption.disabled = true;
      select.appendChild(helpOption);
    }
  }

  async handleProfileSelection(data) {
    const profileId = data.profileId;
    const infoSection = document.getElementById('selectedProfileInfo');
    
    if (!profileId) {
      this.dataStore.setSelectedProfile(null);
      if (infoSection) {
        infoSection.classList.add('hidden');
      }
      return;
    }
    
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      if (!response.ok) {
        throw new Error('Failed to load profile details');
      }
      
      const profile = await response.json();
      
      // Store in DataStore instead of global variables
      this.dataStore.setSelectedProfile(profile);
      console.log('📊 MODERNIZED ProfileService: Profile', profile.name, 'stored in DataStore');
      
      // Update UI via EventBus
      eventBus.emit('profile:selected', { profile });
      eventBus.emit('profile:show-info', { profile });
      console.log('📡 MODERNIZED ProfileService: Emitted profile selection EventBus events');
      
      // Trigger question type analysis if rubric exists
      const currentRubric = this.dataStore.getCurrentRubric();
      if (profile && currentRubric) {
        setTimeout(() => {
          eventBus.emit('question-type:analyze');
        }, 100);
      }
      
    } catch (error) {
      console.error('Error loading profile details:', error);
      this.dataStore.setSelectedProfile(null);
      
      eventBus.emit('profile:error', { 
        message: 'Failed to load profile details',
        error: error.message 
      });
      
      if (infoSection) {
        infoSection.classList.add('hidden');
      }
    }
  }

  showProfileInfo(data) {
    const profile = data.profile;
    const infoSection = document.getElementById('selectedProfileInfo');
    
    if (!infoSection) {
      console.error('Profile info section not found');
      return;
    }
    
    // Update the info section using modern DOM manipulation
    const nameEl = document.getElementById('profileInfoName');
    const detailsEl = document.getElementById('profileInfoDetails');
    const instructionsEl = document.getElementById('profileInfoInstructions');
    const typesEl = document.getElementById('profileInfoTypes');
    
    if (nameEl) nameEl.textContent = profile.name;
    if (detailsEl) {
      detailsEl.textContent = `${profile.subject_area} • ${profile.grade_level}${profile.school_type ? ' • ' + profile.school_type : ''}`;
    }
    if (instructionsEl) {
      instructionsEl.textContent = profile.general_instructions || 'No specific instructions';
    }
    if (typesEl) {
      typesEl.textContent = `${profile.question_types.length} types configured`;
    }
    
    infoSection.classList.remove('hidden');
  }

  navigateToProfileCreation() {
    console.log('Create Profile button clicked - navigating to AI Assistant');
    
    // Use the main navigation system
    if (window.loadPage) {
      window.loadPage('ai-assistant');
    } else {
      // Fallback to direct navigation
      window.location.hash = '#ai-assistant';
      
      // Import and render AI Assistant page directly
      import('../ai-assistant.js').then(module => {
        module.renderAIAssistant(document.getElementById('content'));
      });
    }
  }

  // Backward compatibility methods
  getSelectedProfile() {
    return this.dataStore.getSelectedProfile();
  }

  hasSelectedProfile() {
    return this.dataStore.hasSelectedProfile();
  }

  getAvailableProfiles() {
    return this.dataStore.getAvailableProfiles();
  }
}