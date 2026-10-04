/**
 * NOWWHAT? — Open-Source AI Architecture Showcase & Model Switcher
 */

const OpenAIShowcase = {
  init() {
    this.setupHeroQuickInput();
    this.setupModelSwitcher();
  },

  setupHeroQuickInput() {
    const heroBtn = document.getElementById('hero-quick-submit');
    const heroInput = document.getElementById('hero-quick-input');

    if (heroBtn && heroInput) {
      heroBtn.addEventListener('click', () => {
        const text = heroInput.value.trim();
        if (!text) {
          App.showToast('Tell us what you have or how you feel!', 'info');
          heroInput.focus();
          return;
        }
        Wizard.submitNaturalPrompt(text);
      });

      heroInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          heroBtn.click();
        }
      });
    }

    // Hero quick chip examples
    document.querySelectorAll('.hero-sample-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (heroInput) {
          heroInput.value = chip.dataset.prompt;
          heroInput.focus();
        }
      });
    });
  },

  setupModelSwitcher() {
    const modelSelect = document.getElementById('engine-select-dropdown');
    if (modelSelect) {
      modelSelect.addEventListener('change', async (e) => {
        const newProvider = e.target.value;
        try {
          const res = await fetch((window.API_BASE || '') + '/api/models/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: newProvider })
          });

          const data = await res.json();
          if (data.success) {
            App.showToast(`Switched engine to ${newProvider}`, 'success');
            App.fetchModelInfo();
            this.updateEngineBadge(newProvider);
          }
        } catch (err) {
          App.showToast('Could not switch model.', 'info');
        }
      });
    }
  },

  updateEngineBadge(provider) {
    const badge = document.getElementById('arch-active-model-name');
    if (badge) {
      const names = {
        'local': 'NowWhat? Edge Reasoning Engine (100% Offline)',
        'groq': 'Meta Llama 3.3 70B (Open-Weight via Groq)',
        'ollama': 'Self-Hosted Ollama (Local Sovereign GPU)',
        'huggingface': 'Mistral 7B Instruct (Hugging Face)'
      };
      badge.textContent = names[provider] || provider;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  OpenAIShowcase.init();
});
