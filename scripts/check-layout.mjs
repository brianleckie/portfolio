// check-layout.mjs — verificación visual con Playwright (per SPEC §11)
// Uso: npm run build && npm run check:layout
// Levanta astro preview en el puerto 4322, recorre los 6 viewports del SPEC,
// falla si: overflow horizontal, errores de consola, requests 404/fallidas.
// Fase 1 extra: teclado ≤ contenedor, altura wrapper = 312×scale, Enter click,
// document.fonts.check Satoshi 900, reducedMotion sin animación.
// Guarda screenshots full-page en .checks/<viewport>.png
// Guarda hero-crop en .checks/hero-<viewport>.png para los dos viewports indicados.

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { setTimeout as sleep } from 'timers/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE_URL = process.env.CHECK_URL ?? 'http://localhost:4322';
const CHECKS_DIR = path.join(ROOT, '.checks');

const VIEWPORTS = [
  { name: '1440x810',  width: 1440, height: 810  },
  { name: '1440x1002', width: 1440, height: 1002 },
  { name: '1024x768',  width: 1024, height: 768  },
  { name: '768x1024',  width: 768,  height: 1024 },
  { name: '390x844',   width: 390,  height: 844  },
  { name: '360x740',   width: 360,  height: 740  },
];

const HERO_CROP_VIEWPORTS = ['1440x810', '390x844'];

const PAGES = ['/'];

async function waitForServer(url, retries = 20, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (res.status < 500) return true;
    } catch { /* not ready yet */ }
    await sleep(delayMs);
  }
  throw new Error(`Server not reachable at ${url} after ${retries} retries`);
}

async function checkPage(page, url, viewport) {
  const errors = [];
  const failed = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('requestfailed', req => {
    failed.push(`${req.failure()?.errorText} — ${req.url()}`);
  });
  page.on('response', res => {
    if (res.status() === 404) failed.push(`404 — ${res.url()}`);
  });

  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait a bit for JS to settle (ResizeObserver, font loading)
  await sleep(300);

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );

  // --- Fase 1 keyboard checks ---
  const kbChecks = await page.evaluate(() => {
    const wrapper = document.getElementById('kb-wrapper');
    const stage = document.getElementById('kb-stage');
    if (!wrapper || !stage) return { skip: true };

    const wrapperRect = wrapper.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    // 1. Keyboard stage visual width ≤ wrapper width
    const kbFitsContainer = stageRect.width <= wrapperRect.width + 1; // +1 for rounding

    // 2. Wrapper height ≈ 312 * scale (+ slack)
    // Derive scale from stage rendered width / 900
    const scale = stageRect.width / 900;
    const expectedH = 312 * scale;
    const actualH = wrapperRect.height;
    const heightOk = actualH >= expectedH - 1 && actualH <= expectedH + 25; // ±25px slack

    // 3. Enter key clickable via elementFromPoint (scroll into view first)
    const enterEl = document.getElementById('key-Enter');
    let enterClickable = false;
    if (enterEl) {
      enterEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      const r = enterEl.getBoundingClientRect();
      // Hit center of Enter (accounting for S key overlap on left, use right portion)
      const testX = r.left + r.width * 0.65;
      const testY = r.top + r.height * 0.5;
      const hit = document.elementFromPoint(testX, testY);
      enterClickable = hit === enterEl || (hit !== null && enterEl.contains(hit));
    }

    // 4. Satoshi 900 loaded
    const satoshiLoaded = document.fonts.check('900 72px Satoshi');

    return { kbFitsContainer, heightOk, enterClickable, satoshiLoaded, scale, actualH, expectedH };
  });

  // --- Fase 1 reduced-motion check ---
  const rmChecks = await page.evaluate(() => {
    // Check that no animated transform is running on .key-face elements
    // (reduced motion means CSS transitions are 0.01ms via global rule)
    const face = document.querySelector('.key-face');
    if (!face) return { skip: true };
    const style = window.getComputedStyle(face);
    const duration = parseFloat(style.transitionDuration);
    const noAnim = duration < 0.05; // < 50ms means effectively disabled
    return { noAnim };
  }, { reducedMotion: 'reduce' }); // note: this arg is ignored by evaluate; see below

  return { overflow, errors, failed, kbChecks, rmChecks };
}

