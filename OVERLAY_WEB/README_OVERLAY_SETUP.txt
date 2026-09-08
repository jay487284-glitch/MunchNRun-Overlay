MUNCH 'N RUN LIVE OVERLAY - ONE-TIME SETUP
============================================================

1. Create/open a Supabase project.
2. In Supabase SQL Editor, run SUPABASE_SETUP.sql once.
3. Deploy this OVERLAY_WEB folder to Vercel as a static site.
4. In MUNCH 'N RUN > Settings > OVERLAY, enter:
   - Hosted Page: your public Vercel overlay URL (for example
     https://your-project.vercel.app/overlay)
   - Supabase: your Project URL (https://PROJECT.supabase.co)
   - Public Key: the Supabase publishable/anon key
5. Turn LIVE Sync ON, Save Changes, then press PUBLISH.
6. Press COPY URL. Paste that HTTPS URL into TikTok LIVE Studio's
   Link/Browser source. Use a 720 x 1280 canvas/source and keep its
   background transparent.

Normal use after setup
----------------------
- Change Gift, Likes/TapTap, Follow, action, count, Hunter, layout,
  scale or header in MUNCH 'N RUN.
- Press Save Changes. The game publishes the new mapped-trigger cards.
- The LIVE page refreshes automatically within about two seconds.
- GENERATE ALL makes transparent PNG cards in the local app-data
  OverlayExports folder. EXPORT ONE uses the current PNG selector.

Security
--------
- Never enter a Supabase service-role key. Use only the publishable/anon key.
- The generated write token stays in the desktop config and is never included
  in the copied browser URL or overlay state.
- The copied URL includes a private read token. Treat the URL as private;
  press NEW KEYS if it is accidentally shared.
- Supabase stores only SHA-256 hashes of read/write tokens.
- No license key, login/session data or customer email is published.
