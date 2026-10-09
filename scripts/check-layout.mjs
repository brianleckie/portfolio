// check-layout.mjs — verificación con Playwright contra el build (SPEC §11)
// Uso: npm run build && npm run check:layout
//
// Levanta `astro preview` (puerto 4322) o usa CHECK_URL si ya hay un server.
// Chequea:
//   - Home en 6 viewports y todas las páginas de proyecto en 390×844 y 1440×810:
//     overflow horizontal, errores de consola, requests fallidas/404.
//   - Teclado: centrado, sin superposición (SAT), clickeable, lado ≥ 56px, captions, fold completo; línea de
//     ubicación y botón de WhatsApp del hero (solo mobile) dentro del primer pantallazo.
//   - Animación (sin display): teclas presionadas muestreadas cada 50 ms durante ~6 s.
//   - Marquee: translateX muestreado ~4 s, siempre en [-anchoGrupo, 0], grupo >= viewport.
//   - reduced-motion: ni teclado ni marquee se mueven.
//   - Filtros: teclas y chips, ?cat= en la URL, carga directa y valores inválidos.
//   - Links: wa.me con número y text, mailto válido, sin href vacío ni "#", cero 404 internos.
//   - Contenido: sin "TODO", sin datos retirados, valuador con "precio de oferta" y sin métricas.
//   - SEO: title/description/canonical/OG/Twitter por página con URL absoluta, imágenes OG (200, PNG 1200×630,
//     < 300 KB), JSON-LD Person solo en la home, robots.txt y sitemap con todas las páginas.
//   - CTA sticky (mobile) y secciones de la home.
// Guarda screenshots full-page en .checks/<viewport>.png (home) y .checks/<viewport>-<slug>.png.

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE_URL = process.env.CHECK_URL ?? 'http://localhost:4322';
const CHECKS_DIR = path.join(ROOT, '.checks');
// URL pública del sitio: única fuente en src/config/site.ts
const SITE_URL = readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8').match(/^\s*url:\s*"([^"]+)"/m)[1].replace(/\/$/, '');

const VIEWPORTS = [
  { name: '1440x810', width: 1440, height: 810 },
  { name: '1440x1002', width: 1440, height: 1002 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x740', width: 360, height: 740 },
];
const CASE_VIEWPORTS = ['1440x810', '390x844'];
const ANIM_VIEWPORTS = ['1440x810', '390x844'];
const CATEGORIES = ['web', 'sistemas', 'integraciones', 'it', 'academico'];
const FILTER_KEYS = { W: 'web', O: 'sistemas', R: 'integraciones', S: 'it' };

const SLUGS = readdirSync(path.join(ROOT, 'src/content/projects'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));

// ---------------------------------------------------------------- helpers

const issuesByLabel = new Map();
let totalFails = 0;

function report(label, issues) {
  if (issues.length === 0) {
    console.log(`✓ ${label}`);
  } else {
    console.log(`✗ ${label}`);
    issues.forEach((i) => console.log(`   • ${i}`));
    totalFails += issues.length;
  }
  issuesByLabel.set(label, issues);
}

async function waitForServer(url, retries = 40, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (res.status < 500) return true;
    } catch {
      /* not ready yet */
    }
    await sleep(delayMs);
  }
  throw new Error(`Server not reachable at ${url} after ${retries} retries`);
}

/** Abre una página con listeners de consola/requests; devuelve helpers para leer los errores. */
async function openPage(browser, viewport, url, contextOptions = {}) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    ...contextOptions,
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => failed.push(`${req.failure()?.errorText} — ${req.url()}`));
  page.on('response', (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} — ${res.url()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await sleep(300); // ResizeObserver, fuentes
  return { ctx, page, errors, failed };
}

const shot = (page, name) => page.screenshot({ path: path.join(CHECKS_DIR, `${name}.png`), fullPage: true });

// ---------------------------------------------------------------- checks de página

async function checkBasics(page, errors, failed) {
  const issues = [];
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (overflow) issues.push('overflow-x detected');
  errors.forEach((e) => issues.push(`console.error: ${e}`));
  failed.forEach((f) => issues.push(`request failed: ${f}`));
  const h1s = await page.evaluate(() => document.querySelectorAll('h1').length);
  if (h1s !== 1) issues.push(`se esperaba 1 <h1>, hay ${h1s}`);
  const editable = await page.evaluate(() => document.querySelectorAll('[contenteditable]').length);
  if (editable) issues.push('existe contenteditable en el DOM');
  return issues;
}

const KEY_ORDER = ['L', 'E', 'K1', 'I', 'W', 'O', 'R', 'K2', 'S', 'Enter'];
const KEY_LABELS = {
  L: 'Proyectos', E: 'Servicios', K1: 'Stack', I: 'Sobre mí', W: 'Webs y catálogos', O: 'Sistemas',
  R: 'Integraciones', K2: 'Mi proceso', S: 'IT y soporte', Enter: 'Hablemos por WhatsApp',
};
const KEY_HREFS = { L: '#proyectos', E: '#servicios', K1: '#stack', I: '#sobre-mi', W: '#proyectos', O: '#proyectos', R: '#proyectos', K2: '#proceso', S: '#proyectos' };
const MIN_KEY_SIDE = 56;
const MOBILE_MAX = 699; // el botón de WhatsApp del hero existe solo por debajo de 700px
const LOCATION = readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8').match(/^\s*location:\s*"([^"]+)"/m)[1];

/** Cada tecla en coordenadas de viewport: lado SIN transformar, ángulo, esquinas rotadas y puntos internos. */
const readKeys = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('#kb-stage .key')).map((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      const a = Math.atan2(m.b, m.a);
      const r = el.getBoundingClientRect(); // bbox del rect rotado: su centro = centro de la tecla
      const w = parseFloat(cs.width);
      const h = parseFloat(cs.height);
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const at = (lx, ly) => [cx + lx * Math.cos(a) - ly * Math.sin(a), cy + lx * Math.sin(a) + ly * Math.cos(a)];
      return {
        id: el.id.replace('key-', ''),
        href: el.getAttribute('href'),
        label: el.getAttribute('aria-label'),
        filter: el.getAttribute('data-filter'),
        w,
        h,
        rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
        corners: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => at((sx * w) / 2, (sy * h) / 2)),
        probes: [[0, 0], [-0.35, -0.35], [0.35, -0.35], [0.35, 0.35], [-0.35, 0.35]].map(([fx, fy]) => at(fx * w, fy * h)),
        captionPx: parseFloat(getComputedStyle(el.querySelector('.key-caption, .key-enter-caption')).fontSize),
      };
    }),
  );

/** Separación entre dos polígonos convexos por SAT (px; ≤ 0 = se tocan o se superponen). */
function satGap(a, b) {
  let best = -Infinity;
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const nx = (y1 - y2) / len;
      const ny = (x2 - x1) / len;
      const pa = a.map(([x, y]) => x * nx + y * ny);
      const pb = b.map(([x, y]) => x * nx + y * ny);
      best = Math.max(best, Math.min(...pb) - Math.max(...pa), Math.min(...pa) - Math.max(...pb));
    }
  }
  return best;
}

