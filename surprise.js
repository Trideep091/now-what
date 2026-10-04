/**
 * NOWWHAT? — Surprise Me Mode Logic
 */

const Surprise = {
  selectedTime: '2 hours',
  selectedVibe: 'Curious',
  selectedBoredom: 'Very bored',

  init() {
    this.setupSurpriseOptions();
    this.setupSurpriseSubmit();
  },

  setupSurpriseOptions() {
    // Time chips
    document.querySelectorAll('.surprise-time-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.surprise-time-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedTime = btn.dataset.time;
      });
    });

    // Vibe chips
    document.querySelectorAll('.surprise-vibe-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.surprise-vibe-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedVibe = btn.dataset.vibe;
      });
    });
  },

  setupSurpriseSubmit() {
    const triggerBtn = document.getElementById('surprise-generate-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        this.generateSurprise();
      });
    }
  },

  async generateSurprise() {
    Wizard.showLoadingScreen();

    let plan = null;
    const surprisePayload = {
      timeAvailable: this.selectedTime,
      vibe: this.selectedVibe,
      boredomLevel: this.selectedBoredom,
      startTime: Timeline.getCurrentFormattedTime()
    };

    try {
      const res = await fetch((window.API_BASE || '') + '/api/surprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surprisePayload)
      });

      const data = await res.json();
      if (data && data.success && data.plan) {
        plan = data.plan;
      }
    } catch (err) {
      console.warn('[NowWhat?] Backend offline or on GitHub Pages. Generating surprise locally in browser:', err.message);
    }

    if (!plan && window.ClientEngine) {
      plan = window.ClientEngine.generateSurprisePlan(surprisePayload);
    }

    if (plan) {
      App.currentPlan = plan;
      App.recordHistory(plan);
      Timeline.renderPlan(plan);

      setTimeout(() => {
        Wizard.hideLoadingScreen();
        App.navigate('results');
        App.showToast('🎲 Surprise itinerary created!', 'love');
      }, 700);
    } else {
      Wizard.hideLoadingScreen();
      App.showToast('Could not generate surprise plan.', 'info');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Surprise.init();
});
