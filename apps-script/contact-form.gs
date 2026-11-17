// ═══════════════════════════════════════════════════════════════════════════════
// Tech Transpire: website contact form (https://www.techtranspire.com/contact-us)
//
// Receives the form posted by site/src/pages/contact-us.astro, stores it in the Google Sheet and
// emails a notification to info@. Validation, spam rules and the response contract mirror
// site/src/server/inquiry.ts, so the site handles both endpoints the same way:
//   { ok: true }  |  { ok: false, reason: 'validation', errors: { field: message } }
//                 |  { ok: false, reason: 'bad-request' | 'rate-limited' | 'server-error' }
// Apps Script always answers HTTP 200, so the site reads `ok` and `reason`, never the status code.
//
// Spam (D-55): checked first, before the rate limit, any sheet write or email. A rejected post
// gets the same { ok: true } as a real one, sends no email, never touches SHEET_TAB and is logged
// to REJECTED_TAB. Run testSpamRules() from the editor to check the rules; it writes nothing.
//
// Deploy: Deploy → Manage deployments → edit (pencil) the existing web app → Version: New version
// → Deploy. Keep "Execute as: Me" and "Who has access: Anyone". Editing the existing deployment
// keeps the /exec URL the site uses (site/src/lib/site.ts); a brand-new deployment changes it.
// ═══════════════════════════════════════════════════════════════════════════════

const SHEET_ID = '1dNaI5ntcUzhuaF4FFx5XGKIac5K9SLcuBqVQwdRYqBY';
const SHEET_TAB = 'Website Inquiries'; // The previous form's TT_Submissions tab is left as it is.
const REJECTED_TAB = 'Rejected_TT'; // Not "Rejected": the TLS script writes that tab in this spreadsheet.
const NOTIFY_EMAIL = 'info@techtranspire.com';
const FORM_ID = 'tt-contact-us';

// ▼▼▼ LOG_REJECTED_IN_FULL ▼▼▼
// true:  every field, reason, form id, seconds to submit and the raw JSON go to REJECTED_TAB.
// false: one short row (time, reason, form id). Switch to false after two weeks (around 2026-12-02).
const LOG_REJECTED_IN_FULL = true;
// ▲▲▲ LOG_REJECTED_IN_FULL ▲▲▲

const MIN_FILL_MS = 3000; // submitted − form_ts below this is a bot (both from the visitor's clock).
const MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000; // form_ts older than 7 days + 1 day leeway (server clock).
const RATE_LIMIT_MAX = 20; // Accepted (non-spam) posts per window across all visitors (no client IP in Apps Script).
const RATE_LIMIT_WINDOW_S = 600;
const MAX_BODY_CHARS = 20000;
const MAX_CELL_CHARS = 45000; // Sheets' limit is 50,000 per cell.

const AREAS = {
  discovery: 'Discovery and clarity',
  blueprint: 'Execution blueprint',
  implementation: 'Guided implementation',
  recovery: 'Recovering a stalled or underperforming initiative',
  referral: 'Referral or partnership',
  other: 'Something else',
};
const SOURCES = ['LinkedIn', 'Facebook', 'Referral', 'Search', 'Event or presentation', 'Existing client or colleague', 'Other'];

const MSG = {
  name: 'Please enter your name.',
  company: 'Please enter your company name.',
  email: "That email address doesn't look complete. Please check it.",
  phone: 'Please check the phone number, or leave it blank.',
  area: "Please choose the option closest to what you'd like to discuss.",
  message: 'Please tell us a little more, a sentence or two is enough.',
  source: 'Please choose one of the options.',
  consent: 'Please confirm you agree to the Privacy Policy so we can respond.',
};

const HEADERS = [
  'Submitted At (UTC)', 'Name', 'Company', 'Email', 'Phone', 'Area of Interest',
  'Message', 'How They Heard', 'Consent Given At (UTC)', 'Email Notification',
];
const NOTIFY_COL = HEADERS.length;

