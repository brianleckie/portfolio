// Verifica el build Editorial con Chromium. Uso: npm run build && npm run check:layout.
// Capturas full-page en .checks/.
import { parse } from 'yaml';
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
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1440x1002', width: 1440, height: 1002 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x740', width: 360, height: 740 },
];
const CASE_VIEWPORTS = ['1440x900', '390x844'];

const projectRaw = (slug) => readFileSync(path.join(ROOT, 'src/content/projects', slug + '.md'), 'utf8');
const projectData = (slug) => parse(projectRaw(slug).split(/^---\s*$/m)[1]);
const projectFlag = (slug, name, value) => projectData(slug)[name] === value;

const ALL_SLUGS = readdirSync(path.join(ROOT, 'src/content/projects'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));
const DRAFT_SLUGS = ALL_SLUGS.filter((slug) => projectFlag(slug, 'draft', true));
const SLUGS = ALL_SLUGS.filter((slug) => !DRAFT_SLUGS.includes(slug));
const GRID_SLUGS = SLUGS.filter((slug) => !projectFlag(slug, 'inGrid', false));

// ---------------------------------------------------------------- helpers

let totalFails = 0;

function report(label, issues) {
  if (issues.length === 0) {
    console.log(`✓ ${label}`);
  } else {
    console.log(`✗ ${label}`);
    issues.forEach((i) => console.log(`   • ${i}`));
    totalFails += issues.length;
  }
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

const byOrder = (a, b) => projectData(a).order - projectData(b).order;
const featured = GRID_SLUGS.filter((slug) => projectFlag(slug, 'featured', true)).sort(byOrder);
const others = GRID_SLUGS.filter((slug) => !featured.includes(slug)).sort(byOrder);

async function checkTypographyAndTargets(page) {
  return page.evaluate(() => {
    const issues = [];
    const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible' && !el.closest('.sr-only');
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el) || !Array.from(el.childNodes).some((node) => node.nodeType === 3 && node.textContent.trim())) continue;
      const { fontSize } = getComputedStyle(el);
      if (parseFloat(fontSize) < 14) {
        issues.push(`texto ${fontSize}: ${el.textContent.trim().slice(0, 60)}`);
      }
    }
    for (const el of document.querySelectorAll('a[href], button')) {
      if (!visible(el)) continue;
      const { width, height } = el.getBoundingClientRect();
      if (width < 44 || height < 44) issues.push(`target ${width.toFixed(1)}×${height.toFixed(1)}: ${el.textContent.trim()}`);
    }
    return issues;
  });
}

