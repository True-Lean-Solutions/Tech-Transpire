// Field-guide tab, card and lead form (D-56; markup and styles in components/GuidePrompt.astro).
// Re-wired on every page load, including client-side navigations, and torn down before each swap.

type State = 'tab' | 'open' | 'done';
type Tone = 'clear' | 'dense' | 'dark';

const DONE_KEY = 'tt:guide:done';
const DISMISSED_KEY = 'tt:guide:dismissed';
const SHOWN_KEY = 'tt:guide:shown';
/** Set for the rest of the browser session once the tab has nudged, so later pages stay still. */
const SESSION_KEY = 'tt:guide:on';

const DAY = 86_400_000;
const QUIET_MS = 14 * DAY;
const MAX_SHOWS = 3;
const SCROLL_SHARE = 0.3;
const WAIT_MS = 20_000;
const RETRY_MS = 1500;
/** Attention nudges: the first when the tab offers itself, then a few more, until the visitor reacts. */
const NUDGE_FIRST_MS = 700;
const NUDGE_GAP_MS = 8000;
const NUDGES = 4;
/** Width of the refracting rim, in CSS px. */
const RIM = 16;
// Loose on purpose: the browser's own email check runs too, and the Apps Script has the final say.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Storage can be blocked (private modes, strict settings): then every visit behaves as the first.
const store = (area: () => Storage) => ({
  get(key: string): string | null { try { return area().getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { area().setItem(key, value); } catch { /* not remembered */ } },
});
const local = store(() => window.localStorage);
const session = store(() => window.sessionStorage);

// backdrop-filter: url() (SVG refraction of the live page) works in Chromium only; elsewhere the
// card keeps the plain blurred glass. Only Chromium exposes navigator.userAgentData.
const canRefract = () => !!(navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands?.some((b) => b.brand === 'Chromium');

let page: AbortController | null = null;
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => { page?.abort(); page = null; });

function init() {
  page?.abort();
  const card = document.querySelector<HTMLElement>('[data-guide-prompt]');
  if (!card) return;
  const ctl = new AbortController();
  page = ctl;
  const { signal } = ctl;
  const loadedAt = Date.now();
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tab = card.querySelector<HTMLButtonElement>('[data-guide-expand]')!;
  const close = card.querySelector<HTMLButtonElement>('[data-guide-close]')!;
  const body = card.querySelector<HTMLElement>('.gd-body')!;
  const form = card.querySelector<HTMLFormElement>('[data-guide-form]')!;
  const done = card.querySelector<HTMLElement>('[data-guide-done]')!;
  const name = form.querySelector<HTMLInputElement>('input[name="name"]')!;
  const email = form.querySelector<HTMLInputElement>('input[name="email"]')!;
  const honeypot = form.querySelector<HTMLInputElement>('input[name="website"]')!;
  const err = form.querySelector<HTMLElement>('.gd-err')!;
  const notice = form.querySelector<HTMLElement>('.gd-notice')!;
  const openers = [...document.querySelectorAll<HTMLElement>('[data-guide-open]')];

  let visible = false;
  let returnTo: HTMLElement | null = null;
  let timer = 0;
  signal.addEventListener('abort', () => {
    window.clearTimeout(timer);
    document.documentElement.classList.remove('guide-open', 'guide-on');
  });

  // ---- Glass: tone from what is behind the card ----
  const lum = (r: number, g: number, b: number) => {
    const lin = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const rgba = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/g;
  /** Luminance of an element's own painted background (colour or gradient), or null if see-through. */
  const paint = (el: Element): number | null => {
    const cs = getComputedStyle(el);
    const solid = [...cs.backgroundColor.matchAll(rgba)][0];
    if (solid && Number(solid[4] ?? 1) >= 0.5) return lum(+solid[1], +solid[2], +solid[3]);
    if (cs.backgroundImage.includes('gradient')) {
      const stops = [...cs.backgroundImage.matchAll(rgba)].filter((m) => Number(m[4] ?? 1) >= 0.5);
      if (stops.length) return stops.reduce((sum, m) => sum + lum(+m[1], +m[2], +m[3]), 0) / stops.length;
    }
    return null;
  };
  const measureTone = (): Tone => {
    const r = card.getBoundingClientRect();
    const cols = 4;
    const rows = Math.max(2, Math.round(r.height / 56));
    let dark = 0, busy = 0, total = 0;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = r.left + 8 + ((r.width - 16) * i) / (cols - 1);
      const y = r.top + 8 + ((r.height - 16) * j) / (rows - 1);
      // Down through everything painted at this point (overlays included) to the first photo,
      // canvas or opaque background; the page itself is white.
      let L: number | null = null;
      let media = false;
      for (const el of document.elementsFromPoint(x, y)) {
        if (card.contains(el)) continue;
        if (el.matches('img, picture, video, canvas')) { media = true; break; }
        if ((L = paint(el)) !== null) break;
      }
      total++;
      if (media) { busy++; continue; }
      L ??= 1;
      if (L < 0.2) dark++;
      else if (L < 0.6) busy++;
    }
    if (total && dark * 2 >= total) return 'dark';
    return dark || busy ? 'dense' : 'clear';
  };
  let toneFrame = 0;
  const updateTone = () => {
    if (toneFrame || !visible) return;
    toneFrame = requestAnimationFrame(() => { toneFrame = 0; if (visible) card.dataset.tone = measureTone(); });
  };
  window.addEventListener('scroll', updateTone, { passive: true, signal });
  window.addEventListener('resize', updateTone, { signal });
  signal.addEventListener('abort', () => cancelAnimationFrame(toneFrame));

  // ---- Glass: refraction map drawn to the card's real shape (Chromium) ----
  const filter = document.getElementById('gd-refract');
  const mapImage = filter?.querySelector<SVGFEImageElement>('[data-guide-map]');
  /** Displacement map: neutral inside, pulling the backdrop inward across the rim, like a lens edge. */
  const drawMap = (w: number, h: number, radius: number) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    if (!g) return '';
    const img = g.createImageData(w, h);
    const d = img.data;
    const r = Math.min(radius, w / 2, h / 2);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x + 0.5 - w / 2;
        const py = y + 0.5 - h / 2;
        const qx = Math.abs(px) - (w / 2 - r);
        const qy = Math.abs(py) - (h / 2 - r);
        const ox = Math.max(qx, 0);
        const oy = Math.max(qy, 0);
        const out = Math.hypot(ox, oy);
        const depth = r - out - Math.min(Math.max(qx, qy), 0);
        let dx = 0, dy = 0;
        if (depth > 0 && depth < RIM) {
          let nx: number, ny: number;
          if (out > 0) { nx = (ox / out) * Math.sign(px); ny = (oy / out) * Math.sign(py); }
          else if (qx > qy) { nx = Math.sign(px); ny = 0; }
          else { nx = 0; ny = Math.sign(py); }
          const k = (1 - depth / RIM) ** 2;
          dx = -nx * k;
          dy = -ny * k;
        }
        const i = (y * w + x) * 4;
        d[i] = 128 + dx * 127;
        d[i + 1] = 128 + dy * 127;
        d[i + 2] = 128;
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL();
  };
  if (filter && mapImage && canRefract()) {
    let size = '';
    const fit = () => {
      const r = card.getBoundingClientRect();
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (!w || !h || `${w}x${h}` === size) return;
      size = `${w}x${h}`;
      const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
      for (const el of [filter, mapImage]) { el.setAttribute('width', String(w)); el.setAttribute('height', String(h)); }
      mapImage.setAttribute('href', drawMap(w, h, radius));
      card.classList.add('gd-refract');
    };
    const ro = new ResizeObserver(fit);
    ro.observe(card);
    signal.addEventListener('abort', () => ro.disconnect());
  }

  // ---- Getting noticed ----
  let nudgeTimer = 0;
  let nudgesLeft = 0;
  const nudge = () => {
    if (!nudgesLeft || !visible || card.dataset.state !== 'tab') return;
    nudgesLeft--;
    card.removeAttribute('data-nudge');
    void card.offsetWidth; // restart the animation
    card.setAttribute('data-nudge', '');
    if (nudgesLeft) nudgeTimer = window.setTimeout(nudge, NUDGE_GAP_MS);
  };
  const startAttention = (count: number) => {
    nudgesLeft = count;
    card.dataset.attention = '';
    window.clearTimeout(nudgeTimer);
    nudgeTimer = window.setTimeout(nudge, NUDGE_FIRST_MS);
  };
  const stopAttention = () => {
    nudgesLeft = 0;
    window.clearTimeout(nudgeTimer);
    delete card.dataset.attention;
    card.removeAttribute('data-nudge');
  };
  card.addEventListener('animationend', (e) => { if (e.target === card && e.animationName.includes('gd-ring')) card.removeAttribute('data-nudge'); }, { signal });
  // Any sign the visitor has seen it ends the nudging for this page.
  card.addEventListener('pointerenter', stopAttention, { signal });
  card.addEventListener('focusin', stopAttention, { signal });
  signal.addEventListener('abort', () => window.clearTimeout(nudgeTimer));

  // ---- States ----
  const setState = (state: State) => {
    card.dataset.state = state;
    const open = state !== 'tab';
    body.hidden = !open;
    tab.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('guide-open', open && visible);
    if (open) stopAttention();
    updateTone();
  };

  const show = (state: Exclude<State, 'done'>) => {
    if (card.dataset.state !== 'done') setState(state);
    if (visible) return;
    visible = true;
    card.hidden = false;
    document.documentElement.classList.add('guide-on');
    document.documentElement.classList.toggle('guide-open', card.dataset.state !== 'tab');
    card.dataset.tone = measureTone();
    // Next frame, so the entrance runs from the hidden state.
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-in')));
  };

  const quiet = card.dataset.quiet !== undefined;
  let downloaded = false;
  /** The visitor has opened the card on this page: no nudge needed after that. */
  let engaged = false;

  /** The card folds back into the tab, which stays in its corner. Only on the quiet pages (no tab
   *  there) does it leave the screen. Folding an unanswered card is a "not now": no nudges for 14 days. */
  const minimize = () => {
    if (card.dataset.state === 'tab') return;
    if (card.dataset.state === 'open') local.set(DISMISSED_KEY, String(Date.now()));
    const hadFocus = card.contains(document.activeElement);
    const back = returnTo;
    returnTo = null;
    if (quiet) {
      visible = false;
      stopAttention();
      document.documentElement.classList.remove('guide-open', 'guide-on');
      card.classList.remove('is-in');
      window.setTimeout(() => { if (!visible) card.hidden = true; }, reduce() ? 0 : 260);
    } else {
      setState('tab');
    }
    if (back?.isConnected) back.focus({ preventScroll: true });
    else if (hadFocus) (quiet ? document.getElementById('main') : tab)?.focus({ preventScroll: true });
  };

  /** Opens the card: the form, or the confirmation if the guide was already downloaded on this page. */
  const expand = () => {
    engaged = true;
    stopAttention();
    show(downloaded ? 'tab' : 'open');
    if (downloaded) { setState('done'); requestAnimationFrame(() => done.focus({ preventScroll: true })); return; }
    requestAnimationFrame(() => name.focus({ preventScroll: true }));
  };

  tab.addEventListener('click', expand, { signal });
  close.addEventListener('click', minimize, { signal });
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || card.dataset.state === 'tab') return;
    e.stopPropagation();
    minimize();
  }, { signal });

  openers.forEach((opener) => {
    (opener.closest<HTMLElement>('[data-guide-open-wrap]') ?? opener).hidden = false;
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      returnTo = opener;
      expand();
    }, { signal });
  });

  // ---- The form ----
  // When the notice under the button was first on screen: what the visitor read before sending.
  let noticeShown = '';
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { noticeShown = new Date().toISOString(); io.disconnect(); }
    });
    io.observe(notice);
    signal.addEventListener('abort', () => io.disconnect());
  }

  const fail = (field: HTMLInputElement, message: string) => {
    field.setAttribute('aria-invalid', 'true');
    err.textContent = message;
    err.hidden = false;
    field.focus();
  };
  [name, email].forEach((f) => f.addEventListener('input', () => f.removeAttribute('aria-invalid'), { signal }));

  // A same-site file saved through a temporary link, inside the submit itself so the browser
  // treats the download as asked for.
  const download = () => {
    const link = Object.assign(document.createElement('a'), { href: card.dataset.file ?? '', download: card.dataset.fileName ?? '', hidden: true });
    document.body.append(link);
    link.click();
    link.remove();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    name.removeAttribute('aria-invalid');
    email.removeAttribute('aria-invalid');
    err.hidden = true;
    const nameValue = name.value.trim();
    const emailValue = email.value.trim();
    if (nameValue.length < 2) return fail(name, 'Please enter your name.');
    if (!emailValue) return fail(email, 'Please enter your work email.');
    if (!EMAIL.test(emailValue) || !email.checkValidity()) return fail(email, 'That email address does not look right.');

    // A filled honeypot is a bot: the same confirmation, with nothing sent or downloaded.
    if (!honeypot.value.trim()) {
      download();
      const params = new URLSearchParams({
        form: 'tt-guide',
        guide: card.dataset.guide ?? '',
        source: 'popup',
        page: location.pathname,
        name: nameValue,
        email: emailValue,
        website: '',
        form_ts: String(loadedAt),
        notice_shown: noticeShown || new Date().toISOString(),
        submitted: new Date().toISOString(),
      });
      // Fire-and-forget: the download never waits on the sheet.
      fetch(card.dataset.endpoint ?? '', { method: 'POST', body: params, mode: 'no-cors', keepalive: true }).catch(() => {});
    }
    local.set(DONE_KEY, String(Date.now()));
    downloaded = true;
    form.hidden = true;
    done.hidden = false;
    setState('done');
    done.focus({ preventScroll: true });
  }, { signal });

  // ---- Offering itself ----
  const num = (key: string) => Number(local.get(key)) || 0;
  const shows = (): number[] => {
    try {
      const list = JSON.parse(local.get(SHOWN_KEY) ?? '[]');
      return Array.isArray(list) ? list.filter((t) => typeof t === 'number' && loadedAt - t < QUIET_MS) : [];
    } catch {
      return [];
    }
  };
  // The tab sits in its corner on every page, like a chat launcher, and stays there: scrolling
  // never moves it and × only folds the card back into it. Not on the quiet pages.
  if (quiet) return;
  show('tab');

  // The offer is the nudge: once per browser session, at most 3 sessions in 14 days, never after
  // a download, and not for 14 days after the visitor folded the card away unanswered.
  const nudgeable = !num(DONE_KEY) && loadedAt - num(DISMISSED_KEY) > QUIET_MS && !session.get(SESSION_KEY) && shows().length < MAX_SHOWS;
  if (!nudgeable) return;

  let offered = false;
  const typing = () => !!document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
  const offer = () => {
    if (offered || signal.aborted) return;
    window.clearTimeout(timer);
    if (engaged) return; // already opened on this page: no need to call attention
    if (document.hidden || typing()) { timer = window.setTimeout(offer, RETRY_MS); return; }
    offered = true;
    local.set(SHOWN_KEY, JSON.stringify([...shows(), Date.now()]));
    session.set(SESSION_KEY, '1');
    startAttention(NUDGES);
  };
  window.addEventListener('scroll', () => {
    const room = document.documentElement.scrollHeight - window.innerHeight;
    if (room > 0 && window.scrollY / room >= SCROLL_SHARE) offer();
  }, { passive: true, signal });
  timer = window.setTimeout(offer, WAIT_MS);
}
