// check-layout.mjs — Fase 0 skeleton
// Ejecutar contra `astro preview` con: node scripts/check-layout.mjs
// Se completa en Fase 4.

import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: '1440x810',  width: 1440, height: 810  },
  { name: '1440x1002', width: 1440, height: 1002 },
  { name: '1024x768',  width: 1024, height: 768  },
  { name: '768x1024',  width: 768,  height: 1024 },
  { name: '390x844',   width: 390,  height: 844  },
  { name: '360x740',   width: 360,  height: 740  },
];

const BASE_URL = process.env.CHECK_URL ?? 'http://localhost:4321';

// TODO (Fase 4): implementar checks completos per SPEC §11:
//   - scrollWidth <= innerWidth (sin overflow horizontal)
//   - teclado dentro de su contenedor
//   - 0 errores de consola, 0 requests 404
//   - teclas con href y nombre accesible
//   - Enter clickeable en sus coordenadas reales
//   - screenshots full-page en .checks/<viewport>.png
//   - prefers-reduced-motion: marquee estático, teclado sin animación

console.log('check-layout: TODO — se completa en Fase 4');
console.log(`Base URL: ${BASE_URL}`);
console.log('Viewports a verificar:', VIEWPORTS.map(v => v.name).join(', '));
