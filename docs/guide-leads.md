# Field-guide lead card

The site offers one guide, **Clarity Before Change**, for a name and a work email (D-56). On submit the PDF downloads in the visitor's browser and the lead is written to a Google Sheet. No email is sent. This page is the operating manual: how the pieces fit, how to switch it on, what the sheet records, and how to change the guide.

The behavior is ported from the True Lean Solutions site (`True-Lean-Solutions/TLS-Website`: `GuidePrompt.astro`, `GuideForm.astro`, `guide-leads.gs`). Its look, colors and copy are Tech Transpire's own.

## How it fits together

| Piece | Where | What it does |
|---|---|---|
| Guide settings | `site/src/data/guide.ts` | The copy (kicker, title, promise, facts, button), the Insights post the title links to, the PDF's path and download name, the pages where the tab never offers itself |
| Endpoint | `GUIDE_ENDPOINT` in `site/src/lib/site.ts` | The Apps Script `/exec` URL. **Empty means off:** no tab, no card, no footer link, and no script loaded |
| PDF | `site/public/guides/clarity-before-change-field-guide.pdf` | Served from the site itself. The card also stays off while this file is missing |
| Tab, card and form | `site/src/components/GuidePrompt.astro` | Markup and styles. Rendered by `site/src/layouts/Base.astro` only while the guide is enabled |
| Behavior | `site/src/scripts/guide.ts` | The tab, when it nudges, the form, the download, the glass. Re-wired on every page, including client-side navigations |
| Footer link | `site/src/components/Footer.astro` | "Free field guide" in the legal bar opens the card on any page |
| Glass | `GuidePrompt.astro` (CSS and an SVG filter) and `scripts/guide.ts` | Transparent glass over the live page. See "The glass" below |
| Script | `docs/apps-script/guide-leads.gs` | Checks for spam and writes the lead to the sheet. This file is the copy of record |

## What the visitor sees

- A one-line tab at the bottom right of every page, where sites usually put a chat launcher (Tech Transpire has no bot): a document icon in a blue disc, "Free field guide" and an arrow. It is there from page load and never leaves: scrolling doesn't move it, and it has no ×. It is not a pop-up: no overlay, no backdrop, no focus steal, no scroll lock. Not on Contact, Privacy Policy or the 404 page.
- The × on the open card (or Escape) folds it back into the tab. Focus returns to the tab, or to the footer link if the card was opened from there.
- The tab is firmer than the open card (denser glass, a blue rim) so it stays visible over pale sections. The footer's last line is padded so the tab never covers it at the bottom of a page.
- To be noticed, the tab nudges once 30% of the page is scrolled or 20 seconds have passed, whichever comes first: a short shake with a soft blue ring, then again every 8 seconds, four times in all. It stops for good on that page as soon as the visitor hovers over it, focuses it or opens it. With reduced motion there is no shake, just a steady ring. Not while the visitor is typing in a field.
- The nudge runs once per browser session and in at most three sessions in 14 days. Folding the card away without downloading counts as "not now": no nudges for 14 days. After a download it never nudges again on that browser. The tab itself stays in every case.
- On the home page the section rail shares the right edge; it fades out while the card is open, so the two never overlap.
- The tab opens a compact card: kicker, the title (linking to *You Don't Have an Execution Problem. You're Executing the Wrong Plan.*), the promise, three fact chips, then Name, Work email and "Download the guide".
- On submit the PDF downloads at once and the card reads "Your guide is downloading." with a plain link to the same file. Reopening the tab on that page shows the same confirmation.
- State lives in `localStorage` (`tt:guide:done`, `tt:guide:dismissed` for "not now", `tt:guide:shown` for nudging sessions) and `sessionStorage` (`tt:guide:on`, set once the tab has nudged in this session). It only governs the nudge; the tab shows regardless. With storage blocked, every visit behaves as the first.

## The glass

The card is real glass over the live page: what is behind it shows through, blurred and colour-boosted (`backdrop-filter: blur(18px) saturate(180%)`), with a specular sheen across the top-left and a light rim.

- **Chrome and Edge** also bend the page along the card's rim, with a slight colour split, like the edge of a lens. An SVG displacement filter does this (`#gd-refract` in `GuidePrompt.astro`). `scripts/guide.ts` draws its map to the card's exact size and corner radius, and redraws it whenever the card changes shape.
- **Safari and Firefox** don't support SVG filters in `backdrop-filter`, so they get the same transparent glass without the bent edge.
- The site's WebGL engine (`site/src/vendor/liquid-glass.js`) is not used here. It can only refract a picture it draws itself, not the live page, so it made the card look like a solid pale panel.