// The first three columns are also the whole row when LOG_REJECTED_IN_FULL is false.
const REJECTED_HEADERS = [
  'Logged At (UTC)', 'Reason', 'Form', 'Seconds To Submit',
  'Name', 'Company', 'Email', 'Phone', 'Area of Interest', 'Message', 'How They Heard', 'Consent',
  'website (honeypot)', 'form_ts', 'submitted', 'Raw JSON',
];

function doPost(e) {
  let fields;
  try {
    fields = parsePayload_(e);
  } catch (err) {
    console.warn('inquiry: bad-request', String(err));
    return json_({ ok: false, reason: 'bad-request' });
  }
  try {
    return json_(handle_(fields));
  } catch (err) {
    console.error('inquiry: server-error', err && err.stack ? err.stack : String(err));
    return json_({ ok: false, reason: 'server-error' });
  }
}

function doGet() {
  return json_({ status: 'running' });
}

function handle_(f) {
  // Spam first: same response as a real submission, no email, nothing in SHEET_TAB, and it is
  // never counted by the rate limit, so a spam burst cannot lock out real visitors.
  const reason = spamCheck_(f, Date.now());
  if (reason) {
    console.log('inquiry: spam:' + reason);
    logRejected_(f, reason);
    return { ok: true };
  }
  if (!allow_()) { console.warn('inquiry: rate-limited'); return { ok: false, reason: 'rate-limited' }; }

  const result = validate_(f);
  if (result.errors) return { ok: false, reason: 'validation', errors: result.errors };
  const d = result.data;

  const stored = store_(d);
  const notified = notify_(d);
  try {
    stored.sheet.getRange(stored.row, NOTIFY_COL).setValue(safeCell_(notified));
  } catch (err) {
    console.error('inquiry: could not record notification status', String(err));
  }
  console.log('inquiry: received', 'row=' + stored.row, 'mail=' + notified);
  // The Sheet is the record: once stored, the visitor sees success even if the email failed.
  return { ok: true };
}

// Returns the rejection reason, or null for a clean submission. Mirrors spamCheck in inquiry.ts.
function spamCheck_(f, nowMs) {
  if (str_(f.website)) return 'honeypot';
  const ts = str_(f.form_ts);
  if (!ts) return 'form_ts_missing';
  if (!/^\d{10,15}$/.test(ts)) return 'form_ts_invalid';
  const sub = str_(f.submitted);
  if (!sub) return 'submitted_missing';
  const subMs = Date.parse(sub);
  if (isNaN(subMs)) return 'submitted_invalid';
  if (subMs - Number(ts) < MIN_FILL_MS) return 'too_fast';
  if (nowMs - Number(ts) > MAX_AGE_MS) return 'too_old';
  return null;
}

function logRejected_(f, reason) {
  // Logging must never change the visitor's response, so failures are only written to the log.
  try {
    const now = new Date().toISOString();
    let row = [now, reason, FORM_ID];
    if (LOG_REJECTED_IN_FULL) {
      const ts = Number(str_(f.form_ts));
      const subMs = Date.parse(str_(f.submitted));
      const secs = ts && !isNaN(subMs) ? Math.round((subMs - ts) / 100) / 10 : '';
      let rawJson;
      try { rawJson = JSON.stringify(f); } catch (err) { rawJson = '(unserializable)'; }
      row = row.concat([
        secs, str_(f.name), str_(f.company), str_(f.email), str_(f.phone), str_(f.areaOfInterest),
        str_(f.message), str_(f.source), str_(f.consent), str_(f.website), str_(f.form_ts), str_(f.submitted), rawJson,
      ]);
    }
    rejectedSheet_().appendRow(row.map(safeCell_));
  } catch (err) {
    console.error('inquiry: could not log rejected post', reason, String(err));
  }
}

function rejectedSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const existing = ss.getSheetByName(REJECTED_TAB);
  if (existing) return existing;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let sheet = ss.getSheetByName(REJECTED_TAB); // Another execution may have created it meanwhile.
    if (!sheet) {
      sheet = ss.insertSheet(REJECTED_TAB);
      sheet.appendRow(REJECTED_HEADERS);
      sheet.getRange(1, 1, 1, REJECTED_HEADERS.length).setFontWeight('bold').setBackground('#0E2841').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
    return sheet;
  } finally {
    lock.releaseLock();
  }
}

function validate_(f) {
  const errors = {};
  const name = clean_(f.name);
  const company = clean_(f.company);
  const email = clean_(f.email);
  const phone = clean_(f.phone);
  const areaKey = clean_(f.areaOfInterest);
  const message = typeof f.message === 'string' ? f.message.trim() : '';
  const source = clean_(f.source);

  if (name.length < 2 || name.length > 120) errors.name = MSG.name;
  if (!company || company.length > 120) errors.company = MSG.company;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) errors.email = MSG.email;
  if (phone && !/^[0-9 +()\-]{7,20}$/.test(phone)) errors.phone = MSG.phone;
  if (!Object.prototype.hasOwnProperty.call(AREAS, areaKey)) errors.areaOfInterest = MSG.area;
  if (message.length < 20 || message.length > 4000) errors.message = MSG.message;
  if (source && SOURCES.indexOf(source) === -1) errors.source = MSG.source;
  if (['on', 'true', 'yes'].indexOf(clean_(f.consent).toLowerCase()) === -1) errors.consent = MSG.consent;
  if (Object.keys(errors).length) return { errors: errors };

  return {
    data: {
      name: name, company: company, email: email, phone: phone,
      area: AREAS[areaKey], message: message, source: source,
      at: new Date().toISOString(),
    },
  };
}

function store_(d) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_TAB);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TAB);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0E2841').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([d.at, d.name, d.company, d.email, d.phone, d.area, d.message, d.source, d.at, 'Pending'].map(safeCell_));
    SpreadsheetApp.flush();
    return { sheet: sheet, row: sheet.getLastRow() };
  } finally {
    lock.releaseLock();
  }
}

function notify_(d) {
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      replyTo: d.email,
      name: 'Tech Transpire Website',
      subject: 'New website inquiry: ' + d.name + ' (' + d.company + ')',
      body: [
        'New inquiry from www.techtranspire.com/contact-us',
        '',
        'Name: ' + d.name,
        'Company: ' + d.company,
        'Email: ' + d.email,
        'Phone: ' + (d.phone || 'Not given'),
        'Area of interest: ' + d.area,
        'How they heard: ' + (d.source || 'Not given'),
        'Consent given: ' + d.at,
        '',
        'Message:',
        d.message,
        '',
        'Reply to this email to answer ' + d.name + ' directly.',
        'All inquiries: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit',
      ].join('\n'),
    });
    return 'Sent';
  } catch (err) {
    console.error('inquiry: mail failed', String(err));
    return 'Failed: ' + String(err).slice(0, 200);
  }
}

