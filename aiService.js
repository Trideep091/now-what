/**
 * NOWWHAT? — Modular Open-Source AI Orchestration Layer
 * Self-contained in a single flat directory.
 * Supports:
 * - Meta Llama 3.3 70B & 3.1 8B via Groq
 * - Self-Hosted Ollama (Local Sovereign GPU: llama3, mistral, deepseek)
 * - Hugging Face Open-Source Serverless Inference (Mistral 7B)
 * - Built-In Edge Reasoning Engine (100% Offline & Zero-Key Required)
 */

// ============================================================================
// 1. PROMPT TEMPLATES
// ============================================================================
const SYSTEM_PROMPT = `You are NOWWHAT?, an elite, empathetic, and culturally aware AI free-time planner.
Your mission is to cure boredom by transforming free time into a personalized, energizing, and realistic itinerary.

CORE PHILOSOPHY:
"Boredom isn't a lack of time. It's a lack of ideas."
You don't give random laundry lists. You build a coherent, time-budgeted, sequential journey.

VALID ACTIVITY CATEGORIES (must be one of these exact uppercase values):
- WATCH (Movies, short films, episodes, docs)
- MAKE (Quick recipes, DIY, setup, organizing)
- MOVE (Walks, stretches, workouts, sports, cycling)
- LEARN (Micro-skills, curiosities, Wikipedia rabbit holes, tutorials)
- PLAY (Video games, board games, puzzles, trivia, chess)
- CREATE (Writing, sketch, playlist curation, coding, photography)
- CONNECT (Calling friends, meeting up, hostel banter, community)
- EXPLORE (Local cafes, parks, new routes, thrift spots, museum)
- RELAX (Tea/chai break, meditation, audiobooks, power nap)
- IMPROVE (Digital declutter, wardrobe refresh, posture, journaling)

STRICT RULES:
1. Total activity duration must approximately equal the user's total free time.
2. Total cost must stay within the user's budget (e.g., ₹0, ₹100, ₹300, etc.).
3. Adhere strictly to EXCLUSIONS (e.g. if "no studying" or "no cooking", NEVER include them).
4. Respect LOCATION (e.g. if "Hostel" or "At home", don't suggest going to a distant mall unless requested).
5. Respect MOOD and ENERGY levels.
6. If category is WATCH, include specific title, format (Movie, Short Film, Doc, Episode), year, and streaming/free platform.
7. Return ONLY a valid JSON object matching the requested schema. No markdown fences around JSON, no conversational banter.`;

function buildPlanPrompt(params) {
  const {
    timeAvailable,
    people,
    location,
    mood,
    energy,
    budget,
    interests = [],
    exclusions = '',
    customNote = '',
    startTime = '4:00 PM'
  } = params;

  return `Generate a personalized free-time plan based on this user profile:
- Available Time: ${timeAvailable}
- People with user: ${people}
- Location / Environment: ${location}
- Current Mood: ${mood}
- Energy Level: ${energy}
- Budget: ${budget}
- Interests / Up for: ${interests.length > 0 ? interests.join(', ') : 'Any fun and engaging ideas'}
- Strict Exclusions (Do NOT include): ${exclusions || 'None'}
- Special Note from User: "${customNote || 'None'}"
- Starting Time for first activity: ${startTime}

Return a JSON object with this exact structure:
{
  "summary": "Brief 1-2 sentence inspiring summary of this customized plan",
  "vibeTag": "Short 2-3 word vibe badge e.g. 'Chill Hostel Evening' or 'Low-Budget High-Energy'",
  "totalDurationMinutes": 180,
  "estimatedCostTotal": "₹120",
  "activities": [
    {
      "time": "4:00 PM",
      "duration": 30,
      "title": "Chai & balcony decompression",
      "category": "RELAX",
      "cost": 30,
      "costFormatted": "₹30",
      "reason": "Matches your low energy and need to unwind before getting creative.",
      "tip": "Leave your phone inside for 15 minutes to reset your dopamine baseline.",
      "media": null
    }
  ]
}`;
}

