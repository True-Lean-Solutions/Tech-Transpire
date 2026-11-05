# 19 — Unverified Claims in Articles and Public Content

**2026-10-29.** Prepared after the company's correction to D-25: *"publish as authored" does not override the no-unverified-claims rule.*

## Three states of content

| State | Where | Rule |
|---|---|---|
| **Preserved source** | `source-archive/`, `data/content-blocks.json` | Full original text, never edited, never deleted |
| **Internal review** | Review build (`npm run build`) | Everything renders, with amber tags on unverified items. `noindex` |
| **Approved for publication** | Public build (`npm run build:public`) | Only content whose claims are verified, or whose unverified passages have an **approved** editorial omission. Otherwise the article is **held** |

**Current public-build behaviour (implemented):** an article publishes only when every claim listed for it below is verified or covered by an approved omission. On 2026-10-29 **8 of 10 articles were held**. **2026-11-05 (D-54):** Mack Akhani verified the figures; every AC-xx claim below (and C-08, C-09, C-14) is verified and **all ten articles publish**. The tables are kept as the record of what was verified. Nothing is deleted.

## How claims were found

Every sentence, heading, card, stat and tag line of all ten articles was scanned for numerals, spelled-out numbers ("Sixty-five", "seven years"), percentages, currency, ratios and outcome verbs (reduced, cleared, eliminated, acquired, ahead of…). 177 candidate sentences were then reviewed by hand. General statements of opinion ("The cost of executing the wrong plan is always greater…") are **not** claims. A **claim** is a statement of fact about a specific engagement, client or result that a reader could take as evidence.

- **R = result or achievement** (what the engagement produced). Highest priority.
- **F = engagement fact** (client size, baseline, team, timeline). These are also unverified statements about real engagements.

Existing register IDs (12 §3) are shown where they apply. New IDs use the form **AC-{article}-{n}**.

---

## TT-INS-001 · Mastering Kaizen Events (Guide) · **PUBLISHED** (verified, D-54)

Mostly a method guide; one section reports an engagement.

| ID | Kind | Exact text (TT-INS-001-B08) |
|---|---|---|
| AC-001-1 | F | "migrating client systems onto a unified intake platform at roughly thirty per quarter, with federal compliance warnings already issued against the organization." |
| AC-001-2 | F | "We piloted two systems end to end … around thirty-minute involvement slots per specialist." |
| AC-001-3 | R | "Sixty-five migrations were actioned that day." |
| AC-001-4 | R | "The remaining 103 finished in days rather than quarters, and the company was returned to compliance." |

Related: same figures as TT-INS-002 (C-18). **Lightest fix:** an approved omission of section B08 ("What It Looks Like When It Works"), two paragraphs, would let the rest of the guide publish.

## TT-INS-002 · Two Quarters of Migration Work, Cleared in a Single Day (Case study) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-002-1 | R | Title: "Two Quarters of Migration Work, Cleared in a Single Day" |
| AC-002-2 | R | B01: "65 client migrations actioned in a single day against a prior rate of 30 per quarter" |
| AC-002-3 | R | B02 At a Glance: "65", "30 per quarter", "103 · Remaining intakes completed in days rather than quarters", "3 to 1 · Legacy intake methods consolidated onto one automated platform" |
| AC-002-4 | F | B03: "three separate legacy intake methods"; B04: "roughly thirty client systems per quarter and consuming 283 internal hours each quarter" |
| AC-002-5 | F | B06: "migrated two client systems completely"; "roughly thirty minutes of involvement" |
| AC-002-6 | R | B07: "Sixty-five client migrations were actioned in a single day against a prior rate of thirty per quarter." / "The remaining 103 intakes were completed within days rather than quarters." / "…removed the category of data loss that had triggered the federal warnings." |
| AC-002-7 | R | B08: "changed throughput by more than an order of magnitude without adding anyone to the payroll." |

Attribution present: "Engagement led by Mack Akhani prior to founding Tech Transpire."

## TT-INS-003 · A Seven-Year Migration, Closed in 19 Hours (Case study) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-003-1 | R | Title: "A Seven-Year Migration, Closed in 19 Hours" (**C-07**) |
| AC-003-2 | R | B01: "389 hospitals migrated and a seven-year initiative closed two years ahead of projection" (**C-07**) |
| AC-003-3 | R | B02 At a Glance: "19 hours", "389 · Hospitals migrated, across 47 hospital system clients", "10 per quarter", "$311K · Annual savings from retiring the legacy platform" (**C-08**) |
| AC-003-4 | F | B04/B05: "One customer lost reimbursement … came close to declaring bankruptcy"; "already seven years old and advancing at roughly ten client migrations per quarter" |
| AC-003-5 | F | B06: "a 12-member team"; "Five complete migrations were run in advance"; "Nineteen stored procedures"; "Nineteen hours … across three consecutive days" |
| AC-003-6 | R | B06: "Twelve other programs subsequently replicated it." (**C-14**, already omitted by E-09) |
| AC-003-7 | R | B07: "Processing engines for 47 hospital system clients, comprising 389 individual hospitals, were migrated within the 19-hour event." / "A seven-year-old initiative was closed two years ahead of its projected completion." |
| AC-003-8 | R | B07: "Retiring the legacy platform produced $311,000 in annual savings and improved quality by 50%." / "…returned to CMS compliance." (**C-08**) |
| AC-003-9 | R | B07: "…the division became a viable acquisition target and was subsequently acquired." (**C-08**, confidentiality) |

