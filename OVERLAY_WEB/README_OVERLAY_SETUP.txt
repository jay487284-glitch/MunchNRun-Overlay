MUNCH 'N RUN - HORIZONTAL ARTWORK OVERLAY (September 8, 2026)

This update preserves the working Supabase RPCs, tokens, tables and HTTPS URL.
Do not run SUPABASE_SETUP.sql again for this update. Keep Data API enabled.

DEPLOY THE WEBSITE
In jay487284-glitch/MunchNRun-Overlay, replace the OVERLAY_WEB folder with this
entire folder, including assets/ and preview-fixture.json. Keep the existing
repository-root vercel.json (outputDirectory: OVERLAY_WEB).
Do not upload only the JavaScript: it requires the bundled PNG artwork.
Wait for Vercel to finish. The HTTPS address stays:
https://munch-n-run-overlay.vercel.app/

BUILD THE GAME
Use GAME_INSTALLER_BUILDER/BUILD_FINAL_INSTALLER.bat from the full package.
Install release/MunchNRun_Setup_2.0.3.exe after the build finishes.
Existing PacmanLive/config.json settings and private channel tokens are kept.
LIVE Sync ON -> Save Changes -> Publish -> Copy URL.
Paste the full copied HTTPS URL into TikTok LIVE Studio's Link/Browser source.
The bare home URL has no channel/read token and intentionally shows no cards.
A 1920 x 240 browser-source viewport is a useful starting size for the horizontal
strip; adjust source height for an optional header. The strip automatically fits
its source width without wrapping, up to the configured scale.

OWNER SETUP
Public hosting defaults are bundled in the desktop app at
app/assets/overlay_owner_defaults.json. The normal settings panel hides those
fields and hides key regeneration. Existing non-empty config values take
priority. Only the owner needs to edit that file when changing deployment.
It must contain only the HTTPS URLs and Supabase publishable/anon key.
Never put a service-role key, private write token or license data in it.
Hiding a URL/public key is a UI simplification, not a security boundary.
Backend write-token checks and read-token checks remain the access controls.
The copied overlay URL is read-only but should still be treated as private.

DESIGN
Normal cards: amount -> action artwork -> gift image; all columns horizontal.
Bundles preserve their ordered values (1/5x, 5/30x). Four equal Hunter entries
use the sample's total (10 each = 40x); unequal Hunter counts remain separate.
Likes have a dynamically rendered heart number; Follow uses follow.png.
Social triggers never render a TikTok gift underneath their social artwork.
WIN cards follow Sample Output 2: signed amount and gift, with no invented icon.
The Action icon guide is a legend only and is not used as a layout or sprite.

IMAGES
Original action PNGs are bundled unchanged. For the currently configured gifts,
the supplied Sample Output sheets provide a local, deterministic fallback when
TikFinity's catalog has no image URL. Rectangles are composed at runtime; white
connected to the sheet background is made transparent. Their small source sizes
limit detail at high enlargement. Refreshed HTTPS catalog images take priority.
Other gifts need an HTTPS image URL from catalog sync; if unavailable, a compact
gift-name fallback identifies the missing gift instead of substituting artwork.

VERIFICATION STATUS
Desktop preview and PNG outputs were rendered and visually inspected for normal,
all-Hunters, selected-action, Likes 100/500/1000, Follow and WIN cases.
Python publisher/render tests and hosted schema-1/schema-2 contract tests passed.
QA images are fixture renders, not proof of a new live publish.
The test browser rejected the local test server: net::ERR_BLOCKED_BY_CLIENT.
Automatic GitHub writing was blocked previously: 403 Resource not accessible
by integration. This new website revision has NOT been deployed or verified
in the HTTPS browser/TikTok LIVE Studio yet. Those checks remain after upload.