async function checkKeyboardStatic(page, viewport) {
  const issues = [];
  if (!(await page.$('#kb-wrapper #kb-stage'))) return ['no se encontró el teclado (#kb-wrapper / #kb-stage)'];

  // Medir en reposo: con reduced-motion el script suelta las teclas y no hay transiciones
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(100);

  // Fold (sin scroll): titular bajo el header, teclado completo (Enter incluido) y, en mobile, también el botón de WhatsApp
  const fold = await page.evaluate(() => {
    const rect = (sel) => document.querySelector(sel)?.getBoundingClientRect();
    const cta = document.querySelector('.hero-cta .btn');
    return {
      headerBottom: rect('.site-header').bottom,
      locationTop: rect('.hero-location')?.top ?? null,
      h1Top: rect('#hero h1').top,
      kbBottom: Math.max(...Array.from(document.querySelectorAll('#kb-stage .key')).map((k) => k.getBoundingClientRect().bottom)),
      ctaShown: !!cta && getComputedStyle(cta).display !== 'none' && cta.getBoundingClientRect().height > 0,
      ctaTop: cta?.getBoundingClientRect().top ?? null,
      ctaBottom: cta?.getBoundingClientRect().bottom ?? null,
      vh: window.innerHeight,
    };
  });
  if (fold.locationTop === null) issues.push(`falta la línea de ubicación (.hero-location)`);
  else if (fold.locationTop < fold.headerBottom - 0.5) issues.push(`fold: la línea de ubicación queda bajo el header (${fold.locationTop.toFixed(0)} < ${fold.headerBottom.toFixed(0)})`);
  if (fold.h1Top < fold.headerBottom - 0.5) issues.push(`fold: el titular queda bajo el header (${fold.h1Top.toFixed(0)} < ${fold.headerBottom.toFixed(0)})`);
  if (fold.kbBottom > fold.vh) issues.push(`fold: el teclado (Enter incluido) no entra sin scroll (bottom ${fold.kbBottom.toFixed(0)} > ${fold.vh})`);

  // Botón "Escribime por WhatsApp": solo mobile (<700px), debajo del teclado y dentro del primer pantallazo
  if (viewport.width <= MOBILE_MAX) {
    if (!fold.ctaShown) issues.push('mobile: falta el botón "Escribime por WhatsApp" bajo el teclado');
    else {
      if (fold.ctaTop < fold.kbBottom) issues.push(`mobile: el botón de WhatsApp (top ${fold.ctaTop.toFixed(0)}) queda sobre el teclado (bottom ${fold.kbBottom.toFixed(0)})`);
      if (fold.ctaBottom > fold.vh) issues.push(`fold: el botón de WhatsApp no entra sin scroll (bottom ${fold.ctaBottom.toFixed(0)} > ${fold.vh})`);
    }
  } else if (fold.ctaShown) {
    issues.push(`el botón de WhatsApp del hero debe existir solo en mobile (<700px), se ve a ${viewport.width}px`);
  }

  await page.evaluate(() => document.getElementById('kb-stage').scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(50);
  const keys = await readKeys(page);
  const env = await page.evaluate(() => ({
    vw: document.documentElement.clientWidth,
    stage: document.getElementById('kb-stage').getBoundingClientRect().toJSON(),
    marqueeTop: document.querySelector('.marquee-strip')?.getBoundingClientRect().top ?? Infinity,
    satoshi: document.fonts.check('900 72px Satoshi'),
    location: document.querySelector('.hero-location')?.textContent?.trim() ?? null,
    locationPx: parseFloat(getComputedStyle(document.querySelector('.hero-location') ?? document.body).fontSize),
    locationInH1: !!document.querySelector('#hero h1 .hero-location'),
    ctaText: document.querySelector('.hero-cta .btn')?.textContent?.trim() ?? null,
    ctaHref: document.querySelector('.hero-cta .btn')?.getAttribute('href') ?? null,
    ctaTarget: document.querySelector('.hero-cta .btn')?.getAttribute('target') ?? null,
    ctaRel: document.querySelector('.hero-cta .btn')?.getAttribute('rel') ?? '',
  }));

  // Línea de ubicación: texto del sitio, legible (≥ 11px) y por encima del titular
  if (env.location !== LOCATION) issues.push(`línea de ubicación = ${JSON.stringify(env.location)} (se esperaba ${JSON.stringify(LOCATION)})`);
  if (env.locationPx < 11) issues.push(`línea de ubicación de ${env.locationPx}px (< 11px)`);
  if (fold.locationTop !== null && fold.locationTop > fold.h1Top) issues.push('la línea de ubicación debe ir sobre el titular');
  if (env.ctaText !== 'Escribime por WhatsApp') issues.push(`botón del hero: texto ${JSON.stringify(env.ctaText)}`);
  if (!/^https:\/\/wa\.me\/\d+/.test(env.ctaHref ?? '')) issues.push(`botón del hero: href ${JSON.stringify(env.ctaHref)} (se esperaba wa.me/<número>)`);
  if (env.ctaTarget !== '_blank' || !/noopener/.test(env.ctaRel)) issues.push('botón del hero: debe abrir en pestaña nueva con rel=noopener');

  // Orden (= tabulación), nombres accesibles, href y filtros
  const ids = keys.map((k) => k.id).join(',');
  if (ids !== KEY_ORDER.join(',')) issues.push(`orden del DOM/tabulación: ${ids}`);
  for (const k of keys) {
    if (!k.href || k.href === '#') issues.push(`${k.id}: href vacío`);
    if (k.id !== 'Enter' && k.href !== KEY_HREFS[k.id]) issues.push(`${k.id}: href ${k.href} ≠ ${KEY_HREFS[k.id]}`);
    if (k.label !== KEY_LABELS[k.id]) issues.push(`${k.id}: aria-label "${k.label}" ≠ "${KEY_LABELS[k.id]}"`);
    if (k.filter !== (FILTER_KEYS[k.id] ?? null)) issues.push(`${k.id}: data-filter ${k.filter} ≠ ${FILTER_KEYS[k.id] ?? null}`);
  }

  // Centrada, dentro de pantalla, dentro del alto reservado y sin pisar el marquee
  const u = keys.reduce(
    (acc, k) => ({
      left: Math.min(acc.left, k.rect.left), right: Math.max(acc.right, k.rect.right),
      top: Math.min(acc.top, k.rect.top), bottom: Math.max(acc.bottom, k.rect.bottom),
    }),
    { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
  );
  const off = (u.left + u.right) / 2 - env.vw / 2;
  if (Math.abs(off) > 4) issues.push(`composición descentrada ${off.toFixed(1)}px`);
  if (u.left < 0 || u.right > env.vw) issues.push(`teclas fuera de pantalla (${u.left.toFixed(0)}–${u.right.toFixed(0)} de ${env.vw}px)`);
  if (u.top < env.stage.top - 1 || u.bottom > env.stage.bottom + 1) issues.push('las teclas se salen del alto de #kb-stage');
  if (env.marqueeTop < u.bottom) issues.push('el marquee pisa al teclado');

  // Sin superposición: polígonos rotados (SAT), no bounding boxes
  for (let a = 0; a < keys.length; a++) {
    for (let b = a + 1; b < keys.length; b++) {
      const gap = satGap(keys[a].corners, keys[b].corners);
      if (gap < 1) issues.push(`teclas superpuestas o pegadas: ${keys[a].id}–${keys[b].id} (${gap.toFixed(1)}px)`);
    }
  }

  // Lado real post-escala (no el bbox rotado) ≥ 56px; teclas cuadradas
  for (const k of keys) {
    const side = Math.min(k.w, k.h);
    if (side < MIN_KEY_SIDE) issues.push(`${k.id}: ${side.toFixed(1)}px de lado (< ${MIN_KEY_SIDE}px)`);
    if (k.id !== 'Enter' && Math.abs(k.w - k.h) > 0.5) issues.push(`${k.id} no es cuadrada (${k.w}×${k.h})`);
  }

  // Captions: 0px (ocultos) o ≥ 10px; el del Enter siempre ≥ 11px
  for (const k of keys) {
    const bad = k.id === 'Enter' ? k.captionPx < 11 : k.captionPx > 0 && k.captionPx < 10;
    if (bad) issues.push(`${k.id}: caption de ${k.captionPx}px`);
  }

  // Clickeables: centro + 4 puntos internos de TODAS las teclas (Enter incluido)
  const blocked = await page.evaluate(
    (list) =>
      list
        .filter(({ id, probes }) => {
          const el = document.getElementById(`key-${id}`);
          return !probes.every(([x, y]) => {
            const hit = document.elementFromPoint(x, y);
            return hit === el || el.contains(hit);
          });
        })
        .map((k) => k.id),
    keys.map(({ id, probes }) => ({ id, probes })),
  );
  if (blocked.length) issues.push(`teclas que no reciben el click en todo su interior: ${blocked.join(', ')}`);

  if (!env.satoshi) issues.push('Satoshi 900 not loaded (document.fonts.check failed)');
  await page.emulateMedia({ reducedMotion: 'no-preference' }); // la animación vuelve para checkKeyboardAnimation
  return issues;
}

/** El CTA sticky aparece recién cuando el hero entero (botón de WhatsApp incluido) quedó atrás. */
async function checkHeroSticky(browser) {
  const issues = [];
  const mobile = VIEWPORTS.find((v) => v.name === '390x844');
  const { ctx, page } = await openPage(browser, mobile, `${BASE_URL}/`);
  const scrollHeroBottomTo = async (y) => {
    await page.evaluate((target) => {
      const prev = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollBy(0, document.getElementById('hero').getBoundingClientRect().bottom - target);
      document.documentElement.style.scrollBehavior = prev;
    }, y);
    await sleep(500);
  };
  const state = () =>
    page.evaluate(() => ({
      bar: document.getElementById('sticky-cta').classList.contains('is-visible'),
      heroBottom: document.getElementById('hero').getBoundingClientRect().bottom,
    }));

  let st = await state();
  if (st.bar) issues.push('sticky visible en el primer pantallazo');
  await scrollHeroBottomTo(24); // el hero todavía asoma 24px
  st = await state();
  if (st.bar) issues.push(`sticky visible con el hero todavía en pantalla (bottom del hero ${st.heroBottom.toFixed(0)}px)`);
  await scrollHeroBottomTo(-24); // el hero ya quedó atrás
  st = await state();
  if (!st.bar) issues.push('sticky no aparece después de pasar el hero');
  await ctx.close();
  return issues;
}

/** Muestrea qué teclas tienen .is-pressed cada 50 ms durante ~6 s (sin display). */
async function checkKeyboardAnimation(page) {
  const issues = [];
  await page.evaluate(() => {
    document.getElementById('kb-wrapper')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  const samples = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const out = [];
        const t0 = performance.now();
        const timer = setInterval(() => {
          out.push(Array.from(document.querySelectorAll('.key.is-pressed')).map((k) => k.id.replace('key-', '')));
          if (performance.now() - t0 >= 6000) {
            clearInterval(timer);
            resolve(out);
          }
        }, 50);
      }),
  );

  const seen = new Set(samples.flat());
  const expected = ['L', 'E', 'K1', 'I', 'W', 'O', 'R', 'K2', 'S', 'Enter'];
  const missing = expected.filter((k) => !seen.has(k));
  if (missing.length) issues.push(`teclas que nunca se presionaron en ~6 s: ${missing.join(', ')}`);

  const maxSimultaneous = Math.max(...samples.map((s) => s.length));
  if (maxSimultaneous > 1) issues.push(`hubo ${maxSimultaneous} teclas presionadas a la vez`);

  const run = {};
  let worstKey = '';
  let worst = 0;
  for (const s of samples) {
    for (const k of expected) {
      run[k] = s.includes(k) ? (run[k] ?? 0) + 1 : 0;
      if (run[k] > worst) {
        worst = run[k];
        worstKey = k;
      }
    }
  }
  if (worst * 50 > 1000) issues.push(`la tecla ${worstKey} estuvo presionada ~${worst * 50} ms seguidos (> 1 s)`);
  return issues;
}

/** Muestrea el translateX del marquee ~4 s: avanza y se mantiene en [-anchoGrupo, 0]. */
async function checkMarquee(page) {
  const issues = [];
  await page.evaluate(() => {
    document.querySelector('.marquee-strip')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  const data = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const track = document.getElementById('marquee-track');
        const g1 = document.getElementById('marquee-g1');
        const tx = [];
        const t0 = performance.now();
        const timer = setInterval(() => {
          tx.push(new DOMMatrix(getComputedStyle(track).transform).m41);
          if (performance.now() - t0 >= 4000) {
            clearInterval(timer);
            resolve({
              tx,
              groupWidth: g1.getBoundingClientRect().width,
              vw: document.documentElement.clientWidth,
              exposed: document.querySelectorAll('#marquee-g1 > :not([aria-hidden="true"])').length,
            });
          }
        }, 100);
      }),
  );

  const { tx, groupWidth, vw, exposed } = data;
  if (groupWidth < vw - 1) issues.push(`grupo del marquee (${groupWidth.toFixed(0)}px) más angosto que el viewport (${vw}px)`);
  const out = tx.filter((v) => v > 0.01 || v < -groupWidth - 0.01);
  if (out.length) issues.push(`translateX fuera de [-${groupWidth.toFixed(0)}, 0]: ${out.slice(0, 3).map((v) => v.toFixed(1)).join(', ')}`);
  const travelled = tx[0] - tx[tx.length - 1];
  if (travelled < 120) issues.push(`el marquee casi no avanzó en 4 s (${travelled.toFixed(0)}px)`);
  if (exposed !== 1) issues.push(`el texto debe estar expuesto una sola vez (hay ${exposed})`);
  return issues;
}

