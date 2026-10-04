/**
 * NOWWHAT? — Core Application Shell & State Management
 */

window.API_BASE = (window.location.protocol === 'file:' || !window.location.port)
  ? 'http://localhost:3000'
  : '';

const App = {
  currentView: 'home',
  currentPlan: null,
  activeModelInfo: null,

  // Local storage state
  state: {
    savedPlans: [],
    savedActivities: [],
    planHistory: []
  },

  init() {
    this.loadPersistedState();
    this.setupRouting();
    this.setupNavigation();
    this.setupMobileMenu();
    this.fetchModelInfo();
    this.updateNavBadges();
  },

  loadPersistedState() {
    try {
      this.state.savedPlans = JSON.parse(localStorage.getItem('nw_saved_plans')) || [];
      this.state.savedActivities = JSON.parse(localStorage.getItem('nw_saved_activities')) || [];
      this.state.planHistory = JSON.parse(localStorage.getItem('nw_plan_history')) || [];
    } catch (e) {
      console.warn('Failed to parse localStorage:', e);
    }
  },

  saveState(key) {
    try {
      if (key === 'savedPlans') localStorage.setItem('nw_saved_plans', JSON.stringify(this.state.savedPlans));
      if (key === 'savedActivities') localStorage.setItem('nw_saved_activities', JSON.stringify(this.state.savedActivities));
      if (key === 'planHistory') localStorage.setItem('nw_plan_history', JSON.stringify(this.state.planHistory));
      this.updateNavBadges();
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  updateNavBadges() {
    const savedCount = this.state.savedPlans.length + this.state.savedActivities.length;
    const badgeEl = document.getElementById('nav-saved-badge');
    if (badgeEl) {
      badgeEl.textContent = savedCount;
      badgeEl.style.display = savedCount > 0 ? 'inline-flex' : 'none';
    }

    const historyCount = this.state.planHistory.length;
    const historyBadgeEl = document.getElementById('nav-history-badge');
    if (historyBadgeEl) {
      historyBadgeEl.textContent = historyCount;
      historyBadgeEl.style.display = historyCount > 0 ? 'inline-flex' : 'none';
    }
  },

  setupRouting() {
    // Listen to hash change for SPA navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.navigate(hash, false);
    });

    // Check initial hash
    const initialHash = window.location.hash.replace('#', '') || 'home';
    this.navigate(initialHash, false);
  },

  navigate(viewName, updateHash = true) {
    const validViews = ['home', 'find', 'surprise', 'results', 'saved', 'history', 'about'];
    const target = validViews.includes(viewName) ? viewName : 'home';

    this.currentView = target;
    if (updateHash) {
      window.location.hash = target;
    }

    // Toggle view containers
    document.querySelectorAll('.view-container').forEach(el => {
      el.classList.remove('active-view');
    });

    const activeEl = document.getElementById(`view-${target}`);
    if (activeEl) {
      activeEl.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.target === target);
    });

    // Close mobile drawer if open
    this.closeMobileMenu();

    // Trigger view-specific renderers
    if (target === 'saved') this.renderSavedView();
    if (target === 'history') this.renderHistoryView();
  },

  setupNavigation() {
    document.querySelectorAll('[data-target]').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        const target = elem.dataset.target;
        this.navigate(target);
      });
    });
  },

  setupMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    if (hamburgerBtn && mobileDrawer) {
      hamburgerBtn.addEventListener('click', () => {
        const isOpen = hamburgerBtn.classList.toggle('open');
        mobileDrawer.classList.toggle('open', isOpen);
      });
    }
  },

  closeMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (hamburgerBtn && mobileDrawer) {
      hamburgerBtn.classList.remove('open');
      mobileDrawer.classList.remove('open');
    }
  },

  async fetchModelInfo() {
    try {
      const res = await fetch((window.API_BASE || '') + '/api/models');
      const data = await res.json();
      if (data.success) {
        this.activeModelInfo = data;
        this.updateModelStatusPill(data.activeModel);
      }
    } catch (e) {
      console.warn('Could not fetch model info:', e);
      this.updateModelStatusPill('Open-Source AI (Offline Ready)');
    }
  },

  updateModelStatusPill(modelName) {
    const pill = document.getElementById('nav-model-pill');
    if (pill) {
      const textSpan = pill.querySelector('.model-name-text');
      if (textSpan) textSpan.textContent = modelName.replace('NowWhat? Edge Reasoning Engine (Open-Source Offline)', 'Edge Engine (Offline)');
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'love' ? '❤️' : '✨'}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // Save current full plan
  saveCurrentPlan() {
    if (!this.currentPlan) return;
    const exists = this.state.savedPlans.some(p => p.id === this.currentPlan.id);
    if (!exists) {
      this.state.savedPlans.unshift({
        ...this.currentPlan,
        savedAt: new Date().toISOString()
      });
      this.saveState('savedPlans');
      this.showToast('Plan saved to your library!', 'success');
    } else {
      this.showToast('This plan is already saved.', 'info');
    }
  },

  // Save single activity
  saveActivity(activity) {
    const exists = this.state.savedActivities.some(a => a.id === activity.id || (a.title === activity.title && a.time === activity.time));
    if (!exists) {
      this.state.savedActivities.unshift({
        ...activity,
        savedAt: new Date().toISOString()
      });
      this.saveState('savedActivities');
      this.showToast(`Saved "${activity.title.slice(0, 24)}..."`, 'success');
      return true;
    } else {
      this.state.savedActivities = this.state.savedActivities.filter(a => a.id !== activity.id && a.title !== activity.title);
      this.saveState('savedActivities');
      this.showToast(`Removed from saved activities.`, 'info');
      return false;
    }
  },

  // Push plan to history
  recordHistory(plan) {
    if (!plan) return;
    // Don't add duplicates
    this.state.planHistory = this.state.planHistory.filter(h => h.id !== plan.id);
    this.state.planHistory.unshift(plan);
    // Keep max 20
    if (this.state.planHistory.length > 20) {
      this.state.planHistory = this.state.planHistory.slice(0, 20);
    }
    this.saveState('planHistory');
  },

  // Render Saved View
  renderSavedView() {
    const plansContainer = document.getElementById('saved-plans-list');
    const actsContainer = document.getElementById('saved-activities-list');
    if (!plansContainer || !actsContainer) return;

    // Render Saved Plans
    if (this.state.savedPlans.length === 0) {
      plansContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">📂</div>
          <h3>No saved plans yet</h3>
          <p>Generate a free-time itinerary and click "Save this plan" to keep it handy.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.navigate('find')">Plan Free Time →</button>
        </div>
      `;
    } else {
      plansContainer.innerHTML = `
        <div class="saved-grid">
          ${this.state.savedPlans.map(plan => `
            <div class="saved-plan-card">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                  <span class="meta-pill vibe">${plan.vibeTag || 'Personalized'}</span>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(plan.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <h4 style="font-size:1.15rem; margin-bottom:8px;">${plan.inputs?.timeAvailable || 'Free Time'} Itinerary</h4>
                <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${plan.summary || ''}</p>
                <div style="margin-top:12px; font-size:0.8rem; color:var(--text-muted);">
                  ${plan.activities ? plan.activities.length : 0} activities • ${plan.estimatedCostTotal || 'Free'}
                </div>
              </div>
              <div style="display:flex; gap:10px; justify-content:space-between; align-items:center;">
                <button class="btn btn-secondary" style="padding:8px 16px; font-size:0.85rem;" onclick="App.openSavedPlan('${plan.id}')">View Plan →</button>
                <button class="btn btn-ghost" style="padding:8px 12px; font-size:0.82rem; color:#F43F5E;" onclick="App.deleteSavedPlan('${plan.id}')">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Render Saved Activities
    if (this.state.savedActivities.length === 0) {
      actsContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">⭐</div>
          <h3>No bookmarked activities</h3>
          <p>You can bookmark individual activities from any generated itinerary.</p>
        </div>
      `;
    } else {
      actsContainer.innerHTML = `
        <div class="saved-grid">
          ${this.state.savedActivities.map(act => `
            <div class="activity-card">
              <div class="activity-card-top">
                <div class="activity-time-duration">
                  <span class="duration-pill">${act.duration} min</span>
                  <span class="cost-pill">${act.costFormatted || (act.cost === 0 ? 'Free' : '₹' + act.cost)}</span>
                </div>
                <span class="activity-category-badge cat-${(act.category || 'RELAX').toLowerCase()}">${act.category}</span>
              </div>
              <h4 class="activity-title" style="font-size:1.1rem;">${act.title}</h4>
              <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:12px;">${act.reason || ''}</p>
              ${act.tip ? `<div style="font-size:0.8rem; color:var(--accent-primary); margin-bottom:12px;">💡 ${act.tip}</div>` : ''}
              <div style="display:flex; justify-content:flex-end;">
                <button class="btn btn-ghost" style="font-size:0.8rem; color:#F43F5E;" onclick="App.deleteSavedActivity('${act.id || act.title}')">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  },

  openSavedPlan(planId) {
    const plan = this.state.savedPlans.find(p => p.id === planId);
    if (plan) {
      this.currentPlan = plan;
      Timeline.renderPlan(plan);
      this.navigate('results');
    }
  },

  deleteSavedPlan(planId) {
    this.state.savedPlans = this.state.savedPlans.filter(p => p.id !== planId);
    this.saveState('savedPlans');
    this.renderSavedView();
    this.showToast('Plan removed from saved.', 'info');
  },

  deleteSavedActivity(actId) {
    this.state.savedActivities = this.state.savedActivities.filter(a => a.id !== actId && a.title !== actId);
    this.saveState('savedActivities');
    this.renderSavedView();
    this.showToast('Activity removed.', 'info');
  },

  // Render History View
  renderHistoryView() {
    const historyList = document.getElementById('history-plans-list');
    if (!historyList) return;

    if (this.state.planHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon">⏳</div>
          <h3>No plan history yet</h3>
          <p>Every time you generate an itinerary, it will be automatically recorded here.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="App.navigate('find')">Generate Your First Plan →</button>
        </div>
      `;
      return;
    }

    historyList.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <span style="font-size:0.9rem; color:var(--text-muted);">${this.state.planHistory.length} previous journeys recorded</span>
        <button class="btn btn-ghost" style="font-size:0.85rem; color:#F43F5E;" onclick="App.clearHistory()">Clear History</button>
      </div>
      <div class="saved-grid">
        ${this.state.planHistory.map(plan => `
          <div class="saved-plan-card">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                <span class="meta-pill vibe">${plan.vibeTag || 'Free Time'}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(plan.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <h4 style="font-size:1.15rem; margin-bottom:8px;">${plan.inputs?.timeAvailable || 'Free Time'} • ${plan.inputs?.mood || 'Plan'}</h4>
              <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5;">${plan.summary || ''}</p>
              <div style="margin-top:12px; font-size:0.8rem; color:var(--text-muted);">
                ${plan.activities ? plan.activities.length : 0} activities • ${plan.estimatedCostTotal || 'Free'}
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.75rem; color:var(--accent-primary); font-family:var(--font-mono);">${plan.providerUsed || 'Open AI'}</span>
              <button class="btn btn-secondary" style="padding:8px 16px; font-size:0.85rem;" onclick="App.openHistoryPlan('${plan.id}')">Open Plan →</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  openHistoryPlan(planId) {
    const plan = this.state.planHistory.find(p => p.id === planId);
    if (plan) {
      this.currentPlan = plan;
      Timeline.renderPlan(plan);
      this.navigate('results');
    }
  },

  clearHistory() {
    if (confirm('Clear all plan history?')) {
      this.state.planHistory = [];
      this.saveState('planHistory');
      this.renderHistoryView();
      this.showToast('History cleared.', 'info');
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
