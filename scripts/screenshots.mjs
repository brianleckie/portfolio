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

const selected = new Set(process.argv.slice(2));
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
      let filename = `${name}${suffix}.webp`;
      let currentUrl = url;
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(12_000);
        await open(page, url);
        await prepare(page, settings, settings.waitFor);
        await capture(page, dir, filename, width, height);
        if (settings.alt) {
          filename = `${name}-alt${suffix}.webp`;
          const { path: altPath, click, scrollTo: selector, waitFor } = settings.alt;
          if (altPath) {
            currentUrl = new URL(altPath, url).href;
            await open(page, currentUrl);
          }
          const base = altPath ? settings : {};
          const css = [base.css, settings.alt.css].filter(Boolean).join('\n');
          await prepare(page, { ...base, click, css }, waitFor);
          if (selector) await scrollTo(page, selector);
          await capture(page, dir, filename, width, height);
        }
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
