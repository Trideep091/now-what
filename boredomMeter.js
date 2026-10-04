/**
 * NOWWHAT? — Playful Boredom Meter Component
 */

const BoredomMeter = {
  currentLevel: '🥱 Very bored',

  levelData: {
    'mild': {
      label: '😐 Mild',
      hint: "Just need a quick dopamine bump or small distraction before getting back to life.",
      suggestedPreset: { timeAvailable: '30 min', mood: 'Relaxed', energy: 'Low', interests: ['Relax'] }
    },
    'medium': {
      label: '😑 Medium',
      hint: "Staring at the ceiling or endless scrolling through social reels without purpose.",
      suggestedPreset: { timeAvailable: '1 hour', mood: 'Curious', energy: 'Medium', interests: ['Explore', 'Watch'] }
    },
    'very': {
      label: '🥱 Very bored',
      hint: "Bro, hours are slipping away and you have zero clue what to do with yourself.",
      suggestedPreset: { timeAvailable: '2 hours', mood: 'Bored', energy: 'Medium', interests: ['Make', 'Learn', 'Play'] }
    },
    'emergency': {
      label: '🚨 Emergency boredom',
      hint: "Critical existential dread. Needs immediate high-impact intervention or wild adventure!",
      suggestedPreset: { timeAvailable: '3 hours', mood: 'Adventurous', energy: 'High', interests: ['Move', 'Explore', 'Play'] }
    }
  },

  init() {
    this.setupListeners();
  },

  setupListeners() {
    document.querySelectorAll('.boredom-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const levelKey = btn.dataset.level;
        this.selectLevel(levelKey, btn);
      });
    });

    const triggerBtn = document.getElementById('boredom-cure-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        const currentData = this.levelData[this.currentLevelKey || 'very'];
        if (currentData) {
          Wizard.presetAndLaunch(currentData.suggestedPreset);
        }
      });
    }

    // Set initial
    this.currentLevelKey = 'very';
  },

  selectLevel(levelKey, btnElement) {
    this.currentLevelKey = levelKey;
    document.querySelectorAll('.boredom-option-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');

    const data = this.levelData[levelKey];
    const hintEl = document.getElementById('boredom-hint-text');
    if (hintEl && data) {
      hintEl.textContent = data.hint;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  BoredomMeter.init();
});
