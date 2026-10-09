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
- **Keyboard: `transform: scale()`** sobre un stage de 900×312 fijo, calculado con `ResizeObserver` sobre el wrapper. Wrapper height = `312 × scale + 20px` (slack para sombra y foco). _(Reemplazado por el teclado en arco: ver la última sección.)_
- **Keyboard: `pointer-events: none` en `.key-face`** para que `elementFromPoint` retorne el `<a>` y no el span decorativo.
- **Keyboard Enter: `scrollIntoView` antes del check** — el teclado puede quedar bajo el fold en viewports cortos; el script de check hace scroll antes de usar `elementFromPoint`.
- **Captions ocultos cuando scale < 0.6** — a ~4px serían ilegibles; el nombre accesible se mantiene en `aria-label`.
- **Marquee: dos grupos en `display:flex; width:max-content`**, animados con `requestAnimationFrame` a 50px/s. Duración calculada por el ancho real del primer grupo.
- **Secciones #proyectos, #servicios, #proceso, #sobre-mi, #contacto:** shells vacíos con IDs y texto placeholder para Fases 2–3. Los IDs son necesarios para que las teclas del teclado y el header ya sean funcionales.

## Correcciones post-Fase 1 (audit del usuario)

- **Fold en 1440×810:** `hero-inner padding-bottom` reducido a 16px y `keyboard-section padding-top` a 8px (ahorro total 72px). Teclado comienza en ~255px del viewport; fila 1 (161px) completamente visible sin scroll. Chequeado con nuevo test en `check-layout.mjs`. _(Reemplazado: ver "Teclado en arco".)_
- **Keyboard `inViewport` boolean:** `paused = true` al inicio; IO setea `inViewport` y llama `resume()`. `resume()` verifica las 5 condiciones: `paused && inViewport && !pointerActive && !focusedKey && !document.hidden && !prefersReduced.matches`. Elimina la ventana de 1-tick donde animation re-arrancaba antes de que el IO la pausara de nuevo.
- **Marquee IntersectionObserver:** `cancelAnimationFrame` cuando `.marquee-strip` sale del viewport; rAF se reinicia al volver. Unifica con el `visibilitychange` handler en `startRaf()`/`stopRaf()`.
- **check:layout fold check:** nuevo check exclusivo de 1440×810 que mide `getBoundingClientRect()` del `#kb-stage` sin scroll y verifica `stageTop + 161 ≤ 810`.

## Cierre de Fase 1 y correcciones de contenido

- **Rama/PR:** el PR #11 ya estaba mergeado; se trabaja en `claude/peaceful-goodall-l3ktv0` y se abre un PR nuevo a `main` (sin mergear). El commit `9ab0d70` (fold + race del IO) estaba solo en la rama vieja: se cherry-pickeó.
- **Correcciones de contenido del usuario:** Ecodespensa `en-produccion`; Mbarete: resultado = "Usado por gimnasios en Buenos Aires y en distintas partes de Paraguay."; Estación: "intendente" en lugar de "Presidente"; Valuador reescrito (AVM Gran Asunción) sin métricas ni portales.
- **Datos de los `.md` no respaldados por el original (`34b14eb:src/data/projects.js`):** no se borraron; se listan en el reporte final para que el usuario confirme (Mbarete: avisos de cuotas vencidas, estados de socio, multi-tenant; Kevjer: gestión de inventario, galería; Estación: FastAPI, roles; Jopoi: PostgreSQL). Se quitó solo el rango "50–200 socios" (regla de no inventar métricas).
- **Marquee:** cada grupo repite la frase hasta ser ≥ ancho del viewport (SPEC §7); sin `role="marquee"` ni `aria-label` (el texto se expone una sola vez).
- **Sin `!important`:** Header sube especificidad; el reset global de reduced-motion de `base.css` se reemplazó por guards por componente (`scroll-behavior: smooth` solo con `no-preference`).
- **Anclas del header:** `/#seccion` (sirven desde páginas de proyecto) y `scroll-margin-top` con `--header-h` (64px; 113px en mobile, header de dos filas).
- **Teclado:** S va por encima del Enter (`z-index`), como pide el SPEC; antes el Enter tapaba la mitad derecha de S y un click ahí abría WhatsApp. El orden del DOM (tabulación) no cambia. _(Ya no aplica: el Enter nuevo no se superpone con ninguna tecla.)_
- **Botones/badges/chips compartidos** en `src/styles/ui.css`; el CSS de cada componente queda scoped.

