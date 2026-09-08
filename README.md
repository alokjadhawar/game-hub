# Game Hub

A static, Vercel-ready game portal backed by Supabase. Players can play without an account; signing in enables leaderboard, streaks, and rewards eligibility. Time is measured server-side through short, visibility-aware heartbeats, rather than trusting a timer in the browser.

## Add the Supabase backend

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste and run [`supabase/migrations/20260907000001_secure_existing_game_hub.sql`](supabase/migrations/20260907000001_secure_existing_game_hub.sql). It upgrades the initial Game Hub schema already present in the connected project.
3. In **Authentication → URL Configuration**, set the Site URL to your deployed Vercel URL and add that URL to Redirect URLs.
4. In **Authentication → Providers → Email**, enable email/password. Turn off email confirmation only if you deliberately want immediate sign-in during testing.
5. Make yourself an admin in the SQL Editor (replace the email):
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

The migration deliberately exposes no direct access to play sessions, activity, or aggregate analytics. Browser clients may call narrowly scoped RPCs only; the analytics RPC independently checks `profiles.role = 'admin'`.

## Configure and deploy

1. `public/config.js` is already populated with this project's browser-safe Supabase URL and publishable key. Never place a `service_role` key in it.
2. Put each HTML game and any companion `<name>_files` folder in `public/games/`, then register it in Supabase. The matching file path is `/games/<slug>.html`:
   ```sql
   insert into public.games (id, title, description, path, active)
   values ('my-game', 'My Game', 'A short description', '/games/my-game.html', true);
   ```
3. Import this folder into Vercel as a static site. Set the Root Directory to `.` and leave Build Command and Output Directory empty. Or run `vercel --prod` from this folder after signing in.

`public/config.js` contains only browser-safe values and may be committed to the repository.
