# 05 — Production Readiness Checklist

**2026-10-29.** ☑ done and verified (evidence given) · ◐ partly done · ☐ open. **Launch requires every Blocker to be ☑ and explicit authorization to deploy.** Nothing has been deployed.

Run the automated part with `cd site && npm run validate` (CI runs it on every push) and, with a preview server running, `npm run qa`.

## Content

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| C-1 | Every archived line renders verbatim (after approved corrections only) | Yes | ☑ | `check:content`: 545 lines, review build |
| C-2 | Approved corrections applied exactly and logged | Yes | ☑ | 17; build fails on any mismatch |
| C-3 | No unverified claim in the public build | Yes | ☑ | `check:content` gating: 8 held articles absent, no result figures, no C-15 tags, no withdrawn label |
| C-4 | H-01 "three times…" (Home card) | Yes | ☐ | Company: confirm a source or approve an omission (19) |
| C-5 | H-04 "within 2 to 6 weeks" (Expertise) and C-15 "6-8 weeks" | Yes | ☐ | Company: confirm current timeframes |
| C-6 | H-05 "within 1 business day" (Contact, success message) | Yes | ☐ | Company: confirm (C-17) |
| C-7 | Articles: verify claims or approve omissions so more than 2 articles publish | No (site works with 2) | ☐ | Mack; fastest path in 19 |
| C-8 | New copy approvals: N-02 theme lines, "What we help you achieve", "Selected Experience" intro line, N-04, N-05 Healthcare, N-06, N-13, N-14, N-16, N-17, small UI labels | Partly | ☐ | Company. Public build hides N-02 lines; others render as drafted |
| C-9 | Leadership profiles confirmed (C-10, C-12, C-13, C-20) with approved photos | No (section hidden until then) | ☐ | Each person; Mack's photo file |
| C-10 | Healthcare page (N-05) approved, which shows Industries in the nav | No | ☐ | Company |
| C-11 | Hero and closing-band photography added, with ownership/licence confirmed | Yes (design) | ☐ | Company: two files to `docs/phase-2-design/assets/` |

## Legal

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| L-1 | Privacy Policy reviewed and published; consent text links to it | Yes | ◐ | Approved by the company and published 2026-11-02 (D-50); `check:content` now fails if it is missing. Counsel review still recommended |
| L-2 | Akhani LLC footer line and About paragraph wording | Yes | ☐ | Counsel (N-06) |
| L-3 | Accessibility statement, Terms (N-08) | Recommended | ☐ | After hosting/analytics are known |
| L-4 | Image usage rights for all published images (`data/assets.csv`) | Yes | ☐ | Company. Article covers are company-made; confirm |

## Accessibility (target WCAG 2.2 AA)

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| A-1 | Semantic landmarks, one H1 per page, skip link, breadcrumbs with `aria-current` | Yes | ☑ | Templates; reviewed in code |
| A-2 | Keyboard: menu (Escape, focus return), method nodes, form | Yes | ☑ | `npm run qa` |
| A-3 | Reduced motion: no hidden content, no pointer effects, final SVG states | Yes | ☑ | `npm run qa` (0 hidden) |
| A-4 | Form: visible labels, inline errors tied to fields, error summary focus, no placeholder-only labels | Yes | ☑ | `npm run qa` |
| A-5 | Colour contrast of text tokens (muted text ≥ 4.5:1 on paper and mist; white on navy) | Yes | ◐ | Checked by calculation for core tokens; run an automated audit |
| A-6 | Automated audit (axe) of every template, plus a manual screen-reader pass | Yes | ☐ | Next step: add axe to `npm run qa` |
| A-7 | Alt text: portraits named; decorative images empty; hero photo described | Yes | ◐ | Done in templates; N-11 text for article covers to review |