## Fase 2 — Proyectos

- **Filtro global:** los filtros (chips y teclas) aplican a destacados y a "Más proyectos". Con filtro solo-grid, "Integraciones" quedaba vacío (Ecodespensa es destacado) y el check pedido exige que solo se vean cards de la categoría.
- **Sin JS** se ven todos los proyectos (la barra de filtros está `hidden` hasta que corre el script). `?cat=` inválido cae en "Todos"; el filtro se refleja con `history.replaceState`.
- **`kb:filter`:** el teclado y los links de Servicios solo emiten el evento (`src/scripts/filter-links.ts`); `ProjectGrid` aplica el filtro y hace el scroll.
- **Plugin remark `remark-strip-todo`:** borra del cuerpo los párrafos `TODO:` y los headings que quedan vacíos; así no se editan los `.md` y el visitante nunca ve "TODO". `clean()/cleanList()` hacen lo mismo con el frontmatter.
- **Resumen en TODO (Ecodespensa):** la card usa el primer highlight (dato real); la meta description usa una frase genérica con título, rol y ubicación.
- **Imágenes:** `cover`/`coverMobile` del frontmatter ganan; si no hay, se usan `desktop.webp`/`mobile.webp` de `npm run shots` (`import.meta.glob`). `<Picture>` con avif + webp (fallback webp). Sin imagen: placeholder CSS con forma de tecla, el `accent` y las iniciales.
- **Mobile primero en cards:** <700px, si hay captura mobile se muestra solo el teléfono; con ambas capturas en desktop el teléfono se superpone al navegador.
- **Página de caso:** prev/next circular entre los 6 destacados; los no destacados muestran "Todos los proyectos". La franja de `results` (hoy solo Mbarete) se muestra resaltada en card y en el caso.
- **`trailingSlash: 'always'`** para URLs canónicas consistentes (el sitemap y los canonical usan la barra final).
- **check:layout:** home en 6 viewports + las 15 páginas de caso en 390×844 y 1440×810, animación del teclado (50 ms × 6 s), marquee (translateX × 4 s), reduced-motion, filtros (teclas y chips), links y contenido (sin TODO, sin datos retirados, valuador sin métricas ni portales).

## Fase 3 — Servicios, proceso, sobre mí, contacto, CTA sticky, footer

- **Primitivas de sección compartidas** (`.section`, `.section-inner`, `.section-title`, `.section-lead`, `.sr-only`) en `src/styles/ui.css`; ProjectGrid también las usa.
- **Servicios:** contenido en `src/config/services.ts`; `showPrices: false` en `site.ts` y `fromPrice` opcional por servicio (solo se muestra si `showPrices` es true y hay valor). "Ver ejemplos" apunta a `/?cat=…#proyectos` con `data-filter`: sin JS navega con el parámetro, con JS aplica el filtro sin recargar.
- **Proceso:** el paso 2 ("Te muestro una demo") va en el color de acento, elevado y con la etiqueta "Mi diferencial"; en mobile no se eleva.
- **Sobre mí:** texto armado solo con hechos del SPEC y de DECISIONS (4º año, full-stack, IT empresarial, Encarnación, negocios de todo Paraguay, Klien IT Systems remoto). "Países Bajos" no se muestra. **Klien IT Systems aparece solo ahí** (lo verifica el check). El texto queda marcado para revisión del usuario.
- **Tecla K (STACK)** apunta a `#stack` (el bloque de stack dentro de Sobre mí), como pide el SPEC.
- **Contacto:** el botón de WhatsApp usa el lila de los links (`#a9b4ff`) con texto oscuro: el índigo del acento contra `#151a33` no llega a 3:1 como componente de UI.
- **CTA sticky:** `data-after`/`data-until` parametrizan la barra (home: tras `#hero` hasta `#contacto`; casos: tras `#caso-hero` hasta `#caso-cta`). Se oculta también cuando la sección final quedó atrás (no reaparece sobre el footer). Una vez que aparece, `body` conserva el padding inferior (evita saltos de scroll al ocultarse) y `html` tiene `scroll-padding-bottom` para que el foco no quede tapado. `viewport-fit=cover` + `env(safe-area-inset-bottom)`.
- **Footer** compartido por home y casos; GitHub/LinkedIn solo si están cargados.

