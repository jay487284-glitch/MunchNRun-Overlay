MUNCH 'N RUN - DYNAMIC TIKTOK GIFT ARTWORK UPDATE

The established horizontal layout and all MNR action PNGs are unchanged.
Sample Output files are design references ONLY. No sample-gift images or
hand-maintained gift catalog are used by this release.

INSTALL BOTH PARTS
1. Replace the complete OVERLAY_WEB folder in the existing overlay GitHub repo.
   Keep the existing repository-root vercel.json and Vercel project/settings.
   Remove old assets/gift-reference.png and assets/win-gift-reference.png if
   GitHub upload leaves old files behind. New code never reads them.
2. From the full game source package run:
   GAME_INSTALLER_BUILDER/BUILD_FINAL_INSTALLER.bat
   Install the generated release/MunchNRun_Setup_2.0.3.exe.
3. While LIVE, use the existing TikFinity gift catalog Sync control. The updated
   event parser also learns icons from TikFinity giftPictureUrl/giftImageUrl/
   giftIconUrl fields and the existing nested catalog image fields.
4. Select the exact gift entry, Save Changes, then Publish. Copy the same HTTPS
   overlay URL to TikTok LIVE Studio, and refresh the browser source.

HOW IT WORKS
The existing known_gifts catalog stores gift ID, name and original HTTPS URL.
An explicit gift ID never borrows another gift's image based on a matching name.
Ambiguous names and ID-only catalog entries with no icon are reported clearly.
There is no new metadata database. Save Changes persists the current catalog.

The desktop downloads and verifies the selected image, creates a bounded PNG,
and caches it under %LOCALAPPDATA%/PacmanLive/OverlayGiftImages. Cache identity
includes the Gift ID and exact source URL, preventing another selection from
reusing the previous gift's picture. Preview and PNG export read this same PNG.
Publish deduplicates the PNG bytes by SHA-256 and embeds them into the existing
JSON payload. Supabase's existing publish/read RPCs store and return it; the
HTTPS overlay loads the exact PNG bytes without contacting TikTok's CDN.
This removes browser hotlink/CORS/expired-URL dependencies after a successful
initial download. No new server, storage bucket, service-role key, SQL migration
or privileged browser credential is required. Keep Supabase Data API enabled.

FAILURES ARE EXPLICIT
No ID, ambiguous name, missing metadata, inaccessible URL, HTTP error, invalid
image bytes, or failed cache write -> IMAGE MISSING and a diagnostic.
Publish refuses to report success until ALL enabled gift icons resolve, then
verifies the critical hosted card/action/layout/artwork fields. The previous hosted config is kept
if artwork resolution fails before upload. Export also refuses incomplete PNGs.
Original gift names are never substituted as successful artwork.
Readback verification tolerates JSON tuple/list conversion and non-critical
metadata changes. Every differing field is logged; only critical differences fail.
Logs: %LOCALAPPDATA%/PacmanLive/overlay_publish.log

Limits: 4 concurrent downloads; 30-second publish artwork wait; 2 MB input per
image; max 4 million decoded pixels; normalized PNG at most 18 KB; safe public
HTTPS only, including redirects. Existing 512 KiB backend payload limit remains.
The publisher rejects oversize payloads with a clear message before the RPC.

OWNER CONFIGURATION
Hosted URL/public key defaults remain in app/assets/overlay_owner_defaults.json.
Normal game settings keep those fields hidden. Existing channel/write/read
credentials are preserved. Private write credentials are never in the overlay.

VERIFICATION STATUS (READ BEFORE CLAIMING THE TASK COMPLETE)
Tested: metadata extraction including giftPictureUrl; duplicate-name ID matching;
three synthetic selection changes through Publish/read-back mocks and PNG export;
durable disk cache after a simulated HTTP 403; real missing-image editor render;
HTTPS-only validation and corrupt-image rejection; hosted renderer contract tests.
These unit fixtures are NOT actual TikTok gift selections or live publish tests.

Observed live state: all 25 currently published gift cards have Gift IDs but empty
image URLs, including TikTok (5269) and Fireworks (6090).
A direct request to inspect TikFinity metadata from this workspace was stopped:
'network approval was cancelled before a decision was returned'.
The user's Windows TikFinity / TikTok LIVE Studio session is not accessible here.
Automatic GitHub writes previously failed: 403 Resource not accessible by integration.
This revision has NOT been deployed or verified end-to-end with three real gifts.

LIVE ACCEPTANCE TEST STILL REQUIRED
Choose three real gifts absent from the supplied Sample Output references, one
at a time on the SAME mapping. For each, confirm its ID/name/URL are available,
then verify: Preview image -> PNG -> Publish SUCCESS -> hosted HTTPS image ->
TikTok LIVE Studio image. Also confirm mapped action/amount stay correct.
If Sync still returns ID/name but no URL, provide overlay_publish.log plus a
redacted gift event/catalog sample containing the gift ID and image fields.
Do not send private channel tokens, license files or service-role credentials.

FRESH LOG DIAGNOSIS
Only overlay_publish(3).log was used for the latest readback investigation.
The logged response has 27 cards. Rebuilding their render plans with the prior
code reproduced 32 tuple/list differences at render_plan.icons[*].rect.
Numbers match; JSON round-trip normalization makes the reconstructed payload
identical to that response. The original upload body itself was not in the log.
Six focused tests cover this case, ignored metadata, critical changes, and status.
The publisher now logs field paths/expected/actual values rather than dumping
embedded PNG bytes on a verification failure. HTTP transport errors retain status.
