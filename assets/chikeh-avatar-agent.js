const PAGES_HOSTS = ['pages.dev'];
const GITHUB_PAGES_HOSTS = ['github.io'];
const LOCAL_PAGES_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
const STAGING_API_ORIGIN = 'https://mm-kitchen-staging.pages.dev';

function usesCloudflarePagesApi() {
  const host = (window.location.hostname || '').toLowerCase();
  return LOCAL_PAGES_HOSTS.has(host) || PAGES_HOSTS.some((suffix) => host.endsWith(suffix));
}

function usesStagingApiProxy() {
  const host = (window.location.hostname || '').toLowerCase();
  const params = new URLSearchParams(window.location.search || '');
  return params.get('api') === 'staging' || GITHUB_PAGES_HOSTS.some((suffix) => host.endsWith(suffix));
}

function buildApiPath(kind) {
  if (usesStagingApiProxy()) return `${STAGING_API_ORIGIN}${kind === 'config' ? '/config' : '/session'}`;
  if (usesCloudflarePagesApi()) return kind === 'config' ? '/config' : '/session';
  return kind === 'config'
    ? '/.netlify/functions/avatar-config'
    : '/.netlify/functions/avatar-session';
}

const API_CONFIG = buildApiPath('config');
const API_SESSION = buildApiPath('session');
const MENU_DATA = 'data/order-catalog.json';
const PAGE_PARAMS = new URLSearchParams(window.location.search);
const DRAFT_STORAGE_KEY = 'mm_chikeh_avatar_draft_v1';
const DEFAULT_VOICE_PROFILE_ID = 'mild-heavy';
const CHIKEH_SPEECH_TOKEN = '__MM_CHIKEH__';

const HOURS_TEXT = 'Tuesday and Wednesday from 12 PM to 9 PM, Thursday from 12 PM to 10 PM, Friday from 12 PM to midnight, Saturday from 12 PM to 10 PM, and Sunday from 1 PM to 6 PM. Monday is closed.';
const ADDRESS_TEXT = '12255 Teel Parkway, Suite 410, Frisco, Texas 75033.';
const HAPPY_HOUR_TEXT = 'Happy hour runs Tuesday through Friday from 3 PM to 7 PM.';
const CATERING_TEXT = 'Catering bundles start at 225 dollars and M and M asks for at least 24 hours notice for trays and group orders.';
const SPECIAL_TEXT = 'Monthly specials and the Amala Abula lane are preorder only, paid in advance, and pickup only on the scheduled dates.';
const PHONE_TEXT = 'The restaurant line is 945-327-0366.';
const ORDER_ONLINE_TEXT = 'For the current live online ordering path, M and M still uses DoorDash while this owned website-order lane stays in preview.';

const QUICK_ACTIONS = [
  { title: 'First-time order', prompt: 'It is my first time. What should I order?' },
  { title: 'Add jollof + wings', prompt: 'Add jollof rice and suya wings for pickup.' },
  { title: 'Soup + swallow', prompt: 'Tell me about egusi and amala abula.' },
  { title: 'Happy hour', prompt: 'What is good for happy hour?' },
  { title: 'Catering for 20', prompt: 'I need catering for about 20 people next week.' },
  { title: 'Hours + directions', prompt: 'What are your hours and where are you located?' },
];

const VOICE_PROFILES = {
  cleaner: {
    id: 'cleaner',
    label: 'Cleaner / lighter Nigerian English',
    chip: 'Ezinne · Cleaner NG',
    voice: 'en-NG-EzinneNeural',
    locale: 'en-NG',
    rate: '+0%',
    pitch: '0%',
  },
  'mild-heavy': {
    id: 'mild-heavy',
    label: 'Mild-heavy Nigerian host',
    chip: 'Ezinne · Mild-heavy NG',
    voice: 'en-NG-EzinneNeural',
    locale: 'en-NG',
    rate: '+4%',
    pitch: '-1%',
  },
  warmer: {
    id: 'warmer',
    label: 'Warmer floor-host delivery',
    chip: 'Ezinne · Warm host',
    voice: 'en-NG-EzinneNeural',
    locale: 'en-NG',
    rate: '+2%',
    pitch: '-2%',
  },
};

