/**
 * NOWWHAT? — Results Page & Interactive Timeline Logic
 */

const Timeline = {
  categoryIcons: {
    WATCH: '🎬',
    MAKE: '🍳',
    MOVE: '🚶',
    LEARN: '🧠',
    PLAY: '🎮',
    CREATE: '🎨',
    CONNECT: '📞',
    EXPLORE: '🗺️',
    RELAX: '☕',
    IMPROVE: '✨'
  },

  getCurrentFormattedTime() {
    const d = new Date();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  },

  renderPlan(plan) {
    if (!plan) return;

    // Set meta tags
    const vibeEl = document.getElementById('results-vibe-tag');
    const timeEl = document.getElementById('results-total-time');
    const costEl = document.getElementById('results-total-cost');
    const modelEl = document.getElementById('results-model-badge');
    const summaryEl = document.getElementById('results-plan-summary');

    if (vibeEl) vibeEl.textContent = plan.vibeTag || 'Personalized Vibe';
    if (timeEl) timeEl.textContent = `${plan.totalDurationMinutes || 120} min total`;
    if (costEl) costEl.textContent = plan.estimatedCostTotal || 'Free';
    if (modelEl) modelEl.textContent = `⚡ ${plan.modelUsed ? plan.modelUsed.split('(')[0].trim() : 'Open AI'}`;
    if (summaryEl) summaryEl.textContent = plan.summary || 'A customized itinerary designed for your free time.';

    // Render Timeline Items
    const timelineContainer = document.getElementById('itinerary-timeline-container');
    if (!timelineContainer) return;

    const activities = plan.activities || [];
    if (activities.length === 0) {
      timelineContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No activities generated.</p>`;
      return;
    }

    timelineContainer.innerHTML = activities.map((act, idx) => {
      const cat = (act.category || 'RELAX').toUpperCase();
      const icon = this.categoryIcons[cat] || '✨';
      const isSaved = App.state.savedActivities.some(a => a.id === act.id || a.title === act.title);

      return `
        <div class="timeline-item" style="animation-delay: ${idx * 0.1}s;">
          <div class="timeline-node">
            <div class="timeline-node-inner"></div>
          </div>
          <div class="activity-card">
            <div class="activity-card-top">
              <div class="activity-time-duration">
                <span class="clock-time-badge">${act.time || '4:00 PM'}</span>
                <span class="duration-pill">${act.duration} min</span>
                <span class="cost-pill">${act.costFormatted || (act.cost === 0 ? 'Free' : '₹' + act.cost)}</span>
              </div>
              <span class="activity-category-badge cat-${cat.toLowerCase()}">${icon} ${cat}</span>
            </div>

            <h3 class="activity-title">${act.title}</h3>

            <div class="ai-reason-box">
              <div class="ai-reason-label">Why the AI selected this</div>
              ${act.reason || 'Tailored to your current mood, energy, and free-time budget.'}
            </div>

            ${act.tip ? `
              <div class="activity-tip-box">
                <span class="activity-tip-icon">💡</span>
                <span>${act.tip}</span>
              </div>
            ` : ''}

            ${act.media ? `
              <div class="media-rec-card">
                <div class="media-rec-info">
                  <span class="media-rec-title">🎬 ${act.media.title} (${act.media.year || ''})</span>
                  <span class="media-rec-meta">${act.media.type || 'Movie'} • ${act.media.runtime || ''} ${act.media.genre ? '• ' + act.media.genre : ''}</span>
                </div>
                <span class="media-platform-badge">${act.media.platform || 'Streaming'}</span>
              </div>
            ` : ''}

            <div class="activity-actions-bar">
              <button class="save-act-btn ${isSaved ? 'saved' : ''}" onclick="Timeline.toggleBookmarkActivity(${idx})">
                <span>${isSaved ? '★ Bookmarked' : '☆ Save Activity'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Reset feedback buttons
    document.querySelectorAll('.feedback-btn').forEach(btn => btn.classList.remove('selected'));
    const feedbackFeedbackMsg = document.getElementById('feedback-thank-you');
    if (feedbackFeedbackMsg) feedbackFeedbackMsg.style.display = 'none';
  },

  toggleBookmarkActivity(index) {
    if (!App.currentPlan || !App.currentPlan.activities[index]) return;
    const activity = App.currentPlan.activities[index];
    const isNowSaved = App.saveActivity(activity);
    
    // Re-render button state
    const btn = document.querySelectorAll('.save-act-btn')[index];
    if (btn) {
      btn.classList.toggle('saved', isNowSaved);
      btn.innerHTML = `<span>${isNowSaved ? '★ Bookmarked' : '☆ Save Activity'}</span>`;
    }
  },

  async regenerateCurrentPlan() {
    if (!App.currentPlan) return;
    const inputs = App.currentPlan.inputs || {};

    Wizard.showLoadingScreen();

    let plan = null;
    const payload = {
      ...inputs,
      startTime: this.getCurrentFormattedTime()
    };

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
      console.warn('[NowWhat?] Backend offline. Regenerating plan locally in browser:', err.message);
    }

    if (!plan && window.ClientEngine) {
      plan = window.ClientEngine.generatePlan(payload);
    }

    if (plan) {
      App.currentPlan = plan;
      App.recordHistory(plan);
      this.renderPlan(plan);

      setTimeout(() => {
        Wizard.hideLoadingScreen();
        App.showToast('Fresh plan generated!', 'success');
      }, 700);
    } else {
      Wizard.hideLoadingScreen();
      App.showToast('Could not regenerate plan.', 'info');
    }
  },

  copyPlanToClipboard() {
    if (!App.currentPlan) return;
    const p = App.currentPlan;

    let text = `NOWWHAT? FREE-TIME ITINERARY\n`;
    text += `"${p.summary || ''}"\n`;
    text += `Duration: ${p.totalDurationMinutes} mins | Cost: ${p.estimatedCostTotal}\n\n`;

    (p.activities || []).forEach(act => {
      text += `[${act.time}] ${act.title} (${act.duration} min - ${act.costFormatted})\n`;
      text += `   Category: ${act.category}\n`;
      text += `   Reason: ${act.reason}\n`;
      if (act.tip) text += `   Tip: ${act.tip}\n`;
      text += `\n`;
    });

    text += `Generated with NowWhat? — Built with Open-Source AI.`;

    navigator.clipboard.writeText(text).then(() => {
      App.showToast('Itinerary copied to clipboard!', 'success');
    }).catch(() => {
      App.showToast('Could not copy to clipboard.', 'info');
    });
  },

  async sendFeedback(rating) {
    if (!App.currentPlan) return;
    document.querySelectorAll('.feedback-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.rating === rating);
    });

    const feedbackMsg = document.getElementById('feedback-thank-you');
    if (feedbackMsg) feedbackMsg.style.display = 'block';

    try {
      await fetch((window.API_BASE || '') + '/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: App.currentPlan.id,
          rating
        })
      });
      App.showToast('Thanks for your feedback!', rating === 'love' ? 'love' : 'info');
    } catch (e) {
      console.warn('Feedback send failed:', e);
    }
  }
};
