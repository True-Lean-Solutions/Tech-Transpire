// Approved editorial corrections, applied at build time to the verbatim archive text.
// The archive itself is never edited. Each `before` must occur exactly once in its block,
// otherwise the build fails, so a correction can never silently drift or double-apply.
// Human-readable log: docs/website-architecture/17-approved-corrections-log.md

export type Correction = {
  id: string;
  block: string;
  field?: 'text' | 'heading';
  before: string;
  after: string;
  kind: 'spelling' | 'capitalization' | 'punctuation' | 'temporary omission' | 'content update';
  approval: string;
};

export const corrections: Correction[] = [
  { id: 'E-01', block: 'TT-INS-002-B06', before: 'rexactlyan reverting', after: 'rather than reverting', kind: 'spelling', approval: 'D-11' },
  { id: 'E-02', block: 'TT-INS-004-B02', before: 'buil9work', after: 'busywork', kind: 'spelling', approval: 'D-11; intended word confirmed by the company' },
  { id: 'E-03', block: 'TT-PG-004-B04', before: 'Kranthi Architects enterprise-grade', after: 'Kranthi architects enterprise-grade', kind: 'capitalization', approval: 'D-11' },
  { id: 'E-04a', block: 'TT-PG-004-B04', before: "TechTranspire's financial backbone", after: "Tech Transpire's financial backbone", kind: 'spelling', approval: 'D-11' },
  { id: 'E-04b', block: 'TT-INS-010-B10', before: 'CTA: Talk to TechTranspire >', after: 'CTA: Talk to Tech Transpire >', kind: 'spelling', approval: 'D-11 (link URL untouched)' },
  // E-09 (temporary omission of the C-14 sentence in TT-INS-003-B06) retired 2026-11-05: C-14 verified (D-54).
  { id: 'E-10', block: 'TT-PG-004-B04', before: 'Mack brings over a decade of experience', after: 'Mack brings over two decades of experience', kind: 'content update', approval: 'D-35: the company, 2026-10-30 ("make it two decade"); also updates the Home founder intro' },
  // F-01–F-04 (page punctuation) were withdrawn on 2026-10-30 for the exact live wording, then
  // re-approved with F-08–F-13 on 2026-11-01 after the external review (D-42, D-43).
  { id: 'H-01a', block: 'TT-PG-001-B01', before: 'Most transformation budgets are wasted before the first line of code is written.', after: 'Transformation budgets can be wasted before the first line of code is written.', kind: 'content update', approval: 'D-43: the company, 2026-11-01 (qualifies an unsupported claim)' },
  { id: 'H-01b', block: 'TT-PG-001-B03', before: 'By then, the cost of fixing it is three times what it would have been upfront.', after: 'By then, resolving the misalignment can be significantly more expensive than addressing it upfront.', kind: 'content update', approval: 'D-43: the company, 2026-11-01 (replaces the unsourced "three times" claim)' },
  { id: 'F-14', block: 'TT-PG-001-B01', before: 'Sounds Familiar?', after: 'Sound Familiar?', kind: 'spelling', approval: 'D-43: the company, 2026-11-01 (grammar)' },
  { id: 'F-08', block: 'TT-PG-001-B02', before: 'high-stake transformation', after: 'high-stakes transformation', kind: 'spelling', approval: 'D-43 (grammar)' },
  { id: 'F-01', block: 'TT-PG-001-B02', before: 'transformation points - moments', after: 'transformation points, moments', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-09', block: 'TT-PG-001-B01', before: 'perfectly, is still a failure', after: 'perfectly is still a failure', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-02', block: 'TT-PG-001-B03', before: 'different directions invisible', after: 'different directions, invisible', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-03a', block: 'TT-PG-001-B05', before: 'understands it not dependent', after: 'understands it, not dependent', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-03b', block: 'TT-PG-001-B05', before: 'actually delivered then we', after: 'actually delivered, then we', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-04a', block: 'TT-PG-001-B07', before: 'bring clarity not simply', after: 'bring clarity, not simply', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-04b', block: 'TT-PG-002-B06', before: 'bring clarity not simply', after: 'bring clarity, not simply', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-10', block: 'TT-PG-001-B08', before: 'implementation time 209 days to 78 in one engagement', after: 'implementation time, 209 days to 78, in one engagement', kind: 'punctuation', approval: 'D-43 (shown only once C-05 is verified)' },
  { id: 'F-11a', block: 'TT-PG-004-B03', before: "treat symptoms we find", after: "treat symptoms, we find", kind: 'punctuation', approval: 'D-43' },
  { id: 'F-11b', block: 'TT-PG-004-B05', before: 'validate ideas we validate', after: 'validate ideas, we validate', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-11c', block: 'TT-PG-004-B05', before: 'independent not dependent on us', after: 'independent, not dependent on us', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-11d', block: 'TT-PG-004-B03', before: 'complete openness especially when', after: 'complete openness, especially when', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-12a', block: 'TT-PG-002-B03', before: 'deep discovery understanding', after: 'deep discovery, understanding', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-12b', block: 'TT-PG-002-B04', before: 'implementation not a slide deck', after: 'implementation, not a slide deck', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-12c', block: 'TT-PG-002-B04', before: 'operating independently not when', after: 'operating independently, not when', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-12d', block: 'TT-PG-002-B05', before: 'Transformation Blueprint current to future state', after: 'Transformation Blueprint, current to future state', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-12e', block: 'TT-PG-002-B05', before: 'augmentation only when tied', after: 'augmentation, only when tied', kind: 'punctuation', approval: 'D-43' },
  { id: 'F-13a', block: 'TT-PG-005-B04', before: 'If aligned - Clear next steps', after: 'If aligned: clear next steps', kind: 'punctuation', approval: 'D-43 (punctuation and capitalization)' },
  // D-48: the "Things we look for" cards rewritten in the buyer's voice from the company mockup.
  { id: 'G-01', block: 'TT-PG-001-B03', before: 'Hidden misalignment', after: 'Everyone’s Busy. But Are You Moving Forward?', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-02', block: 'TT-PG-001-B03', before: 'Processes and teams pulling in different directions, invisible until execution fails. By then, resolving the misalignment can be significantly more expensive than addressing it upfront.', after: 'Your teams are working hard, but in different directions. Progress suffers, costs rise, and alignment comes too late.', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-03', block: 'TT-PG-001-B03', before: 'Executing the wrong plan', after: 'What If You’re Executing the Wrong Plan?', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-04', block: 'TT-PG-001-B03', before: 'Leadership investing time and money in a direction that hasn\'t been fully validated. The initiative looks right until it doesn\'t.', after: 'You’ve committed time, money, and people. But what if the assumptions behind your strategy were wrong from the start?', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-05', block: 'TT-PG-001-B03', before: 'Stalled or failing implementations', after: 'Another Deadline. Another Disappointment.', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-06', block: 'TT-PG-001-B03', before: 'Projects that lose momentum mid-execution. Teams frustrated. Vendors misaligned. No clear path forward.', after: 'Milestones slip. Costs climb. Confidence fades. You need a clear path to recovery, not another status report.', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-07', block: 'TT-PG-001-B03', before: 'High-stakes decisions under pressure', after: 'Big Decisions. Not Enough Confidence.', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-08', block: 'TT-PG-001-B03', before: 'ERP selections, vendor contracts, process redesigns made without full confidence in the problem definition or the plan.', after: 'Technology investments, vendor choices, major changes. The pressure to act is real. So is the cost of getting it wrong.', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-09', block: 'TT-PG-001-B03', before: 'Root causes masked as symptoms', after: 'Why Do the Same Problems Keep Coming Back?', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-10', block: 'TT-PG-001-B03', before: 'Organizations solving for the wrong problem because they never got to the real one. Speed-to-execution with no clarity upfront.', after: 'New tools. New processes. Same frustrations. What if you’re fixing symptoms while the real problem goes untouched?', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-11', block: 'TT-PG-001-B03', before: 'No clear ownership', after: 'Everyone’s Involved. Who’s Accountable?', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'G-12', block: 'TT-PG-001-B03', before: 'Accountability gaps across functions. Handoffs that fall through. No one carrying the end-to-end problem.', after: 'Decisions stall. Handoffs fail. Problems bounce between teams. Yet nobody truly owns the outcome.', kind: 'content update', approval: 'D-48: the company mockup, 2026-11-01 (buyer point of view)' },
  { id: 'F-15', block: 'TT-PG-001-B01', before: 'Want to learn more?', after: 'Learn More', kind: 'content update', approval: 'D-47: the company, 2026-11-01 ("instead of want to learn more write Learn More")' },
  // D-51: method step titles in title case; "Quick wins and momentum" becomes "Quick Wins".
  { id: 'F-16a', block: 'TT-PG-001-B05', before: 'Deep discovery', after: 'Deep Discovery', kind: 'content update', approval: "D-51: the company, 2026-11-01 (title case; 'and momentum' struck out)" },
  { id: 'F-16b', block: 'TT-PG-001-B05', before: 'Uncover the truth', after: 'Uncover the Truth', kind: 'content update', approval: "D-51: the company, 2026-11-01 (title case; 'and momentum' struck out)" },
  { id: 'F-16c', block: 'TT-PG-001-B05', before: 'Quick wins and momentum', after: 'Quick Wins', kind: 'content update', approval: "D-51: the company, 2026-11-01 (title case; 'and momentum' struck out)" },
  { id: 'F-16d', block: 'TT-PG-001-B05', before: 'Execution blueprint', after: 'Execution Blueprint', kind: 'content update', approval: "D-51: the company, 2026-11-01 (title case; 'and momentum' struck out)" },
  { id: 'F-16e', block: 'TT-PG-001-B05', before: 'Guided execution', after: 'Guided Execution', kind: 'content update', approval: "D-51: the company, 2026-11-01 (title case; 'and momentum' struck out)" },
  // D-52: About values rewritten by Mack Akhani (2026-11-01). Applied after F-11a/F-11d.
  { id: 'V-01', block: 'TT-PG-004-B03', before: 'We do not start work until there is full clarity of intent, priorities, and direction.', after: 'We align on the real problem, priorities, and path forward before taking action.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-02', block: 'TT-PG-004-B03', before: 'Ownership Without Permission', after: 'We Own the Outcome', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-03', block: 'TT-PG-004-B03', before: 'We take responsibility without waiting to be told. We act like owners, not employees.', after: 'No excuses. No finger-pointing. We take responsibility and follow through.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-04', block: 'TT-PG-004-B03', before: 'Solve the Right Problem', after: 'Root Causes. Real Solutions.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-05', block: 'TT-PG-004-B03', before: "We don't treat symptoms, we find root causes. Challenge assumptions. Go deep before acting. Design solutions that actually work.", after: 'We challenge assumptions and fix what’s actually holding you back.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-06', block: 'TT-PG-004-B03', before: 'Outcomes Over Activity', after: 'Results Over Activity', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-07', block: 'TT-PG-004-B03', before: 'Effort means nothing without results. Focus on meaningful impact. Complete what we start. Avoid busywork.', after: 'Busy isn’t progress. We measure success by meaningful business outcomes.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-08', block: 'TT-PG-004-B03', before: 'High Standards, Always', after: 'Excellence. No Shortcuts.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-09', block: 'TT-PG-004-B03', before: 'Quality is the baseline, not an aspiration. No unverified or half-baked output. Think before sending. Represent excellence in every interaction.', after: 'We hold every recommendation, decision, and deliverable to a higher standard.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-10', block: 'TT-PG-004-B03', before: 'Honesty, Integrity, and Transparency', after: 'Truth. Even When It’s Hard.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'V-11', block: 'TT-PG-004-B03', before: 'We operate with complete openness, especially when it is uncomfortable. No hidden work, no hidden intent.', after: 'Straight answers. Risks surfaced early. No hidden agendas.', kind: 'content update', approval: 'D-52: Mack Akhani, 2026-11-01' },
  { id: 'H-05a', block: 'TT-PG-005-B05', before: 'and we will respond within one business day.', after: 'and we aim to respond within one business day.', kind: 'content update', approval: 'D-46: review 2026-11-01 (a firm promise softened while C-17 is unconfirmed)' },
  { id: 'F-13b', block: 'TT-PG-005-B04', before: 'If not - Honest redirect', after: 'If not: honest redirect', kind: 'punctuation', approval: 'D-43 (punctuation and capitalization)' },
  { id: 'F-07a', block: 'TT-INS-008-B01', before: 'Handoffs - Not the Steps', after: 'Handoffs — Not the Steps', kind: 'punctuation', approval: 'F-01–F-07 approval (punctuation only)' },
  { id: 'F-07b', block: 'TT-INS-008-B02', field: 'heading', before: 'Handoffs - Not the Steps', after: 'Handoffs — Not the Steps', kind: 'punctuation', approval: 'F-01–F-07 approval (punctuation only)' },
];

// Corrections to Insights Sheet fields (card title), keyed by insight ID.
export const sheetCorrections: Record<string, { id: string; field: 'Title'; before: string; after: string }[]> = {
  'TT-INS-008': [{ id: 'F-07c', field: 'Title', before: 'Handoffs - Not the Steps', after: 'Handoffs — Not the Steps' }],
};

function countOccurrences(haystack: string, needle: string) {
  let n = 0;
  for (let i = haystack.indexOf(needle); i >= 0; i = haystack.indexOf(needle, i + needle.length)) n++;
  return n;
}

export function applyTo<T extends { block_id: string; heading: string; text: string[] }>(block: T): T {
  const mine = corrections.filter((c) => c.block === block.block_id);
  if (!mine.length) return block;
  let heading = block.heading;
  let text = [...block.text];
  for (const c of mine) {
    if (c.field === 'heading') {
      if (countOccurrences(heading, c.before) !== 1) throw new Error(`${c.id}: expected one match in ${c.block} heading`);
      heading = heading.replace(c.before, c.after);
    } else {
      const hits = text.reduce((n, t) => n + countOccurrences(t, c.before), 0);
      if (hits !== 1) throw new Error(`${c.id}: expected one match in ${c.block}, found ${hits}`);
      text = text.map((t) => (t.includes(c.before) ? t.replace(c.before, c.after) : t));
    }
  }
  return { ...block, heading, text };
}

export function correctSheetField(insightId: string, field: 'Title', value: string) {
  for (const c of sheetCorrections[insightId] ?? []) {
    if (c.field !== field) continue;
    if (countOccurrences(value, c.before) !== 1) throw new Error(`${c.id}: expected one match in ${insightId} ${field}`);
    value = value.replace(c.before, c.after);
  }
  return value;
}
