# NOWWHAT?

<div align="center">

**"You have free time. We have ideas."**

*An AI-powered personalized free-time planner that turns boredom and open hours into structured, memorable itineraries.*

[![License: ISC](https://img.shields.io/badge/License-ISC-FF7A30.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-10B981.svg)](https://nodejs.org/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Open--Source_Weights-38BDF8.svg)](#open-source-ai-architecture)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Private-A855F7.svg)](#privacy--data-sovereignty)

[Overview](#-overview) • [The Core Equation](#-the-core-equation) • [Key Features](#-key-features) • [Open-Source AI Core](#-open-source-ai-core) • [Quick Start](#-quick-start) • [API Reference](#-api-reference)

---

</div>

## 💡 Overview

We live in the most hyper-stimulated era in human history, yet millions of people stare at their screens every day asking the exact same questions:
- *"What should I do right now?"*
- *"Bro, I'm bored. What can I do for the next 3 hours?"*

The default answer is almost always **the doomscroll trap**—passively consuming TikToks, Instagram Reels, and YouTube shorts until hours vanish, leaving you more exhausted and unfulfilled than before.

### The Real Problem
**Boredom isn't a lack of time. It's a lack of ideas and the cognitive friction of decision paralysis.**

Generic web lists like *"100 things to do when you're bored"* fail because they completely ignore context:
- They don't know you only have **₹150** left in your wallet.
- They don't know you're sitting in a **hostel room** or bedroom with low energy.
- They don't know you strictly **do not want to study** or cook.

**NOWWHAT?** fixes this by taking your real-life constraints and generating a **chronological, time-budgeted, sequential journey** that is immediately actionable.

---

## 📐 The Core Equation

$$\text{TIME} + \text{MOOD} + \text{PEOPLE} + \text{LOCATION} + \text{BUDGET} + \text{ENERGY} + \text{PREFERENCES} \longrightarrow \mathbf{\text{AI}} \longrightarrow \mathbf{\text{YOUR PLAN}}$$

Instead of an overwhelming list of disjointed options, NowWhat? builds a coherent flow that eases you out of inertia:
1. **Low-friction starter:** A warm chai, balcony reset, or quick posture stretch.
2. **Engaging centerpiece:** An exploratory walk, creative playlist curation, or tactical challenge.
3. **Immersive conclusion:** A handpicked feel-good film, documentary, or casual banter session.

---

## ✨ Key Features

### 1. Multi-Step Personalization Wizard (9 Steps)
A guided flow designed with keyboard navigation, progress calculation, and instant visual feedback:
- **Step 1 — Time:** 30 min, 1 hour, 2 hours, 3 hours, 4+ hours, or custom duration.
- **Step 2 — People:** Just me (solo recharge), Partner, Friends, Family, Group.
- **Step 3 — Location:** At home, Hostel, Campus, Outdoors, City, Cafe, Anywhere, or custom input.
- **Step 4 — Mood:** Bored, Relaxed, Energetic, Curious, Creative, Social, Tired, Adventurous.
- **Step 5 — Energy:** Low (unwinding), Medium (light activity), High (kinetic/active).
- **Step 6 — Budget:** ₹0 (Free), Under ₹100, ₹100–₹300, ₹300–₹500, ₹500+.
- **Step 7 — Interests:** Multi-select across 10 activity categories + custom inputs.
- **Step 8 — Exclusions:** Strict filters ("No studying", "No outdoor activities", "No spending money", "No cooking", "No screen time").
- **Step 9 — Final Conversational Context:** Free-text box for natural nuances.

### 2. Conversational Natural Input (Zero-Form Planning)
Don't want to click through 9 steps? Just describe your situation in plain conversational text:
> *"Bro, I'm alone in my hostel, have 4 hours and ₹200. I'm bored but I don't want to study."*

The backend parser semantically extracts duration (4 hours), setting (Hostel), financial cap (₹200), energy level, and exclusions ("No studying"), automatically producing a tailored itinerary in seconds.

### 3. Chronological Itinerary Timeline
Every plan is rendered as a clean chronological timeline:
- **Exact Clock Times:** `4:00 PM` → `4:35 PM` → `5:15 PM` calculated from current local time.
- **Activity Metadata:** Duration pill, budget cost (`₹30`, `Free`), and category pill.
- **"Why the AI selected this":** Contextual explanation connecting the item to your stated mood and constraints.
- **Actionable Tips:** Practical execution advice to minimize friction.
- **Movie & Media Cards:** When recommendations involve films or documentaries, it includes titles, release years, runtime, genre, and streaming/free platforms (e.g., *12th Fail*, *The Secret Life of Walter Mitty*).

### 4. The 10 Activity Dimensions
Activities are balanced across 10 curated categories:
| Category | Focus | Example Activities |
|---|---|---|
| `WATCH` | Cinema & Visuals | Feel-good movies, Oscar animated shorts, video essays |
| `MAKE` | Tactile Craft | Slow-simmered masala chai, elevated hostel Maggi, origami |
| `MOVE` | Physical Reset | 30-min neighborhood photo walks, posture reset stretches |
| `LEARN` | Curiosity | Wikiracing speedruns, NATO phonetic alphabet, design podcasts |
| `PLAY` | Play & Strategy | GeoGuessr world challenges, blitz chess on Lichess, card tricks |
| `CREATE` | Creative Output | 7-song memory playlist curation, 100-word micro-fiction |
| `CONNECT` | Human Connection | "No-reason" old friend calls, hostel corridor chai banter |
| `EXPLORE` | Discovery | Hidden street food kiosks, rooftop golden hour skyline watch |
| `RELAX` | Deep Restoration | 4-7-8 parasympathetic breathing, 20-min coffee naps |
| `IMPROVE`| Digital / Space | Camera roll & screenshots purge, desk minimalism reset |

### 5. Playful Boredom Meter
A fun interactive gauge with 4 distinct triage levels:
- 😐 **Mild:** Quick 30-minute mental resets.
- 😑 **Medium:** 1-hour curiosity rabbit holes.
- 🥱 **Very Bored:** 2-hour multi-activity momentum builders.
- 🚨 **Emergency:** High-impact, adventurous interventions.

### 6. Surprise Me Mode
A minimal 2-question flow for pure spontaneity: choose how much time you have, pick your general vibe (*Cozy & Chill*, *Curious*, *Adventurous*, *Creative Sparks*, or *Wildcard*), and receive an unexpected plan.

### 7. Saved & History Library
- Save complete itineraries or bookmark individual activities.
- Persisted locally via `localStorage`—no login or account creation required.
- Chronological history log to revisit and relaunch previous plans.

### 8. Feedback Loop
After each plan, one-click feedback buttons (❤️ Loved it, 🙂 It was okay, 👎 Not for me) allow users to influence recommendation weights.

---

## 🧠 Open-Source AI Core

Open-source and open-weight models power NowWhat?, ensuring users are never locked into proprietary corporate APIs or ad-driven algorithms.

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Client                      │
│     (HTML5 / Vanilla CSS3 / ES6+ / LocalStorage)       │
└──────────────────────────┬─────────────────────────────┘
                           │ fetch() REST JSON
┌──────────────────────────▼─────────────────────────────┐
│                 Node.js & Express API                  │
│       (CORS, Parameter Extraction, Security .env)      │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│            Modular Open-Source AI Layer                │
│                 (`aiService.js`)                       │
└──────┬───────────────────┼────────────────────┬────────┘
       │                   │                    │
┌──────▼───────┐    ┌──────▼───────┐     ┌──────▼────────┐
│ Meta Llama   │    │ Self-Hosted  │     │ Edge Engine   │
│ 3.3 70B/3.1  │    │ Ollama GPU   │     │ (100% Offline │
│ (via Groq)   │    │ (Local host) │     │ & Zero-Key)   │
└──────────────┘    └──────────────┘     └───────────────┘
```

### Supported Providers:
1. **NowWhat? Built-In Edge Reasoning Engine (Default):**
   - 100% offline, zero-latency, and requires **no external API keys**.
   - Performs deterministic constraint satisfaction, chronological slot budgeting, and rule-based semantic scoring.
2. **Meta Llama 3.3 70B & Llama 3.1 8B (Open Weights via Groq):**
   - Blazingly fast open-weight inference for complex natural prompt understanding.
3. **Self-Hosted Ollama (`127.0.0.1:11434`):**
   - Connects to your workstation GPU running `llama3:8b`, `mistral`, or `deepseek-r1` for total local sovereignty.
4. **Hugging Face Serverless:**
   - Connects to open instruction models such as Mistral 7B.

---

## 🛡️ Privacy & Data Sovereignty

Why does open-source AI matter for a free-time planner?
- **Sensitive Personal Telemetry:** Users input their emotional state, fatigue level, financial budget, and exact location (hostel, home, campus). Sending this data to commercial ad-monetized AI networks builds tracking profiles.
- **Zero Dark Patterns:** Proprietary recommendation engines subtly steer your free time toward commercial sponsors, ticketed events, and consumer spending. Open-source weights have no financial incentive to sell your attention.
- **Offline Resilience:** Whether you are traveling on a train without WiFi or in a remote hostel, NowWhat? continues generating plans without needing an active internet connection.

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (installed with Node)

### 1. Installation
Clone the repository and install the lightweight dependencies (`express`, `cors`, `dotenv`):
```bash
git clone https://github.com/your-username/Nowwhat.git
cd Nowwhat
npm install
```

### 2. Environment Setup (Optional)
By default, NowWhat? runs with the **built-in offline engine** out of the box with zero setup.

If you wish to use open weights like **Llama 3.3 70B** via Groq or **Ollama**, configure `.env`:
```env
PORT=3000

# AI Provider: 'local', 'groq', or 'ollama'
AI_PROVIDER=local

# Optional: Groq API Key for cloud open weights
GROQ_API_KEY=your_groq_api_key_here

# Optional: Self-hosted Ollama local server
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3:8b
```

### 3. Run the Application
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

*(For active development with auto-reload, run `npm run dev`)*.

---

## 📂 Project Structure

All files reside in a flat, clean single-folder layout:

```
Nowwhat/
├── index.html          # Responsive single-page application shell
├── style.css           # Core styling tokens, dark palette, typography
├── components.css      # Stepper wizard, timeline cards, boredom meter, modal
├── app.js              # SPA client router, state persistence, toasts
├── wizard.js           # 9-Step interactive wizard & progress calculation
├── timeline.js         # Chronological itinerary timeline & media card logic
├── surprise.js         # Spontaneous Surprise Me mode logic
├── boredomMeter.js     # 4-Level interactive boredom meter handler
├── openAiShowcase.js   # Live engine switcher & hero prompt handler
├── server.js           # Express web server & REST API endpoints
├── aiService.js        # Self-contained modular open-source AI orchestrator
├── package.json        # Dependencies & scripts
├── .env                # Local secrets (never committed to git)
├── .env.example        # Environment variable template
├── .gitignore          # Repository hygiene
└── README.md           # Documentation
```

---

## 🔌 API Reference

### `POST /api/plan`
Generates a full itinerary from structured wizard parameters.

**Request Body:**
```json
{
  "timeAvailable": "2 hours",
  "people": "Just me",
  "location": "Hostel",
  "mood": "Bored",
  "energy": "Medium",
  "budget": "₹100–₹300",
  "interests": ["Watch", "Relax"],
  "exclusions": "No studying",
  "customNote": "Need a break before evening",
  "startTime": "4:00 PM"
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "id": "plan-1791027226340",
    "summary": "A carefully paced 2 hours itinerary designed for just me at hostel...",
    "vibeTag": "Energizing dopamine-reboot",
    "totalDurationMinutes": 120,
    "estimatedCostTotal": "₹30",
    "modelUsed": "NowWhat? Edge Reasoning Engine (Open-Source Offline)",
    "activities": [
      {
        "id": "act-1",
        "time": "4:00 PM",
        "duration": 20,
        "title": "Brew a slow-crafted masala or adrak chai",
        "category": "MAKE",
        "cost": 20,
        "costFormatted": "₹20",
        "reason": "Crushing fresh ginger is an aromatic sensory break that centers you.",
        "tip": "Let spices simmer on low flame for 4 extra minutes."
      }
    ]
  }
}
```

### `POST /api/chat-plan`
Accepts a natural-language sentence, extracts constraints, and returns a tailored plan.
```json
{
  "prompt": "Bro I'm stuck in my hostel for 3 hours. I have ₹150 and don't want to study."
}
```

### `POST /api/surprise`
Generates an unexpected, delightful plan from minimal inputs:
```json
{
  "timeAvailable": "2 hours",
  "vibe": "Adventurous",
  "boredomLevel": "Emergency boredom"
}
```

### `GET /api/models`
Returns currently active AI provider, offline capability status, and open-source principles.

### `POST /api/models/switch`
Dynamically switches the active AI engine (`local`, `groq`, `ollama`) at runtime.

---

## 🎨 Design Philosophy

- **Dark Sophisticated Canvas:** Deep tones (`#080A0E`, `#10131A`) that eliminate eye strain during late-night hostel or bedroom planning.
- **Warm Cream Typography:** Clean `#F8F6F0` headers and `#DDD8CE` body text using Google Fonts (*Plus Jakarta Sans* for editorial crispness and *Space Grotesk* for technical timestamps).
- **Subtle Amber/Flame Accent:** Warm orange gradient (`#FF7A30` to `#F59E0B`) symbolizing energy, curiosity, and action.
- **Micro-Interactions:** Subtle card elevations, glassmorphic blurs (`backdrop-filter: blur(20px)`), and gentle feedback states that make the app feel alive without being overwhelming.

---

## 📄 License

This project is licensed under the [ISC License](file:///Users/trideep/Desktop/Nowwhat/package.json).

---

<div align="center">

*Built with open-source AI. Because your free time should be an adventure, not an algorithm trap.*

</div>
