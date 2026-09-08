import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const config = window.GAME_HUB_CONFIG || {};
const games = [
  { slug: 'space-sprint', title: 'Space Sprint', description: 'A fast placeholder for your first HTML game.', path: '/games/space-sprint.html' },
  { slug: 'puzzle-lab', title: 'Puzzle Lab', description: 'A thoughtful placeholder for your next challenge.', path: '/games/puzzle-lab.html' },
  { slug: 'arcade-dash', title: 'Arcade Dash', description: 'A bright placeholder for an arcade favourite.', path: '/games/arcade-dash.html' }
];
const configured = config.supabaseUrl && config.supabasePublishableKey && !config.supabaseUrl.includes('YOUR_');
const supabase = configured ? createClient(config.supabaseUrl, config.supabasePublishableKey) : null;
const grid = document.querySelector('#gameGrid');
const list = document.querySelector('#leaderboardList');
const dialog = document.querySelector('#authDialog');
let signUp = false;

function renderGames(items) {
  document.querySelector('#gameCount').textContent = `${items.length} games`;
  grid.innerHTML = items.map(game => `<article class="card"><div><p class="eyebrow">PLAY NOW</p><h3>${escapeHtml(game.title)}</h3><p>${escapeHtml(game.description || '')}</p></div><a class="play" href="/play.html?game=${encodeURIComponent(game.slug)}&path=${encodeURIComponent(game.path || `/games/${game.slug}.html`)}">Start game →</a></article>`).join('');
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

async function loadGames() {
  if (!supabase) return renderGames(games);
  const { data } = await supabase.rpc('public_games');
  renderGames(data?.length ? data : games);
}
async function loadLeaderboard() {
  if (!supabase) { list.innerHTML = '<li class="empty">Connect Supabase to show live rankings.</li>'; return; }
  const { data, error } = await supabase.rpc('leaderboard', { p_limit: 10 });
  if (error || !data?.length) { list.innerHTML = '<li class="empty">The first verified player will appear here.</li>'; return; }
  list.innerHTML = data.map(row => `<li>${escapeHtml(row.display_name)} <span>${formatSeconds(row.play_seconds)} · ${row.current_streak} day streak</span></li>`).join('');
}
function formatSeconds(value) { const minutes = Math.floor(Number(value || 0) / 60); return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`; }

async function updateAuth() {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  const button = document.querySelector('#authButton');
  button.textContent = user ? 'Sign out' : 'Sign in';
  button.onclick = async () => { if (user) { await supabase.auth.signOut(); await updateAuth(); } else dialog.showModal(); };
}
document.querySelector('.close').onclick = () => dialog.close();
document.querySelector('#modeToggle').onclick = () => { signUp = !signUp; document.querySelector('#modeToggle').textContent = signUp ? 'Already have an account? Sign in' : 'New here? Create an account'; document.querySelector('#authForm button').textContent = signUp ? 'Create account' : 'Continue'; };
document.querySelector('#authForm').onsubmit = async event => {
  event.preventDefault(); if (!supabase) { showAuth('Add your Supabase values to public/config.js first.'); return; }
  const form = new FormData(event.currentTarget); const email = String(form.get('email')); const password = String(form.get('password'));
  const result = signUp ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } }) : await supabase.auth.signInWithPassword({ email, password });
  showAuth(result.error ? result.error.message : signUp ? 'Check your inbox to confirm your account.' : 'Signed in — your play now earns a rank.');
  if (!result.error && !signUp) setTimeout(() => { dialog.close(); updateAuth(); }, 700);
};
function showAuth(text) { document.querySelector('#authMessage').textContent = text; }
renderGames(games); loadGames(); loadLeaderboard(); updateAuth();
