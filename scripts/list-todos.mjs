// list-todos.mjs — lista los `TODO:` pendientes de config y proyectos (SPEC §3).
// Corre antes de cada build (`prebuild`) y no falla: el sitio oculta todo lo que sea TODO.
// Uso: npm run todos

import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.relative(ROOT, p);

const files = [
  path.join(ROOT, 'src/config/site.ts'),
  path.join(ROOT, 'src/config/services.ts'),
  ...readdirSync(path.join(ROOT, 'src/content/projects'))
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => path.join(ROOT, 'src/content/projects', f)),
];

const found = [];
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  // En los .ts solo cuentan los valores pendientes (`campo: "TODO:…"`), no el código que los detecta.
  const isPending = file.endsWith('.md') ? (l) => /TODO:?/.test(l) : (l) => /^\s*\w+:\s*["'`]TODO:/.test(l);
  text.split('\n').forEach((line, i) => {
    if (isPending(line)) found.push({ file: rel(file), line: i + 1, text: line.trim() });
  });
}

if (found.length === 0) {
  console.log('✓ Sin TODOs pendientes');
} else {
  console.warn(`\n⚠ ${found.length} TODO(s) pendientes (el sitio los oculta; completalos cuando tengas el dato):`);
  let current = '';
  for (const f of found) {
    if (f.file !== current) {
      current = f.file;
      console.warn(`  ${current}`);
    }
    console.warn(`    L${f.line}: ${f.text.length > 110 ? f.text.slice(0, 107) + '…' : f.text}`);
  }
  console.warn('');
}
