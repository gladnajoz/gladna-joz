# Putting gladna.joz Organizer online (with cross-device sync)

Two parts: **(A) turn on cloud sync** so data is shared across her devices, then
**(B) host it** at a web address. Do A before B.

---

## A. Cloud sync — Supabase (free)

1. Go to https://supabase.com → sign up (free) → **New project**.
   - Give it a name (e.g. `gladna-joz`), set a database password (save it), pick a
     region near you. Wait ~2 min for it to finish provisioning.
2. In the project: **SQL Editor → New query**, paste the contents of
   [`supabase-setup.sql`](./supabase-setup.sql), and click **Run**.
   (This creates the table that stores the app's data.)
3. Get your keys: **Settings → API**. Copy:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long token — the one labelled `anon` / `public`)
4. In the project folder, copy `.env.example` to `.env` and paste them in:
   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
   ```
5. Restart the dev server (`npm run dev`). The app now reads/writes to the cloud.
   Anything she does on one device shows up on the next when it loads.

> Note: this uses the public anon key with open access to that one table — fine
> for a private family tool, but keep the link private. A PIN/login can be added
> later.

---

## B. Host it — Vercel (recommended) or Netlify

The app is a static site, so hosting is free and simple. Two routes:

### Easiest: Netlify Drop (no account setup, no Git)
1. Build it: `npm run build` → creates a `dist/` folder.
2. Go to https://app.netlify.com/drop and **drag the `dist` folder** onto the page.
3. You get a live URL instantly (e.g. `https://gladna-joz.netlify.app`).
   - Downside: to update it, you rebuild and drag `dist` again. (Fine to start.)

### Better long-term: Vercel or Netlify connected to Git
This auto-rebuilds and redeploys whenever the code changes.
1. Put the project on GitHub (needs `git init` + a GitHub repo — **make it private**,
   since `.env` and config live here). `.env` is gitignored and must NOT be committed.
2. On https://vercel.com (or Netlify) → **Import** the repo.
3. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   in the host's project settings → **Environment Variables**. (The host builds the
   app, so it needs the keys there too — the local `.env` is not uploaded.)
4. Deploy. Every push redeploys.

---

## C. Install on her phone
Once it's at a URL, open it on her phone:
- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** menu → *Install app* / *Add to Home screen*.
It then opens fullscreen with the bowl icon, like a native app, and works offline.
