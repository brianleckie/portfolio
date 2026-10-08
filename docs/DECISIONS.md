# Decisiones del proyecto

## Fase 0 — Scaffolding

- **Astro 5 + TypeScript strict en lugar de Vite + React** — per SPEC §2. Salida estática (SSG) para SEO y previews de links reales.
- **CSS custom properties, sin Tailwind** — per SPEC §2. Un archivo de tokens + CSS por componente.
- **Reutilizar `/public/images/`** — las capturas existentes (estacion, mbarete, kevjer) se mantienen en su lugar y serán referenciadas por los `.md` desde Fase 2.
- **`clientNamePublic: false` por defecto** en todos los proyectos — los nombres de clientes no se muestran hasta que se confirme permiso explícito.
- **Ecodespensa = Bistrosoft→Tiendanube** — son el mismo proyecto. Se crea un solo archivo `ecodespensa.md`; no se crea `bistrosoft-tiendanube.md`.
- **Ecodespensa: campos descriptivos con `TODO:`** — sin inventar nada. Status `en-desarrollo` como valor más preciso disponible.
- **`site.ts`: campo `employer` agregado** (no estaba en el SPEC) para reflejar el rol actual en Klien IT Systems (remoto, Países Bajos). Anotado aquí.
- **Rol en el portfolio:** desarrollador frontend/fullstack en Klien IT Systems (remoto, Países Bajos) + proyectos freelance propios.
- **Valuador automático de inmuebles: incluido como featured** con `order: 2`. Sin campo `results` — ninguna métrica inventada.
- **Préstamos/cobros: excluido** — junto a Felinas y Oro Bruto. No se crea el archivo.
- **6 proyectos destacados**, en este orden: floreria-catalogo (1), valuador-inmuebles (2), lhoney (3), estacion-de-carretera (4), mbarete (5), ecodespensa (6). Kevjer: `featured: false`.
- **REGLA PERMANENTE: Nunca inventar métricas ni resultados en ningún proyecto.** Sin dato real → campo vacío → sección oculta. Aplica a R², MAE, % de precisión, cantidades de usuarios, ingresos, etc.
- **Stack `["TODO:"]`** para proyectos donde no tenemos el dato — el componente lo ocultará en Fase 2.
- **`check-layout.mjs`:** implementación funcional completada pre-Fase 1. Keyboard-specific checks se agregan en Fase 1.

## Pre-Fase 1 — Correcciones de scaffolding

- **Content Layer API:** migrado a `src/content.config.ts` con glob loader (Astro 5). `entry.id` incluye extensión `.md`; se strip en getStaticPaths. `render()` importado de `astro:content`.
- **`src/layouts/BaseLayout.astro`:** punto único de `<head>` boilerplate, CSS imports y font loading. Elimina duplicación entre index y [slug].
- **Imágenes estacion/mbarete/kevjer:** copiadas a `src/assets/projects/<slug>/` con campos `cover`/`coverMobile` en schema usando helper `image()`. Los originales en `public/images/` se mantienen para fases posteriores.
- **Inter + Instrument Serif:** self-hosted via `@fontsource-variable/inter` y `@fontsource/instrument-serif`.
- **Satoshi:** Self-hosted en `public/fonts/` — `Satoshi-Bold.woff2` (700) y `Satoshi-Black.woff2` (900), extraídos del zip ITF FFL. Licencia en `public/fonts/Satoshi-LICENSE.txt`. `@font-face` declarado en `base.css`; preload de Black en `BaseLayout.astro`. Sin dependencias externas de fuentes.

## Fase 1 — Hero, Header, Keyboard, Marquee

- **Header mobile (<700px):** wordmark + "Hablemos ↗" en la fila principal; los otros tres links en fila scrolleable debajo (sin menú hamburguesa). Más limpio que un modal, sin JS extra.
- **Keyboard: `transform: scale()`** sobre un stage de 900×312 fijo, calculado con `ResizeObserver` sobre el wrapper. Wrapper height = `312 × scale + 20px` (slack para sombra y foco).
- **Keyboard: `pointer-events: none` en `.key-face`** para que `elementFromPoint` retorne el `<a>` y no el span decorativo.
- **Keyboard Enter: `scrollIntoView` antes del check** — el teclado puede quedar bajo el fold en viewports cortos; el script de check hace scroll antes de usar `elementFromPoint`.
- **Captions ocultos cuando scale < 0.6** — a ~4px serían ilegibles; el nombre accesible se mantiene en `aria-label`.
- **Marquee: dos grupos en `display:flex; width:max-content`**, animados con `requestAnimationFrame` a 50px/s. Duración calculada por el ancho real del primer grupo.
- **Secciones #proyectos, #servicios, #proceso, #sobre-mi, #contacto:** shells vacíos con IDs y texto placeholder para Fases 2–3. Los IDs son necesarios para que las teclas del teclado y el header ya sean funcionales.

## Correcciones post-Fase 1 (audit del usuario)

- **Fold en 1440×810:** `hero-inner padding-bottom` reducido a 16px y `keyboard-section padding-top` a 8px (ahorro total 72px). Teclado comienza en ~255px del viewport; fila 1 (161px) completamente visible sin scroll. Chequeado con nuevo test en `check-layout.mjs`.
- **Keyboard `inViewport` boolean:** `paused = true` al inicio; IO setea `inViewport` y llama `resume()`. `resume()` verifica las 5 condiciones: `paused && inViewport && !pointerActive && !focusedKey && !document.hidden && !prefersReduced.matches`. Elimina la ventana de 1-tick donde animation re-arrancaba antes de que el IO la pausara de nuevo.
- **Marquee IntersectionObserver:** `cancelAnimationFrame` cuando `.marquee-strip` sale del viewport; rAF se reinicia al volver. Unifica con el `visibilitychange` handler en `startRaf()`/`stopRaf()`.
- **check:layout fold check:** nuevo check exclusivo de 1440×810 que mide `getBoundingClientRect()` del `#kb-stage` sin scroll y verifica `stageTop + 161 ≤ 810`.
