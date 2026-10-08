// check-layout.mjs — verificación visual con Playwright (per SPEC §11)
// Uso: npm run build && npm run check:layout
// Levanta astro preview en el puerto 4322, recorre los 6 viewports del SPEC,
// falla si: overflow horizontal, errores de consola, requests 404/fallidas.
// Guarda screenshots full-page en .checks/<viewport>.png
// Keyboard-specific checks se agregan en Fase 1.

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
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

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );

  return { overflow, errors, failed };
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

  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH
    ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium`
    : undefined });

  let totalFails = 0;

  try {
    for (const viewport of VIEWPORTS) {
      for (const pagePath of PAGES) {
        const url = `${BASE_URL}${pagePath}`;
        const ctx = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const pw = await ctx.newPage();

        const { overflow, errors, failed } = await checkPage(pw, url, viewport);

        const screenshotPath = path.join(CHECKS_DIR, `${viewport.name}.png`);
        await pw.screenshot({ path: screenshotPath, fullPage: true });

        const issues = [];
        if (overflow) issues.push('overflow-x detected');
        errors.forEach(e => issues.push(`console.error: ${e}`));
        failed.forEach(f => issues.push(`request failed: ${f}`));

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