async function checkHome(page, viewport) {
  const data = await page.evaluate(() => ({
    projects: [...document.querySelectorAll('.cases > [data-project]')].map((el) => [el.dataset.project, el.dataset.status]),
    archive: [...document.querySelectorAll('.more > [data-project]')].map((el) => [el.dataset.project, el.dataset.status]),
    index: [...document.querySelectorAll('.toc a')].map((a) => a.hash.slice(3)),
    height: document.documentElement.scrollHeight,
    first: document.querySelector('.cases h3').getBoundingClientRect().top + scrollY,
    diagrams: [...document.querySelectorAll('[data-diagram]')].map((el) => el.closest('[data-project]').dataset.project),
    lang: Boolean(document.querySelector('.languages')),
    years: [...document.querySelectorAll('.cases .meta')].some((meta) => /\b20\d{2}\b/.test(meta.textContent)),
  }));
  const issues = [];
  if (await page.locator('[data-keyboard], .brand-key').count()) issues.push('queda una pieza del teclado anterior');
  if (!await page.getByRole('heading', { level: 1, name: 'Brian Leckie', exact: true }).count()) issues.push('nombre accesible del h1');
  const phone = page.locator('[data-hero-figure] .current .device-phone');
  if (!await phone.isVisible()) issues.push('falta el teléfono del hero');
  else {
    const look = await phone.evaluate((el) => ({
      transform: getComputedStyle(el).transform,
      island: getComputedStyle(el, '::after').width,
      side: getComputedStyle(el.querySelector('.phone-side')).display,
      label: el.closest('figure').querySelector('.device-label').getBoundingClientRect().height,
      labelW: el.closest('figure').querySelector('.device-label').getBoundingClientRect().width,
    }));
    if (!look.transform.startsWith('matrix3d')) issues.push('el teléfono del hero no está en perspectiva 3D');
    if (look.side !== 'block' || parseFloat(look.island) <= 0) issues.push('faltan canto o Dynamic Island en el teléfono del hero');
    if (look.label < 44 || look.labelW < 44) issues.push('etiqueta del teléfono menor a 44px');
  }
  const sites = await page.locator('[data-hero-slide]').evaluateAll((slides) => slides.map((slide) => slide.dataset.site));
  if (sites.join(',') !== 'mbarete,rocio,ornella,lhoney,estacion-de-carretera,cpo-tech') issues.push('faltan sitios en el teléfono');
  if (await page.locator('.hero-meta, #hero [data-clock], #hero [data-offset]').count()) issues.push('quedó el reloj en el hero');
  if (viewport.width <= 390) {
    // Caja de layout (sin la perspectiva): el canto se compensa con un margen derecho.
    const box = await phone.evaluate((el) => {
      return { width: el.offsetWidth, height: el.offsetHeight };
    });
    const projected = await phone.boundingBox();
    if (box.width < viewport.width * .6 || box.width > viewport.width * .7 ||
      box.height > viewport.height * .56 || !projected || projected.x < 0 ||
      projected.x + projected.width > viewport.width || Math.abs(projected.x + projected.width / 2 - viewport.width / 2) > 24) {
      issues.push('tamaño o centrado del teléfono en mobile');
    }
    if (data.first >= viewport.height * 1.5) issues.push('el primer caso comienza después del primer pantallazo y medio');
  }
  if (JSON.stringify(data.index) !== JSON.stringify(featured)) issues.push('índice de trabajos fuera de orden');
  for (const [found, slugs] of [[data.projects, featured], [data.archive, others]]) {
    if (JSON.stringify(found) !== JSON.stringify(slugs.map((slug) => [slug, projectData(slug).status]))) {
      issues.push('orden, inclusión o estado de los proyectos incorrecto');
    }
  }
  if (data.lang || data.years) issues.push('selector de idioma o año de proyecto visible');
  if (data.diagrams.join(',') !== 'ecodespensa,valuador-inmuebles') issues.push('falta un diagrama destacado');
  if (!(await page.locator('.cv a[href="/proyectos/it-sucursales/"]').isVisible())) issues.push('enlace de Grupo Empresarial Franz ausente');
  if (viewport.width === 390) {
    const firstShot = await page.locator('.cases > li').first().locator('.device-laptop').boundingBox();
    console.log(`  Home 390: ${data.height}px · primer título y captura a ${Math.round(data.first)} / ${Math.round(firstShot?.y ?? Infinity)}px`);
    if (data.height > 8000) issues.push(`home supera 8000px (${data.height}px)`);
    if (!firstShot || firstShot.y >= viewport.height * 2) {
      issues.push('el primer título y captura deben aparecer con un scroll');
    }
  }
  return issues;
}

