// Site-wide configuration: build mode, navigation, contact details and approval switches.
export const MODE = __SITE_MODE__;
export const isReview = MODE === 'review';
// On-page review markers (amber tags, the "Review build" strip, review notes). Off by default
// at the company's request (2026-10-30); REVIEW_MARKERS=1 shows them for an approval session.
// The items they mark stay tracked in docs/website-architecture/12 and 19.
export const showMarkers = isReview && __REVIEW_MARKERS__;
// Production on GitHub Pages (D-50): a static host with no server, so the contact form posts to
// the Google Apps Script web app in apps-script/contact-form.gs instead of /api/inquiry.
export const isStaticHost = __PAGES__;
const APPS_SCRIPT_INQUIRY_URL = 'https://script.google.com/macros/s/AKfycbz8nPkA1TNsApYlmIGpXbj1WhIBWhppwGA5lW57SXBhfRJASb8QiD3KiKYCGGGR7mXI/exec';
export const inquiryEndpoint = isStaticHost ? APPS_SCRIPT_INQUIRY_URL : '/api/inquiry';

// GitHub Pages serves each page from its directory and 301s /page to /page/, so on that host
// canonical and structured-data URLs carry the trailing slash to match what is actually served.
export const pagePath = (path: string) => {
  const bare = path.replace(/\/+$/, '');
  if (!bare) return '/';
  return isStaticHost && !/\.[a-z0-9]+$/i.test(bare) ? `${bare}/` : bare;
};

// Approval switches. Each flips to true when the decisions register records the approval.
export const approvals = {
  healthcarePage: false, // N-05 draft, D-06: Industries hidden from primary nav until approved
  privacyPolicy: true, // N-07: approved by the company for launch 2026-11-02 (D-50); docs/website-architecture/privacy-policy.md
  outcomeThemeCopy: false, // N-02 lines and the section heading
  akhaniParagraph: false, // N-06, legal wording
  newFormOptions: false, // N-16 "Event or presentation", "Existing client or colleague"
  advisors: false, // D-38–D-40: imported from trueleansolutions.com, role lines rewritten for Tech Transpire (draft); figures and each advisor's agreement to confirm
};

// The Privacy Policy is published once approved (N-07); before that only an approval session showed it.
export const showPrivacy = showMarkers || approvals.privacyPolicy;

export const showIndustries = isReview || approvals.healthcarePage;

export type NavItem = { label: string; href: string };
// Header order and labels match the company's reference header (2026-11-01, D-41). Industries
// stays reachable from the footer and search.
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about-us' },
  { label: 'Services', href: '/services' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact Us', href: '/contact-us' },
];

// [E] TT-PG-005-B02, B03: exact values.
export const contact = {
  email: 'info@techtranspire.com',
  phone: '+1 (979) 479-2779',
  tel: '+19794792779',
  linkedin: 'https://www.linkedin.com/company/techtranspire/',
  booking: 'https://outlook.office.com/book/IntroCallwithTechTranspire@techtranspire.com/?ismsaljsauthenabled',
};

export const entityLine = 'Tech Transpire is a DBA of Akhani LLC.';

// D-27 (approved 2026-10-29): city-region only, never a street address.
export const location = { label: 'Dallas–Fort Worth, Texas', locality: 'Dallas–Fort Worth', region: 'TX' };
export const SITE_NAME = 'Tech Transpire';