## Fase 4 — Pulido y entrega

- **URL única:** `site.url` en `src/config/site.ts` (provisorio `https://portfolio-alpha-henna-61.vercel.app`); `astro.config.mjs` la importa, así que cambiar de dominio es una línea. `robots.txt` es un endpoint (no un archivo estático) para no duplicar la URL. `trailingSlash: 'always'` + `vercel.json` `trailingSlash: true` para que canonical, sitemap y rutas coincidan.
- **OG:** `satori` + `@resvg/resvg-js` en un endpoint de Astro (`/og/[slug].png`), no Playwright: corre en el build de Vercel sin navegador. Fuentes leídas con `fs` desde `process.cwd()` (las rutas relativas a `import.meta.url` se rompen en el bundle de endpoints). Satoshi Black en `src/assets/fonts/` (fuera de `public/`, no se sirve); Inter e Instrument Serif en `woff` desde `@fontsource`. Colores planos: PNG de 40–116 KB (WhatsApp ignora previews pesados). Satoshi no tiene el glifo ↵: desde el teclado en arco el ↵ se dibuja como SVG (web y OG).
- **Geometría y colores del teclado:** fuente única en `src/styles/tokens.css`; `src/config/keyboard.ts` los lee con `?raw` (`kbToken()`) para la imagen OG de la home.
- **SEO:** title/description/canonical/og/twitter por página con URL absoluta desde `Astro.site`; `@astrojs/sitemap`; JSON-LD `Person` solo en la home y **sin empleador** (Klien IT Systems solo aparece en "Sobre mí"); favicon SVG propio.
- **CSS inline** (`build.inlineStylesheets: 'always'`): elimina los dos CSS que bloqueaban el render (FCP 1.7 s → 1.5 s en Lighthouse mobile).
- **Accesibilidad:** el wordmark tiene `aria-label` que contiene el texto visible ("leki. — Brian Leckie, ir al inicio", criterio de etiqueta en el nombre).
- **Lighthouse mobile** (v12.8.2, throttling simulado, `astro preview` local): home 99 / 100 / 100 / 100 y caso (Mbarete) 100 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO).
- **`npm run shots`:** lee `demoUrl` de los `.md`; las capturas se usan solas (`cover`/`coverMobile` del frontmatter tienen prioridad). En el entorno cloud las demos están bloqueadas por la política de red (CONNECT 403): queda funcionando para correrlo en local.
- **`prebuild` lista los `TODO:`** pendientes (`scripts/list-todos.mjs`); no falla el build.

## Previews, links y capturas (PR #12, tras la revisión del usuario)