async function checkPictures(page) {
  const issues = [];
  const pictures = await page.locator('picture:visible').all();
  for (const picture of pictures) {
    await picture.scrollIntoViewIfNeeded();
    try {
      await picture.locator('img').evaluate((img) => img.decode());
    } catch {
      issues.push('captura sin decodificar: ' + await picture.locator('img').getAttribute('alt'));
    }
    const formats = await picture.locator('source').evaluateAll((sources) => sources.map((s) => s.type));
    if (!formats.includes('image/avif') || !formats.includes('image/webp')) issues.push('falta AVIF o WebP');
  }
  for (const image of await page.locator('.device-image[src]:visible').all()) {
    await image.scrollIntoViewIfNeeded();
    try { await image.evaluate((img) => img.decode()); }
    catch { issues.push('captura de dispositivo sin decodificar'); }
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  return issues;
}

async function checkInteractions(browser) {
  const viewport = VIEWPORTS.find(({ width }) => width === 390);
  const { ctx, page } = await openPage(browser, viewport, BASE_URL + '/?cat=web', { reducedMotion: 'reduce' });
  try {
    const issues = await checkHome(page, viewport);
    const visual = page.locator('[data-typing-visual]');
    if ((await visual.textContent()).trim().replace(/\s+/g, ' ') !== 'Brian Leckie' ||
      await page.locator('.is-typing').count()) issues.push('el título debe ser estático con reduced motion');
    if (await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) !== 'auto') {
      issues.push('el scroll animado sigue activo con reduced motion');
    }

    await page.keyboard.press('Tab');
    if (!await page.evaluate(() => {
      const focused = document.activeElement;
      return focused.matches(':focus-visible') && getComputedStyle(focused).outlineStyle !== 'none';
    })) issues.push('falta foco visible al navegar con Tab');

    const toggle = page.locator('.menu-toggle');
    const menu = page.getByRole('dialog', { name: 'Menú' });
    await toggle.click();
    if (!await menu.isVisible() || await toggle.getAttribute('aria-expanded') !== 'true') issues.push('el menú no abrió');
    for (const link of await menu.getByRole('navigation').getByRole('link').all()) {
      if ((await link.boundingBox())?.height < 56) issues.push('enlace del menú menor a 56px');
    }
    if (await menu.getByRole('link', { name: 'Escribime por WhatsApp' }).count() !== 1) issues.push('falta el CTA del menú');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false');
    if (await menu.isVisible() || !await toggle.evaluate((el) => el === document.activeElement)) issues.push('Escape no cerró o devolvió el foco');
    await toggle.click();
    await menu.getByRole('link', { name: 'Experiencia' }).click();
    await page.waitForFunction(() => document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'false');
    if (new URL(page.url()).hash !== '#experiencia' || !await toggle.evaluate((el) => el === document.activeElement)) issues.push('el enlace del menú no cerró, navegó o devolvió el foco');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));

    const positions = await page.evaluate(() => {
      const headerHeight = document.querySelector('.hdr').getBoundingClientRect().height;
      const end = document.documentElement.scrollHeight - innerHeight;
      const result = new Set([0, end]);
      for (let y = 0; y < end; y += 160) result.add(y);
      for (const link of document.querySelectorAll('[data-inline-wa]')) {
        const { top, bottom } = link.getBoundingClientRect();
        for (const y of [top + scrollY - innerHeight + 1, top + scrollY - innerHeight - 1, bottom + scrollY - headerHeight - 1, bottom + scrollY - headerHeight + 1]) {
          if (y >= 0 && y <= end) result.add(Math.round(y));
        }
      }
      return [...result].sort((a, b) => a - b);
    });
    for (const y of positions) {
      const count = await page.evaluate(async (top) => {
        scrollTo({ top, behavior: 'instant' });
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return [...document.querySelectorAll('a[href^="https://wa.me/"]')].filter((link) => {
          const { top, bottom, width } = link.getBoundingClientRect();
          const headerBottom = document.querySelector('.hdr').getBoundingClientRect().bottom;
          return width && bottom > (link.hasAttribute('data-inline-wa') ? headerBottom : 0) && top < innerHeight;
        }).length;
      }, y);
      if (count !== 1) issues.push(`a scrollY=${y}px se ven ${count} CTA de WhatsApp`);
    }
    await page.locator('footer a[href="#top"]').click();
    if (await page.evaluate(() => scrollY > 1)) issues.push('Arriba no vuelve al comienzo');
    return issues;
  } finally {
    await ctx.close();
  }
}

