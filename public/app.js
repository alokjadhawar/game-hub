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
  if (!supabase) {
    list.innerHTML =
      '<li class="empty">Connect Supabase to show live rankings.</li>';
    return;
  }

  const {
    data,
    error
  } = await supabase.rpc('leaderboard', {
    p_limit: 10
  });

  if (error || !data?.length) {
    list.innerHTML =
      '<li class="empty">The first player will appear here.</li>';
    return;
  }

  list.innerHTML = data.map(row => `
    <li>
      <span>
        <strong>#${Number(row.rank || 0)}</strong>
        ${escapeHtml(row.display_name)}
      </span>

      <span>
        ${Number(row.points || 0)} points
      </span>
    </li>
  `).join('');
}

async function updateAuth() {
  if (!supabase) return;
  const { data: { user } } = await supabase.auth.getUser();
  const button = document.querySelector('#authButton');
  button.textContent = user ? 'Sign out' : 'Sign in';
  button.onclick = async () => { if (user) { await supabase.auth.signOut(); await updateAuth(); } else dialog.showModal(); };
}
document.querySelector('.close').onclick = () => dialog.close();
document.querySelector('#modeToggle').onclick = () => {
  signUp = !signUp;
  document.querySelector('#modeToggle').textContent =
    signUp ? 'Already have an account? Sign in' : 'New here? Create an account';
  document.querySelector('#authForm button').textContent =
    signUp ? 'Create account' : 'Continue';

  document.querySelector('#authForm input[type="password"]')
    .setAttribute('autocomplete', signUp ? 'new-password' : 'current-password');

  showAuth('');
};
document.querySelector('#authForm').onsubmit = async event => {
  event.preventDefault();

  if (!supabase) {
    showAuth('Add your Supabase values to public/config.js first.');
    return;
  }

  const form = new FormData(event.currentTarget);
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');

  if (signUp) {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: location.origin
      }
    });

    const message = result.error?.message || '';

    // Supabase may hide "email already exists" for security.
    // An existing account can also be detected by an empty identities array.
    const alreadyExists =
      /already (registered|exists)|user.*already|email.*already/i.test(message) ||
      Boolean(
        result.data?.user &&
        Array.isArray(result.data.user.identities) &&
        result.data.user.identities.length === 0
      );

    if (alreadyExists) {
      signUp = false;

      document.querySelector('#modeToggle').textContent =
        'New here? Create an account';

      document.querySelector('#authForm button').textContent =
        'Continue';

      document.querySelector('#authForm input[type="password"]')
        .setAttribute('autocomplete', 'current-password');

      showAuth(
        'This account already exists. Enter your password and sign in.'
      );

      return;
    }

    showAuth(
      result.error
        ? result.error.message
        : 'Check your inbox to confirm your account.'
    );

    return;
  }

  const result = await supabase.auth.signInWithPassword({
    email,
    password
  });

  showAuth(
    result.error
      ? result.error.message
      : 'Signed in — your play now earns a rank.'
  );

  if (!result.error) {
    setTimeout(() => {
      dialog.close();
      updateAuth();
      loadLeaderboard();
    }, 700);
  }
};
function showAuth(text) { document.querySelector('#authMessage').textContent = text; }
renderGames(games); loadGames(); loadLeaderboard(); updateAuth();