- **Escena de preview 16/10 en todos los anchos** (`ProjectMedia`): navegador + teléfono, medidas en `cqi` (porcentaje del ancho de la media), así se ve igual a 360 y a 1440px. En mobile el navegador va a la izquierda y el teléfono asoma recortado por abajo. `#featured-block` a 390×844: ≈3.770px → 3.324px. Se descartó el carrusel horizontal (esconde proyectos y choca con el filtro `?cat=` y la accesibilidad).
- **Ventanas de proporción fija** con `object-fit: cover; object-position: 50% 0`: navegador 11/5 (2,2:1); el teléfono toma la proporción de su propia captura acotada a [0,46–0,58] (las capturas nuevas miden 738×1326, no 738×1600), así no se recortan costados.
- **`links` en el schema**: botones "Ver <label> ↗" (nunca la URL cruda). Florería (Rocío y Ornella) y Lhoney. Los botones publican los nombres de las florerías (pedido expreso del usuario).
- **`preview: { desktop, mobile }`** elige `desktop-<clave>.webp` / `mobile-<clave>.webp` cuando un proyecto tiene varios sitios; si el archivo no existe no rompe el build (ese marco no se muestra). Florería: Ornella en el navegador (captura desktop pendiente) y Rocío en el teléfono.
- **`npm run shots`** captura también los `links`. Contra rociofloreria.vercel.app, ornella-floreria.vercel.app y lhoney.store el entorno cloud responde `ERR_TUNNEL_CONNECTION_FAILED` (egress bloqueado): se usan las capturas mobile que subió el usuario. Faltan `floreria-catalogo/desktop-ornella.webp` y `lhoney/desktop.webp`.
- **Lhoney** pasa a `en-produccion` (pedido del usuario).
- **Estación sin mención a la inauguración** hasta que el cliente confirme "Pdte. Santiago Peña" vs "intendente": se quitó la frase del summary, el highlight y la sección "Resultado". En la captura móvil, la 2ª línea de la tarjeta del hero ("Inaugurada Nov. 2024 · …") está pintada con el color de la propia tarjeta (un recorte puro dejaba una imagen sin proporción de teléfono); se guarda como `mobile.webp`, se eliminó `coverMobile.jpeg` y la copia pública `public/images/estacion-mobile.jpeg`. Reversible con git. `check:layout` prohíbe `inaugur` en cualquier página.
- **Ecodespensa:** `ApiSource` lee la API de Bistrosoft y `ExcelSource` las exportaciones de Excel de Bistrosoft (confirmado por el usuario); el `.md` lo dice explícitamente.

## Diagramas "Cómo funciona" para proyectos sin interfaz (PR #12)

- **Desvío de SPEC §8.4 pedido por el usuario:** los proyectos sin interfaz (AVM Gran Asunción, Ecodespensa, IT para red de sucursales) muestran un diagrama en lugar del placeholder con iniciales. **La captura siempre gana** si existe.
- **Nunca parece una captura del producto:** píldora visible "Diagrama", sin imágenes, texto real en una lista ordenada (`<ol>`), números y flechas decorativos con `aria-hidden`.
- **Nada inventado:** el contenido sale del campo opcional `flow` del `.md`, validado por Zod (3–4 pasos, palabras cortas, sin `TODO` ni `%`). `check:layout` exige que cada número y cada palabra de 5+ letras del diagrama aparezca en el `.md` (sin contar el bloque `flow`).
- **Diseño responsive por contenedor:** fila de 3–4 nodos (≥560px), serpentina 2×2 solo con nombres en cards angostas (incluida mobile) y columna en la página del caso en mobile; misma caja 16/10 que las capturas para que la grilla quede pareja.
- **Movimiento:** un punto índigo recorre las flechas (solo `transform`/`opacity`, pausado fuera de pantalla). Con `prefers-reduced-motion` no existe animación (lo verifica el check).
- **Confirmado por el usuario:** `ApiSource` lee la API de Bistrosoft y `ExcelSource` las exportaciones de Excel de Bistrosoft; "15 sucursales" (IT) es dato confirmado.

## Teclado en arco, botón de WhatsApp mobile y línea de ubicación (PR nuevo, tras el merge del PR #12)

