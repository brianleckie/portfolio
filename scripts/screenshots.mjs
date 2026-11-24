// npm run shots [-- slug ...] — capturas de sitios públicos (SPEC §8.4).
// shots.default configura un solo sitio. Para varios links, usá la clave del label
// (primera palabra sin tildes) para los ajustes y preview. La demoUrl usa "default".
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');
const ASSETS_DIR = path.join(ROOT, 'src/assets/projects');
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

function keyOf(label) {
  return label.trim().split(/\s+/)[0].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

async function readProject(filename) {
  const slug = path.basename(filename, '.md');
  const source = await readFile(path.join(PROJECTS_DIR, filename), 'utf8');
  const { demoUrl, links = [], shots = {} } = parse(source.split(/^---\s*$/m)[1]) ?? {};
  const candidates = [
    ...(demoUrl ? [{ url: demoUrl, key: 'default' }] : []),
    ...links.map(({ url, label }) => ({ url, key: keyOf(label) })),
  ];
  const targets = candidates.filter(({ url }, index) => candidates.findIndex((target) => target.url === url) === index);
  const keys = targets.map(({ key }) => key);
  if (new Set(keys).size !== keys.length || keys.some((key) => !/^[a-z0-9-]+$/.test(key))) {
    throw new Error(`${slug}: las claves de captura deben ser únicas y alfanuméricas`);
  }
  return {
    slug,
    targets: targets.map(({ url, key }) => ({
      url,
      suffix: targets.length > 1 && key !== 'default' ? `-${key}` : '',
      settings: targets.length === 1 ? (shots[key] ?? shots.default ?? {}) : (shots[key] ?? {}),
    })),
  };
}

async function open(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? 'sin respuesta'}: ${url}`);
}

async function prepare(page, settings, waitFor) {
  if (settings.click) await page.locator(settings.click).click();
  if (waitFor) await page.locator(waitFor).first().waitFor({ state: 'visible' });
  if (settings.delay) await sleep(settings.delay);
  if (settings.css) await page.addStyleTag({ content: settings.css });
  for (const selector of settings.hideText ?? []) {
    // Playwright admite selectores de texto; se oculta el nodo mínimo que coincide.
    await page.locator(selector).evaluateAll((elements) => {
      for (const element of elements) element.style.setProperty('display', 'none', 'important');
    });
  }
}

async function scrollTo(page, selector) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: 'visible' });
  await target.evaluate((element) => {
    element.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
}

async function waitForMedia(page) {
  // Limita la espera a las imágenes del encuadre, incluidas las lazy activadas al desplazar.
  await page.evaluate(async () => {
    const visible = [...document.images].filter((image) => {
      const bounds = image.getBoundingClientRect();
      return bounds.width && bounds.height && bounds.bottom > 0 && bounds.right > 0 &&
        bounds.top < innerHeight && bounds.left < innerWidth;
    });
    for (const image of visible) image.loading = 'eager';
    await Promise.race([
      Promise.all([document.fonts.ready, ...visible.map((image) => image.decode().catch(() => {}))]),
      new Promise((resolve) => setTimeout(resolve, 8_000)),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function capture(page, dir, filename, width, height) {
  await waitForMedia(page);
  const png = await page.screenshot({ animations: 'disabled', caret: 'hide', timeout: 15_000 });
  const output = path.join(dir, filename);
  const temporary = `${output}.${process.pid}.tmp`;
  const image = sharp(png);
  const metadata = await image.metadata();
  if (metadata.width !== width * 2 || metadata.height !== height * 2) {
    throw new Error(`Tamaño inesperado: ${metadata.width}×${metadata.height}`);
  }
  try {
    await writeFile(temporary, await image.webp({ quality: 82 }).toBuffer());
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`✓ ${path.relative(ROOT, output)}`);
}

/** Recorta el fondo uniforme del final (franjas en blanco). Conserva un margen y un alto mínimo. */
async function trimTail(buffer, { margin = 24, minHeight = 1200 } = {}) {
  const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rowStats = (y) => {
    const min = [255, 255, 255];
    const max = [0, 0, 0];
    const sum = [0, 0, 0];
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        const v = data[(y * width + x) * channels + c];
        if (v < min[c]) min[c] = v;
        if (v > max[c]) max[c] = v;
        sum[c] += v;
      }
    }
    return { spread: Math.max(...max.map((v, c) => v - min[c])), mean: sum.map((v) => v / width) };
  };
  const base = rowStats(height - 1);
  if (base.spread > 8) return { buffer, trimmed: 0 };
  let last = height - 1;
  while (last > minHeight) {
    const row = rowStats(last - 1);
    if (row.spread > 8 || row.mean.some((v, c) => Math.abs(v - base.mean[c]) > 12)) break;
    last--;
  }
  const keep = Math.min(height, Math.max(minHeight, last + margin));
  if (height - keep < 40) return { buffer, trimmed: 0 };
  const out = await sharp(buffer).extract({ left: 0, top: 0, width, height: keep }).webp({ quality: 80 }).toBuffer();
  return { buffer: out, trimmed: height - keep };
}

/** Guarda aparte los elementos fijos al pie (barra de navegación, botón flotante) y los oculta. */
async function captureSticky(page, dir, suffix, width, selector) {
  const found = await page.evaluate((sel) => {
    const vh = innerHeight;
    const els = new Set(document.querySelectorAll(sel));
    for (const e of document.querySelectorAll('*')) {
      if (!['fixed', 'sticky'].includes(getComputedStyle(e).position)) continue;
      const r = e.getBoundingClientRect();
      if (r.width && r.height && r.top > vh * .55 && r.bottom >= vh - 120 && r.height < vh * .3) els.add(e);
    }
    let top = vh;
    for (const e of els) {
      e.setAttribute('data-sticky-cap', '');
      top = Math.min(top, e.getBoundingClientRect().top);
    }
    return { count: els.size, top, vh };
  }, selector);
  if (!found.count) throw new Error(`stickyBottom sin coincidencias: ${selector}`);
  const style = await page.addStyleTag({ content: `
    html, body { background: transparent !important; }
    body * { visibility: hidden !important; }
    [data-sticky-cap], [data-sticky-cap] * { visibility: visible !important; }` });
  const y = Math.max(0, Math.floor(found.top) - 28);
  const png = await page.screenshot({
    clip: { x: 0, y, width, height: found.vh - y }, omitBackground: true, animations: 'disabled', caret: 'hide',
  });
  await style.evaluate((node) => node.remove());
  await page.addStyleTag({ content: '[data-sticky-cap] { display: none !important; }' });
  const output = path.join(dir, `mobile-full-bar${suffix}.webp`);
  await writeFile(output, await sharp(png).resize({ width: width * 2 }).webp({ quality: 85, alphaQuality: 100 }).toBuffer());
  console.log(`✓ ${path.relative(ROOT, output)} (${found.count} elemento/s fijos)`);
}

async function captureFull(page, dir, filename, width, limit) {
  await page.evaluate(async (maxHeight) => {
    const height = Math.min(maxHeight, document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += innerHeight * .75) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 110));
    }
    scrollTo({ top: 0, behavior: 'instant' });
    const images = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.width && rect.height && rect.top < maxHeight;
    });
    await Promise.race([
      Promise.all([document.fonts.ready, ...images.map((image) => image.decode().catch(() => {}))]),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
  }, limit);
  const height = await page.evaluate((max) => Math.min(max, document.documentElement.scrollHeight), limit);
  const png = await page.screenshot({
    fullPage: true, clip: { x: 0, y: 0, width, height },
    animations: 'disabled', caret: 'hide', timeout: 30000,
  });
  const image = sharp(png).resize({ width: width === 1440 ? width : width * 2 });
  let webp = await image.clone().webp({ quality: 75 }).toBuffer();
  for (const quality of [67, 58, 49, 40]) {
    if (webp.length <= 400_000) break;
    webp = await image.clone().webp({ quality }).toBuffer();
  }
  if (webp.length > 400_000) webp = await sharp(webp).resize({ width, height: Math.round(height * .8), fit: 'inside' }).webp({ quality: 68 }).toBuffer();
  const tail = await trimTail(webp);
  webp = tail.buffer;
  const output = path.join(dir, filename);
  const temporary = `${output}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, webp);
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`✓ ${path.relative(ROOT, output)} (${Math.round(webp.length / 1024)} KB${tail.trimmed ? `, recortadas ${tail.trimmed}px en blanco` : ''})`);
}

