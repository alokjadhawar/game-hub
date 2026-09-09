import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const config = window.GAME_HUB_CONFIG || {};

const configured =
  config.supabaseUrl &&
  config.supabasePublishableKey &&
  !config.supabaseUrl.includes('YOUR_');

const supabase = configured
  ? createClient(
      config.supabaseUrl,
      config.supabasePublishableKey
    )
  : null;


const profileName = document.querySelector('#profileName');
const profileMessage = document.querySelector('#profileMessage');
const profileStats = document.querySelector('#profileStats');
const signedOut = document.querySelector('#signedOut');

const points = document.querySelector('#points');
const pointsRank = document.querySelector('#pointsRank');
const currentStreak = document.querySelector('#currentStreak');
const longestStreak = document.querySelector('#longestStreak');
const streakRank = document.querySelector('#streakRank');
const rewardStatus = document.querySelector('#rewardStatus');


function showSignedOut() {
  profileStats.classList.add('hidden');
  profileMessage.classList.add('hidden');
  signedOut.classList.remove('hidden');
  profileName.textContent = 'Welcome back';
}


function showError(message) {
  profileStats.classList.add('hidden');
  profileMessage.textContent = message;
}


async function loadProfile() {

  if (!supabase) {
    showError('Connect Supabase to load your profile.');
    return;
  }


  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();


  if (!user) {
    showSignedOut();
    return;
  }


  const {
    data,
    error
  } = await supabase.rpc('my_player_stats');


  if (error) {
    console.error(error);

    showError(
      'Unable to load your profile right now.'
    );

    return;
  }


  if (!data?.length) {
    showError(
      'Your player profile could not be found.'
    );

    return;
  }


  const player = data[0];


  profileName.textContent =
    player.display_name || 'Player';

  profileMessage.textContent =
    'Your personal Game Hub progress';


  points.textContent =
    Number(player.points || 0).toLocaleString();


  pointsRank.textContent =
    player.points_rank
      ? `#${Number(player.points_rank)}`
      : '—';


  currentStreak.textContent =
    Number(player.current_streak || 0);


  longestStreak.textContent =
    Number(player.longest_streak || 0);


  streakRank.textContent =
    player.streak_rank
      ? `#${Number(player.streak_rank)}`
      : '—';


  if (player.reward_ready) {
    rewardStatus.textContent = 'READY';
  } else {
    rewardStatus.textContent = 'KEEP GOING';
  }
}


loadProfile();