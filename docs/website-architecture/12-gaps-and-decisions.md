# 12 — Content Gaps, Decisions and Approval Register

**Version 1.1, updated 2026-10-29 with the company's decisions.**

This register keeps **source facts**, **recommendations** and **decisions** separate. Other documents refer to its items by ID: D-xx decisions · C-xx claims · E-xx editorial corrections · N-xx proposed new content · MS-xx missing sources.

**Governing rule (company, 2026-10-29):** unverified metrics and credentials stay in the source material, **flagged as pending**. They are never deleted, and never published until verified. Structural work does not wait on them.

Status key: ✅ approved · ✅◐ approved with condition · ⏳ pending evidence or confirmation · 🟦 recommended, awaiting sign-off · ✖ withdrawn or not recommended

---

## 1. Existing and verified content

Everything below is captured verbatim in [`source-archive/`](source-archive/) and may be migrated without rewording.

| Item | Source blocks |
|---|---|
| Home problem statements ("Sounds Familiar?" carousel) | TT-PG-001-B01 |
| Home positioning: "Clarity before Execution." + two subtext lines | TT-PG-001-B02 |
| Six problem cards | TT-PG-001-B03 |
| "Our Method" + five method steps | TT-PG-001-B04, B05 |
| "The outcome" callout | TT-PG-001-B06 |
| Fit list (5 yes / 5 no) | TT-PG-001-B07 = TT-PG-002-B06 |
| Signature offer, four engagement types, six components | TT-PG-002-B01–B05 |
| Our Story, Our Values, Our Message | TT-PG-004-B02, B03, B05 |
| Four team profiles | TT-PG-004-B04 (publication gated, see §3) |
| Contact details, booking link, "What happens next" | TT-PG-005-B02–B04 |
| Ten published Insights articles. **Reconciled 2026-10-29:** the ten `.docx` originals in the Drive "Blogs and case studies" folder are word-for-word identical to the published text | TT-INS-001 … 010 |
| 17 site images + 5 logo files (logo folder) | [`data/assets.csv`](data/assets.csv), `source-archive/assets/logo/` |

## 2. Existing but incomplete

| ID | Item | What is missing | Status |
|---|---|---|---|
| G-01 | Page metadata | No meta descriptions; generic titles | Drafts in N-10 |
| G-02 | Image alt text | None in any source | Rules in N-11 |
| G-03 | Article dates | No "last updated"; inconsistent formats | Normalized in the model (E-08) |
| G-04 | Article taxonomy | Type and topic mixed in one field | Resolved in 09 |
| G-05 | Service detail | Components are single cards | Accepted for launch (D-02): no extra pages except Transformation Recovery |
| G-06 | Industry content | No industry descriptions | Healthcare draft built from existing evidence (N-05) |
| G-07 | "Hidden Gaps" draft | No body text | Held (D-10) |
| G-08 | Logo | — | **Resolved**: 5 logo files received (MS-03 closed) |
| G-09 | Contact form | — | **Resolved in spec**: new field set approved (D-12) |
| G-10 | Footer / legal | None exists | Footer line approved (D-08); Privacy draft prepared (D-13) |
| G-11 | Master Drive folder | Reviewed 2026-10-29 through the company's Google account (not shared publicly) | **Closed** (MS-01). Live pages match the archive; a superseded May 2026 draft and new photography are recorded in [18](18-drive-master-reconciliation.md) |

## 3. Claims and credentials register

Nothing in this table is published until its status is ✅. Pending items stay in the source and in the content model with `verification_status: pending`. The build refuses to render them (B-17).

