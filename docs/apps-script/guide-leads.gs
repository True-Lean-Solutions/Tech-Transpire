/**
 * Tech Transpire field-guide lead form: Google Apps Script web app (D-56).
 *
 * Receives the guide card's form (site/src/components/GuidePrompt.astro, scripts/guide.ts) and
 * writes the lead to the "TT Guide Leads" tab of the spreadsheet "TLS LEADS From Website"
 * (CONFIG.SHEET_ID). It is a standalone project created at script.google.com, not a script
 * bound to that spreadsheet: the TLS site's own script is bound there, and the two must stay
 * separate (one doPost each). It sends no email: the visitor's browser downloads the PDF from
 * the site itself. Deploy steps: docs/guide-leads.md. Adapted from the TLS site's
 * docs/apps-script/guide-leads.gs (True-Lean-Solutions/TLS-Website); every spam check is kept.
 *
 * It always answers with the same response, whatever it decided, so a bot learns nothing from
 * the reply. Rejections go to "TT Guide Leads Rejected" (never to the TLS tabs in this file).
 *
 * This file is the copy of record. Change the live script only through
 * Deploy > Manage deployments > Edit (pencil) > Version: New version, so the URL stays the same.
 */

const CONFIG = Object.freeze({
  FORM: 'tt-guide',
  /** "TLS LEADS From Website" (also used by the Contact form script, apps-script/contact-form.gs). */
  SHEET_ID: '1dNaI5ntcUzhuaF4FFx5XGKIac5K9SLcuBqVQwdRYqBY',
  /** Written on every row: the spreadsheet is shared with the True Lean Solutions website. */
  LEAD_SOURCE: 'Tech Transpire website (techtranspire.com)',
  LEADS_SHEET: 'TT Guide Leads',
  REJECTED_SHEET: 'TT Guide Leads Rejected',
  /** A human needs at least this long between page load and submit. */
  MIN_SECONDS: 3,
  /** A page left open longer than this is treated as stale. */
  MAX_AGE_DAYS: 7,
  /** Allowance for a visitor's clock running ahead of the server's. */
  CLOCK_SKEW_MINUTES: 10,
  MAX_NAME: 120,
  MAX_EMAIL: 254,
  MAX_PAGE: 200,
  /** Sheets allows 50,000 characters per cell. */
  MAX_CELL: 45000,
});

/** Every guide the form may ask for, by the id the site sends (site/src/data/guide.ts). */
const GUIDES = Object.freeze({
  'solve-the-right-problem': { title: 'Solve the Right Problem (playbook)' },
});

const LEAD_HEADERS = [
  'Submitted At (UTC)', 'Lead Source', 'Name', 'Email', 'Guide', 'Page', 'Opened From',
  'Notice Shown At (UTC)', 'Asked Before',
];
const REJECT_HEADERS = [
  'Logged At (UTC)', 'Lead Source', 'Reason', 'Seconds To Submit', 'Name', 'Email', 'Guide',
  'Page', 'Opened From', 'website (honeypot)', 'form_ts', 'submitted',
];

function doPost(e) {
  try {
    handle_((e && e.parameter) || {});
  } catch (err) {
    console.error('guide-leads: ' + (err && err.stack ? err.stack : err));
  }
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function doGet() {
  return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}

function handle_(p) {
  const now = new Date();
  const lead = {
    name: clean_(p.name, CONFIG.MAX_NAME),
    email: clean_(p.email, CONFIG.MAX_EMAIL).toLowerCase(),
    guide: clean_(p.guide, 60),
    page: clean_(p.page, CONFIG.MAX_PAGE),
    source: clean_(p.source, 20),
    website: clean_(p.website, 200),
    formTs: clean_(p.form_ts, 20),
    submitted: clean_(p.submitted, 40),
    noticeShown: isoOrBlank_(p.notice_shown),
  };

  const verdict = judge_(p, lead, now);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const book = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    if (verdict.reason) {
      sheet_(book, CONFIG.REJECTED_SHEET, REJECT_HEADERS).appendRow([
        now.toISOString(), CONFIG.LEAD_SOURCE, verdict.reason, verdict.seconds, lead.name, lead.email, lead.guide,
        lead.page, lead.source, lead.website, lead.formTs, lead.submitted,
      ].map(safeCell_));
      return;
    }

    const leads = sheet_(book, CONFIG.LEADS_SHEET, LEAD_HEADERS);
    const title = GUIDES[lead.guide].title;
    leads.appendRow([
      now.toISOString(), CONFIG.LEAD_SOURCE, lead.name, lead.email, title, lead.page, lead.source,
      lead.noticeShown, askedBefore_(leads, lead.email, title) ? 'Yes' : '',
    ].map(safeCell_));
  } finally {
    lock.releaseLock();
  }
}

/** Returns { reason, seconds }; an empty reason means the lead is accepted. */
function judge_(p, lead, now) {
  let seconds = '';
  if (clean_(p.form, 40) !== CONFIG.FORM) return { reason: 'wrong_form', seconds };
  if (lead.website) return { reason: 'honeypot', seconds };
  if (!/^\d{10,16}$/.test(lead.formTs)) return { reason: 'form_ts_missing', seconds };
  const loaded = Number(lead.formTs);
  const submitted = Date.parse(lead.submitted);
  if (!isFinite(submitted)) return { reason: 'submitted_missing', seconds };
  seconds = Math.round((submitted - loaded) / 1000);
  if (seconds < CONFIG.MIN_SECONDS) return { reason: 'too_fast', seconds };
  const age = now.getTime() - loaded;
  if (age > CONFIG.MAX_AGE_DAYS * 86400000) return { reason: 'form_ts_stale', seconds };
  if (age < -CONFIG.CLOCK_SKEW_MINUTES * 60000) return { reason: 'form_ts_future', seconds };
  if (!GUIDES[lead.guide]) return { reason: 'unknown_guide', seconds };
  if (lead.name.length < 2) return { reason: 'name_missing', seconds };
  if (/https?:\/\/|www\./i.test(lead.name)) return { reason: 'name_has_link', seconds };
  if (!validEmail_(lead.email)) return { reason: 'email_invalid', seconds };
  return { reason: '', seconds };
}