async function checkHeroMotion(browser) {
  const staticPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  const issues = [];
  try {
    await staticPage.goto(BASE_URL + '/');
    const visible = staticPage.locator('[data-typing-visual]');
    if ((await visible.textContent()).trim().replace(/\s+/g, ' ') !== 'Brian Leckie' ||
        !await staticPage.getByRole('heading', { level: 1, name: 'Brian Leckie', exact: true }).count()) {
      issues.push('el título debe conservar su texto visible y accesible sin JavaScript');
    }
  } finally {
    await staticPage.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    const page = await ctx.newPage();
    await page.clock.install();
    // Pausa antes de cargar para observar todos los fotogramas del título.
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.goto(BASE_URL + '/');
    const caption = page.locator('[data-typing-visual]');
    const headline = page.getByRole('heading', { level: 1, name: 'Brian Leckie', exact: true });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const height = await headline.evaluate((el) => el.offsetHeight);
    await page.clock.runFor(900);
    if (await caption.textContent() !== 'Ingenier' || !await headline.count()) issues.push('guiño del título o nombre accesible incorrecto');
    await page.clock.runFor(2100);
    if ((await caption.textContent()).trim().replace(/\s+/g, ' ') !== 'Brian Leckie' ||
      height !== await headline.evaluate((el) => el.offsetHeight)) issues.push('el título final cambió de tamaño o de texto');
    const active = page.locator('[data-hero-slide].current a');
    if (await active.getAttribute('href') !== '/proyectos/mbarete/') issues.push('primera figura incorrecta');
    const image = page.locator('[data-hero-slide].current .device-scroll');
    await image.evaluate((img) => img.decode());
    await page.clock.runFor(100);
    if (!await page.locator('.hero-figure.playing').count()) issues.push('la figura no anima al entrar en viewport');
    await active.focus();
    await page.clock.runFor(100);
    if (await page.locator('.hero-figure.playing').count()) issues.push('la figura se mueve con foco');
    await page.locator('.brand').focus();
    await page.clock.runFor(100);
    await image.evaluate((img) => img.dispatchEvent(new CustomEvent('hero-pan-end', { bubbles: true })));
    // Decodificar la siguiente captura antes de activar su slide.
    await page.locator('[data-site="rocio"] .device-scroll').evaluate((img) => img.decode());
    await page.clock.runFor(100);
    if (await active.getAttribute('href') !== '/proyectos/floreria-catalogo/') issues.push('la figura no cambia de caso');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.runFor(200);
    if (await image.evaluate((img) => img.getAnimations().length) !== 0) issues.push('la figura se mueve con reduced motion');
    await page.evaluate(() => document.getElementById('experiencia').scrollIntoView({ behavior: 'instant' }));
    await page.clock.runFor(100);
    if (await page.locator('.nav [aria-current="location"]').getAttribute('href') !== '#experiencia') issues.push('el indicador de sección no sigue el scroll');
    return issues;
  } finally {
    await ctx.close();
  }
}

async function checkHeroScroll(browser) {
  const issues = [];
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    try {
      const page = await ctx.newPage();
      await page.goto(BASE_URL + '/');
      await page.locator('[data-hero-figure]').scrollIntoViewIfNeeded();
      const seen = new Set();
      // Muestrea el translateY real de la captura activa: debe cambiar a lo largo del tiempo.
      for (let i = 0; i < 60 && seen.size < 3; i++) {
        seen.add(Math.round(await page.evaluate(() =>
          new DOMMatrix(getComputedStyle(document.querySelector('[data-hero-slide].current .device-scroll')).transform).f)));
        await page.waitForTimeout(200);
      }
      if (seen.size < 3) issues.push(`${width}px: la captura del hero no scrollea (translateY ${[...seen].join(',')})`);
      const barSites = new Set([
        existsSync(path.join(ROOT, 'src/assets/projects/mbarete/mobile-full-bar.webp')) && 'mbarete',
        existsSync(path.join(ROOT, 'src/assets/projects/floreria-catalogo/mobile-full-bar-rocio.webp')) && 'rocio',
      ].filter(Boolean));
      const visited = [];
      for (let n = 0; n < 6; n++) {
        const info = await page.evaluate(async () => {
          const slide = document.querySelector('[data-hero-slide].current');
          const img = slide.querySelector('.device-scroll');
          const win = slide.querySelector('.device-window');
          await img.decode().catch(() => {});
          const anim = img.getAnimations()[0];
          if (!anim) return { site: slide.dataset.site, none: true };
          const travel = img.offsetHeight - win.clientHeight;
          const ys = anim.effect.getKeyframes().map((k) => -parseFloat(/translateY\(([-\d.]+)px/.exec(k.transform)[1]));
          anim.pause();
          anim.currentTime = anim.effect.getTiming().duration;
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const ir = img.getBoundingClientRect();
          const wr = win.getBoundingClientRect();
          const bar = slide.querySelector('.device-bar')?.getBoundingClientRect();
          return { site: slide.dataset.site, travel, maxY: Math.max(...ys), gap: ir.bottom - wr.bottom,
            bar: bar ? wr.bottom - bar.bottom : null };
        });
        visited.push(info.site);
        if (info.none) issues.push(`${width}px ${info.site}: sin animación de scroll`);
        else {
          if (info.maxY > info.travel + 1) issues.push(`${width}px ${info.site}: el scroll supera la captura (${info.maxY} > ${info.travel})`);
          if (info.travel > 0 && info.maxY < info.travel - 1) issues.push(`${width}px ${info.site}: el scroll no llega al final`);
          if (info.gap < -1) issues.push(`${width}px ${info.site}: pantalla en blanco al final (${info.gap.toFixed(1)}px)`);
          if (barSites.has(info.site) && (info.bar === null || Math.abs(info.bar) > 1.5)) issues.push(`${width}px ${info.site}: la barra fija no está al pie`);
        }
        const href = info.site;
        await page.evaluate(() => { const a = document.querySelector('[data-hero-slide].current .device-scroll').getAnimations()[0]; a?.play(); a?.finish(); });
        try {
          await page.waitForFunction((h) => document.querySelector('[data-hero-slide].current').dataset.site !== h, href, { timeout: 6000 });
        } catch { issues.push(`${width}px ${info.site}: no pasa al siguiente sitio`); break; }
      }
      if (new Set(visited).size < 6) issues.push(`${width}px: el teléfono no rota por los 6 sitios (${visited.join(',')})`);
    } finally {
      await ctx.close();
    }
  }
  return issues;
}

