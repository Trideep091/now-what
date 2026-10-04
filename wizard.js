/**
 * NOWWHAT? — Multi-Step Wizard & Natural Input Logic
 */

const Wizard = {
  currentStep: 1,
  totalSteps: 9,
  activeMode: 'wizard', // 'wizard' | 'natural'
  loadingInterval: null,

  formData: {
    timeAvailable: '2 hours',
    customTime: '',
    people: 'Just me',
    location: 'Hostel',
    customLocation: '',
    mood: 'Bored',
    energy: 'Medium',
    budget: '₹100–₹300',
    interests: ['Relax', 'Watch'],
    customInterest: '',
    exclusions: ['No studying'],
    customExclusion: '',
    customNote: ''
  },

  loadingMessages: [
    "Checking your available time...",
    "Matching your mood...",
    "Considering your budget...",
    "Filtering your strict exclusions...",
    "Finding the right vibe...",
    "Sequencing optimal activity durations...",
    "Building your personalized plan..."
  ],

  init() {
    this.setupStepNavigation();
    this.setupOptionSelectors();
    this.setupInterestsSelectors();
    this.setupExclusionChips();
    this.setupModeToggle();
    this.setupNaturalChat();
    this.updateStepUI();
  },

  setupModeToggle() {
    const wizardModeBtn = document.getElementById('mode-btn-wizard');
    const naturalModeBtn = document.getElementById('mode-btn-natural');
    const wizardCard = document.getElementById('wizard-step-card');
    const naturalCard = document.getElementById('natural-input-card');

    if (wizardModeBtn && naturalModeBtn && wizardCard && naturalCard) {
      wizardModeBtn.addEventListener('click', () => {
        this.activeMode = 'wizard';
        wizardModeBtn.classList.add('active');
        naturalModeBtn.classList.remove('active');
        wizardCard.style.display = 'block';
        naturalCard.style.display = 'none';
      });

      naturalModeBtn.addEventListener('click', () => {
        this.activeMode = 'natural';
        naturalModeBtn.classList.add('active');
        wizardModeBtn.classList.remove('active');
        wizardCard.style.display = 'none';
        naturalCard.style.display = 'block';
      });
    }
  },

  setupStepNavigation() {
    const nextBtn = document.getElementById('wizard-next-btn');
    const backBtn = document.getElementById('wizard-back-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.updateStepUI();
        } else {
          this.submitWizardPlan();
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.updateStepUI();
        }
      });
    }
  },

  setupOptionSelectors() {
    // Standard single-select options (Time, People, Location, Mood, Energy, Budget)
    document.querySelectorAll('.option-select-btn[data-param]').forEach(btn => {
      btn.addEventListener('click', () => {
        const param = btn.dataset.param;
        const val = btn.dataset.value;

        // Deselect siblings in the same grid
        const parentGrid = btn.closest('.step-options-grid');
        if (parentGrid) {
          parentGrid.querySelectorAll('.option-select-btn').forEach(b => b.classList.remove('selected'));
        }
        btn.classList.add('selected');

        this.formData[param] = val;

        // Auto-advance for single-choice steps (smooth UX)
        if (['timeAvailable', 'people', 'location', 'mood', 'energy', 'budget'].includes(param) && this.currentStep < 7) {
          setTimeout(() => {
            if (this.currentStep < this.totalSteps) {
              this.currentStep++;
              this.updateStepUI();
            }
          }, 240);
        }
      });
    });

    // Custom time input listener
    const customTimeInput = document.getElementById('custom-time-input');
    if (customTimeInput) {
      customTimeInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          this.formData.timeAvailable = val;
          // Uncheck preset buttons
          document.querySelectorAll('[data-param="timeAvailable"]').forEach(b => b.classList.remove('selected'));
        }
      });
    }

    // Custom location input listener
    const customLocationInput = document.getElementById('custom-location-input');
    if (customLocationInput) {
      customLocationInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          this.formData.location = val;
          document.querySelectorAll('[data-param="location"]').forEach(b => b.classList.remove('selected'));
        }
      });
    }
  },

  setupInterestsSelectors() {
    // Multi-select for interests
    document.querySelectorAll('.interest-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const interest = btn.dataset.value;
        const isSelected = btn.classList.toggle('selected');

        if (isSelected) {
          if (!this.formData.interests.includes(interest)) {
            this.formData.interests.push(interest);
          }
        } else {
          this.formData.interests = this.formData.interests.filter(i => i !== interest);
        }
      });
    });

    const customInterestInput = document.getElementById('custom-interest-input');
    if (customInterestInput) {
      customInterestInput.addEventListener('input', (e) => {
        this.formData.customInterest = e.target.value.trim();
      });
    }
  },

  setupExclusionChips() {
    document.querySelectorAll('.exclusion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const ex = chip.dataset.value;
        const isSelected = chip.classList.toggle('selected');

        if (isSelected) {
          if (!this.formData.exclusions.includes(ex)) {
            this.formData.exclusions.push(ex);
          }
        } else {
          this.formData.exclusions = this.formData.exclusions.filter(item => item !== ex);
        }
      });
    });

    const customExclusionInput = document.getElementById('custom-exclusion-input');
    if (customExclusionInput) {
      customExclusionInput.addEventListener('input', (e) => {
        this.formData.customExclusion = e.target.value.trim();
      });
    }
  },

  setupNaturalChat() {
    const naturalBtn = document.getElementById('natural-submit-btn');
    const naturalTextarea = document.getElementById('natural-prompt-input');

    if (naturalBtn && naturalTextarea) {
      naturalBtn.addEventListener('click', () => {
        const text = naturalTextarea.value.trim();
        if (!text) {
          App.showToast('Please type your free time situation first!', 'info');
          return;
        }
        this.submitNaturalPrompt(text);
      });
    }

    // Quick chip buttons in natural input card
    document.querySelectorAll('.natural-sample-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (naturalTextarea) {
          naturalTextarea.value = chip.dataset.prompt;
          naturalTextarea.focus();
        }
      });
    });
  },

  updateStepUI() {
    // Hide all step sections
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepElem = document.getElementById(`step-content-${i}`);
      if (stepElem) stepElem.style.display = i === this.currentStep ? 'block' : 'none';
    }

    // Update progress bar
    const progressFill = document.getElementById('wizard-progress-fill');
    if (progressFill) {
      const percent = ((this.currentStep) / this.totalSteps) * 100;
      progressFill.style.width = `${percent}%`;
    }

    // Update step counter text
    const stepBadge = document.getElementById('wizard-step-counter');
    if (stepBadge) {
      stepBadge.textContent = `STEP ${this.currentStep} OF ${this.totalSteps}`;
    }

    // Update buttons
    const backBtn = document.getElementById('wizard-back-btn');
    const nextBtn = document.getElementById('wizard-next-btn');

    if (backBtn) {
      backBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (this.currentStep === this.totalSteps) {
        nextBtn.innerHTML = `Generate My Plan →`;
        nextBtn.className = 'btn btn-primary';
      } else {
        nextBtn.innerHTML = `Next →`;
        nextBtn.className = 'btn btn-secondary';
      }
    }
  },

  showLoadingScreen() {
    const overlay = document.getElementById('ai-loading-overlay');
    const msgEl = document.getElementById('ai-loading-msg');
    if (!overlay || !msgEl) return;

    overlay.classList.add('active');
    let msgIdx = 0;
    msgEl.textContent = this.loadingMessages[0];

    clearInterval(this.loadingInterval);
    this.loadingInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % this.loadingMessages.length;
      msgEl.style.opacity = '0';
      setTimeout(() => {
        msgEl.textContent = this.loadingMessages[msgIdx];
        msgEl.style.opacity = '1';
      }, 200);
    }, 1400);
  },

  hideLoadingScreen() {
    const overlay = document.getElementById('ai-loading-overlay');
    if (overlay) overlay.classList.remove('active');
    clearInterval(this.loadingInterval);
  },

  async submitWizardPlan() {
    // Read final conversational note
    const finalNote = document.getElementById('wizard-final-note');
    if (finalNote) {
      this.formData.customNote = finalNote.value.trim();
    }

    // Combine interests
    const finalInterests = [...this.formData.interests];
    if (this.formData.customInterest) {
      finalInterests.push(this.formData.customInterest);
    }

    // Combine exclusions
    const finalExclusions = [...this.formData.exclusions];
    if (this.formData.customExclusion) {
      finalExclusions.push(this.formData.customExclusion);
    }

    const payload = {
      timeAvailable: this.formData.timeAvailable,
      people: this.formData.people,
      location: this.formData.location,
      mood: this.formData.mood,
      energy: this.formData.energy,
      budget: this.formData.budget,
      interests: finalInterests,
      exclusions: finalExclusions.join(', '),
      customNote: this.formData.customNote,
      startTime: Timeline.getCurrentFormattedTime()
    };

    this.showLoadingScreen();

    let plan = null;

    try {
      const res = await fetch((window.API_BASE || '') + '/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data && data.success && data.plan) {
        plan = data.plan;
      }
    } catch (err) {
      console.warn('[NowWhat?] Backend server offline or unavailable. Running Open-Source Edge Engine locally in browser:', err.message);
    }

    // Client-side fallback if server is off or on GitHub Pages
    if (!plan && window.ClientEngine) {
      plan = window.ClientEngine.generatePlan(payload);
    }

    if (plan) {
      App.currentPlan = plan;
      App.recordHistory(plan);
      Timeline.renderPlan(plan);

      setTimeout(() => {
        this.hideLoadingScreen();
        App.navigate('results');
      }, 700);
    } else {
      this.hideLoadingScreen();
      App.showToast('Could not generate plan. Please try again.', 'info');
    }
  },

  async submitNaturalPrompt(promptText) {
    this.showLoadingScreen();

    let plan = null;

    try {
      const res = await fetch((window.API_BASE || '') + '/api/chat-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          extraContext: {
            startTime: Timeline.getCurrentFormattedTime()
          }
        })
      });

      const data = await res.json();
      if (data && data.success && data.plan) {
        plan = data.plan;
      }
    } catch (err) {
      console.warn('[NowWhat?] Backend server offline or on GitHub Pages. Parsing locally in browser:', err.message);
    }

    // Client-side fallback if server is off or on GitHub Pages
    if (!plan && window.ClientEngine) {
      const parsed = window.ClientEngine.parseNaturalPrompt(promptText);
      plan = window.ClientEngine.generatePlan({
        ...parsed,
        startTime: Timeline.getCurrentFormattedTime()
      });
    }

    if (plan) {
      App.currentPlan = plan;
      App.recordHistory(plan);
      Timeline.renderPlan(plan);

      setTimeout(() => {
        this.hideLoadingScreen();
        App.navigate('results');
      }, 700);
    } else {
      this.hideLoadingScreen();
      App.showToast('Could not generate plan. Please try again.', 'info');
    }
  },

  // Preset quick wizard launch from home or boredom meter
  presetAndLaunch(preset) {
    if (preset.timeAvailable) this.formData.timeAvailable = preset.timeAvailable;
    if (preset.mood) this.formData.mood = preset.mood;
    if (preset.energy) this.formData.energy = preset.energy;
    if (preset.location) this.formData.location = preset.location;
    if (preset.budget) this.formData.budget = preset.budget;
    if (preset.interests) this.formData.interests = preset.interests;

    App.navigate('find');
    this.currentStep = 1;
    this.updateStepUI();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Wizard.init();
});