const ITEM_KEYWORDS = {
  'salmon-bites': ['salmon bites', 'salmon'],
  'spicy-suya-wings': ['suya wings', 'wings'],
  'naija-beef-suya': ['beef suya', 'naija beef suya'],
  'owanbe-jollof-rice': ['jollof rice', 'jollof'],
  'signature-fried-rice': ['fried rice'],
  'egusi-with-chicken': ['egusi'],
  'amala-abula': ['amala abula', 'abula', 'amala'],
  'chicken-shawarma': ['chicken shawarma', 'shawarma'],
  'beef-shawarma': ['beef shawarma'],
  'afro-fusion-oxtails': ['oxtails', 'oxtail'],
  'seafood-platter': ['seafood platter', 'seafood'],
  'red-snapper': ['red snapper', 'whole fish'],
  'shrimp-scampi': ['shrimp scampi'],
  'afri-luxe-lamb-chops': ['lamb chops', 'lamb'],
};

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

const els = {
  configPill: document.getElementById('configPill'),
  avatarPill: document.getElementById('avatarPill'),
  micPill: document.getElementById('micPill'),
  draftPill: document.getElementById('draftPill'),
  voiceChip: document.getElementById('voiceChip'),
  voiceProfileSelect: document.getElementById('voiceProfileSelect'),
  modeChip: document.getElementById('modeChip'),
  startAvatarBtn: document.getElementById('startAvatarBtn'),
  startMicBtn: document.getElementById('startMicBtn'),
  stopMicBtn: document.getElementById('stopMicBtn'),
  replayGreetingBtn: document.getElementById('replayGreetingBtn'),
  sendPromptBtn: document.getElementById('sendPromptBtn'),
  sendDraftBtn: document.getElementById('sendDraftBtn'),
  clearDraftBtn: document.getElementById('clearDraftBtn'),
  customPromptInput: document.getElementById('customPromptInput'),
  quickActions: document.getElementById('quickActions'),
  transcriptOutput: document.getElementById('transcriptOutput'),
  logOutput: document.getElementById('logOutput'),
  avatarFrame: document.getElementById('avatarFrame'),
  avatarPlaceholder: document.getElementById('avatarPlaceholder'),
  avatarPresenceChip: document.getElementById('avatarPresenceChip'),
  avatarSpeakingChip: document.getElementById('avatarSpeakingChip'),
  draftOrderSummary: document.getElementById('draftOrderSummary'),
  draftOrderTotal: document.getElementById('draftOrderTotal'),
};

const state = {
  config: null,
  catalog: [],
  byId: new Map(),
  sdkLoaded: false,
  session: null,
  avatarSynthesizer: null,
  peerConnection: null,
  recognizer: null,
  micActive: false,
  startingAvatar: false,
  playbackUnlockArmed: false,
  avatarSpeaking: false,
  voiceProfileId: requestedVoiceProfileId(),
  draft: loadDraft(),
};

function requestedVoiceProfileId() {
  const requested = String(PAGE_PARAMS.get('accent') || PAGE_PARAMS.get('profile') || DEFAULT_VOICE_PROFILE_ID).trim();
  return VOICE_PROFILES[requested] ? requested : DEFAULT_VOICE_PROFILE_ID;
}

function currentVoiceProfile() {
  const fromSelect = els.voiceProfileSelect?.value;
  const id = VOICE_PROFILES[fromSelect] ? fromSelect : state.voiceProfileId;
  return VOICE_PROFILES[id] || VOICE_PROFILES[DEFAULT_VOICE_PROFILE_ID];
}

function currentAvatarCharacter() {
  return state.config?.avatar_character || 'nia';
}

function currentAvatarStyle() {
  if (!state.config) return 'business-casual';
  return Object.prototype.hasOwnProperty.call(state.config, 'avatar_style')
    ? (state.config.avatar_style || '')
    : 'business-casual';
}

function videoHasRenderableFrames() {
  const video = document.getElementById('avatarVideo');
  if (!video || !video.srcObject) return false;
  return Boolean((video.videoWidth && video.videoHeight) || video.readyState >= 2);
}

function syncAvatarFrameState({ speaking = state.avatarSpeaking, liveVideo = videoHasRenderableFrames() } = {}) {
  state.avatarSpeaking = Boolean(speaking);
  const live = Boolean(liveVideo);
  els.avatarFrame?.classList.toggle('avatar-live', live);
  els.avatarFrame?.classList.toggle('avatar-speaking', live && state.avatarSpeaking);
  els.avatarFrame?.classList.toggle('avatar-idle', live && !state.avatarSpeaking);
  if (els.avatarPresenceChip) {
    els.avatarPresenceChip.textContent = live ? 'Azure avatar on stage' : 'Stage waiting for avatar';
  }
  if (els.avatarSpeakingChip) {
    els.avatarSpeakingChip.textContent = live && state.avatarSpeaking ? 'Chi-keh is responding live' : 'Chi-keh is listening';
  }
}

