START HERE - COMPACT LIVE OVERLAY + SHARED ARTWORK (2026-09-09)

The old 490,000-byte check was triggered by base64 PNGs inside configuration.
Images now live once in Supabase Storage; cards refer to shared content hashes.
The MNR artwork and publish/read RPCs are preserved. The viewer now renders at
the selected native width and wraps cards into real rows; it never shrinks one
extremely wide row to the browser viewport.

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
   Set the browser-source dimensions to the Output dimensions shown in Preview.

OVERLAY SETTINGS
- Compact / Medium / Wide / Custom selects a real output width.
- Custom width accepts exact pixels (240-1920).
- Cards / Row defaults to AUTO. A manual value is also constrained by width, so
  no card is deliberately placed outside the output.
- Icon Size, Row Gap and Column Gap update Preview immediately.
- Transparent is the recommended LIVE background. COLOR and HEX provide a
  matching custom background for Preview, the full PNG and hosted overlay.
- EXPORT OVERLAY writes one full native-size MunchNRun_Overlay.png. EXPORT ONE
  remains available for a selected trigger card.

Backend changes are ALREADY APPLIED to project itccpogpstqfgudrgheg:
- public Storage bucket mnr-gift-artwork (public read; no public write policies)
- mnr-overlay-assets Edge Function, ACTIVE version 1, channel-write authentication
- service-role-only asset reservation helper and conditional read RPC
No private key needs to be entered into the game or website.
For another project only, see SUPABASE_ASSET_STORAGE/README.txt.

VALIDATION BOUNDARY
27, 100, 500 duplicate/test mappings passed local layout + web renderer contracts.
The actual Supabase RPCs accepted all three sizes with identical readback in
rolled-back database tests. No live streamer configuration was replaced.
Actual installed Windows Preview and LIVE Studio remain unverified in this Linux
workspace. The updated website files must be deployed before the new layout is live.
The live production overlay still contains the user's previously working 5 cards.

Read OVERLAY_SCALABILITY_REPORT.md for exact sizes, free-tier budgets and errors.
Logs: %LOCALAPPDATA%/PacmanLive/overlay_publish.log