## Functionality

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| F-1 | **Contact form end-to-end: real inquiry stored and real email received** | **Yes** | ☐ | D-50: Apps Script → Sheet + email. Redeploy `apps-script/contact-form.gs` as a new version, then submit one real test from the live site |
| F-2 | Contact backend logic | Yes | ☑ | `npm test` 14/14 |
| F-3 | No false success; failure message keeps input | Yes | ☑ | `npm run qa` (503 → failure) |
| F-4 | Internal links and anchors resolve, both builds | Yes | ☑ | `check:links`: 924 review / 271 public links |
| F-5 | External links (LinkedIn, Microsoft Bookings) reachable | Yes | ☐ | `node scripts/check-links.mjs dist-public/client --external` on a networked machine |
| F-6 | Legacy redirects (`/home`, `/blogs`, `/about`, `/contact`, `/expertise`, `/case-studies`, `/blog`) return 301 | Yes | ◐ | `npm run qa` verified `/home` and `/blogs`; the rest come from the same config |
| F-7 | Host-level rules: apex → www, http → https, trailing-slash 301s | Yes | ☑ | GitHub Pages: apex → www, http → https and /page → /page/ all 301 (verified 2026-11-02); page links already carry the slash |
| F-8 | No JS errors or horizontal overflow, 320–1440px | Yes | ☑ | `npm run qa` (12 routes × 2 widths) and screenshots (3 widths) |

## SEO

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| S-1 | All five live URLs preserved; articles at `/insights/{slug}` | Yes | ☑ | Build output |
| S-2 | Unique titles and meta descriptions (N-10 drafts) | Yes | ◐ | Implemented; N-10 wording to approve |
| S-3 | Canonical, Open Graph, Twitter tags | Yes | ☑ | Base layout |
| S-4 | Structured data: ProfessionalService (with Dallas–Fort Worth), Service, Article, BreadcrumbList | Yes | ☑ | Base layout and templates; validate with Google's Rich Results Test on staging |
| S-5 | `sitemap-index.xml` (public only); robots: review `Disallow`, public `Allow` + sitemap | Yes | ☑ | Build output |
| S-6 | Held articles: decide 301 targets for their old modal URLs, or leave them unlinked | No | ☐ | They never had standalone URLs; nothing to redirect today |
| S-7 | Search Console set up; baseline before cut-over | Yes | ☐ | Launch step (13) |

## Security and privacy

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| P-1 | No secrets in repo or browser bundle; `.env*` ignored; `.env.example` has no values | Yes | ☑ | Repository; server reads `process.env` only |
| P-2 | CSRF: JSON-only form posting; Astro origin check for form posts | Yes | ☑ | `npm run qa` |
| P-3 | Spam: honeypot, 3-second minimum, per-IP rate limit | Yes | ☑ | `npm test` |
| P-4 | No personal data in logs or analytics | Yes | ☑ | Endpoint logs outcomes only; no analytics installed |
| P-5 | Security headers on the host (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, CSP) | Yes | ☐ | Not possible on GitHub Pages (D-50); accepted for launch. Revisit with a host that supports headers |
| P-6 | Dependency audit (`npm audit`) clean or accepted | Yes | ☐ | Before launch |
| P-7 | Analytics and consent (if any analytics is added) | If used | ☐ | D-16 open; Privacy Policy must match |

## Performance

| # | Item | Blocker | Status | Evidence / owner |
|---|---|---|---|---|
| R-1 | Static pages; JS 4–6 KB inline per page (≤ 2.3 KB gz); CSS 10.5 KB gz; self-hosted fonts | — | ☑ | Measured on the public build |
| R-2 | Responsive images (AVIF/WebP via `astro:assets`), lazy below the fold, hero preloaded with high priority | Yes | ☑ | Templates |
| R-3 | Lighthouse ≥ 90 (mobile) for Performance, Accessibility, Best Practices, SEO on Home, Expertise, an article and Contact; LCP < 2.5 s, CLS < 0.1 | Yes | ☐ | Run on staging **after** the hero photo is added (it is the LCP element) |
| R-4 | Animations limited to transform/opacity; no continuous layout animation | — | ☑ | CSS review |

## Launch operations (13 §2, 15)

| # | Item | Blocker | Status |
|---|---|---|---|
| O-1 | Hosting chosen; adapter set; staging URL shared with the team | Yes | ☑ GitHub Pages, static (D-50) |
| O-2 | Live-site fixes R-01–R-06 (owner actions, 15) | Yes | ☐ |
| O-3 | Export existing Apps Script form submissions before cut-over | Yes | ☐ |
| O-4 | DNS cut-over plan; rollback plan | Yes | ☐ |
| O-5 | Post-launch checks at 1 day / 2 weeks / 6 weeks | — | ☐ |
| O-6 | **Explicit authorization to deploy** | Yes | ☑ Mack Akhani, 2026-11-02 (D-50) |
