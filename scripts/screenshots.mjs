// screenshots.mjs — capturas de las demos de los proyectos (SPEC §8.4)
// Uso: npm run shots              → todos los proyectos con demoUrl
//      npm run shots -- mbarete   → solo esos slugs
//
// Para cada proyecto con `demoUrl` captura 1440×900 y 390×844 (deviceScaleFactor 2), convierte a WebP
// con sharp y guarda src/assets/projects/<slug>/desktop.webp y mobile.webp. El sitio las usa solas
// (un `cover`/`coverMobile` en el frontmatter del .md tiene prioridad sobre estas capturas).
// Necesita salida a internet hacia las demos; corré esto en tu máquina (npx playwright install chromium).

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

const projects = readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const slug = f.replace(/\.md$/, '');
    const match = readFileSync(path.join(PROJECTS_DIR, f), 'utf8').match(/^demoUrl:\s*["']?([^"'\s]+)["']?\s*$/m);
    return { slug, demoUrl: match?.[1] };
  })
  .filter((p) => p.demoUrl && (only.length === 0 || only.includes(p.slug)));

if (projects.length === 0) {
  console.log('No hay proyectos con demoUrl' + (only.length ? ` para: ${only.join(', ')}` : '') + '.');
  process.exit(0);
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium` : undefined,
});

const failures = [];

for (const { slug, demoUrl } of projects) {
  mkdirSync(path.join(ASSETS_DIR, slug), { recursive: true });
  for (const shot of SHOTS) {
    const label = `${slug} · ${shot.name}`;
    const ctx = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
      isMobile: shot.mobile,
      hasTouch: shot.mobile,
    });
    try {
      const page = await ctx.newPage();
      await page.goto(demoUrl, { waitUntil: 'networkidle', timeout: 45_000 });
      await sleep(1500); // animaciones de entrada, fuentes, imágenes lazy
      const png = await page.screenshot({ type: 'png' });
      const out = path.join(ASSETS_DIR, slug, `${shot.name}.webp`);
      await sharp(png).webp({ quality: 82 }).toFile(out);
      console.log(`✓ ${label} → ${path.relative(ROOT, out)}`);
    } catch (err) {
      failures.push(label);
      console.error(`✗ ${label} (${demoUrl}): ${String(err.message).split('\n')[0]}`);
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} captura(s) fallaron: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\n✓ Capturas listas. Corré `npm run build` para verlas en el sitio.');
