// screenshots.mjs — capturas de los sitios de los proyectos (SPEC §8.4)
// Uso: npm run shots              → todos los proyectos con demoUrl o links
//      npm run shots -- mbarete   → solo esos slugs
//
// Para cada sitio (demoUrl y cada `links[].url` del .md) captura 1440×900 y 390×844 (deviceScaleFactor 2),
// convierte a WebP con sharp y guarda en src/assets/projects/<slug>/:
//   - un solo sitio por proyecto   → desktop.webp y mobile.webp
//   - varios sitios por proyecto   → desktop-<clave>.webp y mobile-<clave>.webp, con <clave> = primera palabra
//     del label sin tildes y en minúsculas (ej. "Rocío Florería" → rocio). El .md elige cuál va en cada marco
//     con `preview: { desktop: ornella, mobile: rocio }`.
// El sitio las usa solo (un `cover`/`coverMobile` en el frontmatter tiene prioridad sobre estas capturas).
// Necesita salida a internet hacia los sitios; corré esto en tu máquina (npx playwright install chromium).

import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, readFileSync, readdirSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = path.join(ROOT, 'src/content/projects');
const ASSETS_DIR = path.join(ROOT, 'src/assets/projects');

const SHOTS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, mobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, mobile: true },
];

const only = process.argv.slice(2);

const keyOf = (label) =>
  label.split(/\s+/)[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Frontmatter → [{ url, label? }] con demoUrl y links (parseo simple de líneas, sin dependencias). */
function targetsOf(frontmatter) {
  const targets = [];
  const demo = frontmatter.match(/^demoUrl:\s*["']?([^"'\s]+)["']?\s*$/m);
  if (demo) targets.push({ url: demo[1] });
  const block = frontmatter.match(/^links:\s*\n((?:[ \t]+.*\n?)+)/m);
  if (block) {
    for (const item of block[1].split(/^\s*-\s+/m).slice(1)) {
      const label = item.match(/label:\s*["']?(.+?)["']?\s*$/m)?.[1];
      const url = item.match(/url:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];
      if (label && url) targets.push({ url, label });
    }
  }
  return targets;
}

const projects = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const frontmatter = readFileSync(path.join(PROJECTS_DIR, f), 'utf8').split(/^---\s*$/m)[1] ?? '';
    const targets = targetsOf(frontmatter);
    return {
      slug,
      targets: targets.map((t) => ({
        ...t,
        suffix: targets.length > 1 && t.label ? `-${keyOf(t.label)}` : '',
      })),
    };
  })
  .filter((p) => p.targets.length > 0 && (only.length === 0 || only.includes(p.slug)));

if (projects.length === 0) {
  console.log('No hay proyectos con demoUrl o links' + (only.length ? ` para: ${only.join(', ')}` : '') + '.');
  process.exit(0);
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium` : undefined,
});

const failures = [];

for (const { slug, targets } of projects) {
  mkdirSync(path.join(ASSETS_DIR, slug), { recursive: true });
  for (const { url, suffix } of targets) {
    for (const shot of SHOTS) {
      const label = `${slug} · ${shot.name}${suffix}`;
      const ctx = await browser.newContext({
        viewport: shot.viewport,
        deviceScaleFactor: 2,
        isMobile: shot.mobile,
        hasTouch: shot.mobile,
      });
      try {
        const page = await ctx.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
        await sleep(1500); // animaciones de entrada, fuentes, imágenes lazy
        const png = await page.screenshot({ type: 'png' });
        const out = path.join(ASSETS_DIR, slug, `${shot.name}${suffix}.webp`);
        await sharp(png).webp({ quality: 82 }).toFile(out);
        console.log(`✓ ${label} → ${path.relative(ROOT, out)}`);
      } catch (err) {
        failures.push(label);
        console.error(`✗ ${label} (${url}): ${String(err.message).split('\n')[0]}`);
      } finally {
        await ctx.close();
      }
    }
  }
}

await browser.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} captura(s) fallaron: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\n✓ Capturas listas. Corré `npm run build` para verlas en el sitio.');