function setAvatarSpeaking(active) {
  syncAvatarFrameState({ speaking: active });
}

function loadDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state.draft));
}

function currentMediaElements() {
  return ['avatarVideo', 'avatarAudio']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
}

function disarmPlaybackUnlock() {
  if (!state.playbackUnlockArmed) return;
  document.removeEventListener('pointerdown', handlePlaybackUnlockGesture, true);
  document.removeEventListener('keydown', handlePlaybackUnlockGesture, true);
  state.playbackUnlockArmed = false;
  if (els.replayGreetingBtn) els.replayGreetingBtn.textContent = 'Replay greeting';
}

async function resumeAvatarMedia(reason = 'a user interaction') {
  const pending = currentMediaElements().filter((element) => element.srcObject && element.paused);
  if (!pending.length) return false;

  let resumedAny = false;
  for (const element of pending) {
    try {
      await element.play();
      resumedAny = true;
      log(`Resumed ${element.id || element.tagName.toLowerCase()} after ${reason}.`);
    } catch (error) {
      log(`Playback still blocked for ${element.id || element.tagName.toLowerCase()}: ${error.message}`);
    }
  }

  if (resumedAny) disarmPlaybackUnlock();
  return resumedAny;
}

async function handlePlaybackUnlockGesture(event) {
  if (event?.type === 'keydown' && !['Enter', ' ', 'Spacebar'].includes(event.key)) return;
  await resumeAvatarMedia('a user gesture');
}

function armPlaybackUnlock(reason = 'audio autoplay') {
  if (state.playbackUnlockArmed) return;
  state.playbackUnlockArmed = true;
  document.addEventListener('pointerdown', handlePlaybackUnlockGesture, true);
  document.addEventListener('keydown', handlePlaybackUnlockGesture, true);
  if (els.replayGreetingBtn) els.replayGreetingBtn.textContent = 'Unlock + replay greeting';
  log(`Audio is waiting on a user gesture after ${reason}. Tap replay, ask a question, or start the mic once.`);
}

function log(message) {
  const stamp = new Date().toLocaleTimeString();
  els.logOutput.textContent = `[${stamp}] ${message}\n` + els.logOutput.textContent;
}

function setPill(element, label, cls) {
  element.textContent = label;
  element.className = `avatar-pill ${cls}`;
}

function addMessage(kind, text) {
  if (!text) return;
  const empty = els.transcriptOutput.querySelector('.avatar-lab-muted');
  if (empty) empty.remove();
  const box = document.createElement('div');
  box.className = `msg ${kind}`;
  box.innerHTML = `<small>${kind === 'user' ? 'Diner' : 'Chi-keh'}</small>${escapeHtml(text)}`;
  els.transcriptOutput.prepend(box);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    throw new Error(payload.detail || payload.error || `${response.status} ${response.statusText}`);
  }
  return payload;
}

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function escapeSsml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatSpeechTextForSsml(text) {
  const withTokens = String(text || '').replace(/chi-keh/gi, CHIKEH_SPEECH_TOKEN);
  return escapeSsml(withTokens).replaceAll(CHIKEH_SPEECH_TOKEN, '<sub alias="Sheikhe">Chi-keh</sub>');
}

function buildSpeechSsml(text) {
  const profile = currentVoiceProfile();
  const locale = state.session?.locale || profile.locale || state.config?.default_locale || 'en-NG';
  const voice = state.session?.voice || profile.voice || state.config?.default_voice || 'en-NG-EzinneNeural';
  return [
    `<speak version="1.0" xml:lang="${locale}" xmlns="http://www.w3.org/2001/10/synthesis">`,
    `<voice name="${voice}">`,
    `<prosody rate="${profile.rate}" pitch="${profile.pitch}">${formatSpeechTextForSsml(text)}</prosody>`,
    '</voice>',
    '</speak>',
  ].join('');
}

function renderVoiceChip() {
  const profile = currentVoiceProfile();
  els.voiceChip.textContent = `Voice: ${profile.chip}`;
}

function bindVideoTelemetry(element) {
  if (!element || element.dataset.mmTelemetryBound === '1') return;
  element.dataset.mmTelemetryBound = '1';
  ['loadedmetadata', 'loadeddata', 'canplay', 'playing', 'resize'].forEach((eventName) => {
    element.addEventListener(eventName, () => syncAvatarFrameState(), { passive: true });
  });
}

