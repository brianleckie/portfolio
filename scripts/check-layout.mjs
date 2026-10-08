// check-layout.mjs — verificación con Playwright contra el build (SPEC §11)
// Uso: npm run build && npm run check:layout
//
// Levanta `astro preview` (puerto 4322) o usa CHECK_URL si ya hay un server.
// Chequea:
//   - Home en 6 viewports y todas las páginas de proyecto en 390×844 y 1440×810:
//     overflow horizontal, errores de consola, requests fallidas/404.
//   - Teclado: cabe en su contenedor, altura del wrapper, Enter clickeable, Satoshi 900, fold.
//   - Animación (sin display): teclas presionadas muestreadas cada 50 ms durante ~6 s.
//   - Marquee: translateX muestreado ~4 s, siempre en [-anchoGrupo, 0], grupo >= viewport.
//   - reduced-motion: ni teclado ni marquee se mueven.
//   - Filtros: teclas y chips, ?cat= en la URL, carga directa y valores inválidos.
//   - Links: wa.me con número y text, mailto válido, sin href vacío ni "#", cero 404 internos.
//   - Contenido: sin "TODO", sin datos retirados, valuador con "precio de oferta" y sin métricas.
// Guarda screenshots full-page en .checks/<viewport>.png (home) y .checks/<viewport>-<slug>.png.

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdirSync, readdirSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE_URL = process.env.CHECK_URL ?? 'http://localhost:4322';
const CHECKS_DIR = path.join(ROOT, '.checks');

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

async function checkKeyboardStatic(page, viewport) {
  const issues = [];
  const kb = await page.evaluate(() => {
    const wrapper = document.getElementById('kb-wrapper');
    const stage = document.getElementById('kb-stage');
    if (!wrapper || !stage) return { skip: true };

    const wrapperRect = wrapper.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const kbFitsContainer = stageRect.width <= wrapperRect.width + 1;

    const scale = stageRect.width / 900;
    const expectedH = 312 * scale;
    const actualH = wrapperRect.height;
    const heightOk = actualH >= expectedH - 1 && actualH <= expectedH + 25;

    const keys = Array.from(document.querySelectorAll('.key'));
    const keysOk = keys.length === 10 && keys.every((k) => k.getAttribute('href') && k.getAttribute('aria-label'));

    const enterEl = document.getElementById('key-Enter');
    let enterClickable = false;
    const blockedKeys = [];
    if (enterEl) {
      enterEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      const hits = (el, fx, fy) => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
        return hit === el || (hit !== null && el.contains(hit));
      };
      // Área expuesta del Enter (a la derecha del borde que tapa S)
      enterClickable = hits(enterEl, 0.65, 0.5) && hits(enterEl, 0.9, 0.9);
      // Cada tecla debe recibir el click en su centro; S también en su borde derecho (donde se cruza con Enter)
      for (const k of keys) {
        const pts = k.id === 'key-S' ? [[0.5, 0.45], [0.9, 0.6]] : [[0.5, 0.45]];
        if (!pts.every(([fx, fy]) => hits(k, fx, fy))) blockedKeys.push(k.id.replace('key-', ''));
      }
    }

    return {
      kbFitsContainer,
      heightOk,
      keysOk,
      enterClickable,
      blockedKeys,
      satoshiLoaded: document.fonts.check('900 72px Satoshi'),
      scale,
      actualH,
      expectedH,
    };
  });

  if (kb.skip) return ['no se encontró el teclado'];
  if (!kb.kbFitsContainer) issues.push('keyboard wider than container');
  if (!kb.heightOk) issues.push(`wrapper height ${kb.actualH.toFixed(1)}px ≠ 312×${kb.scale.toFixed(3)}=${kb.expectedH.toFixed(1)}px`);
  if (!kb.keysOk) issues.push('las 10 teclas deben tener href y aria-label');
  if (!kb.enterClickable) issues.push('Enter key not clickable at expected coordinates');
  if (kb.blockedKeys.length) issues.push(`teclas tapadas por otra en su área clickeable: ${kb.blockedKeys.join(', ')}`);
  if (!kb.satoshiLoaded) issues.push('Satoshi 900 not loaded (document.fonts.check failed)');

  if (viewport.name === '1440x810') {
    await page.evaluate(() => window.scrollTo(0, 0));
    const fold = await page.evaluate(() => {
      const r = document.getElementById('kb-stage').getBoundingClientRect();
      return { stageTop: r.top, row1Bottom: r.top + 161, viewportH: window.innerHeight };
    });
    if (fold.row1Bottom > fold.viewportH) {
      issues.push(`fold: fila 1 del teclado no entra sin scroll (bottom=${fold.row1Bottom.toFixed(0)}px > ${fold.viewportH}px)`);
    }
  }
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
          });
        }, 1500);
      }),
  );
  if (data.pressed) issues.push('el teclado se animó con prefers-reduced-motion');
  if (data.moved > 0.5) issues.push(`el marquee se movió ${data.moved.toFixed(1)}px con prefers-reduced-motion`);
  if (data.transition >= 0.05) issues.push(`.key-face conserva transición (${data.transition}s)`);
  if (data.groups !== 'none') issues.push('el marquee duplicado debe ocultarse con reduced-motion');
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
          idsByPath.set(pagePath, new Set(await page.evaluate(() => Array.from(document.querySelectorAll('[id]')).map((e) => e.id))));
          contentIssues.push(
            ...checkContent(slug, await page.content(), await page.evaluate(() => document.body.innerText)),
          );
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
