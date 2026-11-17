// Contact inquiry handling (06 §10, D-12, D-16). Pure logic: Zoho and mail are injected,
// so this runs and is tested without network access or credentials.

export const AREAS: Record<string, string> = {
  discovery: 'Discovery and clarity',
  blueprint: 'Execution blueprint',
  implementation: 'Guided implementation',
  recovery: 'Recovering a stalled or underperforming initiative',
  referral: 'Referral or partnership',
  other: 'Something else',
};
export const SOURCES = ['LinkedIn', 'Facebook', 'Referral', 'Search', 'Event or presentation', 'Existing client or colleague', 'Other'];

export type Inquiry = {
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string;
  area: string;
  areaKey: string;
  message: string;
  source?: string;
  consentAt: string;
};

export type Deps = {
  createLead?: (i: Inquiry) => Promise<string>;
  sendMail?: (i: Inquiry, leadId?: string) => Promise<void>;
  allow: (ip: string) => boolean;
  now: () => number;
  log: (event: string, detail?: string) => void;
};

export type Result = { status: number; body: { ok: boolean; reason?: string; errors?: Record<string, string> } };

// Messages match the client-side N-09 drafts.
const MSG = {
  name: 'Please enter your name.',
  company: 'Please enter your company name.',
  email: "That email address doesn't look complete. Please check it.",
  phone: 'Please check the phone number, or leave it blank.',
  area: "Please choose the option closest to what you'd like to discuss.",
  message: 'Please tell us a little more, a sentence or two is enough.',
  consent: 'Please confirm you agree to the Privacy Policy so we can respond.',
};

const clean = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

// Spam rules (D-55), mirrored in apps-script/contact-form.gs spamCheck_. form_ts (page load) and
// submitted (send time) both come from the visitor's clock, so their difference is skew-safe.
export const MIN_FILL_MS = 3000;
export const MAX_AGE_MS = 8 * 24 * 60 * 60 * 1000; // 7 days + 1 day leeway, against the server clock
const raw = (v: unknown) => (v == null ? '' : String(v).trim());

export function spamCheck(fields: Record<string, unknown>, now: number): string | null {
  if (raw(fields.website)) return 'honeypot';
  const ts = raw(fields.form_ts);
  if (!ts) return 'form_ts_missing';
  if (!/^\d{10,15}$/.test(ts)) return 'form_ts_invalid';
  const sub = raw(fields.submitted);
  if (!sub) return 'submitted_missing';
  const subMs = Date.parse(sub);
  if (Number.isNaN(subMs)) return 'submitted_invalid';
  if (subMs - Number(ts) < MIN_FILL_MS) return 'too_fast';
  if (now - Number(ts) > MAX_AGE_MS) return 'too_old';
  return null;
}

export function validate(fields: Record<string, string>, now: number): { data?: Inquiry; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = clean(fields.name);
  const company = clean(fields.company);
  const email = clean(fields.email);
  const phone = clean(fields.phone);
  const areaKey = clean(fields.areaOfInterest);
  const message = typeof fields.message === 'string' ? fields.message.trim() : '';
  const source = clean(fields.source);

  if (name.length < 2 || name.length > 120) errors.name = MSG.name;
  if (!company || company.length > 120) errors.company = MSG.company;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) errors.email = MSG.email;
  if (phone && !/^[0-9 +()\-]{7,20}$/.test(phone)) errors.phone = MSG.phone;
  if (!AREAS[areaKey]) errors.areaOfInterest = MSG.area;
  if (message.length < 20 || message.length > 4000) errors.message = MSG.message;
  if (source && !SOURCES.includes(source)) errors.source = 'Please choose one of the options.';
  if (!['on', 'true', 'yes'].includes(clean(fields.consent))) errors.consent = MSG.consent;
  if (Object.keys(errors).length) return { errors };

  // Zoho requires Last_Name: split on the last space; a single word becomes the last name.
  const cut = name.lastIndexOf(' ');
  return {
    data: {
      name,
      firstName: cut > 0 ? name.slice(0, cut) : '',
      lastName: cut > 0 ? name.slice(cut + 1) : name,
      company,
      email,
      phone: phone || undefined,
      area: AREAS[areaKey],
      areaKey,
      message,
      source: source || undefined,
      consentAt: new Date(now).toISOString(),
    },
  };
}

export async function handleInquiry(fields: Record<string, string>, ip: string, deps: Deps): Promise<Result> {
  // Spam is answered exactly like a real submission and checked before the rate limit, so
  // rejected posts never use up a real visitor's allowance (06 §10, D-55).
  const spam = spamCheck(fields, deps.now());
  if (spam) { deps.log(`spam:${spam}`); return { status: 200, body: { ok: true } }; }
  if (!deps.allow(ip)) { deps.log('rate-limited'); return { status: 429, body: { ok: false, reason: 'rate-limited' } }; }

  const { data, errors } = validate(fields, deps.now());
  if (!data) return { status: 422, body: { ok: false, reason: 'validation', errors } };

  if (!deps.createLead && !deps.sendMail) { deps.log('not-configured'); return { status: 503, body: { ok: false, reason: 'not-configured' } }; }

  let leadId: string | undefined;
  let crmOk = false;
  if (deps.createLead) {
    try { leadId = await deps.createLead(data); crmOk = true; }
    catch (e) { deps.log('crm:failed', (e as Error).message); }
  }
  let mailOk = false;
  if (deps.sendMail) {
    try { await deps.sendMail(data, crmOk ? leadId : undefined); mailOk = true; }
    catch (e) { deps.log('mail:failed', (e as Error).message); }
  }
  // Success only when the inquiry was actually received somewhere (CRM or email).
  if (crmOk || mailOk) { deps.log(`received crm=${crmOk} mail=${mailOk}`); return { status: 200, body: { ok: true } }; }
  return { status: 502, body: { ok: false, reason: 'delivery-failed' } };
}

/** In-memory sliding window. Per server instance; use the host's rate limiting in production. */
export function createRateLimiter(limit = 5, windowMs = 10 * 60 * 1000, now = () => Date.now()) {
  const hits = new Map<string, number[]>();
  return (ip: string) => {
    const t = now();
    const recent = (hits.get(ip) ?? []).filter((h) => t - h < windowMs);
    if (recent.length >= limit) { hits.set(ip, recent); return false; }
    recent.push(t);
    hits.set(ip, recent);
    return true;
  };
}