async function checkReducedMotion(browser, url, viewport) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await sleep(300);

  const result = await page.evaluate(() => {
    const face = document.querySelector('.key-face');
    if (!face) return { skip: true };
    const style = window.getComputedStyle(face);
    const duration = parseFloat(style.transitionDuration);
    // Also check no is-pressed classes are being added (animation stopped)
    const pressedKeys = document.querySelectorAll('.is-pressed').length;
    return { transitionDuration: duration, pressedKeys, noAnim: duration < 0.05 && pressedKeys === 0 };
  });

  await ctx.close();
  return result;
}

async function main() {
  mkdirSync(CHECKS_DIR, { recursive: true });

  let previewProc = null;
  const ownServer = !process.env.CHECK_URL;

  if (ownServer) {
    console.log('▶ Starting astro preview on port 4322…');
    previewProc = spawn('node', ['node_modules/.bin/astro', 'preview', '--port', '4322', '--host'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    previewProc.stdout.on('data', d => process.stdout.write(d));
    previewProc.stderr.on('data', d => process.stderr.write(d));
    await waitForServer(BASE_URL);
    console.log('✓ Preview server ready\n');
  }

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH
      ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium`
      : undefined,
  });

  let totalFails = 0;

  try {
    for (const viewport of VIEWPORTS) {
      for (const pagePath of PAGES) {
        const url = `${BASE_URL}${pagePath}`;
        const ctx = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const pw = await ctx.newPage();

        const { overflow, errors, failed, kbChecks } = await checkPage(pw, url, viewport);

        const screenshotPath = path.join(CHECKS_DIR, `${viewport.name}.png`);
        await pw.screenshot({ path: screenshotPath, fullPage: true });

        // Hero crop screenshot
        if (HERO_CROP_VIEWPORTS.includes(viewport.name)) {
          const heroEl = await pw.$('#hero');
          if (heroEl) {
            const heroCropPath = path.join(CHECKS_DIR, `hero-${viewport.name}.png`);
            await heroEl.screenshot({ path: heroCropPath });
            console.log(`  📸 Hero crop → .checks/hero-${viewport.name}.png`);
          }
        }

        const issues = [];
        if (overflow) issues.push('overflow-x detected');
        errors.forEach(e => issues.push(`console.error: ${e}`));
        failed.forEach(f => issues.push(`request failed: ${f}`));

        // Keyboard checks
        if (kbChecks && !kbChecks.skip) {
          if (!kbChecks.kbFitsContainer) issues.push(`keyboard wider than container`);
          if (!kbChecks.heightOk) issues.push(`wrapper height ${kbChecks.actualH?.toFixed(1)}px ≠ 312×${kbChecks.scale?.toFixed(3)}=${kbChecks.expectedH?.toFixed(1)}px`);
          if (!kbChecks.enterClickable) issues.push(`Enter key not clickable at expected coordinates`);
          if (!kbChecks.satoshiLoaded) issues.push(`Satoshi 900 not loaded (document.fonts.check failed)`);
        }

        if (issues.length === 0) {
          console.log(`✓ ${viewport.name} — ${pagePath}`);
        } else {
          console.log(`✗ ${viewport.name} — ${pagePath}`);
          issues.forEach(i => console.log(`   • ${i}`));
          totalFails += issues.length;
        }

        await ctx.close();
      }
    }

    // Reduced-motion check (once, on first viewport)
    console.log('\n▶ Reduced-motion check (390×844)…');
    const rmViewport = VIEWPORTS.find(v => v.name === '390x844');
    if (rmViewport) {
      const rmResult = await checkReducedMotion(browser, `${BASE_URL}/`, rmViewport);
      if (rmResult.skip) {
        console.log('  ⚠ Keyboard not found — skip reduced-motion check');
      } else if (rmResult.noAnim) {
        console.log('  ✓ reduced-motion: no animation (transitionDuration < 50ms, no pressed keys)');
      } else {
        console.log(`  ✗ reduced-motion: animation still running (transitionDuration=${rmResult.transitionDuration}s, pressedKeys=${rmResult.pressedKeys})`);
        totalFails++;
      }
    }

  } finally {
    await browser.close();
    if (previewProc) {
      previewProc.kill();
      console.log('\n▶ Preview server stopped');
    }
  }

  console.log(`\nScreenshots saved to .checks/`);

  if (totalFails > 0) {
    console.error(`\n✗ ${totalFails} issue(s) found`);
    process.exit(1);
  } else {
    console.log('\n✓ All checks passed');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