function parsePayload_(e) {
  if (!e || !e.postData) throw new Error('no body');
  // A no-JavaScript form post arrives URL-encoded; Apps Script has already parsed it.
  if (e.postData.type === 'application/x-www-form-urlencoded') return e.parameter || {};
  const raw = e.postData.contents || '';
  if (!raw || raw.length > MAX_BODY_CHARS) throw new Error('empty or oversized body');
  const data = JSON.parse(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('body is not an object');
  return data;
}

function allow_() {
  const cache = CacheService.getScriptCache();
  const key = 'rl:' + Math.floor(Date.now() / (RATE_LIMIT_WINDOW_S * 1000));
  const count = Number(cache.get(key) || 0);
  if (count >= RATE_LIMIT_MAX) return false;
  cache.put(key, String(count + 1), RATE_LIMIT_WINDOW_S);
  return true;
}

function clean_(v) {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
}

// Any value as trimmed text (numbers included), '' for null or undefined.
function str_(v) {
  return v == null ? '' : String(v).trim();
}

// Stops a value such as "=HYPERLINK(...)" or "+1 555..." being read by Sheets as a formula or
// number, and keeps it under the per-cell limit.
function safeCell_(v) {
  let s = v == null ? '' : String(v);
  if (s.length > MAX_CELL_CHARS) s = s.slice(0, MAX_CELL_CHARS);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run from the editor (select testSpamRules → Run). Logs ok/FAIL per case; writes nothing.
function testSpamRules() {
  const NOW = Date.UTC(2026, 10, 18, 12, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;
  const at = function (ms) { return new Date(ms).toISOString(); };
  const good = { name: 'Jordan Lee', website: '', form_ts: String(NOW - 60000), submitted: at(NOW - 1000) };
  const withOverride = function (over) { return Object.assign({}, good, over); };
  const cases = [
    ['clean submission', good, null],
    ['honeypot filled', withOverride({ website: 'http://spam.example' }), 'honeypot'],
    ['honeypot whitespace only', withOverride({ website: '   ' }), null],
    ['form_ts missing (old page or direct POST)', { name: 'x', submitted: at(NOW) }, 'form_ts_missing'],
    ['form_ts empty', withOverride({ form_ts: '' }), 'form_ts_missing'],
    ['form_ts too short', withOverride({ form_ts: '12345' }), 'form_ts_invalid'],
    ['form_ts not digits', withOverride({ form_ts: '17630000000x0' }), 'form_ts_invalid'],
    ['form_ts sent as a number', withOverride({ form_ts: NOW - 60000 }), null],
    ['submitted missing', withOverride({ submitted: '' }), 'submitted_missing'],
    ['submitted unparseable', withOverride({ submitted: 'not a date' }), 'submitted_invalid'],
    ['too fast (2 s)', withOverride({ form_ts: String(NOW - 2000), submitted: at(NOW) }), 'too_fast'],
    ['submitted before form_ts', withOverride({ form_ts: String(NOW), submitted: at(NOW - 60000) }), 'too_fast'],
    ['exactly 3 s', withOverride({ form_ts: String(NOW - 3000), submitted: at(NOW) }), null],
    ['too old (9 days)', withOverride({ form_ts: String(NOW - 9 * DAY), submitted: at(NOW) }), 'too_old'],
    ['7 days old is fine', withOverride({ form_ts: String(NOW - 7 * DAY), submitted: at(NOW) }), null],
    ['visitor clock 10 min ahead', withOverride({ form_ts: String(NOW + 600000), submitted: at(NOW + 610000) }), null],
    ['visitor clock 1 day behind', withOverride({ form_ts: String(NOW - DAY - 60000), submitted: at(NOW - DAY) }), null],
  ];
  let failed = 0;
  cases.forEach(function (c) {
    const got = spamCheck_(c[1], NOW);
    const pass = got === c[2];
    if (!pass) failed++;
    console.log((pass ? 'ok   ' : 'FAIL ') + c[0] + ' → ' + got + (pass ? '' : ' (expected ' + c[2] + ')'));
  });
  const cellCases = [
    ['=HYPERLINK("x")', "'=HYPERLINK(\"x\")"], ['+1 555 0100', "'+1 555 0100"], ['-5', "'-5"], ['@here', "'@here"], ['plain', 'plain'],
  ];
  cellCases.forEach(function (c) {
    const got = safeCell_(c[0]);
    const pass = got === c[1];
    if (!pass) failed++;
    console.log((pass ? 'ok   ' : 'FAIL ') + 'safeCell_ ' + c[0] + ' → ' + got);
  });
  const long = safeCell_(new Array(50001).join('a'));
  if (long.length !== MAX_CELL_CHARS) failed++;
  console.log((long.length === MAX_CELL_CHARS ? 'ok   ' : 'FAIL ') + 'safeCell_ caps 50,000 chars → ' + long.length);
  console.log(failed ? failed + ' FAILED' : 'All spam rules pass');
}
