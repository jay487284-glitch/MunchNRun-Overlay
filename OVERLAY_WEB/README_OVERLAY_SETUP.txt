START HERE - SHARED ARTWORK / PAYLOAD SIZE FIX (2026-09-09)

The old 490,000-byte check was triggered by base64 PNGs inside configuration.
Images now live once in Supabase Storage; cards refer to shared content hashes.
The existing horizontal design, MNR artwork and publish/read RPCs are preserved.

INSTALL ORDER FOR THE EXISTING PROJECT
1. Upload/replace OVERLAY_WEB from the website ZIP in the existing GitHub repo.
   Wait for Vercel to deploy. Keep the existing root vercel.json/output directory.
   This viewer also supports the currently published schema-3 PNG payload.
2. Build the updated game using GAME_INSTALLER_BUILDER/BUILD_FINAL_INSTALLER.bat
   and install the generated Windows installer. This ZIP contains source/build
   files, NOT a newly compiled EXE. Close the old game before installing.
3. Open Live Events, keep all your mappings enabled, Save Changes and Publish.
   If metadata is missing, Sync gifts through the existing TikFinity integration.
4. Refresh the SAME copied HTTPS overlay URL in TikTok LIVE Studio.

Backend changes are ALREADY APPLIED to project itccpogpstqfgudrgheg:
- public Storage bucket mnr-gift-artwork (public read; no public write policies)
- mnr-overlay-assets Edge Function, ACTIVE version 1, channel-write authentication
- service-role-only asset reservation helper and conditional read RPC
No private key needs to be entered into the game or website.
For another project only, see SUPABASE_ASSET_STORAGE/README.txt.

VALIDATION BOUNDARY
27, 100, 500 duplicate/test mappings passed local publisher + renderer contracts.
The actual Supabase RPCs accepted all three sizes with identical readback in
rolled-back database tests. No live streamer configuration was replaced.
HTTP asset upload/public read, actual installed Preview/PNG and LIVE Studio remain
unverified: direct network verification was cancelled before approval returned.
The website files have not been deployed by this run (no GitHub write capability).
The live production overlay still contains the user's previously working 5 cards.

Read OVERLAY_SCALABILITY_REPORT.md for exact sizes, free-tier budgets and errors.
Logs: %LOCALAPPDATA%/PacmanLive/overlay_publish.log