async function checkReducedMotion(browser) {
  const issues = [];
  const viewport = VIEWPORTS.find((v) => v.name === '390x844');
  const { ctx, page } = await openPage(browser, viewport, `${BASE_URL}/`, { reducedMotion: 'reduce' });
  const data = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const track = document.getElementById('marquee-track');
        const tx0 = new DOMMatrix(getComputedStyle(track).transform).m41;
        let pressed = 0;
        const timer = setInterval(() => {
          pressed += document.querySelectorAll('.is-pressed').length;
        }, 50);
        setTimeout(() => {
          clearInterval(timer);
          resolve({
            pressed,
            moved: Math.abs(new DOMMatrix(getComputedStyle(track).transform).m41 - tx0),
            transition: parseFloat(getComputedStyle(document.querySelector('.key-face')).transitionDuration),
            groups: getComputedStyle(document.getElementById('marquee-g2')).display,
            packets: [...document.querySelectorAll('[data-diagram] .packet')].filter((p) => getComputedStyle(p).display !== 'none').length,
            anims: document.getAnimations().filter((a) => a.effect?.target?.closest?.('[data-diagram]')).length,
          });
        }, 1500);
      }),
  );
  if (data.pressed) issues.push('el teclado se animó con prefers-reduced-motion');
  if (data.moved > 0.5) issues.push(`el marquee se movió ${data.moved.toFixed(1)}px con prefers-reduced-motion`);
  if (data.transition >= 0.05) issues.push(`.key-face conserva transición (${data.transition}s)`);
  if (data.groups !== 'none') issues.push('el marquee duplicado debe ocultarse con reduced-motion');
  if (data.packets || data.anims) issues.push(`los diagramas se animan con prefers-reduced-motion (${data.packets} paquetes, ${data.anims} animaciones)`);
  await ctx.close();
  return issues;
}

// ---------------------------------------------------------------- filtros

const visibleCards = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('#proyectos li[data-cats]'))
      .filter((li) => !li.hidden)
      .map((li) => li.dataset.cats.split(' ')),
  );