function greetingText() {
  return 'Hello my dear, you are welcome to M and M African Kitchen and Bar. This is Chi-keh speaking. I can help with first plates, jollof, suya, soups and swallow, happy hour, catering, or a pickup draft. What would you like today?';
}

function renderQuickActions() {
  els.quickActions.innerHTML = QUICK_ACTIONS.map((action) => `
    <button class="quick-btn" type="button" data-prompt="${escapeHtml(action.prompt)}">
      <strong>${action.title}</strong>
      <span>${action.prompt}</span>
    </button>
  `).join('');

  els.quickActions.querySelectorAll('[data-prompt]').forEach((button) => {
    button.addEventListener('click', () => {
      const prompt = button.getAttribute('data-prompt') || '';
      els.customPromptInput.value = prompt;
      void sendPrompt();
    });
  });
}

function renderDraft() {
  if (!state.draft.length) {
    els.draftOrderSummary.innerHTML = '<p class="avatar-lab-muted">No items yet. Ask Chi-keh for jollof, suya wings, egusi, shawarma, oxtails, or a seafood platter.</p>';
    els.draftOrderTotal.innerHTML = '';
    els.clearDraftBtn.disabled = true;
    els.sendDraftBtn.disabled = true;
    setPill(els.draftPill, 'Draft empty', 'info');
    return;
  }

  els.draftOrderSummary.innerHTML = state.draft.map((entry) => `
    <div class="draft-line">
      <div>
        <strong>${entry.quantity} × ${escapeHtml(entry.name)}</strong>
        ${entry.notes?.length ? `<small>${escapeHtml(entry.notes.join(' · '))}</small>` : ''}
      </div>
      <strong>${money(entry.price * entry.quantity)}</strong>
    </div>
  `).join('');

  const total = state.draft.reduce((sum, entry) => sum + (entry.price * entry.quantity), 0);
  els.draftOrderTotal.innerHTML = `
    <span>Draft total</span>
    <strong>${money(total)}</strong>
  `;
  els.clearDraftBtn.disabled = false;
  els.sendDraftBtn.disabled = false;
  setPill(els.draftPill, `${state.draft.length} draft line${state.draft.length === 1 ? '' : 's'}`, 'good');
}

function activeOrderEndpoint() {
  const config = window.MM_ORDERING_CONFIG || {};
  return config.orderEndpoint || '/orders';
}

function draftItemsForBoard() {
  return state.draft.map((entry) => ({
    itemId: entry.id,
    name: entry.name,
    price: entry.price,
    quantity: entry.quantity,
    remove: [],
    add: [],
    note: Array.isArray(entry.notes) ? entry.notes.join(' · ') : '',
  }));
}

async function sendDraftToBoard() {
  if (!state.draft.length) return;
  els.sendDraftBtn.disabled = true;
  els.sendDraftBtn.textContent = 'Sending...';
  try {
    const deliveryRequested = state.draft.some((entry) => (entry.notes || []).includes('delivery quote requested'));
    const subtotal = state.draft.reduce((sum, entry) => sum + (entry.price * entry.quantity), 0);
    const orderInput = {
      source: 'chi-keh',
      paymentStatus: 'pending',
      fulfillmentType: 'pickup',
      deliveryNotes: deliveryRequested ? 'Caller asked about delivery; address callback still needed before a transport quote.' : '',
      customer: {
        name: 'Chi-keh draft lead',
        phone: '',
        email: '',
      },
      totals: { subtotal },
      items: draftItemsForBoard(),
      kitchenStation: 'owner_review',
      ticketMode: 'chi-keh-avatar-preview',
    };
    const runtime = window.MMOrderRuntime;
    let orderId = 'draft';
    if (runtime?.createOrder) {
      const order = runtime.createOrder(orderInput);
      orderId = order?.id || order?.provider_order_id || orderId;
    } else {
      const payload = await fetchJson(activeOrderEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderInput),
      });
      orderId = payload?.order?.provider_order_id || payload?.order?.id || orderId;
    }
    addMessage('agent', `I pushed this draft onto the operator board as ${orderId}. M and M can review it, call the guest back, and decide whether it stays pickup or moves to a delivery follow-up.`);
    log(`Draft sent to operator board as ${orderId}.`);
    state.draft = [];
    saveDraft();
    renderDraft();
  } catch (error) {
    log(`Draft handoff failed: ${error.message}`);
    els.sendDraftBtn.textContent = 'Send failed';
    window.setTimeout(() => {
      els.sendDraftBtn.textContent = 'Send draft to operator board';
      els.sendDraftBtn.disabled = state.draft.length === 0;
    }, 1600);
    return;
  }
  els.sendDraftBtn.textContent = 'Send draft to operator board';
}