if (process.argv.includes('--trim-only')) {
  // Recorta las capturas full existentes sin volver a fotografiar los sitios.
  for (const slug of await readdir(ASSETS_DIR)) {
    for (const file of await readdir(path.join(ASSETS_DIR, slug))) {
      if (!/-full(?!-bar)[^/]*\.webp$/.test(file) || file.includes('-full-bar')) continue;
      const target = path.join(ASSETS_DIR, slug, file);
      const { buffer, trimmed } = await trimTail(await readFile(target));
      if (trimmed) await writeFile(target, buffer);
      console.log(`${trimmed ? '✂' : '·'} ${slug}/${file}${trimmed ? ` -${trimmed}px` : ''}`);
    }
  }
  process.exit(0);
}
const fullOnly = process.argv.includes('--full-only');
const selected = new Set(process.argv.slice(2).filter((arg) => arg !== '--full-only'));
const files = await readdir(PROJECTS_DIR);
const projects = (await Promise.all(files
  .filter((file) => file.endsWith('.md') && (!selected.size || selected.has(path.basename(file, '.md'))))
  .map(readProject)))
  .filter(({ targets }) => targets.length);
const missing = [...selected].filter((slug) => !projects.some((project) => project.slug === slug));
if (missing.length) throw new Error(`Sin sitio para capturar: ${missing.join(', ')}`);