function validEmail_(email) {
  if (!email || email.length > CONFIG.MAX_EMAIL) return false;
  // One address only: no separators that could add recipients or headers.
  if (/[\s,;<>()\[\]\\"]/.test(email)) return false;
  return /^[a-z0-9._%+\-]+@[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?)*\.[a-z]{2,24}$/.test(email);
}

/** True when this address already asked for this guide (last 2,000 rows). */
function askedBefore_(sheet, email, title) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  const count = Math.min(last - 1, 2000);
  // Columns C–E: Name, Email, Guide (B is Lead Source).
  const rows = sheet.getRange(last - count + 1, 3, count, 3).getValues();
  return rows.some(function (row) {
    return String(row[1]).toLowerCase() === email && row[2] === title;
  });
}

function sheet_(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]+/g, ' ').trim().slice(0, max);
}
function isoOrBlank_(value) {
  const t = Date.parse(clean_(value, 40));
  return isFinite(t) ? new Date(t).toISOString() : '';
}
/** Text a spreadsheet would read as a formula is stored as plain text, and kept under the cell limit. */
function safeCell_(value) {
  if (typeof value !== 'string') return value;
  const s = value.length > CONFIG.MAX_CELL ? value.slice(0, CONFIG.MAX_CELL) : value;
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

/**
 * Run once from the editor after pasting this file: it asks for the one permission the script
 * needs (Google Sheets) and writes a test row to "TT Guide Leads". Delete the row afterwards.
 */
function writeTestRow() {
  const now = new Date();
  handle_({
    form: CONFIG.FORM, guide: 'solve-the-right-problem', source: 'test', page: '/test/',
    name: 'Test Reader', email: 'test@example.com', website: '',
    form_ts: String(now.getTime() - 10000), submitted: new Date(now.getTime() - 1000).toISOString(),
    notice_shown: now.toISOString(),
  });
  console.log('Wrote a test row to "' + CONFIG.LEADS_SHEET + '". Delete it after checking.');
}

/** Run from the editor: logs ok/FAIL for each spam rule. Writes nothing. */
function testSpamRules() {
  const now = new Date();
  const t = now.getTime();
  const good = {
    form: CONFIG.FORM, guide: 'solve-the-right-problem', source: 'popup', page: '/about-us',
    name: 'Jordan Lee', email: 'jordan@example.com', website: '',
    form_ts: String(t - 60000), submitted: new Date(t - 1000).toISOString(),
  };
  const withOverride = function (over) { return Object.assign({}, good, over); };
  const cases = [
    ['clean lead', good, ''],
    ['wrong form id', withOverride({ form: 'tt-contact' }), 'wrong_form'],
    ['honeypot filled', withOverride({ website: 'http://spam.example' }), 'honeypot'],
    ['form_ts missing', withOverride({ form_ts: '' }), 'form_ts_missing'],
    ['submitted missing', withOverride({ submitted: '' }), 'submitted_missing'],
    ['too fast (2 s)', withOverride({ form_ts: String(t - 2000), submitted: new Date(t).toISOString() }), 'too_fast'],
    ['stale (8 days)', withOverride({ form_ts: String(t - 8 * 86400000), submitted: new Date(t).toISOString() }), 'form_ts_stale'],
    ['clock 20 min ahead', withOverride({ form_ts: String(t + 1200000), submitted: new Date(t + 1260000).toISOString() }), 'form_ts_future'],
    ['unknown guide', withOverride({ guide: 'field-guide-2027' }), 'unknown_guide'],
    ['name too short', withOverride({ name: 'J' }), 'name_missing'],
    ['link in name', withOverride({ name: 'Visit www.spam.example' }), 'name_has_link'],
    ['two addresses', withOverride({ email: 'a@example.com,b@example.com' }), 'email_invalid'],
  ];
  let failed = 0;
  cases.forEach(function (c) {
    const p = c[1];
    const lead = {
      name: clean_(p.name, CONFIG.MAX_NAME), email: clean_(p.email, CONFIG.MAX_EMAIL).toLowerCase(),
      guide: clean_(p.guide, 60), website: clean_(p.website, 200), formTs: clean_(p.form_ts, 20), submitted: clean_(p.submitted, 40),
    };
    const got = judge_(p, lead, now).reason;
    const pass = got === c[2];
    if (!pass) failed++;
    console.log((pass ? 'ok   ' : 'FAIL ') + c[0] + ' → ' + (got || 'accepted') + (pass ? '' : ' (expected ' + (c[2] || 'accepted') + ')'));
  });
  [['=HYPERLINK("x")', "'=HYPERLINK(\"x\")"], ['+1 555', "'+1 555"], ['@here', "'@here"], ['plain', 'plain']].forEach(function (c) {
    const pass = safeCell_(c[0]) === c[1];
    if (!pass) failed++;
    console.log((pass ? 'ok   ' : 'FAIL ') + 'safeCell_ ' + c[0]);
  });
  console.log(failed ? failed + ' FAILED' : 'All spam rules pass');
}