| ID | Claim (exact source wording) | Where | Status | What is needed / decision |
|---|---|---|---|---|
| C-01 | "$3M+ — Revenue impact from founder-led transformation engagements" | TT-PG-001-B08 | ✖ **Label withdrawn** (company: do not describe as "$3M revenue impact" or combine the two $3M outcomes) | Source text archived unchanged. Home shows instead whichever of C-02 / C-03 is verified, with its own label and attribution (wording in §4, N-15) |
| C-02 | "prevented $3M in fraud losses" | TT-PG-004-B04 (Mack Akhani bio) | ✅ **Verified** by company 2026-11-12 | Prior-role attribution applies (D-04) |
| C-03 | "$3M — Annual savings through preferred pricing and inventory optimization" | TT-INS-009-B05 | ⏳ Confirmed by company as a **separate** outcome (healthcare purchasing/standardization); pending supporting evidence | Also needs C-18 (pre-founding or not) |
| C-04 | "90+ Locations served in a single centralized supply chain engagement" | TT-PG-001-B08 | ⏳ | Consistent with TT-INS-009 ("over 80 clinics and 10 surgery centers"); needs evidence + C-18 |
| C-05 | "63% Reduction in median implementation time 209 days to 78 in one engagement" | TT-PG-001-B08; TT-INS-005; TT-INS-010; bio | ✅ **Verified** by company 2026-11-12 | TT-INS-005 is attributed pre-founding; C-18 still open for TT-INS-010 |
| C-06 | "$89M Annual purchasing volume centralized in a single healthcare network transformation" | TT-PG-001-B08; TT-INS-009; bio | ✅ **Verified** by company 2026-11-12 | C-18 still open for TT-INS-009 |
| C-07 | "7 yrs Stalled initiative closed 2 years ahead of schedule using structured Kaizen methodology" | TT-PG-001-B08; TT-INS-003; TT-INS-007 | ✅ **Verified** by company 2026-11-12 | TT-INS-003 is attributed pre-founding. TT-INS-007 separate engagement until C-18 confirmed |
| C-08 | "$311,000 in annual savings", "improved quality by 50%", division "subsequently acquired" | TT-INS-003-B07 | ⏳ | Evidence + confidentiality check |
| C-09 | "1,938 hours… 12 full-time employees"; "166 people in six countries" | TT-INS-004 | ⏳ | Evidence |
| C-10 | "over two decades of experience" (was "over a decade"; updated by the company 2026-10-30, D-35) | Mack Akhani bio | ✅ **Verified** by company 2026-11-12 | Bio timeline confirmed accurate |
| C-11 | Lean Six Sigma Black Belt ("LSSBB") | TT-INS-005 attribution line | ✅ **Confirmed** | May also appear on Mack's profile (wording to approve) |
| C-12 | "PMP Certified" | Kranthi Kumar Goli title | ✅ **Verified** by company 2026-11-12 | |
| C-13 | Bio details ("over five years…", "pursuing his Chartered Accountancy qualification", tools) | Devjet Bag bio | ✅ **Verified** by company 2026-11-12 | |
| C-14 | "Twelve other programs subsequently replicated it." | TT-INS-003-B06 | ⏳ In the original material; pending validation | Article publishes with this sentence **only** after validation. Until then: hold the article or approve a temporary omission (D-24) |
| C-15 | "6-8 weeks"; "within 2 to 6 weeks" | TT-PG-001-B06, TT-PG-002-B03/B04 | 🟦 | Confirm these are current service timeframes |
| C-16 | "We guarantee the rigor, clarity, and honesty behind every recommendation" | TT-PG-004-B05 | 🟦 | Guarantees process, not results; recommended to keep |
| C-17 | "Response within 1 business day" | TT-PG-005 | 🟦 | Confirm it can be met |
| **C-18** | Engagement identity and timing for TT-INS-007, 008, 009, 010 | Those articles (they have no attribution line) | ⏳ **New** | For each: (a) was it led before Tech Transpire was founded? If so, add the D-04 line. (b) Is it the same engagement as TT-INS-003 / 002 / 005? Until answered they are separate engagements, and none of their figures are combined with other articles |
| **C-19** | Source material for the $3M fraud-prevention outcome (global eCommerce) | Mentioned by the company; not on the site except the bio | ⏳ Source located (2026-10-29) | The May 2026 draft's "Fraud Prevention Program — Global eCommerce" summary ([18](18-drive-master-reconciliation.md)). A self-authored summary, not evidence: C-02 still needs supporting evidence |
| **C-20** | Hemang Dwivedi bio and title | TT-PG-004-B04 | ✅ **Verified** by company 2026-11-12 | |
| **C-21** | Leighton Anderson advisor bio | advisors.json | ✅ **Verified** by company 2026-11-12 | No photo supplied yet |

