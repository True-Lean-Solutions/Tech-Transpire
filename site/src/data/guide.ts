// The field guide offered site-wide for a name and work email (D-56, docs/guide-leads.md).
// Build-time only (it reads the filesystem): client scripts take these values from data attributes.
import { existsSync } from 'node:fs';
import { GUIDE_ENDPOINT } from '../lib/site';

export const guide = {
  /** Sent with every submission; the Apps Script accepts only ids it lists in GUIDES. */
  id: 'clarity-before-change',
  kicker: 'Free field guide',
  title: 'Clarity Before Change',
  promise: 'Find out whether you are executing the wrong plan, and what to do in the next 30 days.',
  facts: ['4 practical steps', '4 printable worksheets', 'A 30-day plan'],
  button: 'Download the guide',
  /** TT-INS-006. No trailing slash: pages-finalize adds it on GitHub Pages, as for every internal link. */
  post: '/insights/executing-the-wrong-plan',
  /** Served from site/public. */
  file: '/guides/clarity-before-change-field-guide.pdf',
  downloadName: 'Clarity-Before-Change-Field-Guide.pdf',
  /** Pages where the tab never offers itself (the footer link still opens the card). */
  quietPaths: ['/contact-us', '/privacy-policy', '/404'],
} as const;

// Live only with an endpoint and the PDF in place, so a missing file can never be offered.
// Paths are relative to site/, where every build command runs.
export const guideEnabled = GUIDE_ENDPOINT.length > 0 && existsSync(`public${guide.file}`);
