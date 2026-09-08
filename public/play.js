import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';
const config = window.GAME_HUB_CONFIG || {}; const status = document.querySelector('#status');
const params = new URLSearchParams(location.search); const slug = params.get('game');
const source = params.get('path') || (slug ? `/games/${slug}.html` : '');
const validGame = /^[a-z0-9-]+$/.test(slug || '') && /^\/games\/[A-Za-z0-9._ ()-]+\.html$/.test(source) && !source.includes('..');
const gameFrame = document.querySelector('#game');
// Saved game pages can contain browser-extension sidebars captured with the page.
// The game HTML is same-origin, so remove only those known, unrelated frames after it loads.
gameFrame.addEventListener('load', () => {
  try {
    const savedPage = gameFrame.contentDocument;
    savedPage?.querySelectorAll('#syncia_sidebar, iframe[src*="audio-devices"], .merlin-cta-root').forEach(element => element.remove());
  } catch { /* A cross-origin game frame is intentionally left alone. */ }
});
if (!validGame) { status.textContent = 'Game not found.'; } else gameFrame.src = source;
if (!config.supabaseUrl || !config.supabasePublishableKey || !validGame) { if (validGame) status.textContent = 'Guest play — add Supabase to verify play time.'; }
else {
  const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey);
  const guestToken = localStorage.gameHubGuestToken || (localStorage.gameHubGuestToken = crypto.randomUUID());
  let sessionId;
  const call = async (fn, args) => { const { data, error } = await supabase.rpc(fn, args); if (error) throw error; return data; };
  try {
    const started = await call('start_game_session', { p_game_slug: slug, p_guest_token: guestToken });
    sessionId = started; status.textContent = 'Verified play session active';
    const beat = async () => { if (!sessionId || document.visibilityState !== 'visible') return; try { await call('heartbeat_game_session', { p_session_id: sessionId, p_guest_token: guestToken }); } catch { status.textContent = 'Tracking will resume shortly'; } };
    const timer = setInterval(beat, 25000); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') beat(); });
    addEventListener('pagehide', () => { clearInterval(timer); if (sessionId) supabase.rpc('end_game_session', { p_session_id: sessionId, p_guest_token: guestToken }); });
  } catch { status.textContent = 'Playing as guest — session tracking unavailable'; }
}