async function checkCase(page, slug, viewport) {
  const data = projectData(slug);
  const issues = [];
  if (await page.locator('main').getAttribute('data-status') !== data.status) issues.push('estado del caso incorrecto');
  if (data.clientNamePublic && data.client && !(await page.locator('.article-meta').innerText()).includes(data.client)) issues.push('cliente público ausente');
  if ((await page.locator('.article-meta').innerText()).match(/^(?:año|year)$/im)) issues.push('año en metadatos del caso');
  if ((await page.locator('h1').innerText()).includes(' — ')) issues.push('raya en título del caso');
  if (await page.locator('main a[href^="https://wa.me/"]').count() !== 1) issues.push('el caso requiere un CTA final');
  for (const url of [data.demoUrl, data.repoUrl, ...(data.links ?? []).map((link) => link.url)].filter((url) => url && !url.startsWith('TODO'))) {
    const links = await page.locator('.article-links a').evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
    if (!links.includes(url)) issues.push('enlace externo ausente: ' + url);
  }
  if (data.flow && !await page.locator('[data-diagram]').isVisible()) issues.push('diagrama ausente');
  const dir = path.join(ROOT, 'src/assets/projects', slug);
  if (existsSync(dir)) {
    const figures = slug === 'floreria-catalogo' ? 4 : readdirSync(dir).some((name) => /^.+-alt\./.test(name)) ? 2 : 1;
    if (await page.locator('.gallery figure').count() !== figures) issues.push('faltan vistas de la galería');
  }
  // Los dispositivos de los casos son estáticos: sin animación ni clase de scroll.
  const moving = await page.locator('.device-pair .device-image').evaluateAll((imgs) =>
    imgs.filter((img) => img.classList.contains('device-scroll') || getComputedStyle(img).animationName !== 'none').length);
  if (moving) issues.push('un dispositivo del caso tiene animación de scroll');
  if (viewport.width === 390 && await page.locator('.gallery .device-pair:not(.phone-only)').count()) {
    const frame = await page.locator('.gallery .device-laptop').first().boundingBox();
    if (!frame || frame.width < 330) issues.push('la laptop no ocupa el ancho del caso');
  }
  return issues;
}

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
        if (ld.worksFor?.map((org) => org.name).join() !== 'Klien IT Systems,CPO Tech') issues.push('/: JSON-LD worksFor incorrecto');
        if (ld.knowsLanguage?.join() !== 'es,en' || !ld.jobTitle?.length) issues.push('/: faltan idiomas o rol en JSON-LD');
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
  for (const slug of DRAFT_SLUGS) {
    const casePath = '/proyectos/' + slug + '/';
    const ogPath = '/og/' + slug + '.png';
    if (smText.includes('<loc>' + SITE_URL + casePath + '</loc>')) issues.push('draft presente en sitemap: ' + slug);
    for (const route of [casePath, ogPath]) {
      const response = await api.request.get(BASE_URL + route);
      if (response.status() !== 404) issues.push('ruta de draft ' + route + ' → ' + response.status());
    }
  }
  if ((await api.request.get(BASE_URL + '/en/')).status() !== 404) issues.push('/en/ se publicó antes de R3');
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
  if (/\bprompt\b|mi diferencial/i.test(text)) issues.push(slug + ': aparece copy retirado');
  if (slug === 'valuador-inmuebles') {
    if (!/precio de oferta/i.test(text)) issues.push('valuador: no dice "precio de oferta"');
    if (!/<blockquote/.test(html)) issues.push('valuador: falta el bloque visible de limitación');
    if (/\d\s?%|R²|\bMAE\b|\bRMSE\b/.test(text)) issues.push('valuador: contiene una métrica');
    if (KNOWN_PORTALS.test(text)) issues.push('valuador: nombra un portal inmobiliario');
  }
  if (slug === 'mbarete' && !text.includes('Lo usan 5 gimnasios en Argentina y Paraguay.')) {
    issues.push('mbarete: falta la frase de resultado');
  }
  return issues;
}
async function main() {
  const fullAssets = {
    mbarete: [''], 'floreria-catalogo': ['-rocio', '-ornella'], lhoney: [''], 'cpo-tech': [''],
    kevjer: [''],
  };
  const missing = Object.entries(fullAssets).flatMap(([slug, variants]) => variants.flatMap((suffix) =>
    ['mobile', 'desktop'].map((device) => `${slug}/${device}-full${suffix}.webp`),
  )).filter((file) => !existsSync(path.join(ROOT, 'src/assets/projects', file)));
  report('capturas completas', missing.map((file) => 'archivo ausente: ' + file));
  // La demo de Estación está en mantenimiento. El sitio usa sus capturas
  // archivadas mientras no existan los archivos completos.
  const station = path.join(ROOT, 'src/assets/projects/estacion-de-carretera');
  report('capturas de Estación', ['desktop', 'mobile']
    .filter((device) => !existsSync(path.join(station, device + '-full.webp')) && !existsSync(path.join(station, device + '.webp')))
    .map((device) => 'no hay captura de ' + device));
  mkdirSync(CHECKS_DIR, { recursive: true });

  let previewProc = null;
  if (!process.env.CHECK_URL) {
    console.log('▶ Starting astro preview on port 4322…');
    previewProc = spawn(process.execPath, [path.join(ROOT, 'node_modules/astro/astro.js'), 'preview', '--port', '4322', '--host'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    previewProc.stdout.on('data', (d) => process.stdout.write(d));
    previewProc.stderr.on('data', (d) => process.stderr.write(d));
    await waitForServer(BASE_URL);
    console.log('✓ Preview server ready\n');
  }

  const browser = await chromium.launch();

  const links = []; // { pagePath, links }
  const idsByPath = new Map();
  const contentIssues = [];
  const metas = []; // { pagePath, meta } para el chequeo de SEO

  try {
    async function capturePage(viewport, pagePath, slug) {
      const { ctx, page, errors, failed } = await openPage(browser, viewport, BASE_URL + pagePath);
      try {
        const issues = await checkTypographyAndTargets(page);
        issues.push(...(slug ? await checkCase(page, slug, viewport) : await checkHome(page, viewport)));
        issues.push(...await checkPictures(page), ...await checkBasics(page, errors, failed));
        await shot(page, viewport.name + (slug ? '-' + slug : ''));
        if (viewport.width === 1440 && viewport.height === 900) {
          links.push({ pagePath, links: await collectLinks(page) });
          metas.push({ pagePath, meta: await collectMeta(page) });
          idsByPath.set(pagePath, new Set(await page.locator('[id]').evaluateAll((nodes) => nodes.map((el) => el.id))));
          contentIssues.push(...checkContent(slug ?? 'home', await page.content(), await page.locator('body').innerText()));
          if (!slug) {
            for (const draft of DRAFT_SLUGS) {
              if (links.at(-1).links.some(({ raw }) => raw === '/proyectos/' + draft + '/')) contentIssues.push('draft enlazado: ' + draft);
            }
          }
        }
        report(viewport.name + ' — ' + pagePath, issues);
      } finally {
        await ctx.close();
      }
    }

    for (const viewport of VIEWPORTS) await capturePage(viewport, '/');
    for (const viewport of VIEWPORTS.filter(({ name }) => CASE_VIEWPORTS.includes(name))) {
      for (const slug of SLUGS) await capturePage(viewport, '/proyectos/' + slug + '/', slug);
    }
    report('menú, reduced motion, ?cat= y WhatsApp', await checkInteractions(browser));
    report('título, figura y sección activa', await checkHeroMotion(browser));
    report('scroll y rotación del teléfono del hero (tiempo real)', await checkHeroScroll(browser));

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
