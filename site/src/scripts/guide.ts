// Field-guide tab, card and lead form (D-56; markup and styles in components/GuidePrompt.astro).
// Re-wired on every page load, including client-side navigations, and torn down before each swap.

type Glass = { pause(): void; resume(): void; refresh(): void; destroy(): void };
type Engine = { create(canvas: HTMLCanvasElement, options: object): Glass | null };
type State = 'tab' | 'open' | 'done';

const DONE_KEY = 'tt:guide:done';
const DISMISSED_KEY = 'tt:guide:dismissed';
const SHOWN_KEY = 'tt:guide:shown';
/** Set for the rest of the browser session once the tab has offered itself, so moving to another
 *  page keeps the tab without counting another appearance. */
const SESSION_KEY = 'tt:guide:on';

const DAY = 86_400_000;
const QUIET_MS = 14 * DAY;
const MAX_SHOWS = 3;
const SCROLL_SHARE = 0.3;
const WAIT_MS = 20_000;
const RETRY_MS = 1500;
// Loose on purpose: the browser's own email check runs too, and the Apps Script has the final say.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Storage can be blocked (private modes, strict settings): then every visit behaves as the first.
const store = (area: () => Storage) => ({
  get(key: string): string | null { try { return area().getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { area().setItem(key, value); } catch { /* not remembered */ } },
});
const local = store(() => window.localStorage);
const session = store(() => window.sessionStorage);

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
  signal.addEventListener('abort', () => window.clearTimeout(timer));

  // ---- Liquid glass, loaded the first time the card opens ----
  let glass: Glass | null = null;
  let glassAsked = false;
  signal.addEventListener('abort', () => glass?.destroy());

  /** What the glass refracts: a near-white field lit by the site's blues, from its own tokens. */
  const backdrop = () => {
    const css = getComputedStyle(document.documentElement);
    const rgb = (token: string) => {
      const hex = css.getPropertyValue(token).trim().replace('#', '');
      return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
    };
    const c = document.createElement('canvas');
    c.width = 700;
    c.height = 1000;
    const g = c.getContext('2d');
    if (!g) return null;
    g.fillStyle = `rgb(${rgb('--mist')})`;
    g.fillRect(0, 0, c.width, c.height);
    const glow = (x: number, y: number, r: number, color: string, alpha: number) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${color},${alpha})`);
      grad.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, c.width, c.height);
    };
    glow(60, 40, 460, rgb('--sky'), 0.22);
    glow(660, 260, 420, rgb('--blue'), 0.14);
    glow(120, 960, 480, rgb('--blue'), 0.12);
    glow(640, 940, 420, rgb('--sky'), 0.2);
    glow(350, 500, 340, '255,255,255', 0.8);
    return c;
  };

  const startGlass = async () => {
    if (glassAsked) return;
    glassAsked = true;
    const canvas = card.querySelector<HTMLCanvasElement>('.gd-glass');
    const bg = backdrop();
    if (!canvas || !bg) return;
    try {
      const mod = (await import('../vendor/liquid-glass.js')) as { default?: Engine };
      if (signal.aborted) return;
      const engine = mod.default?.create ? mod.default : (globalThis as { LiquidGlass?: Engine }).LiquidGlass;
      // The canvas needs a size before the engine can draw; CSS takes over once it binds the card.
      canvas.style.display = 'block';
      glass = engine?.create(canvas, {
        background: bg,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--mist').trim(),
        preset: 'frosted',
        maxDpr: 1.5,
        params: {
          thickness: 18, refraction: 0.05, dispersion: 8, blur: 6, tint: [255, 255, 255, 0.35],
          fresnelStrength: 28, glareStrength: 70, glareAngle: -45, shadowStrength: 0,
        },
        shapes: [{ element: card, radius: 'auto' }],
        onError: () => {},
      }) ?? null;
      canvas.style.removeProperty('display');
      if (!visible || card.dataset.state === 'tab') glass?.pause();
    } catch {
      canvas.style.removeProperty('display');
    }
  };

  const setState = (state: State) => {
    card.dataset.state = state;
    const open = state !== 'tab';
    body.hidden = !open;
    tab.setAttribute('aria-expanded', String(open));
    if (open) {
      void startGlass();
      glass?.resume();
      glass?.refresh();
    } else {
      glass?.pause();
    }
  };

  const show = (state: Exclude<State, 'done'>) => {
    if (card.dataset.state !== 'done') setState(state);
    if (visible) return;
    visible = true;
    card.hidden = false;
    if (card.dataset.state !== 'tab') glass?.resume();
    // Next frame, so the entrance runs from the hidden state.
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('is-in')));
  };

  const hide = (remember: boolean) => {
    if (!visible) return;
    visible = false;
    const hadFocus = card.contains(document.activeElement);
    card.classList.remove('is-in');
    window.setTimeout(() => { if (!visible) { card.hidden = true; glass?.pause(); } }, reduce() ? 0 : 260);
    if (remember) local.set(DISMISSED_KEY, String(Date.now()));
    const back = returnTo;
    returnTo = null;
    if (back?.isConnected) back.focus({ preventScroll: true });
    else if (hadFocus) document.getElementById('main')?.focus({ preventScroll: true });
  };

  const focusName = () => requestAnimationFrame(() => name.focus({ preventScroll: true }));

  tab.addEventListener('click', () => { setState('open'); focusName(); }, { signal });
  // Closing after the download is not a "no", so nothing is remembered then.
  close.addEventListener('click', () => hide(card.dataset.state !== 'done'), { signal });
  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    // Opened from the tab: fold back to it. Opened from the footer: close and go back there.
    if (card.dataset.state === 'open' && !returnTo) { setState('tab'); tab.focus(); return; }
    hide(card.dataset.state === 'tab');
  }, { signal });

  openers.forEach((opener) => {
    (opener.closest<HTMLElement>('[data-guide-open-wrap]') ?? opener).hidden = false;
    opener.addEventListener('click', (e) => {
      e.preventDefault();
      returnTo = opener;
      show('open');
      focusName();
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
  const allowed = card.dataset.quiet === undefined && !num(DONE_KEY) && loadedAt - num(DISMISSED_KEY) > QUIET_MS;
  if (!allowed) return;

  // Already offered earlier in this session: keep the tab, without counting another appearance.
  if (session.get(SESSION_KEY)) { show('tab'); return; }
  if (shows().length >= MAX_SHOWS) return;

  let offered = false;
  const typing = () => !!document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
  const offer = () => {
    if (offered || visible || signal.aborted) return;
    window.clearTimeout(timer);
    if (document.hidden || typing()) { timer = window.setTimeout(offer, RETRY_MS); return; }
    offered = true;
    local.set(SHOWN_KEY, JSON.stringify([...shows(), Date.now()]));
    session.set(SESSION_KEY, '1');
    show('tab');
  };
  window.addEventListener('scroll', () => {
    const room = document.documentElement.scrollHeight - window.innerHeight;
    if (room > 0 && window.scrollY / room >= SCROLL_SHARE) offer();
  }, { passive: true, signal });
  timer = window.setTimeout(offer, WAIT_MS);
}