## 4. New content (N-xx)

Drafts are in [`drafts/`](drafts/).

| ID | Item | Status |
|---|---|---|
| N-01 | "Clarity Before Change. Confidence Through Execution." as primary brand statement | ✅ Approved (D-01) |
| N-02 | Outcome theme lines | Draft: [new-content-drafts.md](drafts/new-content-drafts.md#n-02--outcome-themes-home) |
| N-03 | Expertise introduction | ✖ Not needed; existing copy suffices |
| N-04 | Transformation Recovery page | Draft (one new sentence; the rest is existing text) |
| N-05 | Healthcare page | Draft: [healthcare-page-draft.md](drafts/healthcare-page-draft.md) |
| N-06 | Akhani LLC footer line + About paragraph | Draft (Option B recommended), subject to legal wording |
| N-07 | Privacy Policy | First draft: [privacy-policy-draft.md](drafts/privacy-policy-draft.md), for legal review |
| N-08 | Accessibility statement, Terms | Phase 3/4 |
| N-09 | Form consent, validation and failure messages | Draft |
| N-10 | Meta titles and descriptions | Draft |
| N-11 | Alt text | Rules drafted; text written at migration |
| N-12 | Listing summaries | ✖ Not needed; every article has an excerpt |
| N-13 | Referral note | Draft |
| N-14 | 404 page | Draft |
| **N-15** | Replacement Home stat labels for C-01 | ⏳ After C-02/C-03 are verified. Proposed pattern: "$3M — annual savings from purchasing standardization in a healthcare network" and/or "$3M — fraud losses prevented for a global eCommerce business", each followed by "Engagement led by Mack Akhani prior to founding Tech Transpire." where it applies |
| **N-16** | New "How did you hear about us?" options: "Event or presentation", "Existing client or colleague" | 🟦 |

## 5. Decisions

| ID | Decision | Status | Outcome / recommendation |
|---|---|---|---|
| D-01 | Primary positioning | ✅ **Approved** | Concept 06 line is the H1 on Home; "Clarity before Execution." kept in supporting content |
| D-02 | Expertise model | ✅ **Approved** | Built around the signature offer *Implementation Clarity & Execution Blueprint*, its four engagement types and six components. Not split into five services. The brief's five names are internal search/relationship aliases only (08 §4) |
| D-03 | AI & Digital Enablement | ✅ **Approved** | No page at launch; revisit when an offering and evidence exist |
| D-04 | Attribution of pre-founding results | ✅ **Approved** | Wording: "Engagement led by Mack Akhani prior to founding Tech Transpire." Applied wherever such a result appears (articles, Home stats, Healthcare page). Still to confirm which articles it covers (C-18) |
| D-05 | "$3M" | ✅ **Resolved** | Two separate outcomes, never combined, never labelled "revenue impact"; each pending evidence (C-02, C-03) |
| D-06 | Industries in navigation | ✅ **Approved** (2026-10-29, company) | Include Industries in the structure, Healthcare as the initial industry, built from **approved source content only** (no unverified claims). If sufficient approved content is not ready by launch, Industries is **hidden from primary navigation** until it is — the page and nav are specified for both the shown and hidden states (05), so this does not block Phase 2 |
| D-07 | Team profiles | ✅◐ | Mack: approved subject to C-10. Kranthi: pending C-12. Devjet: pending C-13. Hemang: confirm (C-20). Unconfirmed profiles are hidden, not deleted |
| D-08 | Akhani LLC disclosure | ✅ **Approved**, subject to legal wording | Footer line + short About paragraph; True Lean Solutions not promoted elsewhere |
| D-09 | Article titles (Sheet vs Doc) | ✅ **Approved** (2026-10-29) | Doc H1 as page H1; Sheet title as card and SEO title |
| D-10 | "Hidden Gaps" drafts | ✅ **Approved** (2026-10-29) | Held as draft; excluded from launch |
| D-11 | Editorial corrections | ✅ **Approved** (2026-10-29) | E-01–E-05 applied. E-02's intended word confirmed: "busywork". Exact record: [17](17-approved-corrections-log.md) |
| D-12 | Contact form | ✅ **Approved** | Fields: Name, Company, Work email, Phone (optional), Area of interest, Message, plus optional "How did you hear about us?" (Facebook kept) and consent. Annual revenue removed. Spam protection included. Spec in [06 §10](06-page-blueprints.md#10-contact) |
| D-13 | Legal pages | ✅◐ | Privacy Policy first draft prepared; legal review before publication. Accessibility and Terms in Phase 3/4 |
| D-14 | Fit list placement | ✅ **Approved** (2026-10-29) | Canonical on Expertise (`/services#fit`); Home shows a short teaser linking to it |
| D-15 | Platform and editing workflow | ✅ **Approved: Astro** (2026-10-29) | Must support the existing content models, SEO requirements, reusable components and a **secure server-side Zoho CRM integration**. Built in `site/`; record in [phase-2-design/02](../phase-2-design/02-technical-decision-record.md). Editing layer still decided once editors are named |
| D-16 | Form destination, CRM | ✅ **Approved**, subject to feasibility | Zoho CRM lead + email notification ([11 §4a](11-technical-architecture.md)). Open: analytics tool; Zoho data centre and API access |
| D-17 | Case-studies listing | ✅ **Approved** (2026-10-29) | `/insights/case-studies`. **No unverified financial results, statistics or achievements** on the listing itself: it shows the authored case studies (D-25) and adds no summary figures |
| D-18 | Outcome themes | ✅ **Approved** (2026-10-29) | The four themes are on the homepage. Insights filter only if enough correctly categorized content exists: the themes split 1 / 4–5 / 4 / 2 across 10 articles, so **no theme filter at launch**; Insights filters by content type. Add a theme filter when each theme has at least three articles |
| D-19 | Apex domain | ✅ **Approved** | In the remediation checklist (R-01, B-03), after DNS/hosting are confirmed |
| D-20 | "See Our Work" / `/blogs` CTAs | ✅ **Approved** | Interim live fix R-02/R-03 (owner action); new build points to `/insights/case-studies` |
| D-21 | Drive access | ✅◐ | Logo and Blogs folders received and reconciled; **master folder still private** |
| D-22 | Keep `/services`, label "Expertise" | ✅ **Approved** ("preserve existing valid URLs"); label superseded by D-41 | URL kept |
| **D-41** | Header matches the reference header (2026-11-01) | ✅ At the company's direction ("match it") | Primary nav is Home · About · Services · Insights · Contact Us, plain links with the current page in bold, then a search icon (site search over this build's pages and articles). "Expertise" becomes "Services" in the nav, footer, breadcrumbs and 404; page headings and the hero link "Explore Our Expertise" are unchanged. Industries leaves the header (footer and search keep it). The Contact button becomes the "Contact Us" link. Typeface stays Libre Franklin (D-28), not the reference's rounded sans |
| **D-42** | External review findings (2026-11-01) | ✅ Actioned (open items settled by D-43) | Privacy Policy draft no longer appears on the shared preview: shown only in an approval session (REVIEW_MARKERS=1) until counsel approves it (N-07). The GitHub Pages preview says its contact form does not deliver and gives the email address. "Photo coming soon" removed; cards without a photo show initials only. Insights filters already worked on the current preview. Open for the company: engagement duration wording (6–8 weeks vs 2–6 weeks discovery), qualifying strong claims, copy fixes ("Sounds Familiar?", "high-stake"; exact live wording was chosen 2026-10-30), production indexing at launch |
| **D-43** | Decisions on the external review (2026-11-01) | ✅ The company | **Engagement length:** the 6–8 weeks covers discovery and the execution blueprint; discovery typically takes 2–6 weeks within it, depending on complexity and stakeholder availability; guided implementation is scoped separately from the approved blueprint (shown on Services; C-15 verified). **Strong claims:** "Most transformation budgets are wasted…" becomes "Transformation budgets can be wasted before the first line of code is written."; the "three times" line becomes "By then, resolving the misalignment can be significantly more expensive than addressing it upfront." (H-01 withdrawn). **Copy fixes:** approved and applied through the corrections log (17): F-01–F-04, F-08–F-14. **noindex:** stays on the review site; remove at production launch and verify production canonical URLs. **Review preview form:** button reads "Send unavailable in preview" and submission is disabled; the email address stays clickable. Privacy draft handling and initials badges accepted for review. **Production launch requirements:** an approved Privacy Policy (N-07) and verified contact delivery (CRM/email receipt tested) |
| **D-44** | Wally Potts advisor profile: consulting, not technology (2026-11-01) | ◐ Draft, approve | At the company's direction ("Tech Transpire is a consulting firm; don't add anything about technology"), his role line is now "Advisor — Operational Turnaround & Enterprise Transformation" and his bio covers operating models, governance, cost and performance, organizational change and M&A only. Every fact comes from his resume and bio sheet supplied 2026-11-01: 15+ years across Fortune 50, federal, healthcare and PE-backed organizations; Ed.D in Organizational Change and Learning (Baylor); $140M+ savings, $80M in the first 90 days; $472M enterprise services portfolio; change across 6,000+ employees and contractors; Veterans Engineering backlog $6M to $170M+ and M&A execution for the sale to Aretum. Removed: cloud, application migration and all other technology references. Figures and his agreement to be listed still to confirm (D-40) |
| **D-45** | All advisor profiles framed as consulting, no technology (2026-11-01) | ◐ Draft, approve | At the company's direction ("make changes for all of them in advisors"), following D-44. Only facts already in each profile are used. **Sanket Thakkar:** growth, scaling and pod-based delivery; the company name IConflux Technologies and "software development", "developers", "technology ventures" and "digital transformation" removed. **Saurabh Kumar:** role now "Advisor — Strategic Assessment & Risk"; kept 25+ years, Director at Samsung Research America leading a 25-person global team, board-level representation in industry foundations, evaluations and briefing leadership on adoption, delivery for Hisense, Vizio, Lenovo and TPVision, and his consultancy Wanderlight Creative Group; all AI, firmware, silicon, smart-home, IoT and cryptography detail removed, and "Principal Engineer" dropped from his title. **Dharmendra Mistry:** "healthcare and medical technology executive" is now "healthcare executive"; "systems" is now "operations". **Ketul Thakker:** unchanged (no technology content) |
| **D-46** | Second review findings (2026-11-01) | ✅ Actioned | **Response promise:** "we will respond within one business day" becomes "we aim to respond within one business day" (correction H-05a and the Contact meta description); the "Response within 1 business day" next-step line stays pending C-17. **Joined sentences:** Healthcare bold lead-ins, About pledges and profile-card "See more" now have explicit spaces (Astro drops a space between a tag and an expression). **Article titles:** each article opens with its card title (as tab and breadcrumb already did); where the source headline differs it follows as a subheading, word for word (TT-INS-001, TT-INS-005, TT-INS-004). **Preview consent:** the consent checkbox is hidden on the GitHub Pages preview, which cannot send and has no published Privacy Policy |
| **D-47** | Sound Familiar cards and link text (2026-11-01) | ✅ The company | On desktop hover the statement cards no longer flip: two trays slide out from behind each card, the drawing above and the prompt with its link below, in the former back-face colours. The link text "Want to learn more?" becomes "Learn More" with its arrow, under the graphic and in every tray (correction F-15) |
| **D-48** | "Things we look for" cards in the buyer's voice (2026-11-01) | ✅ The company (mockup) | The six problem cards on Home (TT-PG-001-B03) take the titles and lines from the company's mockup, written from the client's point of view (corrections G-01 to G-12). Each card has a small animated icon that acts its idea out. The Transformation Recovery page shows three of these cards and now selects them by icon. Supersedes H-01b on this block |
| **D-50** | Production launch on GitHub Pages (2026-11-02) | ✅ Mack Akhani | The company authorized go-live and approved the site for publication as gated by the public build (held articles, advisors, Healthcare and unconfirmed profiles stay held). **Host:** GitHub Pages (`gh-pages`, custom domain www.techtranspire.com; apex redirects to www, HTTPS enforced). `PAGES=1` now builds the public site at the root instead of the `/Tech-Transpire` review preview (D-34 retired). **Contact form:** posts to a Google Apps Script web app (`apps-script/contact-form.gs`) that validates with the same rules as `site/src/server/inquiry.ts`, stores each inquiry in the Google Sheet tab "Website Inquiries" and emails info@techtranspire.com; the visitor sees success only after the inquiry is stored. Zoho CRM and SMTP (D-16) need a server and remain available for a future Node host. **Privacy Policy (N-07):** approved for launch and published from `docs/website-architecture/privacy-policy.md` (the counsel draft stays in `drafts/`). **Known host limits:** GitHub Pages cannot send security headers (P-5) or true 301s for the legacy paths (they use instant meta refresh pages) |
| **D-49** | Motto under the logo, not in the footer (2026-11-01) | ✅ The company | "Clarity. Alignment. Execution." now sits under the Tech Transpire logo in the header on every page (previously Home only, D-29). The large outlined footer watermark (D-36) is removed. Wording unchanged |
| **D-50** | Home founder section in Mack's voice (2026-11-01) | ✅ The company | Home "Built From Experience" takes the company's copy: "Hi, I’m Mack Akhani.", "Founder & CEO, Tech Transpire | Entrepreneur | Transformation Leader", three first-person paragraphs shown together, and "Get to Know Me →" (to About, team) at the bottom right. No credential badges. Gated with the founder block (C-10 “two decades” still to confirm for public; C-11 verified). The About page header copy is unchanged |
| **D-51** | Method step titles in title case (2026-11-01) | ✅ The company | Home method steps (TT-PG-001-B05): Deep Discovery, Uncover the Truth, Quick Wins (was "Quick wins and momentum"), Execution Blueprint, Guided Execution. Corrections F-16a to F-16e |
| **D-52** | About values in Mack's words (2026-11-01) | ✅ Mack Akhani | The six value cards on About (TT-PG-004-B03): Clarity Before Execution, We Own the Outcome, Root Causes. Real Solutions., Results Over Activity, Excellence. No Shortcuts., Truth. Even When It’s Hard., each with Mack's one-line description (corrections V-01 to V-11). Icons unchanged |
| **D-53** | Motto in header and footer (2026-11-01) | ✅ The company | "Clarity. Alignment. Execution." sits under the header logo on every page and is the footer brand line (it replaces "Clarity Before Change. Confidence Through Execution." in the footer; that line remains the Home hero headline). Briefly tried the positioning line in the header; the company asked for the motto there too |
| **D-54** | All ten insights published (2026-11-05) | ✅ Mack Akhani (relayed by Hemang Dwivedi) | Mack verified the engagement figures in the held articles. Every AC-xx claim in [19](19-article-claims-report.md) plus C-08, C-09 and C-14 is marked verified in `site/src/data/publication.json`, so TT-INS-001–005, 007, 009 and 010 publish alongside 006 and 008, and `/insights/case-studies` is built. E-09 is retired: the C-14 sentence "Twelve other programs subsequently replicated it." is restored in TT-INS-003 (closes D-24). Not covered: the Home "Selected Experience" figures (C-02–C-07) and the pre-founding attribution of 007–010 (C-18) remain pending |
| D-23 | Keep `/about-us`, `/contact-us` | ✅ **Approved** | — |
| D-24 | TT-INS-003 while C-14 is pending | ✅ **Approved** (2026-10-29) | Publish without the C-14 sentence once the rest of its content is approved (E-09); restore it on verification |
| **D-25** | Articles containing unverified claims | ✅ **Revised 2026-10-29 (company correction)** | "Publish as authored" does **not** override the no-unverified-claims rule. Three states: preserved source (archive, untouched) · internal review (review build) · approved for publication (public build). An article publishes only when every claim listed for it in [19](19-article-claims-report.md) is verified or covered by an **approved** editorial omission; otherwise it is **held**. Today 8 of 10 are held (TT-INS-001–005, 007, 009, 010); TT-INS-006 and 008 publish. Same standard for bios, results, Healthcare, SEO metadata. Implemented in `site/src/data/publication.json` |
| **D-26** | Publish pricing | ✅ **Approved: no pricing at launch** (2026-10-29) | Advisory services are consultative; encourage a discovery conversation instead of fixed public rates |
| **D-27** | Location | ✅ **Approved: Dallas–Fort Worth, Texas** (2026-10-29) | Footer, About, Contact and the Organization structured data. City-region only; never a street address |
| **D-28** | Typography | ✅ **Approved: Version B, serif** (2026-10-29, confirmed twice by the company) | Newsreader (display) + Libre Franklin (body/UI). Small card and UI headings use the sans face for readability. The reference image's sans headline is followed for layout only |
| **D-40** | Advisor bios rewritten for Tech Transpire (2026-10-31) | ◐ Draft, approve | At the company's direction ("change their content based on how Tech Transpire works"), each bio's role sentences were rewritten in Tech Transpire's terms (clarity before change, discovery → execution blueprint, root causes, stakeholder alignment). Career background stays verbatim from the TLS source; no new facts. Dharmendra's source said "advised" (past); the draft says "advises", so confirm he is a current advisor. Sanket's and Ketul's single paragraphs were split in two. Still review-only (D-38) |
| **D-39** | Advisor bios name Tech Transpire (2026-10-31) | ✅ | At the company's direction, "True Lean Solutions" and "TLS" in the five advisor bios were replaced with "Tech Transpire" (7 mentions). The About "Our company" paragraph, which describes TLS as the sister company, is unchanged. Still held from the public build until each advisor's agreement and the bio figures are confirmed (D-38) |
| **D-38** | Advisors imported from True Lean Solutions (2026-10-31) | ◐ Review only | At the company's request, the ticked advisors were copied verbatim from trueleansolutions.com/about-us: Dr. Wally Potts, Sanket Thakkar, Ketul Thakker, Saurabh Kumar, Dharmendra Mistry (Nirav Kambodi and Mayank Pujara excluded). Shown on About with photo placeholders (`site/src/data/advisors.json`). Held from the public build (`approvals.advisors`) until the company (1) confirms each person agrees to be listed as a Tech Transpire advisor, (2) decides whether bios should keep naming True Lean Solutions, and (3) confirms the figures (15+ years, $472M, 9,000+, $6M→$170M+, 100+ developers, 13 years, 25+ years, 25-person, 30+ years, ~$10 million). Photos to be supplied by the company. This deliberately overrides the earlier "do not copy the TLS website" rule for this section only |
| **D-37** | Problem-cards intro (2026-10-30) | ✅ | Supplied by the company in its mockup: label "Things we look for", heading "Complexity Isn't the Problem. Lack of Clarity Is.", line "The patterns below are often the first signs that a transformation is heading off course." Shown above the six problem cards on Home |
| **D-36** | Motto: "Clarity. Alignment. Execution." (2026-10-30) | ✅ | The company confirmed this line is its motto. Written with full stops. Shown under the logo on Home and as the footer watermark site-wide (replacing "Clarity Before Change." there). Use it wherever a motto or signature line belongs |
| **D-35** | Mack's experience: "over two decades" (2026-10-30) | ✅ | The company asked for "two decade". Applied as correction E-10 to Mack's bio (About) and the Home founder intro that quotes it: "Mack brings over two decades of experience…". C-10 still gates the public build until the bio timeline is confirmed |
| **D-34** | Shareable review preview on GitHub Pages (2026-10-30) | ✅ | The company asked for a github.io link to showcase the site for review. Static review build (`PAGES=1`, base `/Tech-Transpire`, `noindex`, no on-page markers) published to the `gh-pages` branch: https://himanshu-1-1.github.io/Tech-Transpire/. No server: the form shows its honest failure. Production launch remains unauthorized. **Retired 2026-11-02 by D-50:** the Pages build is now production |
| **D-33** | Mack Akhani photo (2026-10-30) | ✅ | The company supplied a portrait of Mack in chat ("this is the Mack Akhani image … add this in our website") and asked for it to be used. It is a styled studio portrait in front of a Tech Transpire logo wall; treated as the company's separate approval under D-30. Saved as `docs/phase-2-design/assets/Mack Akhani.png`; used on Home and About with per-placement framing. Rights to confirm before production (TT-AS-025) |
| **D-32** | Content as documented in the Word files (2026-10-30) | ✅ | The company supplied `Home Page.docx`, `Services page.docx`, `About Us .docx` and `Temp-TT-Website-Content.docx` and asked that content follow the Word files. The three page files match the archive line for line (whitespace only). Two gaps fixed on Home: the **full fit list** is shown again (supersedes the D-14 teaser) and **CTA2 "See Our Work →"** (to About Us) is restored. `check-content` now also verifies the Home fit list and every CTA label (582 lines). The Temp file is the superseded May 2026 draft (18): not used. Claims gating (D-25) still applies: stats, "6-8 weeks", and team bios stay review-only until verified. The Word files are kept out of git (public repo) |
| **D-31** | Exact live wording (2026-10-30) | ✅ | The company supplied the live homepage text: use it **character for character**. F-01–F-04 punctuation fixes withdrawn; hero line uses the live "Clarity. Alignment. Execution."; fit-list headings "This is for you if" / "We may not be the right fit for you if"; "Want to learn more?" restored. 63 of 65 live lines render verbatim; the other two are the withdrawn "$3M+ Revenue impact" label (D-05). Log: 17 |
| **D-29** | Wording approvals (2026-10-29) | ✅ | Hero supporting line "Clarity · Alignment · Execution" (F-05; now "Clarity. Alignment. Execution." per D-31). Outcome themes Better Decisions · Improved Performance · Efficient Operations · Sustainable Transformation (no separate pages); their supporting lines stay flagged (N-02). Results section titled **"Selected Experience"** because it describes leadership engagements, some pre-founding |
| **D-30** | Leadership photographs | ✅ (2026-10-29) | Only labelled original photographs from the Drive headshots folder. No AI-generated portraits of real people unless separately approved. TT-AS-003 (Mack), 005 (Kranthi) and 006 (Devjet) are AI-generated in Drive and are **not used**; Hemang uses TT-AS-004 (`Hemang_TT_HeadShot.png`); Mack awaits `Mack Akhani.png`. Mayank Pujara is not introduced |

## 6. Not recommended

Five capability pages · AI & Digital Enablement page (until offering exists) · industry pages other than Healthcare · outcome-theme pages · individual profile pages at launch · FAQ page · partners page · whitepapers section · testimonials section (none exist) · True Lean Solutions in primary navigation or on Home · keeping the Docs → Apps Script → iframe rendering.

## 7. Editorial corrections (existing wording vs suggested)

**2026-10-29:** E-01–E-05 and E-09 approved and applied at build time; F-01–F-04 and F-07 approved as punctuation-only and applied. The exact before/after record, and the open F-05/F-06 and new F-08–F-13 items, are in [17-approved-corrections-log.md](17-approved-corrections-log.md). The status column below is historical.

| ID | Location | Existing wording | Suggested | Status |
|---|---|---|---|---|
| E-01 | TT-INS-002-B06 | "…after we stepped back, rexactlyan reverting…" | "…after we stepped back, rather than reverting…" | 🟦 typo |
| E-02 | TT-INS-004-B02 | "returned to buil9work" | "returned to busywork" (intended word confirmed by the company) | ✅ applied |
| E-03 | TT-PG-004-B04 | "Kranthi Architects enterprise-grade…" | "Kranthi architects enterprise-grade…" | 🟦 |
| E-04 | TT-PG-004-B04; TT-INS-010-B10 | "TechTranspire" | "Tech Transpire" | 🟦 |
| E-05 | TT-INS-001-B11 | Card title formatted as a heading | Restore as the fourth card | 🟦 formatting |
| E-06 | TT-INS-007-B03 | "A healthcare SaaS client…" | — | ✖ **Withdrawn**: treated as a separate engagement (company decision) |
| E-07 | TT-INS-007, 008, 009, 010 | No attribution line | Add the D-04 line **where C-18 confirms a pre-founding engagement** | ✅◐ approved in principle |
| E-08 | Sheet dates | Mixed formats | ISO dates in the model | 🟦 metadata |
| **E-09** | TT-INS-003-B06 | "Twelve other programs subsequently replicated it." | Temporarily omitted until C-14 is validated (D-24) | 🟦 |