async function expectFilter(page, filter, via) {
  const issues = [];
  await page.waitForFunction((f) => new URL(location.href).searchParams.get('cat') === f, filter, { timeout: 3000 }).catch(() => {});
  const cat = await page.evaluate(() => new URL(location.href).searchParams.get('cat'));
  if (cat !== filter) issues.push(`${via}: URL debería tener ?cat=${filter} (tiene ${cat})`);
  const cards = await visibleCards(page);
  if (cards.length === 0) issues.push(`${via}: ningún proyecto visible con ${filter}`);
  const wrong = cards.filter((c) => !c.includes(filter));
  if (wrong.length) issues.push(`${via}: ${wrong.length} cards visibles sin la categoría ${filter}`);
  const pressed = await page.evaluate(() => document.querySelector('.chip[aria-pressed="true"]')?.dataset.filter);
  if (pressed !== filter) issues.push(`${via}: chip activo "${pressed}" ≠ "${filter}"`);
  return issues;
}

async function checkFilters(browser, viewport) {
  const issues = [];
  const { ctx, page } = await openPage(browser, viewport, `${BASE_URL}/`);
  const totalCards = (await visibleCards(page)).length;

  // 1. teclas del hero → filtro + ?cat=
  for (const [key, filter] of Object.entries(FILTER_KEYS)) {
    await page.locator(`#key-${key}`).click();
    issues.push(...(await expectFilter(page, filter, `tecla ${key}`)));
  }

  // 2. chips (todas las categorías)
  for (const cat of CATEGORIES) {
    await page.locator(`.chip[data-filter="${cat}"]`).click();
    issues.push(...(await expectFilter(page, cat, `chip ${cat}`)));
  }

  // 3. "Todos" limpia el parámetro y muestra todo
  await page.locator('.chip[data-filter="all"]').click();
  const cat = await page.evaluate(() => new URL(location.href).searchParams.get('cat'));
  if (cat !== null) issues.push(`"Todos" debería quitar ?cat= (queda ${cat})`);
  if ((await visibleCards(page)).length !== totalCards) issues.push('"Todos" no restauró todas las cards');
  await ctx.close();

  // 4. carga directa con ?cat=web y con valor inválido
  const direct = await openPage(browser, viewport, `${BASE_URL}/?cat=web`);
  issues.push(...(await expectFilter(direct.page, 'web', 'carga directa ?cat=web')));
  await direct.ctx.close();

  const bogus = await openPage(browser, viewport, `${BASE_URL}/?cat=bogus`);
  const pressed = await bogus.page.evaluate(() => document.querySelector('.chip[aria-pressed="true"]')?.dataset.filter);
  if (pressed !== 'all') issues.push(`?cat=bogus debería caer en "Todos" (activo: ${pressed})`);
  if ((await visibleCards(bogus.page)).length !== totalCards) issues.push('?cat=bogus ocultó cards');
  await bogus.ctx.close();
  return issues;
}


// ---------------------------------------------------------------- Fase 3: CTA sticky y secciones

const barState = (page) =>
  page.evaluate(() => {
    const bar = document.getElementById('sticky-cta');
    const cs = getComputedStyle(bar);
    const r = bar.getBoundingClientRect();
    return {
      display: cs.display,
      visibility: cs.visibility,
      visible: cs.display !== 'none' && cs.visibility === 'visible' && r.top < window.innerHeight && r.bottom > 0,
      bottomGap: window.innerHeight - r.bottom,
      height: r.height,
      bodyPad: parseFloat(getComputedStyle(document.body).paddingBottom),
      scrollPad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom) || 0,
    };
  });

/** Scrollea con salto instantáneo y espera a que terminen los IntersectionObservers y la transición. */
async function jumpTo(page, selector, block = 'start') {
  await page.evaluate(([sel, b]) => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector(sel).scrollIntoView({ block: b });
    document.documentElement.style.scrollBehavior = prev;
  }, [selector, block]);
  await sleep(500);
}