// ============================================================================
// 2. NATURAL LANGUAGE INTENT & PARAMETER PARSER
// ============================================================================
function parseNaturalPrompt(text) {
  const clean = text.toLowerCase();

  // 1. Time extraction
  let timeAvailable = '2 hours';
  let timeMinutes = 120;

  if (clean.match(/(\d+(\.\d+)?)\s*(hr|hour|hours)/)) {
    const hours = parseFloat(clean.match(/(\d+(\.\d+)?)\s*(hr|hour|hours)/)[1]);
    timeMinutes = Math.round(hours * 60);
    timeAvailable = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (clean.match(/(\d+)\s*(min|mins|minute|minutes)/)) {
    const mins = parseInt(clean.match(/(\d+)\s*(min|mins|minute|minutes)/)[1], 10);
    timeMinutes = mins;
    timeAvailable = `${mins} min`;
  } else if (clean.includes('half an hour') || clean.includes('30 min')) {
    timeMinutes = 30;
    timeAvailable = '30 min';
  } else if (clean.includes('all evening') || clean.includes('whole day') || clean.includes('4+ hour') || clean.includes('4 hours')) {
    timeMinutes = 240;
    timeAvailable = '4+ hours';
  }

  // 2. Budget extraction
  let budget = '₹0';
  let budgetAmount = 0;
  const rupeeMatch = clean.match(/(?:₹|rs\.?|inr|rupees?)\s*(\d+)/) || clean.match(/(\d+)\s*(?:₹|rs\.?|inr|rupees?)/);
  if (rupeeMatch) {
    budgetAmount = parseInt(rupeeMatch[1], 10);
    if (budgetAmount === 0) budget = '₹0';
    else if (budgetAmount <= 100) budget = 'Under ₹100';
    else if (budgetAmount <= 300) budget = '₹100–₹300';
    else if (budgetAmount <= 500) budget = '₹300–₹500';
    else budget = '₹500+';
  } else if (clean.includes('free') || clean.includes('zero') || clean.includes('broke') || clean.includes('no money') || clean.includes('no budget')) {
    budget = '₹0';
    budgetAmount = 0;
  }

  // 3. Location extraction
  let location = 'At home';
  if (clean.includes('hostel') || clean.includes('dorm') || clean.includes('pg')) location = 'Hostel';
  else if (clean.includes('campus') || clean.includes('college') || clean.includes('university') || clean.includes('library')) location = 'Campus';
  else if (clean.includes('cafe') || clean.includes('coffee shop')) location = 'Cafe';
  else if (clean.includes('outdoors') || clean.includes('park') || clean.includes('outside')) location = 'Outdoors';
  else if (clean.includes('city') || clean.includes('town') || clean.includes('market') || clean.includes('mall')) location = 'City';
  else if (clean.includes('anywhere')) location = 'Anywhere';
  else if (clean.includes('home') || clean.includes('flat') || clean.includes('room') || clean.includes('bed')) location = 'At home';

  // 4. People extraction
  let people = 'Just me';
  if (clean.includes('with friend') || clean.includes('friends') || clean.includes('homies') || clean.includes('roommate') || clean.includes('boys') || clean.includes('girls') || clean.includes('mates')) {
    people = 'Friends';
  } else if (clean.includes('partner') || clean.includes('date') || clean.includes('gf') || clean.includes('bf') || clean.includes('wife') || clean.includes('husband')) {
    people = 'Partner';
  } else if (clean.includes('family') || clean.includes('mom') || clean.includes('dad') || clean.includes('sibling') || clean.includes('brother') || clean.includes('sister')) {
    people = 'Family';
  } else if (clean.includes('group') || clean.includes('team') || clean.includes('crowd')) {
    people = 'Group';
  } else if (clean.includes('alone') || clean.includes('just me') || clean.includes('solo') || clean.includes('myself')) {
    people = 'Just me';
  }

  // 5. Mood extraction
  let mood = 'Bored';
  if (clean.includes('tired') || clean.includes('exhausted') || clean.includes('lazy') || clean.includes('drained')) mood = 'Tired';
  else if (clean.includes('relaxed') || clean.includes('chill') || clean.includes('peaceful') || clean.includes('calm')) mood = 'Relaxed';
  else if (clean.includes('energetic') || clean.includes('hyped') || clean.includes('active') || clean.includes('pumped')) mood = 'Energetic';
  else if (clean.includes('curious') || clean.includes('wondering') || clean.includes('intrigued')) mood = 'Curious';
  else if (clean.includes('creative') || clean.includes('inspired') || clean.includes('artistic')) mood = 'Creative';
  else if (clean.includes('social') || clean.includes('talkative') || clean.includes('lonely')) mood = 'Social';
  else if (clean.includes('adventurous') || clean.includes('thrill') || clean.includes('explore')) mood = 'Adventurous';
  else if (clean.includes('bored') || clean.includes('nothing to do')) mood = 'Bored';

  // 6. Energy level
  let energy = 'Medium';
  if (clean.includes('low energy') || clean.includes('exhausted') || clean.includes('tired') || clean.includes('sluggish') || clean.includes('couch potato')) energy = 'Low';
  else if (clean.includes('high energy') || clean.includes('active') || clean.includes('hyper') || clean.includes('restless')) energy = 'High';

  // 7. Exclusions extraction
  const exclusionsList = [];
  if (clean.includes("don't want to study") || clean.includes("no studying") || clean.includes("not study")) {
    exclusionsList.push("No studying");
  }
  if (clean.includes("no outdoor") || clean.includes("stay inside") || clean.includes("inside only")) {
    exclusionsList.push("No outdoor activities");
  }
  if (clean.includes("no cooking") || clean.includes("can't cook")) {
    exclusionsList.push("No cooking");
  }
  if (clean.includes("no spending") || clean.includes("free only")) {
    exclusionsList.push("No spending money");
  }

  // 8. Interests extraction
  const interests = [];
  const interestKeywords = [
    { key: 'Watch', terms: ['movie', 'film', 'series', 'show', 'watch', 'video', 'youtube', 'documentary', 'anime'] },
    { key: 'Make', terms: ['make', 'cook', 'bake', 'recipe', 'craft', 'build', 'diy'] },
    { key: 'Move', terms: ['walk', 'run', 'stretch', 'workout', 'gym', 'cycle', 'move', 'jog'] },
    { key: 'Learn', terms: ['learn', 'read', 'article', 'skill', 'wikipedia', 'course', 'listen'] },
    { key: 'Play', terms: ['game', 'gaming', 'play', 'chess', 'puzzle', 'card', 'bgmi', 'fifa'] },
    { key: 'Create', terms: ['create', 'write', 'draw', 'sketch', 'paint', 'code', 'photo', 'music', 'playlist'] },
    { key: 'Connect', terms: ['call', 'talk', 'connect', 'hangout', 'friends', 'meet', 'chat'] },
    { key: 'Explore', terms: ['explore', 'cafe', 'park', 'walk around', 'roam', 'discover'] },
    { key: 'Relax', terms: ['relax', 'unwind', 'nap', 'tea', 'chai', 'coffee', 'meditate'] },
    { key: 'Improve', terms: ['organize', 'clean', 'declutter', 'improve', 'plan', 'routine', 'journal'] }
  ];

  interestKeywords.forEach(item => {
    if (item.terms.some(t => clean.includes(t))) {
      interests.push(item.key);
    }
  });

  if (interests.length === 0) {
    if (energy === 'Low') interests.push('Relax', 'Watch');
    else if (energy === 'High') interests.push('Move', 'Explore');
    else interests.push('Relax', 'Explore', 'Create');
  }

  return {
    timeAvailable,
    timeMinutes,
    people,
    location,
    mood,
    energy,
    budget,
    budgetAmount,
    interests,
    exclusions: exclusionsList.join(', ') || 'None',
    customNote: text
  };
}

// ============================================================================
// 3. CURATED KNOWLEDGE BASE & DETERMINISTIC OFFLINE ENGINE
// ============================================================================
const ACTIVITIES_DB = [
  // WATCH
  {
    title: "Watch 'The Secret Life of Walter Mitty'",
    category: "WATCH",
    baseDuration: 110,
    cost: 0,
    costFormatted: "Free / Streaming",
    suitableLocations: ["At home", "Hostel", "Cafe", "Anywhere"],
    suitableMoods: ["Bored", "Curious", "Adventurous", "Tired", "Relaxed"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Partner", "Friends"],
    keywords: ["movie", "adventure", "visual", "travel"],
    reason: "A visually breathtaking cure for boredom about daydreaming turning into real life adventure.",
    tip: "Use good headphones; the soundtrack by José González will instantly elevate your headspace.",
    media: {
      type: "Movie",
      title: "The Secret Life of Walter Mitty",
      year: "2013",
      platform: "Hotstar / Prime",
      runtime: "1h 54m",
      genre: "Adventure / Feel-Good"
    }
  },
  {
    title: "Watch '12th Fail' or 'Udaan'",
    category: "WATCH",
    baseDuration: 130,
    cost: 0,
    costFormatted: "Free / Streaming",
    suitableLocations: ["At home", "Hostel", "Anywhere"],
    suitableMoods: ["Bored", "Curious", "Tired", "Creative"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Friends", "Family"],
    keywords: ["movie", "inspiring", "drama", "hostel"],
    reason: "Deeply resonant, grounded storytelling that shakes off inertia and reignites your drive.",
    tip: "Keep a hot cup of tea beside you for the emotional climax.",
    media: {
      type: "Movie",
      title: "12th Fail",
      year: "2023",
      platform: "Hotstar",
      runtime: "2h 27m",
      genre: "Inspiring Drama"
    }
  },
  {
    title: "Watch Oscar-Nominated Animated Short Films",
    category: "WATCH",
    baseDuration: 35,
    cost: 0,
    costFormatted: "Free / YouTube",
    suitableLocations: ["At home", "Hostel", "Campus", "Cafe", "Anywhere"],
    suitableMoods: ["Bored", "Creative", "Curious", "Relaxed"],
    suitableEnergy: ["Low", "Medium", "High"],
    suitablePeople: ["Just me", "Partner", "Friends"],
    keywords: ["short film", "animation", "creative", "quick"],
    reason: "Punchy, creative storytelling in under 15 minutes each ('Piper', 'Bao', or 'Feast').",
    tip: "Search 'Pixar SparkShorts' or 'Oscar Animated Shorts' on YouTube.",
    media: {
      type: "Short Film",
      title: "Pixar SparkShorts Showcase",
      year: "2020-2023",
      platform: "YouTube / Disney+",
      runtime: "35m total",
      genre: "Heartwarming Animation"
    }
  },

  // MAKE
  {
    title: "Brew a slow-crafted masala or adrak chai",
    category: "MAKE",
    baseDuration: 20,
    cost: 20,
    costFormatted: "₹20",
    suitableLocations: ["At home", "Hostel"],
    suitableMoods: ["Relaxed", "Bored", "Tired", "Curious"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Partner", "Friends"],
    keywords: ["tea", "chai", "drink", "comfort"],
    reason: "Crushing fresh ginger and cardamom is an aromatic sensory break that centers you.",
    tip: "Let the milk and spices simmer together on low flame for 4 extra minutes for rich caramelization."
  },
  {
    title: "Hostel Gourmet: Elevated 10-Minute Maggi / Ramen",
    category: "MAKE",
    baseDuration: 25,
    cost: 40,
    costFormatted: "₹40",
    suitableLocations: ["Hostel", "At home"],
    suitableMoods: ["Bored", "Relaxed", "Social"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Friends"],
    keywords: ["food", "cooking", "snack", "hostel"],
    reason: "Upgrading instant noodles with garlic chili oil, a soft-boiled egg, or toasted cheese feels like a tiny triumph.",
    tip: "Sauté minced garlic in a spoon of butter before pouring the water."
  },

  // MOVE
  {
    title: "The 30-Minute Neighborhood Photo Walk",
    category: "MOVE",
    baseDuration: 30,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["Campus", "Outdoors", "City", "Anywhere", "Hostel"],
    suitableMoods: ["Bored", "Curious", "Adventurous", "Creative", "Relaxed"],
    suitableEnergy: ["Medium", "High"],
    suitablePeople: ["Just me", "Friends", "Partner"],
    keywords: ["walk", "photos", "explore", "fresh air"],
    reason: "Walking with a camera lens forces your brain to notice architecture, shadows, and textures you normally ignore.",
    tip: "Put your phone in Airplane Mode and challenge yourself to find 5 interesting color contrasts."
  },
  {
    title: "Mobility & Posture Reset Session",
    category: "MOVE",
    baseDuration: 20,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Anywhere"],
    suitableMoods: ["Tired", "Relaxed", "Bored"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me"],
    keywords: ["stretch", "yoga", "posture", "body"],
    reason: "Undoes desk slouch, opens hip flexors, and sends a rush of oxygenated blood to your brain.",
    tip: "Do 3 sets of cat-cow stretches, thoracic twists, and deep doorframe chest openers."
  },

  // LEARN
  {
    title: "Wikipedia Rabbit Hole / Wikiracing Speedrun",
    category: "LEARN",
    baseDuration: 30,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Campus", "Cafe", "Anywhere"],
    suitableMoods: ["Curious", "Bored", "Creative"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Friends"],
    keywords: ["read", "trivia", "game", "learn"],
    reason: "Start from a random article like 'Bicycle' and try navigating to 'Quantum Physics' using only hyperlinks in 5 clicks.",
    tip: "Visit thewikigame.com or press 'Random article' on Wikipedia."
  },

  // PLAY
  {
    title: "GeoGuessr or CityGuessr World Challenge",
    category: "PLAY",
    baseDuration: 30,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Campus", "Cafe", "Anywhere"],
    suitableMoods: ["Curious", "Bored", "Social", "Adventurous"],
    suitableEnergy: ["Medium", "High"],
    suitablePeople: ["Just me", "Friends", "Partner"],
    keywords: ["game", "geography", "virtual", "detective"],
    reason: "Tests your intuition against soil color, car license plates, sun orientation, and road signs.",
    tip: "Play with friends on geoguessr.com (free daily) or cityguessr.com."
  },

  // CREATE
  {
    title: "Curate a 7-Song 'Specific Memory' Playlist",
    category: "CREATE",
    baseDuration: 30,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Cafe", "Anywhere"],
    suitableMoods: ["Creative", "Relaxed", "Bored", "Curious"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Partner"],
    keywords: ["music", "spotify", "playlist", "mood"],
    reason: "Don't just make a generic playlist; build one around a hyperspecific vibe like 'rainy night cab ride in 2018'.",
    tip: "Give it a poetic 2-word title and create a customized minimalist cover."
  },

  // CONNECT
  {
    title: "The 'No Reason' Catchup Call with an Old Friend",
    category: "CONNECT",
    baseDuration: 30,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Outdoors", "Campus"],
    suitableMoods: ["Social", "Bored", "Relaxed"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me"],
    keywords: ["call", "friend", "voice", "reconnect"],
    reason: "Pick someone you haven't spoken to in 6+ months and call them without an agenda.",
    tip: "Start with: 'Hey! You popped into my head today, just wanted to check how life is treating you.'"
  },

  // EXPLORE
  {
    title: "Rooftop Sunset / Skyline Watch",
    category: "EXPLORE",
    baseDuration: 35,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["Hostel", "At home", "Campus", "Anywhere"],
    suitableMoods: ["Relaxed", "Curious", "Bored"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me", "Partner", "Friends"],
    keywords: ["sky", "sunset", "rooftop", "calm"],
    reason: "Elevating your vantage point by even 3 floors creates psychological distance from everyday stress.",
    tip: "Arrive 15 minutes before the official golden hour to catch the shifting pastel gradients."
  },

  // RELAX
  {
    title: "4-7-8 Deep Breathing & Ambient Sound Bath",
    category: "RELAX",
    baseDuration: 20,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Anywhere"],
    suitableMoods: ["Tired", "Relaxed", "Bored"],
    suitableEnergy: ["Low"],
    suitablePeople: ["Just me"],
    keywords: ["meditation", "breathe", "calm", "relax"],
    reason: "Stimulates the vagus nerve and activates the parasympathetic nervous system in 8 minutes.",
    tip: "Inhale through nose for 4 counts, hold for 7, exhale through mouth with whoosh for 8 counts."
  },

  // IMPROVE
  {
    title: "Digital Declutter: Camera Roll & Screenshots Purge",
    category: "IMPROVE",
    baseDuration: 25,
    cost: 0,
    costFormatted: "Free",
    suitableLocations: ["At home", "Hostel", "Campus", "Cafe", "Anywhere"],
    suitableMoods: ["Bored", "Tired", "Relaxed", "Curious"],
    suitableEnergy: ["Low", "Medium"],
    suitablePeople: ["Just me"],
    keywords: ["phone", "declutter", "clean", "organize"],
    reason: "Low friction, oddly satisfying chore that frees up gigabytes and clears cognitive baggage.",
    tip: "Sort your gallery by 'Screenshots' and delete anything older than 3 months without second-guessing."
  }
];

function formatClockTime(startMinutes) {
  let totalMins = startMinutes % (24 * 60);
  let hours = Math.floor(totalMins / 60);
  let mins = totalMins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minsStr = mins < 10 ? `0${mins}` : mins;
  return `${hours}:${minsStr} ${ampm}`;
}

function parseStartTime(str) {
  if (!str) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
  const match = str.match(/(\d+):?(\d*)\s*(am|pm)?/i);
  if (!match) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  const mer = match[3] ? match[3].toLowerCase() : '';
  if (mer === 'pm' && h < 12) h += 12;
  if (mer === 'am' && h === 12) h = 0;
  return h * 60 + m;
}

function parseTimeToMinutes(timeStr) {
  if (typeof timeStr === 'number') return timeStr;
  const s = String(timeStr).toLowerCase();
  if (s.includes('30 min')) return 30;
  if (s.includes('1 hour') || s.includes('1 hr')) return 60;
  if (s.includes('2 hour') || s.includes('2 hr')) return 120;
  if (s.includes('3 hour') || s.includes('3 hr')) return 180;
  if (s.includes('4+ hour') || s.includes('4 hour') || s.includes('4 hr')) return 240;
  const m = s.match(/(\d+)\s*(hr|hour|min)/);
  if (m) {
    const val = parseInt(m[1], 10);
    return m[2].startsWith('h') ? val * 60 : val;
  }
  return 120;
}

function parseBudgetCap(budgetStr) {
  if (typeof budgetStr === 'number') return budgetStr;
  const b = String(budgetStr).toLowerCase();
  if (b.includes('0') || b.includes('zero') || b.includes('free')) return 0;
  if (b.includes('under 100') || b.includes('100')) return 100;
  if (b.includes('100–300') || b.includes('100-300') || b.includes('300')) return 300;
  if (b.includes('300–500') || b.includes('300-500') || b.includes('500')) return 500;
  return 1000;
}

function generateLocalPlan(params) {
  const {
    timeAvailable = '2 hours',
    people = 'Just me',
    location = 'At home',
    mood = 'Bored',
    energy = 'Medium',
    budget = '₹100–₹300',
    interests = [],
    exclusions = '',
    customNote = '',
    startTime = '4:00 PM'
  } = params;

  const totalTargetMinutes = parseTimeToMinutes(timeAvailable);
  const budgetCap = parseBudgetCap(budget);
  const startMins = parseStartTime(startTime);
  const exclusionsLower = String(exclusions || '').toLowerCase();

  const filteredPool = ACTIVITIES_DB.filter(act => {
    if (exclusionsLower.includes('study') && act.keywords.includes('study')) return false;
    if (exclusionsLower.includes('outdoor') && (act.suitableLocations.includes('Outdoors') && !act.suitableLocations.includes('At home'))) return false;
    if (exclusionsLower.includes('cooking') && act.keywords.includes('cooking')) return false;
    if (exclusionsLower.includes('spending') && act.cost > 0) return false;
    if (act.cost > budgetCap) return false;
    return true;
  });

  const scored = filteredPool.map(act => {
    let score = 10;
    if (act.suitableLocations.includes(location) || act.suitableLocations.includes('Anywhere')) score += 15;
    if (act.suitableMoods.includes(mood)) score += 15;
    if (act.suitableEnergy.includes(energy)) score += 12;
    if (act.suitablePeople.includes(people)) score += 10;
    if (interests && Array.isArray(interests) && interests.length > 0) {
      if (interests.some(i => i.toUpperCase() === act.category.toUpperCase())) score += 20;
    }
    if (customNote) {
      const noteLower = customNote.toLowerCase();
      act.keywords.forEach(kw => {
        if (noteLower.includes(kw)) score += 8;
      });
    }
    score += Math.random() * 5;
    return { ...act, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected = [];
  let currentMinutes = 0;
  let runningCost = 0;
  const pickedCategories = new Set();

  for (const act of scored) {
    if (currentMinutes >= totalTargetMinutes) break;
    if (pickedCategories.has(act.category) && scored.length > 5) continue;
    if (runningCost + act.cost > budgetCap && budgetCap > 0 && act.cost > 0) continue;

    let duration = act.baseDuration;
    const remainingTime = totalTargetMinutes - currentMinutes;

    if (remainingTime < duration) {
      if (remainingTime >= 15) {
        duration = remainingTime;
      } else {
        if (selected.length > 0) {
          selected[selected.length - 1].duration += remainingTime;
          currentMinutes += remainingTime;
        }
        break;
      }
    }

    selected.push({ ...act, duration });
    pickedCategories.add(act.category);
    currentMinutes += duration;
    runningCost += act.cost;
  }

  if (currentMinutes < totalTargetMinutes && selected.length > 0) {
    const diff = totalTargetMinutes - currentMinutes;
    selected[selected.length - 1].duration += diff;
  }

  let currentClockMinutes = startMins;
  const activities = selected.map((act) => {
    const timeFormatted = formatClockTime(currentClockMinutes);
    currentClockMinutes += act.duration;

    let tailoredReason = act.reason;
    if (customNote && customNote.length > 5) {
      tailoredReason += ` Tailored to "${customNote.slice(0, 42)}...".`;
    }

    return {
      time: timeFormatted,
      duration: act.duration,
      title: act.title,
      category: act.category,
      cost: act.cost,
      costFormatted: act.cost === 0 ? "Free" : `₹${act.cost}`,
      reason: tailoredReason,
      tip: act.tip,
      media: act.media || null
    };
  });

  const vibeAdjectives = {
    Bored: "Energizing dopamine-reboot",
    Relaxed: "Unwinding low-stress flow",
    Energetic: "Action-packed active trail",
    Curious: "Mind-expanding exploration",
    Creative: "Maker-mode creative sprint",
    Social: "High-connection bonding session",
    Tired: "Gentle restorative evening",
    Adventurous: "Spontaneous curiosity quest"
  };

  return {
    summary: `A carefully paced ${timeAvailable} itinerary designed for ${people.toLowerCase()} at ${location.toLowerCase()}, balancing your ${mood.toLowerCase()} mood and ${energy.toLowerCase()} energy within ${budget}.`,
    vibeTag: vibeAdjectives[mood] || "Personalized Free-Time Journey",
    totalDurationMinutes: totalTargetMinutes,
    estimatedCostTotal: runningCost === 0 ? "Free" : `₹${runningCost}`,
    modelUsed: "NowWhat? Edge Reasoning Engine (Open-Source Offline)",
    activities
  };
}

// ============================================================================
// 4. OPEN-WEIGHT PROVIDERS (Groq, Ollama, Hugging Face)
// ============================================================================
async function generateGroqPlan(params, apiKey, modelName = 'llama-3.3-70b-versatile') {
  const prompt = buildPlanPrompt(params);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content;
  return { ...JSON.parse(rawContent), modelUsed: `Meta ${modelName} (Open-Weight via Groq)` };
}

async function generateOllamaPlan(params, baseUrl = 'http://127.0.0.1:11434', modelName = 'llama3:8b') {
  const prompt = buildPlanPrompt(params);
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      format: 'json',
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return { ...JSON.parse(data.message?.content), modelUsed: `${modelName} (Self-Hosted Ollama Open Model)` };
}

// ============================================================================
// 5. MAIN AI SERVICE SINGLETON
// ============================================================================
class AIService {
  constructor() {
    this.currentProvider = process.env.AI_PROVIDER || 'local';
    this.groqKey = process.env.GROQ_API_KEY || '';
    this.groqModel = 'llama-3.3-70b-versatile';
    this.ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3:8b';
  }

  setProvider(provider, options = {}) {
    this.currentProvider = provider;
    if (options.groqModel) this.groqModel = options.groqModel;
    if (options.ollamaModel) this.ollamaModel = options.ollamaModel;
  }

  getProviderInfo() {
    return {
      activeProvider: this.currentProvider,
      activeModel: this.getActiveModelName(),
      isOfflineCapable: true,
      dataPrivacy: "100% Client-Private (No proprietary tracking, open-weight execution)",
      availableEngines: [
        {
          id: 'local',
          name: 'NowWhat? Edge Reasoning Engine',
          type: 'Local & Offline',
          description: 'Zero-latency, 100% private, works completely offline without API keys or servers.',
          badge: 'Default / Instant',
          ready: true
        },
        {
          id: 'groq',
          name: 'Meta Llama 3.3 70B (Open-Weight)',
          type: 'High-Speed Cloud Inference',
          description: 'State-of-the-art open-weight model with unmatched conversational reasoning.',
          badge: 'Open Weights',
          ready: Boolean(this.groqKey)
        },
        {
          id: 'ollama',
          name: 'Self-Hosted Ollama (Llama 3 / Mistral / DeepSeek)',
          type: 'Sovereign Local Host',
          description: 'Connect directly to your local workstation GPU or Home Server at 127.0.0.1:11434.',
          badge: '100% Self-Hosted',
          ready: true
        }
      ]
    };
  }

  getActiveModelName() {
    switch (this.currentProvider) {
      case 'groq': return `Meta ${this.groqModel} (via Groq)`;
      case 'ollama': return `${this.ollamaModel} (via Ollama Local)`;
      default: return 'NowWhat? Edge Reasoning Engine (Open-Source Offline)';
    }
  }

  async generatePlan(params) {
    let rawResult;
    let providerUsed = this.currentProvider;

    try {
      if (this.currentProvider === 'groq' && this.groqKey) {
        rawResult = await generateGroqPlan(params, this.groqKey, this.groqModel);
      } else if (this.currentProvider === 'ollama') {
        rawResult = await generateOllamaPlan(params, this.ollamaUrl, this.ollamaModel);
      } else {
        providerUsed = 'local';
        rawResult = generateLocalPlan(params);
      }
    } catch (err) {
      console.warn(`[AI Service] Fallback to local open engine (${err.message})`);
      providerUsed = 'local (fallback)';
      rawResult = generateLocalPlan(params);
    }

    return this.validateAndNormalizePlan(rawResult, params, providerUsed);
  }

  async generatePlanFromNaturalText(promptText, extraContext = {}) {
    const extractedParams = parseNaturalPrompt(promptText);
    const mergedParams = {
      ...extractedParams,
      ...extraContext,
      customNote: promptText
    };

    const plan = await this.generatePlan(mergedParams);
    return {
      extractedSituation: mergedParams,
      plan
    };
  }

  async generateSurprisePlan(surpriseOptions) {
    const timeAvailable = surpriseOptions.timeAvailable || '2 hours';
    const vibe = surpriseOptions.vibe || 'Curious';
    const boredomLevel = surpriseOptions.boredomLevel || 'Very bored';

    const vibeMap = {
      'Curious': { mood: 'Curious', energy: 'Medium', interests: ['Explore', 'Learn'] },
      'Adventurous': { mood: 'Adventurous', energy: 'High', interests: ['Explore', 'Move'] },
      'Cozy & Chill': { mood: 'Relaxed', energy: 'Low', interests: ['Relax', 'Watch'] },
      'Creative Sparks': { mood: 'Creative', energy: 'Medium', interests: ['Create', 'Make'] },
      'Random Wildcard': { mood: 'Adventurous', energy: 'Medium', interests: ['Play', 'Explore', 'Make'] }
    };

    const mapped = vibeMap[vibe] || vibeMap['Curious'];

    const params = {
      timeAvailable,
      people: surpriseOptions.people || 'Just me',
      location: surpriseOptions.location || 'Anywhere',
      mood: mapped.mood,
      energy: mapped.energy,
      budget: surpriseOptions.budget || '₹100–₹300',
      interests: mapped.interests,
      exclusions: surpriseOptions.exclusions || '',
      customNote: `Surprise me! Boredom level: ${boredomLevel}. Vibe: ${vibe}.`,
      startTime: surpriseOptions.startTime || '4:00 PM'
    };

    const plan = await this.generatePlan(params);
    plan.isSurprise = true;
    plan.surpriseVibe = vibe;
    return plan;
  }

  validateAndNormalizePlan(rawPlan, inputParams, providerUsed) {
    if (!rawPlan || typeof rawPlan !== 'object') {
      return generateLocalPlan(inputParams);
    }

    const activities = Array.isArray(rawPlan.activities) ? rawPlan.activities : [];
    const validCats = ['WATCH', 'MAKE', 'MOVE', 'LEARN', 'PLAY', 'CREATE', 'CONNECT', 'EXPLORE', 'RELAX', 'IMPROVE'];

    const normalizedActivities = activities.map((act, index) => {
      let category = (act.category || 'RELAX').toUpperCase();
      if (!validCats.includes(category)) category = 'RELAX';

      let cost = typeof act.cost === 'number' ? act.cost : 0;
      let costFormatted = act.costFormatted || (cost === 0 ? 'Free' : `₹${cost}`);
      let reason = act.reason || `Chosen specifically for your ${inputParams.mood || 'current'} mood and available time.`;

      return {
        id: `act-${Date.now()}-${index}`,
        time: act.time || `${4 + index}:00 PM`,
        duration: typeof act.duration === 'number' ? act.duration : 30,
        title: act.title || 'Spontaneous Free-Time Activity',
        category,
        cost,
        costFormatted,
        reason,
        tip: act.tip || 'Take your time and enjoy the break without checking notifications.',
        media: act.media || null
      };
    });

    const totalMinutes = normalizedActivities.reduce((sum, a) => sum + a.duration, 0);

    return {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      summary: rawPlan.summary || `A personalized ${inputParams.timeAvailable || 'free time'} plan tailored to your mood and setting.`,
      vibeTag: rawPlan.vibeTag || `${inputParams.mood || 'Custom'} Vibe`,
      totalDurationMinutes: totalMinutes,
      estimatedCostTotal: rawPlan.estimatedCostTotal || 'Free / Low Cost',
      modelUsed: rawPlan.modelUsed || this.getActiveModelName(),
      providerUsed: providerUsed,
      inputs: {
        timeAvailable: inputParams.timeAvailable,
        people: inputParams.people,
        location: inputParams.location,
        mood: inputParams.mood,
        energy: inputParams.energy,
        budget: inputParams.budget,
        interests: inputParams.interests,
        exclusions: inputParams.exclusions,
        customNote: inputParams.customNote
      },
      activities: normalizedActivities
    };
  }
}

module.exports = new AIService();
