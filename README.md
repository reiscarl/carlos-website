# carlosreis.com.au

Personal site for Carlos Reis. Plain HTML, CSS and vanilla JavaScript. No build step, no framework, no dependencies.

## Versions

Each version lives in its own folder so earlier work can always be recovered.

| Folder | Status |
| --- | --- |
| `carlos-website` | v1. First rebuild off Carrd. Archived. |
| `carlos-website-v2` | v2. Added HubSpot live chat. Archived. |
| `carlos-website-v3` | v3. Current. This folder is the one connected to GitHub. |

Only ever edit and push from the highest-numbered folder.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site. One page. |
| `privacy.html` | Privacy and cookie notice. |
| `404.html` | Error page. GitHub Pages serves this automatically. |
| `styles.css` | All styling, including the design tokens at the top. |
| `main.js` | Stat count-up, mobile menu, active nav, cookie consent. |
| `fonts/` | Self-hosted Fraunces and Inter (latin subsets, variable). |
| `images/headshot.jpg` | Portrait as displayed: 800x1000, centre-cropped to 4:5. Tone is untouched, only the crop and size differ from the source. |
| `images/headshot-source.jpg` | The original square photo, kept so the display version can be regenerated. |
| `images/share-card.png` | 1200x630 preview shown when the link is shared. |
| `CNAME` | Custom domain for GitHub Pages. Do not delete. |

## Changing the design

The colours, fonts and page width are CSS custom properties at the top of `styles.css`, under `:root`. Change them there rather than hunting through the file.

## Cookies and HubSpot

HubSpot is not loaded until a visitor presses Accept on the cookie banner. The portal ID lives in `main.js` as `HUBSPOT_SRC`. Declining means the script is never loaded, so no HubSpot cookies are set and the live chat does not appear.

If a visitor accepts and later declines, `clearHubSpotCookies()` in `main.js` deletes the cookies HubSpot set before reloading. The list of cookie names is `HUBSPOT_COOKIES`; if HubSpot changes what it sets, that list needs updating.

HubSpot has its own cookie-banner feature in the portal settings. Leave it switched off, or visitors get two banners and HubSpot's will set cookies outside this gate.

## Regenerating the share card

The preview image was rendered from an HTML source file with headless Chrome at 1200x630. If the headline or photo changes, the card should be regenerated to match.

## Deploying

Committing and pushing to `main` publishes to carlosreis.com.au through GitHub Pages. Allow a couple of minutes, then hard refresh.