const browser = await chromium.launch();
const failures = [];

async function runProject({ slug, targets }) {
  const dir = path.join(ASSETS_DIR, slug);
  await mkdir(dir, { recursive: true });
  for (const { url, suffix, settings } of targets) {
    for (const { name, width, height } of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 2,
        isMobile: name === 'mobile',
        hasTouch: name === 'mobile',
      });
      let filename = `${name}${fullOnly ? '-full' : ''}${suffix}.webp`;
      let currentUrl = url;
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(12_000);
        await open(page, url);
        await prepare(page, settings, settings.waitFor);
        if (!fullOnly) await capture(page, dir, filename, width, height);
        if (settings.alt && (!fullOnly || slug === 'mbarete')) {
          filename = `${name}-alt${suffix}.webp`;
          const { path: altPath, click, scrollTo: selector, waitFor } = settings.alt;
          if (altPath) {
            currentUrl = new URL(altPath, url).href;
            await open(page, currentUrl);
          }
          const base = altPath ? settings : {};
          const css = [base.css, settings.alt.css].filter(Boolean).join('\n');
          await prepare(page, { ...base, click, css }, waitFor);
          if (!fullOnly) {
            if (selector) await scrollTo(page, selector);
            await capture(page, dir, filename, width, height);
          }
        }
        filename = `${name}-full${suffix}.webp`;
        if (!fullOnly && slug !== 'mbarete') {
          currentUrl = url;
          await open(page, url);
          await prepare(page, settings, settings.waitFor);
        }
        if (name === 'mobile' && settings.stickyBottom) {
          await captureSticky(page, dir, suffix, width, settings.stickyBottom);
        }
        if (slug === 'mbarete') {
          // La demo es una app con scroll interno. Se libera el panel en el
          // documento de captura para fotografiar su contenido real hasta el pie.
          await page.locator('.page-body.db').evaluate((panel) => {
            panel.style.flex = '0 0 auto';
            for (let element = panel; element; element = element.parentElement) {
              element.style.setProperty('height', 'auto', 'important');
              element.style.setProperty('max-height', 'none', 'important');
              element.style.setProperty('overflow', 'visible', 'important');
            }
          });
        }
        if (slug === 'mercado-jopoi' && settings.alt?.waitFor) {
          await page.locator(settings.alt.waitFor).first().waitFor({ state: 'visible' });
        }
        await captureFull(page, dir, filename, width, name === 'mobile' ? 6000 : 5000);
      } catch (error) {
        failures.push(`${slug}/${filename}`);
        console.error(`✗ ${slug}/${filename} (${currentUrl}): ${error.message.trim()}`);
      } finally {
        await context.close();
      }
    }
  }
}

try {
  // Acota los navegadores concurrentes y deja terminar los demás sitios ante un error.
  for (let index = 0; index < projects.length; index += 3) {
    await Promise.all(projects.slice(index, index + 3).map(runProject));
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Capturas fallidas: ${failures.join(', ')}`);
  process.exitCode = 1;
}
