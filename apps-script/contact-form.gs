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
// Deploy: Deploy → Manage deployments → edit (pencil) the existing web app → Version: New version
// → Deploy. Keep "Execute as: Me" and "Who has access: Anyone". Editing the existing deployment
// keeps the /exec URL the site uses (site/src/lib/site.ts); a brand-new deployment changes it.
// ═══════════════════════════════════════════════════════════════════════════════

const SHEET_ID = '1dNaI5ntcUzhuaF4FFx5XGKIac5K9SLcuBqVQwdRYqBY';
const SHEET_TAB = 'Website Inquiries'; // The previous form's TT_Submissions tab is left as it is.
const NOTIFY_EMAIL = 'info@techtranspire.com';

const MIN_FILL_MS = 3000; // Faster than this is treated as a bot, as on the site.
const RATE_LIMIT_MAX = 20; // Submissions accepted per window across all visitors (no client IP in Apps Script).
const RATE_LIMIT_WINDOW_S = 600;
const MAX_BODY_CHARS = 20000;

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
  // Spam signals are discarded silently with a normal-looking response, as on the site.
  if (clean_(f.website)) { console.log('inquiry: spam:honeypot'); return { ok: true }; }
  const started = Number(f.startedAt);
  if (started && Date.now() - started < MIN_FILL_MS) { console.log('inquiry: spam:too-fast'); return { ok: true }; }
  if (!allow_()) { console.warn('inquiry: rate-limited'); return { ok: false, reason: 'rate-limited' }; }

  const result = validate_(f);
  if (result.errors) return { ok: false, reason: 'validation', errors: result.errors };
  const d = result.data;

  const stored = store_(d);
  const notified = notify_(d);
  try {
    stored.sheet.getRange(stored.row, NOTIFY_COL).setValue(notified);
  } catch (err) {
    console.error('inquiry: could not record notification status', String(err));
  }
  console.log('inquiry: received', 'row=' + stored.row, 'mail=' + notified);
  // The Sheet is the record: once stored, the visitor sees success even if the email failed.
  return { ok: true };
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
    sheet.appendRow([d.at, d.name, d.company, d.email, d.phone, d.area, d.message, d.source, d.at, 'Pending'].map(cell_));
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

// Stops a value such as "=HYPERLINK(...)" or "+1 555..." being read by Sheets as a formula or number.
function cell_(v) {
  const s = v == null ? '' : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