- **Reemplaza el centrado del hero** y el teclado 900×312: 9 teclas en arco (rotaciones leves, extremos más inclinadas) y un Enter ancho oscuro centrado debajo. Diseñado por un subagente Opus; maqueta aprobada en 1440×810 y 390×844 antes de implementar.
- **Geometría en CSS con una unidad `u` (lado de la tecla), sin JS de escala:** `--u` se resuelve con `cqi` y `svh` (`clamp(56px, min(100cqi / 5.88, (100svh − 330px) / 3.473), 140px)`). Se eliminan `ResizeObserver`, `transform: scale()` y el desfasaje del wrapper (el anterior se cortaba a 390px porque el padding entraba en la escala).
- **Arco por fórmula** (`x = i·pitch`, `y = y0 + fila·row + sag·i²`, `rot = i·tilt`) con SAT entre polígonos rotados verificado: separación mínima 0,12u en desktop y 0,098u en mobile. Los derivados `--kb-w`, `--kb-h`, `--kb-y0` son constantes precalculadas (la fórmula está comentada en `tokens.css`); `check:layout` detecta si se desincronizan.
- **Mobile < 560px:** mismo orden de filas (se sigue leyendo "LEKI WORKS") con arco más plano y apretado → teclas de 57,5px a 360 y 62,9px a 390 (mínimo exigido 56px). Se descartó una grilla 3/3/3 (teclas más grandes, pero rompe la lectura).
- **Tokens como única fuente:** paleta (cara / pared / letra), arco desktop y `--kb-reserve` viven en `tokens.css`; la imagen OG de la home los lee con `?raw` y falla el build si falta un token (la OG nunca se desincroniza). Override mobile del arco en `Keyboard.astro`.
- **↵ como SVG:** Satoshi no tiene el glifo y en Android la fuente del sistema varía; el mismo trazo se usa en la web y en la OG (data-URI).
- **Paleta nueva** ("flora y frutos del Paraguay"): cálida y saturada con dos teclas oscuras de letra crema; contraste letra/cara ≥ 4,5:1 en las 10 (5,85–15,1), contorno `#111`. Reemplaza los pasteles. Los `--key-*` y `--kb-*` anteriores no los usaba ningún componente.
- **Hundimiento en el eje local:** `transform: rotate() translateY(--dz)`, así la tecla baja respetando su rotación; la cara y la sombra dura acompañan. Se mantienen secuencia, pausas (puntero, foco, pestaña oculta, IntersectionObserver) y reduced-motion.
- **Titular "Hola, soy [Brian]"** con "Brian" en una pastilla-tecla y fondo de grilla de puntos. **Se quitaron la bajada y los dos CTAs del hero en desktop**: sumarlos obligaba a achicar el teclado a u≈124 y sacaba el marquee del fold, y el CTA de WhatsApp quedaba triplicado (header, botón y Enter). "Ver proyectos" lo cubren la tecla L, el header y el marquee.
- **Botón "Escribime por WhatsApp" solo en mobile (<700px)**, debajo del teclado y dentro del hero: un dueño de PyME entiende un botón de texto antes que una tecla "HABLEMOS". Condición pedida y verificada: el teclado completo y el botón entran sin scroll en 390×844 (Enter ≈ 524px, botón hasta ≈ 609px) y en 360×740 (≈ 496 / 578px). La barra sticky sigue apareciendo recién después del hero (`after="#hero"`); el check lo verifica con el hero todavía asomando 24px.
- **Línea "Encarnación, Paraguay"** (`site.location`) en un renglón chico (13px, mayúsculas, color secundario) sobre el titular, en `<p>` fuera del `<h1>`; cuesta ~16px y el fold a 1440×810 sigue completo (Enter ≈ 761px, `--kb-reserve` subió de 300 a 330px para dejarle lugar).
- **K → `#stack`:** el SPEC decía `#sobre-mi (bloque stack)` pero el código y el id real son `#stack`; el SPEC se alinea al código.
- **Captions** de las teclas: visibles solo si u ≥ 116px (desktop); en mobile quedan en 0px y el nombre accesible se mantiene. El del Enter siempre ≥ 11px.
- **Soporte:** `cqi`, `svh` y `@container` requieren Chrome 105+ / Safari 16+ / Samsung Internet 20+; hay un fallback con `vw` si no hay `cqi`.
- **Rama base:** el PR #12 se mergeó sin los commits `bfb7580` (previews) y `55efe58` (diagramas); `main` no los incluía. Esta rama parte del tip de la rama del PR #12 (con esos commits) + merge de `main`, así que el PR nuevo trae previews + diagramas + teclado. Como los SHA son los originales, mergearlos por separado no genera conflicto.
- **Capturas desktop pendientes:** no estaban `lhoney/desktop.webp` ni `floreria-catalogo/desktop-ornella.webp` (ni en `main`, ni en ramas remotas ni en los uploads); esas cards siguen mostrando solo el teléfono hasta que se agreguen (se completan solas).
- **Nombres de las florerías:** el usuario confirmó que "Rocío Florería" y "Ornella Florería" se publican en los botones.