async function checkStickyCta(browser, pagePath, midSel, untilSel) {
  const issues = [];
  const mobile = VIEWPORTS.find((v) => v.name === '390x844');
  const { ctx, page } = await openPage(browser, mobile, `${BASE_URL}${pagePath}`);

  let st = await barState(page);
  if (st.visible) issues.push('visible arriba, antes de pasar el hero');
  await jumpTo(page, midSel, 'center');
  st = await barState(page);
  if (!st.visible) issues.push(`no aparece a mitad de página (${midSel})`);
  else {
    if (st.bottomGap > 1) issues.push(`la barra no está pegada al borde inferior (gap ${st.bottomGap.toFixed(0)}px)`);
    if (st.bodyPad < st.height - 1) issues.push(`body sin padding inferior suficiente (${st.bodyPad}px < ${st.height.toFixed(0)}px)`);
    if (st.scrollPad < st.height - 1) issues.push(`scroll-padding-bottom insuficiente para el foco (${st.scrollPad}px)`);
  }
  await jumpTo(page, untilSel, 'center');
  st = await barState(page);
  if (st.visible) issues.push(`sigue visible con ${untilSel} en pantalla`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(500);
  st = await barState(page);
  if (st.visible) issues.push('visible al final de la página');
  await ctx.close();

  const desktop = VIEWPORTS.find((v) => v.name === '1440x810');
  const d = await openPage(browser, desktop, `${BASE_URL}${pagePath}`);
  await jumpTo(d.page, midSel, 'center');
  st = await barState(d.page);
  if (st.display !== 'none') issues.push('la barra se muestra en ≥700px');
  await d.ctx.close();
  return issues;
}

async function checkSections(browser) {
  const issues = [];
  const viewport = VIEWPORTS.find((v) => v.name === '1440x810');
  const { ctx, page } = await openPage(browser, viewport, `${BASE_URL}/`);
  const data = await page.evaluate(() => {
    const textOutside = Array.from(document.body.children)
      .map((el) => el.innerText ?? '')
      .join('\n');
    const about = document.getElementById('sobre-mi');
    const mail = document.querySelector('#contacto a[href^="mailto:"]');
    const stackChips = Array.from(document.querySelectorAll('#stack .chips li')).map((li) => li.textContent.trim());
    return {
      ids: ['proyectos', 'servicios', 'proceso', 'sobre-mi', 'contacto', 'stack'].filter((id) => !document.getElementById(id)),
      klienTotal: (textOutside.match(/Klien IT Systems/g) ?? []).length,
      klienInAbout: ((about?.innerText ?? '').match(/Klien IT Systems/g) ?? []).length,
      steps: document.querySelectorAll('#proceso ol > li').length,
      featuredStep: document.querySelector('#proceso li.featured h3')?.textContent?.trim(),
      services: document.querySelectorAll('#servicios li').length,
      serviceFilters: Array.from(document.querySelectorAll('#servicios a[data-filter]')).map((a) => a.dataset.filter),
      mailWrap: mail ? getComputedStyle(mail).overflowWrap : null,
      mailDecoration: mail ? getComputedStyle(mail).textDecorationLine : null,
      contactBg: getComputedStyle(document.getElementById('contacto')).backgroundColor,
      contactTitle: document.querySelector('#contacto h2')?.textContent?.replace(/\s+/g, ' ').trim(),
      credit: /ui\.debbie/.test(document.querySelector('footer')?.textContent ?? ''),
      year: new RegExp(String(new Date().getFullYear())).test(document.querySelector('footer')?.textContent ?? ''),
      stackGroups: Array.from(document.querySelectorAll('#stack .group h4')).map((h) => h.textContent.trim()),
      stackChips,
    };
  });
  if (data.ids.length) issues.push(`faltan secciones: ${data.ids.join(', ')}`);
  if (data.klienTotal !== data.klienInAbout || data.klienInAbout !== 1) {
    issues.push(`"Klien IT Systems" debe aparecer solo en #sobre-mi (total ${data.klienTotal}, en sobre-mi ${data.klienInAbout})`);
  }
  if (data.steps !== 4) issues.push(`el proceso debe tener 4 pasos (hay ${data.steps})`);
  if (data.featuredStep !== 'Te muestro una demo') issues.push(`el paso destacado debería ser "Te muestro una demo" (es ${data.featuredStep})`);
  if (data.services !== 4) issues.push(`debe haber 4 servicios (hay ${data.services})`);
  if (data.serviceFilters.join() !== 'web,sistemas,integraciones,it') issues.push(`filtros de servicios: ${data.serviceFilters.join()}`);
  if (data.mailWrap !== 'anywhere') issues.push(`el email debería tener overflow-wrap:anywhere (es ${data.mailWrap})`);
  if (data.mailDecoration !== 'underline') issues.push('el email debería estar subrayado');
  if (data.contactBg !== 'rgb(21, 26, 51)') issues.push(`fondo de contacto ${data.contactBg} ≠ #151a33`);
  if (!/Tu próximo proyecto/.test(data.contactTitle ?? '') || !/empieza con un hola/.test(data.contactTitle ?? '')) issues.push(`titular de contacto: ${data.contactTitle}`);
  if (!data.credit) issues.push('falta el crédito ui.debbie en el footer');
  if (!data.year) issues.push('el footer no muestra el año actual');
  if (data.stackGroups.join() !== 'Frontend,Backend,Infra y herramientas,IA') issues.push(`grupos del stack: ${data.stackGroups.join()}`);

  // "Ver ejemplos" de Servicios aplica el filtro
  await page.locator('#servicios a[data-filter="integraciones"]').click();
  issues.push(...(await expectFilter(page, 'integraciones', 'servicios → Ver ejemplos')));
  await ctx.close();
  return issues;
}


// ---------------------------------------------------------------- SEO / Open Graph

const collectMeta = (page) =>
  page.evaluate(() => {
    const m = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null;
    return {
      lang: document.documentElement.lang,
      title: document.title,
      description: m('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      ogTitle: m('meta[property="og:title"]'),
      ogDescription: m('meta[property="og:description"]'),
      ogUrl: m('meta[property="og:url"]'),
      ogImage: m('meta[property="og:image"]'),
      ogWidth: m('meta[property="og:image:width"]'),
      ogHeight: m('meta[property="og:image:height"]'),
      twitterCard: m('meta[name="twitter:card"]'),
      twitterImage: m('meta[name="twitter:image"]'),
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
    };
  });

async function checkSeo(metas, api) {
  const issues = [];
  const titles = new Set();
  for (const { pagePath, meta } of metas) {
    const w = pagePath;
    if (meta.lang !== 'es') issues.push(`${w}: lang="${meta.lang}" (se esperaba es)`);
    if (!meta.title || meta.title.length > 80) issues.push(`${w}: title vacío o demasiado largo (${meta.title?.length})`);
    if (titles.has(meta.title)) issues.push(`${w}: title repetido "${meta.title}"`);
    titles.add(meta.title);
    if (!meta.description || meta.description.length < 40 || meta.description.length > 320) {
      issues.push(`${w}: description ausente o de largo raro (${meta.description?.length})`);
    }
    if (meta.canonical !== `${SITE_URL}${pagePath}`) issues.push(`${w}: canonical ${meta.canonical} ≠ ${SITE_URL}${pagePath}`);
    if (meta.ogUrl !== meta.canonical) issues.push(`${w}: og:url ≠ canonical`);
    if (meta.ogTitle !== meta.title) issues.push(`${w}: og:title ≠ title`);
    if (!meta.ogDescription) issues.push(`${w}: falta og:description`);
    if (meta.twitterCard !== 'summary_large_image') issues.push(`${w}: twitter:card = ${meta.twitterCard}`);
    if (meta.twitterImage !== meta.ogImage) issues.push(`${w}: twitter:image ≠ og:image`);
    if (meta.ogWidth !== '1200' || meta.ogHeight !== '630') issues.push(`${w}: og:image:width/height ≠ 1200×630`);

    if (!meta.ogImage || !meta.ogImage.startsWith(`${SITE_URL}/og/`) || !meta.ogImage.endsWith('.png')) {
      issues.push(`${w}: og:image no es una URL absoluta del sitio (${meta.ogImage})`);
      continue;
    }
    const res = await api.request.get(meta.ogImage.replace(SITE_URL, BASE_URL));
    const body = await res.body();
    if (res.status() !== 200) issues.push(`${w}: og:image → ${res.status()}`);
    else {
      if (res.headers()['content-type'] !== 'image/png') issues.push(`${w}: og:image content-type ${res.headers()['content-type']}`);
      if (body.length > 300 * 1024) issues.push(`${w}: og:image pesa ${(body.length / 1024).toFixed(0)} KB (> 300 KB, WhatsApp puede ignorarla)`);
      const [pw, ph] = [body.readUInt32BE(16), body.readUInt32BE(20)];
      if (pw !== 1200 || ph !== 630) issues.push(`${w}: og:image mide ${pw}×${ph}`);
    }

    // JSON-LD Person solo en la home
    if (pagePath === '/') {
      let ld = null;
      try {
        ld = JSON.parse(meta.jsonLd[0] ?? 'null');
      } catch {
        /* se reporta abajo */
      }
      if (!ld || ld['@type'] !== 'Person' || !ld.name) issues.push('/: falta JSON-LD Person válido');
      else {
        if (ld.url !== SITE_URL) issues.push(`/: JSON-LD url ${ld.url} ≠ ${SITE_URL}`);
        if (/Klien/.test(JSON.stringify(ld))) issues.push('/: el JSON-LD no debe incluir al empleador');
        for (const link of ld.sameAs ?? []) if (!/^https:\/\//.test(link)) issues.push(`/: sameAs inválido (${link})`);
      }
    } else if (meta.jsonLd.length) {
      issues.push(`${w}: JSON-LD inesperado fuera de la home`);
    }
  }

  // robots.txt y sitemap
  const robots = await (await api.request.get(`${BASE_URL}/robots.txt`)).text();
  if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap-index.xml`)) issues.push('robots.txt no apunta al sitemap con la URL del sitio');
  const index = await api.request.get(`${BASE_URL}/sitemap-index.xml`);
  if (index.status() !== 200) issues.push(`sitemap-index.xml → ${index.status()}`);
  const sm = await api.request.get(`${BASE_URL}/sitemap-0.xml`);
  const smText = sm.status() === 200 ? await sm.text() : '';
  if (!smText) issues.push(`sitemap-0.xml → ${sm.status()}`);
  for (const { pagePath } of metas) if (!smText.includes(`<loc>${SITE_URL}${pagePath}</loc>`)) issues.push(`el sitemap no incluye ${pagePath}`);
  return issues;
}

// ---------------------------------------------------------------- links y contenido

async function collectLinks(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map((a) => ({
      raw: a.getAttribute('href'),
      href: a.href,
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel') ?? '',
      text: (a.textContent ?? '').trim().slice(0, 40),
    })),
  );
}

function auditLinks(pagePath, links, idsByPath, internal) {
  const issues = [];
  for (const l of links) {
    const where = `${pagePath} → "${l.text}"`;
    if (l.raw === null || l.raw.trim() === '' || l.raw.trim() === '#') {
      issues.push(`${where}: href vacío o "#" suelto`);
      continue;
    }
    if (l.href.startsWith('https://wa.me/')) {
      const m = l.href.match(/^https:\/\/wa\.me\/(\d{8,15})\?text=(.+)$/);
      if (!m) issues.push(`${where}: wa.me sin número válido o sin text (${l.href})`);
      else if (!decodeURIComponent(m[2]).trim()) issues.push(`${where}: wa.me con text vacío`);
    } else if (l.href.startsWith('mailto:')) {
      if (!/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(l.href)) issues.push(`${where}: mailto inválido (${l.href})`);
    } else if (l.href.startsWith(BASE_URL)) {
      const u = new URL(l.href);
      internal.add(u.pathname + u.search);
      if (u.hash) {
        const ids = idsByPath.get(u.pathname);
        if (ids && !ids.has(u.hash.slice(1))) issues.push(`${where}: el ancla ${u.hash} no existe en ${u.pathname}`);
        else if (!ids) internal.add(`${u.pathname}#${u.hash.slice(1)}`);
      }
    }
    if (l.target === '_blank' && !/\bnoopener\b/.test(l.rel)) issues.push(`${where}: target=_blank sin rel=noopener`);
  }
  return issues;
}

