# Wedding invitation website — editable first iteration

A mobile-first, traditional South Indian wedding invitation made with plain HTML, CSS and JavaScript. No Node.js, framework, paid service, or build step is required. Artwork is layered PNG so you can replace each element without editing the code.

## Edit your invitation

1. Open `config.js` in a text editor (VS Code is ideal).
2. Change the bride/groom names, date, time, invitation copy, venue name/address, map query, and footer line.
3. Set `calendarStart` and `calendarEnd` in ISO format to create a timed Google Calendar event. If only `calendarStart` is set as `YYYY-MM-DD`, the link creates an all-day event and includes `eventTime` in its details.
4. Keep the filenames the same, or update the matching path in `config.js` / `index.html` if you rename an asset.

All visible invitation wording is in `config.js`; layout and typography are in `styles.css`; RSVP and map/music behavior are in `script.js`.

## Replace the PNG artwork

Replace these transparent PNG files with your own artwork (keeping the same filename is easiest):

- `assets/ceremonial-toran.png` — the standalone marigold/jasmine garland and brass-bell artwork.
- `assets/botanical-lotus-corner.png` — the lotus and leaf artwork used in the lower corners. The right side is mirrored in CSS.
- `assets/botanical-watercolor-frame.png` — the full transparent watercolor frame, fitted inside the hero's gold border.
- `assets/ganesha.png` — the enhanced transparent gold-line Ganesha illustration.

The three Telugu blessings are editable HTML text at the top of the invitation. The artwork library in `../wedding-invitation-artwork/` contains the reusable toranam SVG and supplied Ganesha PNG.

For best results, use transparent PNGs with generous empty space around the decoration. No invitation text should be baked into the images: keeping text as HTML makes it editable and accessible.

## Add background music

The invitation uses `assets/wedding-music.mp3`. Playback is attempted when the page loads, and guests can use the discreet bottom-corner play/pause control. Some browsers block audio autoplay until a guest taps Play.

## Preview locally

Open `index.html` in a modern browser. The map needs an internet connection. In this preview, the RSVP animation works, but responses are not stored until you configure the endpoint described next.

## Configure a private Google Sheets RSVP register

This starter uses Google Apps Script to append each submitted guest name to a private Google Sheet and assign a sequential response number. There is no 500-response cutoff; 500 is only the expected scale. The public page can submit names but cannot read the register or count back.

1. Create a Google Sheet (for example, `Wedding RSVPs`).
2. Copy the long ID in its URL between `/d/` and `/edit`.
3. Open [script.google.com](https://script.google.com), create a project, and paste `backend/Code.gs` into the editor.
4. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with your sheet ID. Save.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account. Set access to **Anyone** so invitees can RSVP without Google sign-in. Authorize the script.
6. Copy the deployed Web app URL ending in `/exec` into `rsvpEndpoint` in `config.js`.
7. Submit a test response and check that a new row appears in the private sheet with a response number, timestamp, and guest name. Remove the test row before sharing with guests if you do not want it counted.

The response number is assigned under a script lock so simultaneous submissions do not receive the same number. For a total, use `=COUNTA(C2:C)` in a summary cell (column C contains guest names). You can export the register with **File → Download → Microsoft Excel (.xlsx)**.

### Privacy and abuse notes

Because the invitation is public, the RSVP endpoint must accept submissions from people who are not signed into your Google account. The starter validates fields and has a honeypot but is not a high-assurance anti-spam system; a determined person could submit fake rows. Keep the spreadsheet sharing set to **Restricted**, don't put the sheet ID or sheet link on the website, and check responses periodically. Do not collect sensitive information in this RSVP form. The invitation page deliberately does not offer a public attendance-count endpoint.

The static page uses a cross-origin `no-cors` request to Apps Script, so the browser cannot inspect the server response. After setup, verify the first live RSVP in the Sheet before distributing the link widely.

## Host on GitHub Pages

1. Create a GitHub repository, ideally named something private to the event if your plan supports Pages from private repos. The published invitation itself is necessarily public to anyone with the link.
2. Upload the contents of this folder to the repository root (the `index.html` must be at the root).
3. In repository **Settings → Pages**, choose the branch and `/ (root)` folder, then Save.
4. Wait for GitHub Pages to publish the site and open the generated `https://<username>.github.io/<repository>/` address. Share that HTTPS URL.

GitHub Pages hosts the front end only; it does not store RSVP responses. The Google Sheet remains separate and private. Review the repo before publishing: everything in it, including `config.js` and images, is public. Never place private guest lists, Google Sheet URLs with sharing access, credentials, tokens, or the actual spreadsheet ID in the front-end repository.

## Visual inspiration

The visual direction takes cues from South Indian invitation stationery that pairs marigold/jasmine garlands, banana leaves and lotus illustrations with cream paper and restrained gold accents. See the README's original research references below; the included PNG decorations were created for this starter and are replaceable.

- Pinterest — Chitrasutra-style Madurai wedding invitation / lotus inspiration: https://in.pinterest.com/pin/the-madurai-wedding-chitrasutra-style-invitation-in-2023--798896421420929583/
- Pinterest — hand-painted watercolor Indian invitation inspiration: https://in.pinterest.com/pin/indian-wedding-invitation-with-handpainted-watercolor--503418064602158715/
- South Indian wedding invitation with lotus and garland illustrations: https://www.behance.net/gallery/151033799/South-Indian-Wedding-Invitation
- Banana leaves, marigold and traditional Indian invitation inspiration: https://www.etsy.com/listing/4458864906/banana-leaves-south-indian-wedding
- Google Apps Script Web Apps documentation: https://developers.google.com/apps-script/guides/web
- GitHub Pages overview: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