Attribution present.

## TT-INS-004 · A Weekend Scrum-to-Kanban Migration Across Nine Teams (Case study) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-004-1 | R | B01: "Nine teams shifted from sprint-based delivery to continuous feature flow, with zero disruption to active development" |
| AC-004-2 | R | B02 At a Glance: "9 teams", "Downtime or disruption to active development across 166 people in six countries", "1,938 hours · Engineering time per month returned to busywork, equivalent to 12 full-time employees", "9,000+ · Work items migrated without loss of workflow or history" (**C-09**) |
| AC-004-3 | F | B03: "an engineering organization of 166 people distributed across six countries"; "nine Scrum teams" |
| AC-004-4 | F | B05: "four hours and fifteen minutes per developer per week"; "114 engineers and QA specialists" |
| AC-004-5 | R | B06: "Nine teams and more than 10,000 work items were moved across one weekend. All 166 people returned to an uninterrupted workflow on Monday, with no development downtime and no loss of history." |
| AC-004-6 | R | B07: "zero disruption"; "returned four hours and fifteen minutes per developer per week, or seventeen hours per month each"; "1,938 hours per month — 612 from backend, 527 from frontend web, 119 from mobile, and 680 from QA"; "The equivalent of twelve additional full-time employees, recovered without a single new hire" (**C-09**) |

**Internal inconsistency to resolve:** the At a Glance says "9,000+" work items; B06 says "more than 10,000". Attribution present.

## TT-INS-005 · What Value Stream Mapping Found: 9.5 Hours of Work Inside 208 Days of Delays (Case study) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-005-1 | R | Title and H1: "208 Days of Elapsed Time. 9.5 Hours of Actual Work." |
| AC-005-2 | R | B01: "Median customer implementation reduced from 209 days to 78" (**C-05**) |
| AC-005-3 | R | B02 At a Glance: "209 to 78 days · Median customer implementation time, a 63% reduction"; "12% to 50% · First-pass quality, more than four times better"; "0.79%"; "4 days" (**C-05**) |
| AC-005-4 | F | B04/B05: "an average of 209 days"; "roughly 1,000 service request line items"; "1,189 hours of lead time against 565 minutes of actual touch time"; "An activity ratio of 0.79%"; "twelve or more weeks to become productive" |
| AC-005-5 | F | B06: "December 2019 through February 2020"; "Mapped current state, future state and the plan in four days" |
| AC-005-6 | R | B07: "Median customer implementation time fell from 209 days to 78, a reduction of 63%. First-pass quality rose from 12% to 50%, more than four times better…" (**C-05**) |
| AC-005-7 | R | B08: "208 days of elapsed time contained nine and a half hours of actual work - an activity ratio of 0.79%." |

Attribution present ("Engagement facilitated by Mack Akhani, LSSBB, as Lean Transformation Consultant prior to founding Tech Transpire."). LSSBB is verified (C-11).

## TT-INS-006 · You Don't Have an Execution Problem. You're Executing the Wrong Plan. (Perspective) · **PUBLISHES**

No engagement claims. General statements only.

## TT-INS-007 · The 19-Hour Project: What Rapid Execution Actually Looks Like (Perspective) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-007-1 | R | Title: "The 19-Hour Project" |
| AC-007-2 | F | B03: "a seven-year-old initiative … proceeding at ten hospital clients per quarter. One was at risk of bankruptcy." |
| AC-007-3 | R | B04 stats: "7 years", "10/quarter", "389 · Individual hospitals migrated in the 19-hour execution event" (**C-07**) |
| AC-007-4 | F | B05: "A 12-member cross-functional team"; "19 new SQL stored procedures"; "Five client systems migrated end-to-end"; "A 19-hour immersive event over three days" |
| AC-007-5 | R | B05: "389 hospitals across 47 hospital system clients migrated. A seven-year project completed in under a day of focused execution." |
| AC-007-6 | R | B08: "A seven-year project. Closed in 19 hours." / tag "Compliance restored · 2 years ahead of schedule" |

**No attribution line** (C-18). Treated as a separate engagement from TT-INS-003 (company decision), although the figures are identical.