const FORBIDDEN_EVERYWHERE = [
  [/TODO/, 'aparece "TODO"'],
  [/Presidente|Pdte\b|Peña/, 'aparece la mención retirada del Presidente'],
  [/3 gimnasios|Tres gimnasios/i, 'aparece el claim retirado de "3 gimnasios"'],
  [/inaugur/i, 'aparece una mención a la inauguración (pendiente de confirmar con el cliente de Estación)'],
];
const KNOWN_PORTALS = /infocasas|clasipar|mercado ?libre|\bolx\b|encuentra24|remax|marketplace de facebook/i;

function checkContent(slug, html, text) {
  const issues = [];
  for (const [re, msg] of FORBIDDEN_EVERYWHERE) if (re.test(html)) issues.push(`${slug}: ${msg}`);
  if (slug === 'valuador-inmuebles') {
    if (!/precio de oferta/i.test(text)) issues.push('valuador: no dice "precio de oferta"');
    if (!/<blockquote/.test(html)) issues.push('valuador: falta el bloque visible de limitación');
    if (/\d\s?%|R²|\bMAE\b|\bRMSE\b/.test(text)) issues.push('valuador: contiene una métrica');
    if (KNOWN_PORTALS.test(text)) issues.push('valuador: nombra un portal inmobiliario');
  }
  if (slug === 'mbarete' && !text.includes('Usado por gimnasios en Buenos Aires y en distintas partes de Paraguay.')) {
    issues.push('mbarete: falta la frase de resultado');
  }
  return issues;
}



// ---------------------------------------------------------------- diagramas (proyectos sin captura)

const projectRaw = (slug) => readFileSync(path.join(ROOT, 'src/content/projects', `${slug}.md`), 'utf8');

/** Texto del .md SIN el bloque `flow:` (si no, todo lo del diagrama "estaría" en el .md). */
function factsSource(slug) {
  let inFlow = false;
  const kept = [];
  for (const line of projectRaw(slug).split('\n')) {
    if (/^flow:/.test(line)) {
      inFlow = true;
      continue;
    }
    if (inFlow && /^\S/.test(line)) inFlow = false;
    if (!inFlow) kept.push(line);
  }
  return kept.join('\n').toLowerCase();
}

const hasImages = (slug) => {
  if (/^cover(Mobile)?:/m.test(projectRaw(slug))) return true;
  const dir = path.join(ROOT, 'src/assets/projects', slug);
  return existsSync(dir) && readdirSync(dir).some((f) => /^(desktop|mobile)/.test(f));
};
const DIAGRAM_SLUGS = SLUGS.filter((s) => /^flow:/m.test(projectRaw(s)) && !hasImages(s));
const FEATURED_DIAGRAMS = DIAGRAM_SLUGS.filter((s) => /^featured:\s*true/m.test(projectRaw(s)));

async function checkDiagrams(page, viewport, expected) {
  const issues = [];
  const found = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-diagram]')).map((fig) => {
      const m = fig.closest('.media').getBoundingClientRect();
      const visible = (el) => !!el && el.getBoundingClientRect().width > 1;
      const broken = []; // palabras partidas en dos líneas
      fig.querySelectorAll('.label').forEach((el) => {
        const node = el.firstChild;
        if (!node || !visible(el)) return;
        for (const w of node.data.matchAll(/\S+/g)) {
          const r = document.createRange();
          r.setStart(node, w.index);
          r.setEnd(node, w.index + w[0].length);
          if (r.getClientRects().length > 1) broken.push(w[0]);
        }
      });
      const href = fig.closest('article')?.querySelector('a[href^="/proyectos/"]')?.getAttribute('href');
      return {
        slug: (href ?? location.pathname).split('/').filter(Boolean).pop(),
        tagOk: fig.querySelector('.tag')?.textContent.trim() === 'Diagrama' && visible(fig.querySelector('.tag')),
        caption: fig.querySelector('figcaption')?.textContent.trim(),
        steps: fig.querySelectorAll(':scope > ol > li').length,
        exposed: [...fig.querySelectorAll('.link, .cap, svg')].filter((e) => e.getAttribute('aria-hidden') !== 'true').length,
        images: fig.querySelectorAll('img, picture').length,
        overflowX: fig.scrollWidth > fig.clientWidth + 1,
        outside: [...fig.querySelectorAll('.step')].filter((s) => {
          const r = s.getBoundingClientRect();
          return r.left < m.left || r.right > m.right || r.top < m.top || r.bottom + 4 > m.bottom;
        }).length,
        ratio: m.width / m.height,
        card: fig.dataset.variant === 'card',
        broken,
        facts: [...fig.querySelectorAll('.label, .detail, .branches, .note')].map((e) => e.textContent).join(' '),
        html: fig.outerHTML,
      };
    }),
  );
  const got = found.map((d) => d.slug).sort().join();
  if (got !== [...expected].sort().join()) issues.push(`diagramas: [${got}] ≠ esperados [${expected.join()}]`);
  for (const d of found) {
    const w = `diagrama ${d.slug}`;
    if (!d.tagOk || !d.caption) issues.push(`${w}: falta la etiqueta visible "Diagrama"`);
    if (d.steps < 3 || d.steps > 4) issues.push(`${w}: ${d.steps} pasos`);
    if (d.exposed) issues.push(`${w}: ${d.exposed} decorativos sin aria-hidden`);
    if (d.images) issues.push(`${w}: contiene imágenes (debe ser un esquema, no una captura)`);
    if (d.overflowX || d.outside) issues.push(`${w}: se sale del marco (${d.outside} nodos)`);
    if (d.broken.length) issues.push(`${w}: palabras cortadas: ${d.broken.join(', ')}`);
    if (d.card && Math.abs(d.ratio - 1.6) > 0.01) issues.push(`${w}: la media dejó de ser 16/10 (${d.ratio.toFixed(3)})`);
    if (/TODO/.test(d.html)) issues.push(`${w}: contiene "TODO"`);
    if (/%/.test(d.facts)) issues.push(`${w}: contiene un porcentaje`);
    const src = factsSource(d.slug);
    for (const n of new Set(d.facts.match(/\d+(?:[.,]\d+)?/g) ?? [])) {
      if (!new RegExp(`(^|\\D)${n.replace(/[.,]/, '\\$&')}(\\D|$)`).test(src)) issues.push(`${w}: el número ${n} no está en el .md`);
    }
    for (const word of new Set(d.facts.toLowerCase().match(/\p{L}{5,}/gu) ?? [])) {
      if (!new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, 'u').test(src)) issues.push(`${w}: "${word}" no aparece en el .md (¿dato inventado?)`);
    }
  }
  return issues;
}