Because the page shows through, the glass changes tone with what is behind it so text keeps WCAG AA. `scripts/guide.ts` samples the page under the card on scroll and resize:

| Tone | When | Glass |
|---|---|---|
| `clear` | A light part of the page | 50% white |
| `dense` | Photos, canvases, or light and dark mixed | 84% white |
| `dark` | Mostly navy (Results band, CTA band, footer) | 80% navy, with white text |

Contrast was measured from rendered pixels over each case: light sections, the navy band, half over the navy band, the footer, and the advisor portraits. The lowest result was 4.69:1, for blue text over the darkest part of a portrait.

## Switching it on

1. **Put the designed PDF in place:** `site/public/guides/clarity-before-change-field-guide.pdf`. Check that it has no internal notes, and that the card's facts ("4 practical steps", "4 printable worksheets", "A 30-day plan") match it.
2. **Add a clause to the Privacy Policy** covering this collection (name and work email for the guide, follow-up email, kept in a Google Sheet). See the open item in D-56.
3. **Install the script.** Use a Google account that can edit the spreadsheet "TLS LEADS From Website".
   1. Open that spreadsheet and choose Extensions → Apps Script. This creates a script bound to that spreadsheet.
   2. Replace the editor's contents with `docs/apps-script/guide-leads.gs`, then save.
   3. Run `testSpamRules`. The last log line should read "All spam rules pass". It writes nothing.
   4. Run `writeTestRow` and approve the one permission it asks for (this spreadsheet). Check that the test row is in the "TT Guide Leads" tab, then delete the row.
   5. Choose Deploy → New deployment → Web app, with "Execute as: Me" and "Who has access: Anyone". Deploy, then copy the URL ending in `/exec`.
4. **Set `GUIDE_ENDPOINT`** in `site/src/lib/site.ts` to that URL. Open a pull request, merge it, and deploy the site.
5. **Test on the live site.** Ask for the guide. The PDF should download and a row should appear in "TT Guide Leads".

The script creates the "TT Guide Leads" and "TT Guide Leads Rejected" tabs the first time it needs them. It never writes to the TLS tabs ("Guide Leads", "Guide Leads Rejected", "Rejected") in the same spreadsheet.

To change the script later, use Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy, so the URL stays the same. Keep `docs/apps-script/guide-leads.gs` as the copy of record.

## What the site sends

A fire-and-forget `POST` of `URLSearchParams` (never JSON) with these fields:

| Field | Value |
|---|---|
| `form` | `tt-guide` |
| `guide` | `clarity-before-change` |
| `source` | `popup` |
| `page` | The page path |
| `name`, `email` | What the visitor entered |
| `website` | The honeypot, sent empty. If a bot fills it, the browser shows the confirmation and sends and downloads nothing |
| `form_ts` | `Date.now()` when the page loaded |
| `notice_shown` | ISO time the notice under the button was first on screen |
| `submitted` | ISO time of the submit |

## What the sheet records

**TT Guide Leads:** Submitted At (UTC), Name, Email (lower case), Guide, Page, Source, Notice Shown At (UTC), and Asked Before ("Yes" when the same address already asked for this guide).

**TT Guide Leads Rejected:** posts the script treated as spam, with the reason:

| Reason | Meaning |
|---|---|
| `wrong_form` | Not this form |
| `honeypot` | The honeypot was filled |
| `form_ts_missing` | No load time |
| `submitted_missing` | No submit time |
| `too_fast` | Under 3 seconds from load to submit |
| `form_ts_stale` | The page was open more than 7 days |
| `form_ts_future` | The visitor's clock is more than 10 minutes ahead of the server's |
| `unknown_guide` | A guide id the script doesn't list |
| `name_missing` | Name under 2 characters |
| `name_has_link` | A link in the name |
| `email_invalid` | Not one plausible address |

Every cell is guarded against formulas (`=`, `+`, `-`, `@` become text) and capped at 45,000 characters.

The download does not depend on the address, so some rows will carry mistyped or made-up emails. Nothing checks them.

There is no consent checkbox (Hemang's decision). The line under the button says Tech Transpire may email to follow up, and "Notice Shown At" records when that line was on the visitor's screen. The Contact form does use a consent checkbox.

## Changing the guide

1. Put the new PDF in `site/public/guides/`.
2. Update `site/src/data/guide.ts`, giving it a new `id`.
3. Add the same `id` and its title to `GUIDES` in the script, then publish a new version of the existing deployment.