## TT-INS-008 · When Processes Break Down, Look at the Handoffs — Not the Steps (Perspective) · **PUBLISHES**

No figures or results. B04 describes a healthcare client's situation ("data loss that was causing patients to miss Medicare reimbursements") without claiming an outcome. Pre-founding attribution still to confirm (C-18).

## TT-INS-009 · Supply Chain at Scale: How Decentralized Purchasing Silently Destroys Margins (Perspective) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-009-1 | F | B04 heading: "What We Did for a 90-Location Eye Care Network" (**C-04**) |
| AC-009-2 | F | B04: "had grown to over 80 clinics and 10 surgery centers through rapid acquisition" |
| AC-009-3 | R | B05 stats: "$89M · Annual purchasing centralized to a single platform" (**C-06**); "$3M · Annual savings through preferred pricing and inventory optimization" (**C-03**); "5,000+ · SKUs standardized across all locations"; "80% · Improvement in product recall process efficiency through full traceability" |
| AC-009-4 | R | B07 tag: "$3M annual savings" (**C-03**) |

**No attribution line** (C-18). **Lightest fix:** approved omission of the B05 stats block and the B07 tag, and the heading changed to drop "90-Location" (an editorial change, needs approval). The narrative would then stand.

## TT-INS-010 · Why Transformation Programs Fail After a Strong Start (Perspective) · **PUBLISHED** (verified, D-54)

| ID | Kind | Exact text |
|---|---|---|
| AC-010-1 | R | B04: "we reduced median implementation time from 209 days to 78 days and improved first-pass quality from 12% to 50%." (**C-05**) |
| AC-010-2 | R | B05 stats: "209 → 78 days · Median customer implementation time reduced - 63% improvement"; "12% → 50% · First-pass quality improvement - more than 4x" (**C-05**) |

**No attribution line** (C-18), although the figures match TT-INS-005, which is attributed as pre-founding. **Lightest fix:** approved omission of the B05 stats block and the figures sentence in B04.

---

## Site-level public content (same standard)

| ID | Where | Exact text | Treatment in the public build |
|---|---|---|---|
| H-01 | Home, problem card "Hidden misalignment" (TT-PG-001-B03) | "By then, the cost of fixing it is three times what it would have been upfront." | **Launch blocker:** a quantitative assertion with no source. Confirm a source, or approve omitting the sentence |
| H-02 | Home results band | All six figures (C-02–C-07) | Hidden until ≥ 2 verified. Now titled **"Selected Experience"** with the pre-founding attribution |
| H-03 | Home "The outcome" tag; Expertise signature-offer tag | "6-8 weeks · From confusion to clarity"; "6-8 weeks" (**C-15**) | Tag lines hidden in the public build until C-15 is confirmed |
| H-04 | Expertise, Discovery step (TT-PG-002-B04) | "…within 2 to 6 weeks depending on complexity." (**C-15**) | **Launch blocker:** inside a sentence; confirm C-15 or approve an omission |
| H-05 | Contact "What happens next", form intro, success message, meta description | "Response within 1 business day" / "within one business day" (**C-17**) | **Launch blocker:** an operational commitment; the company confirms it can be met |
| H-06 | Home founder block; About profiles | Mack's bio: "over a decade" (**C-10**), "reduced implementation timelines by 63%, prevented $3M in fraud losses, centralized $89M…, closed a 7-year stalled initiative" (C-02, C-05–C-07) | Hidden until verified. The Home founder block depends on C-10 only (first sentence) |
| H-07 | Kranthi, Devjet, Hemang profiles | C-12, C-13, C-20 | Hidden until confirmed |
| H-08 | Healthcare page (draft) | Quotes TT-INS-002/003/005/009 client descriptions containing "three separate legacy intake methods", "over 80 clinics and 10 surgery centers" | Page is unpublished (N-05); quotes come from held articles. Re-check when N-05 is approved |
| H-09 | SEO metadata | Meta descriptions use article excerpts. Held articles are not built, so no unverified excerpt reaches search results. Case-studies meta (N-10) "moved stalled initiatives" | The case-studies page is held while it has no publishable case study |

## What unblocks each article fastest

| Article | Option 1: verify | Option 2: approved omission (keeps the rest public) |
|---|---|---|
| 001 | AC-001-3/4 (same engagement as 002) | Omit section B08 |
| 002, 003, 004, 005, 007 | Every R item and the title | Not practical: the claims are the article |
| 009 | C-03, C-04, C-06 + the two stats | Omit B05 stats + B07 tag; reword the B04 heading |
| 010 | C-05 (same evidence as 005) + attribution | Omit B05 stats + the figures sentence in B04 |

**Recommended next step:** Mack confirms the 005/010 engagement (C-05) and the 002/001 engagement (65 / 103), which together unblock four articles. Decide omissions for 001, 009 and 010 in parallel.
