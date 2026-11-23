# Tech Transpire website

Astro 5 rebuild of www.techtranspire.com (Tech Transpire, a DBA of Akhani LLC, Dallas–Fort Worth). Read [HANDOFF.md](HANDOFF.md) first; decisions live in [docs/website-architecture/12-gaps-and-decisions.md](docs/website-architecture/12-gaps-and-decisions.md) (D-xx rows). There is no `docs/decisions.md`.

## Rules
- The repository is public: no secrets, no Word files (gitignored), no residential address, no pricing.
- Content is verbatim from the source documents; wording changes only through [17-approved-corrections-log.md](docs/website-architecture/17-approved-corrections-log.md).
- Claims publish only when verified in `site/src/data/publication.json`. Never invent achievements, credentials, clients, testimonials or metrics.
- Never show a success message the server did not confirm. Two deliberate exceptions: a filled honeypot (below), and the field-guide card, whose "Your guide is downloading." describes the visitor's own download, not the lead being saved (D-56).
- Do not deploy to production without explicit authorization.

## Builds (run from `site/`)
- Review: `astro build` → `dist` · Public: `SITE_MODE=public` → `dist-public` · Production (GitHub Pages): `PAGES=1 SITE_MODE=public` → `dist-pages`, then `scripts/pages-finalize.mjs dist-pages`, then `scripts/deploy-pages.mjs`.
- Tests: `node --experimental-strip-types --no-warnings --test tests/inquiry.test.ts`.

## Forms
Two forms: the Contact form below, and the field-guide card (D-56), whose contract is the next section.

## Contact form contract (D-12, D-50, D-55)
`site/src/pages/contact-us.astro`. It posts JSON with `fetch` to `inquiryEndpoint` (`site/src/lib/site.ts`):
- production (GitHub Pages): the Google Apps Script web app in `apps-script/contact-form.gs`, sent as `text/plain` (no CORS preflight);
- a Node host: `/api/inquiry` (`site/src/server/inquiry.ts`), sent as `application/json`.

Fields sent: `name`, `company`, `email`, `phone`, `areaOfInterest`, `message`, `source`, `consent`, plus the spam fields:
- `website`: honeypot. Off-screen wrapper (`.hp`, not `display:none`), `aria-hidden`, `tabindex=-1`, `autocomplete=off`. Never name a honeypot with "company", "name", "email", "phone" or "address": Chrome autofill fills those and real leads would be dropped. If it is filled in the browser, show the normal success and send nothing.
- `form_ts`: `Date.now()` at page load (10–15 digits).
- `submitted`: `new Date().toISOString()` at send time.
- `startedAt`: legacy copy of `form_ts` for the Apps Script Version 4; remove once Version 5 is deployed.

Replies: `{ ok: true }` | `{ ok: false, reason: 'validation', errors: { field: message } }` | `{ ok: false, reason: 'bad-request' | 'rate-limited' | 'server-error' }`. Apps Script always answers HTTP 200, so the site reads `ok`/`reason`, never the status.

Server spam rules (`spamCheck_` in the Apps Script and `spamCheck` in `inquiry.ts` must stay identical): run first, before the rate limit, any sheet write or email; reasons `honeypot`, `form_ts_missing`, `form_ts_invalid`, `submitted_missing`, `submitted_invalid`, `too_fast` (`submitted − form_ts` < 3 s), `too_old` (server now − `form_ts` > 8 days). A rejection returns the same `{ ok: true }`, sends no email, never writes the "Website Inquiries" tab, is not counted by the rate limit, and is logged to the **Rejected_TT** tab. Never write to "Rejected": the TLS site's script owns that tab in the same spreadsheet.

Storage and mail: spreadsheet `1dNaI5ntcUzhuaF4FFx5XGKIac5K9SLcuBqVQwdRYqBY`, tab "Website Inquiries"; email to info@techtranspire.com, subject `New website inquiry: {name} ({company})`. Every sheet value goes through `safeCell_`. `website`, `form_ts`, `submitted` and `startedAt` never appear in the email or the main row.

Deploying the Apps Script: Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy. Never "New deployment": it changes the /exec URL the site posts to.

## Field-guide card contract (D-56)
Operating manual: [docs/guide-leads.md](docs/guide-leads.md). One guide, set in `site/src/data/guide.ts`; endpoint `GUIDE_ENDPOINT` in `site/src/lib/site.ts`. **Empty endpoint (or missing PDF at `site/public/guides/`) means off:** no tab, no card, no footer link, no script on any page.
- Tab bottom-right (chat-launcher position; there is no bot), with a short shake-and-ring nudge (4 times, 8 s apart, stops on hover/focus/open; steady ring under reduced motion). Opens a compact card (`GuidePrompt.astro`, behavior in `scripts/guide.ts`). Not a modal: no overlay, no focus steal, no scroll lock. Never overlaps the header, reading progress or section rail.
- Offers itself after 30% scroll or 20 s; not on /contact-us, /privacy-policy, 404, or while a field has focus; at most 3 times in 14 days; hidden 14 days after a dismissal; never again after a download. All storage access in try/catch.
- Submit: the PDF downloads inside the submit handler (same-site file), then a fire-and-forget `POST` of `URLSearchParams` (never JSON) with `form=tt-guide`, `guide`, `source=popup`, `page`, `name`, `email`, `website` (honeypot, empty), `form_ts`, `notice_shown`, `submitted`. A filled honeypot shows the confirmation and sends and downloads nothing. No email is sent to the visitor.
- No consent checkbox (Hemang's decision): the notice line under the button is the disclosure. The Contact form keeps its checkbox.
- Server: `docs/apps-script/guide-leads.gs`, bound to the "TLS LEADS From Website" spreadsheet; tabs "TT Guide Leads" and "TT Guide Leads Rejected" only. Always answers `ok`.
- Glass: transparent over the live page (`backdrop-filter` blur + saturate), plus SVG rim refraction (`#gd-refract`) in Chromium only. Not the WebGL engine: it cannot refract live DOM. Tone (`clear` / `dense` / `dark`) follows what is behind the card so text keeps WCAG AA; re-measure contrast if the fills or text colours change. The home section rail fades out while the card is open.