async function checkDiagramMotion(page) {
  const issues = [];
  if (!(await page.$('[data-diagram]'))) return issues;
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelector('[data-diagram]').scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await sleep(400);
  const on = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const fig = document.querySelector('[data-diagram]');
        const p = fig.querySelector('.packet');
        const anim = p.getAnimations()[0];
        const props = anim ? anim.effect.getKeyframes().flatMap(Object.keys) : [];
        const seen = new Set();
        const t0 = performance.now();
        const timer = setInterval(() => {
          seen.add(getComputedStyle(p).transform);
          if (performance.now() - t0 > 3800) {
            clearInterval(timer);
            resolve({ play: fig.hasAttribute('data-play'), state: anim?.playState, props, distinct: seen.size });
          }
        }, 100);
      }),
  );
  if (!on.play || on.state !== 'running') issues.push(`en pantalla no anima (${on.state})`);
  if (on.distinct < 3) issues.push('los paquetes no se movieron en un ciclo');
  const bad = [...new Set(on.props)].filter((k) => !['offset', 'computedOffset', 'easing', 'composite', 'transform', 'opacity'].includes(k));
  if (bad.length) issues.push(`anima propiedades de layout/paint: ${bad.join(', ')}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const off = await page.evaluate(() => document.querySelector('[data-diagram] .packet').getAnimations()[0]?.playState);
  if (off === 'running') issues.push('fuera del viewport la animación sigue corriendo');
  return issues;
}

// ---------------------------------------------------------------- previews de proyectos y links

const FEATURED_BUDGET_390 = 3400; // px de #featured-block a 390×844 (antes de la escena 16/10: ≈3770)

/** Medias de proyectos: caja uniforme, imágenes cargadas y sin deformar, una descarga por <picture>. */
async function checkProjectMedia(page, viewport, { scope = '#proyectos', featured = true } = {}) {
  const issues = [];
  // Recorre la sección para que bajen las imágenes lazy
  await page.evaluate(async (sel) => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (const m of document.querySelectorAll(`${sel} .media`)) {
      m.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 80));
    }
  }, scope);
  await page
    .waitForFunction(
      (sel) => [...document.querySelectorAll(`${sel} .media img`)].every((i) => i.complete),
      scope,
      { timeout: 10000 },
    )
    .catch(() => issues.push('hay imágenes de proyectos que no terminaron de cargar'));

  const d = await page.evaluate(
    ([sel, withFeatured]) => {
      const rect = (e) => e.getBoundingClientRect();
      const medias = withFeatured ? [...document.querySelectorAll('#featured-block .media')] : [];
      return {
        heights: medias.map((m) => rect(m).height),
        ratios: medias.map((m) => rect(m).width / rect(m).height),
        featuredH: withFeatured ? rect(document.getElementById('featured-block')).height : 0,
        pictures: document.querySelectorAll(`${sel} picture`).length,
        requests: performance
          .getEntriesByType('resource')
          .filter((e) => e.initiatorType === 'img' && e.name.includes('/_astro/')).length,
        imgs: [...document.querySelectorAll(`${sel} .media img`)].map((img) => {
          const box = rect(img.closest('.screen'));
          const m = rect(img.closest('.media'));
          return {
            name: img.closest('article')?.querySelector('h3')?.textContent ?? document.querySelector('h1')?.textContent ?? '?',
            kind: img.closest('.phone') ? 'phone' : 'browser',
            loaded: img.complete && img.naturalWidth > 0,
            fit: getComputedStyle(img).objectFit,
            ratio: box.width / box.height,
            natural: img.naturalWidth / img.naturalHeight,
            sharp: img.naturalWidth >= box.width * 0.95,
            visibleW: box.width,
            inX: box.left >= m.left - 1 && box.right <= m.right + 1,
          };
        }),
      };
    },
    [scope, featured],
  );

  if (featured) {
    const [min, max] = [Math.min(...d.heights), Math.max(...d.heights)];
    if (max - min > 1) issues.push(`medias de destacados con alturas distintas (${min.toFixed(0)}–${max.toFixed(0)}px)`);
    const off = d.ratios.filter((r) => Math.abs(r - 1.6) > 0.01);
    if (off.length) issues.push(`medias que no son 16/10: ${off.map((r) => r.toFixed(3)).join(', ')}`);
    if (viewport.width <= 390 && (min < 190 || max > 240)) issues.push(`alto de media fuera de 190–240px (${min.toFixed(0)}–${max.toFixed(0)})`);
    if (viewport.name === '390x844') {
      console.log(`   · #featured-block a 390×844: ${d.featuredH.toFixed(0)}px (antes ≈3770, presupuesto ${FEATURED_BUDGET_390})`);
      if (d.featuredH > FEATURED_BUDGET_390) issues.push(`destacados miden ${d.featuredH.toFixed(0)}px (> ${FEATURED_BUDGET_390})`);
    }
  }

  for (const i of d.imgs) {
    const w = `${i.name.trim()} (${i.kind})`;
    if (!i.loaded) issues.push(`${w}: imagen no cargada`);
    if (i.fit !== 'cover') issues.push(`${w}: object-fit ${i.fit} (puede deformar)`);
    const want = i.kind === 'phone' ? Math.min(0.58, Math.max(0.46, i.natural)) : 11 / 5;
    if (Math.abs(i.ratio - want) > 0.03) issues.push(`${w}: ventana ${i.ratio.toFixed(2)} ≠ ${want.toFixed(2)}`);
    if (!i.sharp) issues.push(`${w}: la imagen elegida es más chica que su caja (sizes mal calculado)`);
    if (i.visibleW < 40 || !i.inX) issues.push(`${w}: marco invisible o fuera de la media`);
  }
  if (d.requests > d.pictures) issues.push(`descargas duplicadas: ${d.requests} imágenes para ${d.pictures} <picture>`);
  return issues;
}