function parseQuantity(text) {
  const digitMatch = text.match(/\b(\d+)\b/);
  if (digitMatch) return Math.max(1, Math.min(12, Number(digitMatch[1])));
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (text.includes(` ${word} `) || text.startsWith(`${word} `) || text.endsWith(` ${word}`)) {
      return value;
    }
  }
  return 1;
}

function deriveNotes(text) {
  const notes = [];
  if (/no onion|without onion/.test(text)) notes.push('no onions');
  if (/extra spice|extra spicy/.test(text)) notes.push('extra spice');
  else if (/\bmild\b/.test(text)) notes.push('mild spice');
  else if (/\bspicy\b|pepper/.test(text)) notes.push('spicy');
  if (/pickup/.test(text)) notes.push('pickup');
  if (/delivery/.test(text)) notes.push('delivery quote requested');
  return [...new Set(notes)];
}

function buildMatchers() {
  const matchers = [];
  for (const [itemId, phrases] of Object.entries(ITEM_KEYWORDS)) {
    const item = state.byId.get(itemId);
    if (!item) continue;
    for (const phrase of phrases) {
      matchers.push({ item, phrase });
    }
  }
  return matchers.sort((a, b) => b.phrase.length - a.phrase.length);
}

function matchItems(text) {
  const found = [];
  const seen = new Set();
  for (const matcher of buildMatchers()) {
    if (text.includes(matcher.phrase) && !seen.has(matcher.item.id)) {
      seen.add(matcher.item.id);
      found.push(matcher.item);
    }
  }
  return found;
}

function isOrderIntent(text) {
  return /\b(add|order|want|need|get me|can i get|i ll take|i will take|let me have|for pickup|for delivery)\b/.test(text);
}

function addToDraft(item, quantity, notes) {
  const noteKey = (notes || []).join('|');
  const existing = state.draft.find((entry) => entry.id === item.id && (entry.notes || []).join('|') === noteKey);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.draft.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      notes,
    });
  }
  saveDraft();
  renderDraft();
}

function describeItem(item) {
  return `${item.name} is ${item.description} It is ${money(item.price)} in the current preview menu.`;
}

function orderReply(items, quantity, notes) {
  items.forEach((item) => addToDraft(item, quantity, notes));
  const lineText = items.map((item) => `${quantity} ${item.name}`).join(', ');
  const noteText = notes.length ? ` I also noted ${notes.join(', ')}.` : '';
  return `No wahala. I added ${lineText} to your draft.${noteText} If you want, I can keep building this as pickup or point you to the private order lane.`;
}

function chooseResponse(text) {
  const lower = normalize(text);
  const matchedItems = matchItems(lower);
  const quantity = parseQuantity(lower);
  const notes = deriveNotes(lower);

  if (/card|credit card|debit card|pay by phone/.test(lower)) {
    return 'For safety, I do not take card numbers by voice. I can build the order draft here, then route payment through the approved online or in-person path.';
  }

  if (matchedItems.length && isOrderIntent(lower)) {
    return orderReply(matchedItems, quantity, notes);
  }

  if (/first time|first timer|recommend|what should i order|never had nigerian/.test(lower)) {
    return 'No wahala. If this is your first time, start with Owanbe Jollof Rice, plantain, and protein. If you want smoky pepper heat, add suya or suya wings. If you want the full soup-and-swallow lane, start with egusi or amala abula.';
  }

  if (/happy hour|cocktail|drink|bar/.test(lower)) {
    return 'If you are pulling up for happy hour, it runs Tuesday through Friday from 3 PM to 7 PM. Good first moves are salmon bites, suya wings, cocktails, and a jollof or seafood plate once you settle in.';
  }

  if (/hours|open|close|today/.test(lower)) {
    return `You are welcome. ${HOURS_TEXT}`;
  }

  if (/where|address|directions|location|parking|map/.test(lower)) {
    return `M and M is at ${ADDRESS_TEXT} If the strip center turns you around, call the restaurant and they can guide you in, no wahala.`;
  }

  if (/cater|tray|party|event|birthday|group order|office lunch/.test(lower)) {
    return `${CATERING_TEXT} For this preview lane, I can capture the headcount, date, and best callback path, then hand that into the catering follow-up lane.`;
  }

  if (/order online|delivery|doordash/.test(lower)) {
    return ORDER_ONLINE_TEXT;
  }

  if (/special|preorder|monthly|amala special/.test(lower)) {
    return SPECIAL_TEXT;
  }

  if (/phone|call|number/.test(lower)) {
    return PHONE_TEXT;
  }

  if (/vegetarian|vegan|allergy|allergies/.test(lower)) {
    return 'For strict dietary or allergy questions, I would have the restaurant confirm directly before promising anything. I can still point you to gentler starters, soups, or rice plates to begin the conversation.';
  }

  if (/spicy|heat|pepper/.test(lower)) {
    return 'If you want real heat, go toward beef suya, suya wings, pepper gizzard, or catfish pepper soup. If you want the flavor without too much fire, start with jollof, shawarma, or salmon bites and ask for mild spice.';
  }

  if (/soup|swallow|fufu|egusi|amala|abula|ewedu|gbegiri/.test(lower)) {
    return 'For the soup-and-swallow lane, egusi with chicken is the easier first step. If you want a more traditional Yoruba comfort plate, amala abula brings amala, gbegiri, ewedu, spicy stew, and assorted meats together.';
  }

  if (matchedItems.length) {
    return describeItem(matchedItems[0]);
  }

  return 'You are welcome. I can help with first-time recommendations, happy hour, soups and swallow, catering, directions, or I can start a draft pickup order for jollof, suya, shawarma, seafood, or oxtails.';
}

