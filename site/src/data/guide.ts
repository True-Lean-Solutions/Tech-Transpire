// The guide (the Tech Transpire playbook "Solve the Right Problem") offered site-wide for a name and work email (D-56, docs/guide-leads.md).
// Build-time only (it reads the filesystem): client scripts take these values from data attributes.
import { existsSync } from 'node:fs';
import { GUIDE_ENDPOINT } from '../lib/site';

export const guide = {
  /** Sent with every submission; the Apps Script accepts only ids it lists in GUIDES. */
  id: 'solve-the-right-problem',
  kicker: 'Free field guide',
  title: 'Solve the Right Problem',
  promise: 'How to find out whether your business is fixing the wrong thing, and what to do about it in the next 30 days.',
  facts: ['5 steps', '5 printable worksheets', 'One 30-day plan'],
  button: 'Download the guide',
  /** TT-INS-006. No trailing slash: pages-finalize adds it on GitHub Pages, as for every internal link. */
  post: '/insights/executing-the-wrong-plan',
  /** Served from site/public. */
  file: '/guides/solve-the-right-problem-playbook.pdf',
  downloadName: 'TechTranspire-Playbook-Solve-the-Right-Problem.pdf',
  /** Pages where the tab never offers itself (the footer link still opens the card). */
  quietPaths: ['/contact-us', '/privacy-policy', '/404'],
} as const;

// Live only with an endpoint and the PDF in place, so a missing file can never be offered.
// Paths are relative to site/, where every build command runs.
export const guideEnabled = GUIDE_ENDPOINT.length > 0 && existsSync(`public${guide.file}`);