/** `links:` de un .md → [{ label, url }] (parseo simple del frontmatter). */
function linksOf(slug) {
  const front = readFileSync(path.join(ROOT, 'src/content/projects', `${slug}.md`), 'utf8').split(/^---\s*$/m)[1] ?? '';
  const block = front.match(/^links:\s*\n((?:[ \t]+.*\n?)+)/m);
  if (!block) return [];
  return block[1]
    .split(/^\s*-\s+/m)
    .slice(1)
    .map((item) => ({
      label: item.match(/label:\s*["']?(.+?)["']?\s*$/m)?.[1],
      url: item.match(/url:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1],
    }))
    .filter((l) => l.label && l.url);
}

/** Cada link del .md debe verse como botón "Ver <label> ↗" (nunca la URL cruda). `where` = selector del contenedor. */
async function checkProjectLinks(page, slug, where, whereName) {
  const issues = [];
  const expected = linksOf(slug);
  if (expected.length === 0) return issues;
  const found = await page.evaluate(
    ([sel, s]) => {
      const root = sel === 'card'
        ? [...document.querySelectorAll('#featured-block article')].find((a) => a.querySelector(`a[href="/proyectos/${s}/"]`))
        : document.querySelector('main');
      return [...(root?.querySelectorAll('a') ?? [])].map((a) => ({
        text: a.textContent.replace(/\s+/g, ' ').trim(),
        href: a.getAttribute('href'),
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel') ?? '',
      }));
    },
    [where, slug],
  );
  const bodyText = await page.evaluate(() => document.body.innerText);
  for (const l of expected) {
    const a = found.find((f) => f.text === `Ver ${l.label} ↗`);
    if (!a) issues.push(`${slug} (${whereName}): falta el botón "Ver ${l.label} ↗"`);
    else {
      if (a.href !== l.url) issues.push(`${slug} (${whereName}): "${l.label}" apunta a ${a.href} (≠ ${l.url})`);
      if (a.target !== '_blank' || !/\bnoopener\b/.test(a.rel)) issues.push(`${slug} (${whereName}): "${l.label}" sin target=_blank/rel=noopener`);
    }
    if (bodyText.includes(new URL(l.url).host)) issues.push(`${slug} (${whereName}): la URL cruda ${new URL(l.url).host} se ve en el texto`);
  }
  return issues;
}

// ---------------------------------------------------------------- main

async function main() {
  mkdirSync(CHECKS_DIR, { recursive: true });

  let previewProc = null;
  if (!process.env.CHECK_URL) {
    console.log('▶ Starting astro preview on port 4322…');
    previewProc = spawn('node', ['node_modules/.bin/astro', 'preview', '--port', '4322', '--host'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    previewProc.stdout.on('data', (d) => process.stdout.write(d));
    previewProc.stderr.on('data', (d) => process.stderr.write(d));
    await waitForServer(BASE_URL);
    console.log('✓ Preview server ready\n');
  }

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH
      ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium`
      : undefined,
  });

  const links = []; // { pagePath, links }
  const idsByPath = new Map();
  const contentIssues = [];
  const metas = []; // { pagePath, meta } para el chequeo de SEO

  try {
    // ---- Home en los 6 viewports
    for (const viewport of VIEWPORTS) {
      const { ctx, page, errors, failed } = await openPage(browser, viewport, `${BASE_URL}/`);
      const issues = [
        ...(await checkBasics(page, errors, failed)),
        ...(await checkKeyboardStatic(page, viewport)),
      ];
      if (ANIM_VIEWPORTS.includes(viewport.name)) {
        // el teclado animado y el marquee se miden sin mover el mouse
        issues.push(...(await checkKeyboardAnimation(page)).map((i) => `animación: ${i}`));
        issues.push(...(await checkMarquee(page)).map((i) => `marquee: ${i}`));
      } else {
        issues.push(...(await checkMarquee(page)).filter((i) => i.includes('viewport')).map((i) => `marquee: ${i}`));
      }
      await shot(page, viewport.name);
      if (viewport.name === '1440x810' || viewport.name === '390x844') {
        const hero = await page.$('#hero');
        if (hero) await hero.screenshot({ path: path.join(CHECKS_DIR, `hero-${viewport.name}.png`) });
      }

      if (viewport.name === '1440x810') {
        links.push({ pagePath: '/', links: await collectLinks(page) });
        metas.push({ pagePath: '/', meta: await collectMeta(page) });
        idsByPath.set('/', new Set(await page.evaluate(() => Array.from(document.querySelectorAll('[id]')).map((e) => e.id))));
        contentIssues.push(
          ...checkContent('home', await page.content(), await page.evaluate(() => document.body.innerText)),
        );
        const eco = await page.evaluate(() => {
          const card = Array.from(document.querySelectorAll('#proyectos article')).find((a) => a.textContent.includes('Ecodespensa'));
          return card?.querySelector('.badge')?.textContent?.trim() ?? null;
        });
        if (eco !== 'En producción') contentIssues.push(`home: badge de Ecodespensa = ${JSON.stringify(eco)} (se esperaba "En producción")`);
      }
      if (viewport.name === '1440x810' || viewport.name === '390x844') {
        for (const slug of SLUGS) issues.push(...(await checkProjectLinks(page, slug, 'card', 'card en la home')));
        const lhoney = await page.evaluate(() => {
          const card = [...document.querySelectorAll('#featured-block article')].find((a) => a.querySelector('a[href="/proyectos/lhoney/"]'));
          return card?.querySelector('.badge')?.textContent?.trim() ?? null;
        });
        if (lhoney !== 'En producción') issues.push(`badge de Lhoney = ${JSON.stringify(lhoney)} (se esperaba "En producción")`);
      }
      issues.push(...(await checkDiagrams(page, viewport, FEATURED_DIAGRAMS)));
      if (viewport.name === '1440x810') issues.push(...(await checkDiagramMotion(page)).map((i) => `diagramas: ${i}`));
      // última comprobación de la home: scrollea la página para disparar las imágenes lazy
      issues.push(...(await checkProjectMedia(page, viewport)).map((i) => `previews: ${i}`));
      report(`${viewport.name} — /`, issues);
      await ctx.close();
    }

    // ---- Páginas de proyecto (todas) en 390×844 y 1440×810
    for (const name of CASE_VIEWPORTS) {
      const viewport = VIEWPORTS.find((v) => v.name === name);
      for (const slug of SLUGS) {
        const pagePath = `/proyectos/${slug}/`;
        const { ctx, page, errors, failed } = await openPage(browser, viewport, `${BASE_URL}${pagePath}`);
        const issues = await checkBasics(page, errors, failed);
        await shot(page, `${name}-${slug}`);
        if (name === '1440x810') {
          links.push({ pagePath, links: await collectLinks(page) });
          metas.push({ pagePath, meta: await collectMeta(page) });
          idsByPath.set(pagePath, new Set(await page.evaluate(() => Array.from(document.querySelectorAll('[id]')).map((e) => e.id))));
          contentIssues.push(
            ...checkContent(slug, await page.content(), await page.evaluate(() => document.body.innerText)),
          );
        }
        issues.push(...(await checkProjectLinks(page, slug, 'case', 'página del caso')));
        issues.push(...(await checkDiagrams(page, viewport, DIAGRAM_SLUGS.includes(slug) ? [slug] : [])));
        if (['mbarete', 'estacion-de-carretera', 'kevjer', 'floreria-catalogo', 'lhoney'].includes(slug)) {
          issues.push(...(await checkProjectMedia(page, viewport, { scope: 'main', featured: false })).map((i) => `previews: ${i}`));
        }
        report(`${name} — ${pagePath}`, issues);
        await ctx.close();
      }
    }

    // ---- reduced-motion
    report('reduced-motion (390×844)', await checkReducedMotion(browser));

    // ---- filtros (desktop y mobile)
    for (const name of ANIM_VIEWPORTS) {
      const viewport = VIEWPORTS.find((v) => v.name === name);
      report(`filtros (${name})`, await checkFilters(browser, viewport));
    }

    // ---- CTA sticky, secciones de la Fase 3
    report('CTA sticky — home (390×844)', await checkStickyCta(browser, '/', '#servicios', '#contacto'));
    report('CTA sticky — recién después del hero (390×844)', await checkHeroSticky(browser));
    report('CTA sticky — caso (390×844)', await checkStickyCta(browser, '/proyectos/mbarete/', '.prose', '#caso-cta'));
    report('secciones (servicios, proceso, sobre mí, contacto, footer)', await checkSections(browser));

    // ---- links
    const internal = new Set();
    const linkIssues = [];
    for (const { pagePath, links: ls } of links) linkIssues.push(...auditLinks(pagePath, ls, idsByPath, internal));
    const api = await browser.newContext();
    for (const target of internal) {
      if (target.includes('#')) continue; // anclas: ya validadas contra el DOM
      const res = await api.request.get(`${BASE_URL}${target}`);
      if (res.status() !== 200) linkIssues.push(`link interno ${target} → ${res.status()}`);
    }
    await api.close();
    report(`links (${links.reduce((n, l) => n + l.links.length, 0)} links, ${internal.size} rutas internas)`, linkIssues);

    // ---- SEO / OG / sitemap
    const seoApi = await browser.newContext();
    report(`SEO y Open Graph (${metas.length} páginas, ${SITE_URL})`, await checkSeo(metas, seoApi));
    await seoApi.close();

    // ---- contenido
    report('contenido (TODO, datos retirados, valuador, mbarete)', contentIssues);
  } finally {
    await browser.close();
    if (previewProc) {
      previewProc.kill();
      console.log('\n▶ Preview server stopped');
    }
  }

  console.log('\nScreenshots saved to .checks/');
  if (totalFails > 0) {
    console.error(`\n✗ ${totalFails} issue(s) found`);
    process.exit(1);
  } else {
    console.log('\n✓ All checks passed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
