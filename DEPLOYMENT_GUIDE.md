# Put your Game Hub online — beginner guide

Your project already has four active games:

1. Om Nom Run
2. Bubble Hamsters
3. Element Blocks
4. Tower Crash 3D

The game files and their companion asset folders must stay together inside `public/games`. Do not rename or move only one part of a game.

## Part 1 — publish the project to GitHub

Vercel deploys most easily from a GitHub repository. If you do not have accounts yet, create free accounts at [github.com](https://github.com) and [vercel.com](https://vercel.com). Use the same email where convenient.

1. Install [GitHub Desktop](https://desktop.github.com/download/).
2. Open GitHub Desktop and sign in to GitHub.
3. Choose **File → Add local repository**.
4. Select this exact folder:
   `C:\Users\Alok\Documents\Codex\2026-09-07\referenced-chatgpt-conversation-this-is-an\outputs\game-hub`
5. GitHub Desktop will say this is not yet a repository. Choose **create a repository**.
6. Name it `game-hub`. Keep it **Private** unless you want the source files publicly downloadable.
7. Click **Create repository**, then **Publish repository**.

When complete, open the repository on GitHub. At the top level, you should see a `public` folder, a `supabase` folder, and `vercel.json`—not another nested `game-hub` folder.

## Part 2 — deploy with Vercel

1. Open [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Find `game-hub`, then select **Import**.
3. On the Configure Project screen, set the framework preset to **Other**.
4. Leave the root directory as `.`. Do not choose the `public` folder as the root directory.
5. Leave build and output settings at their defaults. This project is a static website; Vercel serves the `public` folder automatically.
6. Select **Deploy**.
7. Wait until Vercel shows **Congratulations**. Click **Visit** and copy the address shown, such as `https://game-hub-xxxx.vercel.app`.

Every later change is simple: edit the files, open GitHub Desktop, write a short summary such as “Add new game”, click **Commit to main**, then click **Push origin**. Vercel will redeploy automatically in about a minute.

## Part 3 — allow login from your new site

This step is important: without it, account confirmation links may send people to the wrong place.

1. Open [Supabase Dashboard](https://supabase.com/dashboard), then open project **alokjadhawar's Project**.
2. Go to **Authentication → URL Configuration**.
3. Paste your Vercel address into **Site URL**.
4. Under **Redirect URLs**, add the same address followed by `/*`.
   Example: `https://game-hub-xxxx.vercel.app/*`
5. Save the changes.
6. Go to **Authentication → Providers → Email** and make sure Email is enabled.

## Part 4 — test before sharing

1. Visit the Vercel address in an incognito/private window.
2. Open any game. It should load inside the Game Hub page.
3. Play for at least one minute. Keep the tab visible; hidden tabs intentionally do not collect play time.
4. Return to the home page and check the leaderboard. Guests can play, but signing in is needed to appear in rankings and earn a streak.
5. Create your own account using the **Sign in** button. If confirmation is enabled, confirm the message sent to your email, then sign in.

## Part 5 — make yourself the administrator

After creating your account, return to Supabase:

1. Go to **SQL Editor → New query**.
2. Paste this, replacing the email address with yours:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'your-email@example.com');
   ```

3. Click **Run**.
4. Go to `https://your-vercel-address/admin` while signed in. You will see player totals, daily active players, individual time, sessions, streaks, and reward-ready players.

## Later: add another game

1. Put the game HTML file and its companion asset folder (if it has one) in `public/games`.
2. In Supabase **SQL Editor**, run this and replace the values:

   ```sql
   insert into public.games (id, title, description, path, active)
   values ('my-game', 'My Game', 'A short description', '/games/My Game.html', true);
   ```

3. Commit and push the new files with GitHub Desktop. The new card will appear after Vercel redeploys.

## One important reminder

Before publicly sharing the site, make sure you have permission to host and redistribute every game and its included assets. Some downloaded web games can have publisher licences, advertisements, or third-party tracking rules.
