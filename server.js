/**
 * NOWWHAT? — Server & REST API
 * Located directly in root directory.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve all static files directly from this folder
app.use(express.static(__dirname));

// In-memory feedback storage
const feedbackLogs = [];

// ============================================================================
// API ROUTES
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NOWWHAT? Open AI Engine'
  });
});

app.get('/api/models', (req, res) => {
  const info = aiService.getProviderInfo();
  res.json({
    success: true,
    ...info,
    philosophy: {
      title: "Why Open-Source AI Powers NowWhat?",
      principles: [
        {
          title: "Total User Privacy",
          desc: "Your mood, free-time schedule, financial budget, and personal location are sensitive. Open-source models can run completely on your own machine without sending personal life data to big-tech surveillance systems."
        },
        {
          title: "Offline & Sovereign Capability",
          desc: "Whether you are on a train without WiFi or in a remote mountain hostel, NowWhat? continues generating itineraries without depending on cloud servers."
        },
        {
          title: "Inspectability & Zero Dark Patterns",
          desc: "Unlike corporate search algorithms that subtly route your free time to sponsor ads and commercial purchases, open weights can be audited, modified, and trusted."
        },
        {
          title: "Model Swapping & Fine-Tuning",
          desc: "Easily switch from lightweight 8B models on a laptop to 70B reasoning engines or specialized cultural fine-tunes without vendor lock-in."
        }
      ]
    }
  });
});

app.post('/api/models/switch', (req, res) => {
  const { provider, options } = req.body;
  if (!['local', 'groq', 'ollama'].includes(provider)) {
    return res.status(400).json({ success: false, error: 'Invalid provider' });
  }

  aiService.setProvider(provider, options || {});
  res.json({
    success: true,
    message: `Switched AI provider to ${provider}`,
    providerInfo: aiService.getProviderInfo()
  });
});

app.post('/api/plan', async (req, res) => {
  try {
    const params = req.body;
    if (!params) return res.status(400).json({ success: false, error: 'Missing params' });

    const plan = await aiService.generatePlan(params);
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error in /api/plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat-plan', async (req, res) => {
  try {
    const { prompt, extraContext } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const result = await aiService.generatePlanFromNaturalText(prompt, extraContext || {});
    res.json({
      success: true,
      extractedSituation: result.extractedSituation,
      plan: result.plan
    });
  } catch (error) {
    console.error('Error in /api/chat-plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/surprise', async (req, res) => {
  try {
    const plan = await aiService.generateSurprisePlan(req.body || {});
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error in /api/surprise:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/feedback', (req, res) => {
  const { planId, rating } = req.body;
  feedbackLogs.push({ planId, rating, timestamp: new Date().toISOString() });
  res.json({ success: true, message: 'Feedback recorded!' });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚡ NOWWHAT? Server running at http://localhost:${PORT}`);
  console.log(`🧠 AI Engine: ${process.env.AI_PROVIDER || 'local'}`);
  console.log(`📁 Flat directory mode: all files in root`);
  console.log(`===============================================`);
});