async function ensureSpeechSdk() {
  if (state.sdkLoaded && window.SpeechSDK) return;
  const sdkUrl = state.config?.speech_sdk_url || 'https://aka.ms/csspeech/jsbrowserpackageraw';
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-speech-sdk="1"]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Speech SDK failed to load.')), { once: true });
      if (window.SpeechSDK) resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.dataset.speechSdk = '1';
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load Speech SDK from ${sdkUrl}`));
    document.head.appendChild(script);
  });
  if (!window.SpeechSDK) throw new Error('Speech SDK loaded but window.SpeechSDK is missing.');
  state.sdkLoaded = true;
  log('Azure Speech SDK loaded in browser.');
}

async function loadConfig() {
  const [config, catalog] = await Promise.all([
    fetchJson(API_CONFIG),
    fetchJson(MENU_DATA),
  ]);
  state.config = config;
  state.catalog = catalog.items || [];
  state.byId = new Map(state.catalog.map((item) => [item.id, item]));
  if (els.voiceProfileSelect) {
    els.voiceProfileSelect.value = state.voiceProfileId;
  }
  renderVoiceChip();
  els.modeChip.textContent = 'Preview lane: primary Cloudflare staging';
  setPill(els.configPill, 'Config loaded', 'good');
  log(`Config loaded. Voice ${config.default_voice}. Locale ${config.default_locale}. Visual avatar ${currentAvatarCharacter()}.`);
  renderQuickActions();
  renderDraft();
  await ensureSpeechSdk();

  if (PAGE_PARAMS.get('autostart') === '1') {
    log('Autostart requested from query string.');
    setTimeout(() => {
      void startAvatar();
    }, 300);
  }
}

async function createSession() {
  const profile = currentVoiceProfile();
  return fetchJson(API_SESSION, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locale: profile.locale || state.config?.default_locale || 'en-NG',
      voice: profile.voice || state.config?.default_voice || 'en-NG-EzinneNeural',
      persona: state.config?.default_persona || 'mm-chikeh-avatar-preview',
      avatar_character: currentAvatarCharacter(),
      avatar_style: currentAvatarStyle(),
    }),
  });
}

function attachRemoteTrack(track, stream) {
  let element = document.getElementById(`avatar-${track.kind}`);
  if (!element) {
    element = document.createElement(track.kind === 'video' ? 'video' : 'audio');
    element.id = `avatar-${track.kind}`;
    element.autoplay = true;
    element.setAttribute('autoplay', 'true');
    if (track.kind === 'video') {
      element.id = 'avatarVideo';
      element.muted = true;
      element.volume = 0;
      element.playsInline = true;
      element.setAttribute('playsinline', 'true');
    } else {
      element.id = 'avatarAudio';
    }
    els.avatarFrame.appendChild(element);
  }
  if (track.kind === 'video') {
    bindVideoTelemetry(element);
    track.onunmute = () => syncAvatarFrameState();
    track.onended = () => syncAvatarFrameState({ speaking: false, liveVideo: false });
  }
  const trackOnlyStream = typeof MediaStream === 'function' ? new MediaStream([track]) : stream;
  element.srcObject = trackOnlyStream;
  const playPromise = typeof element.play === 'function' ? element.play() : null;
  if (playPromise && typeof playPromise.catch === 'function') {
    if (typeof playPromise.then === 'function') {
      playPromise.then(() => {
        if (track.kind === 'audio') disarmPlaybackUnlock();
      });
    }
    playPromise.catch((error) => {
      log(`Avatar ${track.kind} autoplay retry needed: ${error.message}`);
      if (track.kind === 'audio') armPlaybackUnlock('autoplay');
    });
  }
  if (els.avatarPlaceholder) {
    els.avatarPlaceholder.remove();
    els.avatarPlaceholder = null;
  }
  syncAvatarFrameState();
}

async function startAvatar() {
  if (state.startingAvatar) return;
  state.startingAvatar = true;
  els.startAvatarBtn.disabled = true;
  try {
    await ensureSpeechSdk();
    const payload = await createSession();
    state.session = payload.session;
    const SpeechSDK = window.SpeechSDK;

    const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(payload.session.speech.token, payload.session.speech.region);
    speechConfig.speechSynthesisVoiceName = payload.session.voice;
    speechConfig.speechRecognitionLanguage = payload.session.locale;

    const videoFormat = new SpeechSDK.AvatarVideoFormat();
    videoFormat.width = 1280;
    videoFormat.height = 720;
    videoFormat.bitrate = 900000;

    let avatarConfig;
    try {
      avatarConfig = new SpeechSDK.AvatarConfig(payload.session.avatar.character, payload.session.avatar.style || '', videoFormat);
    } catch (error) {
      log(`Avatar style fallback for ${payload.session.avatar.character}: ${error.message}`);
      avatarConfig = new SpeechSDK.AvatarConfig(payload.session.avatar.character, videoFormat);
    }
    avatarConfig.remoteIceServers = [{
      urls: payload.session.relay.urls,
      username: payload.session.relay.username,
      credential: payload.session.relay.credential,
    }];

    state.avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);
    state.avatarSynthesizer.avatarEventReceived = (_, event) => {
      if (event?.description) log(`Avatar event: ${event.description}`);
      if (/SwitchToSpeaking|TurnStart/i.test(event?.description || '')) setAvatarSpeaking(true);
      if (/SwitchToIdle|TurnEnd/i.test(event?.description || '')) setAvatarSpeaking(false);
    };

    state.peerConnection = new RTCPeerConnection({
      iceServers: [{
        urls: payload.session.relay.urls,
        username: payload.session.relay.username,
        credential: payload.session.relay.credential,
      }],
    });
    state.peerConnection.addTransceiver('video', { direction: 'sendrecv' });
    state.peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
    state.peerConnection.ontrack = (event) => attachRemoteTrack(event.track, event.streams[0]);
    state.peerConnection.onconnectionstatechange = () => log(`WebRTC state: ${state.peerConnection.connectionState}`);

    log(`Starting avatar session for ${payload.session.avatar.character} with ${payload.session.voice}.`);
    const result = await Promise.race([
      state.avatarSynthesizer.startAvatarAsync(state.peerConnection),
      new Promise((_, reject) => {
        window.setTimeout(() => {
          reject(new Error('Avatar start timed out before WebRTC/video became live.'));
        }, 18000);
      }),
    ]);
    if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
      throw new Error(`Avatar start did not complete successfully: ${result.reason}`);
    }

    renderVoiceChip();
    setPill(els.avatarPill, 'Avatar live', 'good');
    setPill(els.configPill, 'Session active', 'info');
    els.startMicBtn.disabled = false;
    els.replayGreetingBtn.disabled = false;
    els.sendPromptBtn.disabled = false;
    syncAvatarFrameState({ speaking: false });
    log(`Avatar session started with ${payload.session.voice} as ${payload.session.avatar.character}.`);
    await speakText(greetingText());
  } catch (error) {
    setPill(els.avatarPill, 'Avatar failed', 'warn');
    els.startAvatarBtn.disabled = false;
    log(`Avatar start failed: ${error.message}`);
    throw error;
  } finally {
    state.startingAvatar = false;
  }
}

async function speakText(text) {
  if (!state.avatarSynthesizer || !window.SpeechSDK) {
    throw new Error('Start the live avatar first.');
  }
  addMessage('agent', text);
  setAvatarSpeaking(true);
  let result;
  try {
    if (typeof state.avatarSynthesizer.speakSsmlAsync === 'function') {
      result = await state.avatarSynthesizer.speakSsmlAsync(buildSpeechSsml(text));
    } else {
      result = await state.avatarSynthesizer.speakTextAsync(text);
    }
  } catch (error) {
    log(`SSML speech fallback triggered: ${error.message}`);
    result = await state.avatarSynthesizer.speakTextAsync(text);
  }
  if (result.reason !== window.SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
    throw new Error(`Speech synthesis ended with reason ${result.reason}`);
  }
  log(`Avatar spoke response (${text.slice(0, 90)}${text.length > 90 ? '…' : ''}).`);
  window.setTimeout(() => setAvatarSpeaking(false), 180);
  return result;
}

async function handleGuestUtterance(text) {
  if (!text) return;
  addMessage('user', text);
  const reply = chooseResponse(text);
  await speakText(reply);
}

async function sendPrompt() {
  const text = els.customPromptInput.value.trim();
  if (!text) return;
  els.customPromptInput.value = '';
  try {
    await resumeAvatarMedia('sending a typed prompt');
    await handleGuestUtterance(text);
  } catch (error) {
    log(`Prompt handling failed: ${error.message}`);
  }
}

async function startMic() {
  if (!state.session || !window.SpeechSDK) {
    throw new Error('Start the avatar first.');
  }
  if (state.micActive) return;

  await resumeAvatarMedia('starting the microphone');

  const SpeechSDK = window.SpeechSDK;
  const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(state.session.speech.token, state.session.speech.region);
  speechConfig.speechRecognitionLanguage = state.session.locale || 'en-NG';
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  state.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

  state.recognizer.recognized = async (_, event) => {
    const text = event?.result?.text?.trim();
    if (!text) return;
    log(`Mic recognized: ${text}`);
    try {
      await handleGuestUtterance(text);
    } catch (error) {
      log(`Avatar reply failed after recognition: ${error.message}`);
    }
  };
  state.recognizer.canceled = (_, event) => {
    log(`Recognition canceled: ${event?.errorDetails || event?.reason || 'unknown'}`);
  };
  state.recognizer.sessionStopped = () => {
    log('Recognition session stopped.');
  };

  await new Promise((resolve, reject) => {
    state.recognizer.startContinuousRecognitionAsync(resolve, (err) => reject(new Error(err)));
  });

  state.micActive = true;
  els.startMicBtn.disabled = true;
  els.stopMicBtn.disabled = false;
  setPill(els.micPill, 'Mic listening', 'good');
  log('Microphone recognition started.');
}

async function stopMic() {
  if (!state.recognizer || !state.micActive) return;
  await new Promise((resolve, reject) => {
    state.recognizer.stopContinuousRecognitionAsync(resolve, (err) => reject(new Error(err)));
  });
  state.micActive = false;
  els.startMicBtn.disabled = false;
  els.stopMicBtn.disabled = true;
  setPill(els.micPill, 'Mic idle', 'warn');
  log('Microphone recognition stopped.');
}

els.startAvatarBtn.addEventListener('click', () => startAvatar().catch((error) => log(error.message)));
if (els.voiceProfileSelect) {
  els.voiceProfileSelect.addEventListener('change', () => {
    state.voiceProfileId = currentVoiceProfile().id;
    renderVoiceChip();
    log(`Voice profile set to ${currentVoiceProfile().label}.`);
  });
}
els.startMicBtn.addEventListener('click', () => startMic().catch((error) => log(error.message)));
els.stopMicBtn.addEventListener('click', () => stopMic().catch((error) => log(error.message)));
els.replayGreetingBtn.addEventListener('click', async () => {
  try {
    await resumeAvatarMedia('replaying the greeting');
    await speakText(greetingText());
  } catch (error) {
    log(error.message);
  }
});
els.sendPromptBtn.addEventListener('click', () => {
  void sendPrompt();
});
els.customPromptInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    void sendPrompt();
  }
});
els.sendDraftBtn.addEventListener('click', () => {
  void sendDraftToBoard();
});
els.clearDraftBtn.addEventListener('click', () => {
  state.draft = [];
  saveDraft();
  renderDraft();
});

renderDraft();
loadConfig().catch((error) => {
  setPill(els.configPill, 'Config failed', 'warn');
  log(`Config load failed: ${error.message}`);
});
