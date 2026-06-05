import { createClient } from 'https://esm.sh/@anam-ai/js-sdk@latest';

const PERSONA_ID = '6ae66fe7-1d47-4d00-8fdf-28def476c19e';
const SHARE_URL = 'https://lab.anam.ai/share/_9u4XBq4nu0_WDp4SWUVM';
const STAGING_API_ORIGIN = 'https://mm-kitchen-staging.pages.dev';

const els = {
  startBtn: document.getElementById('startAnamBtn'),
  status: document.getElementById('anamStatus'),
  stage: document.getElementById('anamStage'),
  videoWrap: document.getElementById('anamVideoWrap'),
  iframeWrap: document.getElementById('anamIframeWrap'),
  fallbackLink: document.getElementById('anamFallbackLink'),
};

let client = null;
let starting = false;

function usesStagingApiProxy() {
  const host = (window.location.hostname || '').toLowerCase();
  return host.endsWith('github.io');
}

function sessionEndpoint() {
  return usesStagingApiProxy() ? `${STAGING_API_ORIGIN}/anam-session` : '/anam-session';
}

function setStatus(text) {
  if (els.status) els.status.textContent = text;
}

function showFallback(message = 'Share preview ready') {
  if (els.iframeWrap) els.iframeWrap.hidden = false;
  if (els.videoWrap) els.videoWrap.hidden = true;
  setStatus(message);
}

async function startAnam() {
  if (starting || client) return;
  starting = true;
  if (els.startBtn) els.startBtn.disabled = true;
  setStatus('Creating Anam session');

  try {
    const response = await fetch(sessionEndpoint(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        persona_id: PERSONA_ID,
        source: 'mm_chikeh_anam_preview',
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || typeof body.sessionToken !== 'string') {
      throw new Error(body.detail || body.error || `anam_session_${response.status}`);
    }

    if (els.iframeWrap) els.iframeWrap.hidden = true;
    if (els.videoWrap) els.videoWrap.hidden = false;
    const video = document.getElementById('anamVideo');
    if (!video) throw new Error('anam_video_missing');

    setStatus('Connecting live avatar');
    client = createClient(body.sessionToken);
    await client.streamToVideoElement('anamVideo');
    video.muted = false;
    await video.play().catch(() => {});
    setStatus('Anam avatar live');
    if (els.startBtn) els.startBtn.textContent = 'Chi-keh is live';
  } catch (error) {
    console.warn('Anam session failed; using share-link fallback.', error);
    showFallback('Share fallback');
    if (els.startBtn) {
      els.startBtn.disabled = false;
      els.startBtn.textContent = 'Retry live session';
    }
  } finally {
    starting = false;
  }
}

if (els.fallbackLink) els.fallbackLink.href = SHARE_URL;
showFallback('Share preview ready');
els.startBtn?.addEventListener('click', startAnam);
