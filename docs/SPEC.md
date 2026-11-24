# SPEC — Portfolio de Brian "Leki" Leckie

> Cómo usar este archivo con Claude Code: guardalo en el repo como `docs/SPEC.md`, creá un `CLAUDE.md` corto que diga "La fuente de verdad del proyecto es docs/SPEC.md. Trabajá por fases y no avances de fase sin mi OK", y arrancá con: **"Leé docs/SPEC.md completo, armá un plan para la Fase 0 y ejecutala."**

---

## R. Rediseño 2026-11 (esta sección manda sobre el resto del documento donde lo contradiga)

Pedido de Brian (14–17/11/2026): más profesional, mobile primero de verdad, jerarquía de proyectos nueva, experiencia laboral visible, bilingüe ES/EN, divertido sin parecer "portfolio hecho con IA". Auditorías de respaldo: `docs/audit/` (no se versiona).

### R.1 Hechos confirmados por Brian (usar tal cual; nada más)

| Dato | Valor |
|---|---|
| Trabajo actual | **Software Developer** en **Klien IT Systems** (Países Bajos), remoto, **media jornada**, desde **agosto 2026** |
| Empresa propia | **Co-founder y Team Leader** de **CPO Tech** (Paraguay), fundada en **octubre 2026** entre **7 colegas**; tiene portfolio propio en https://www.cpotech.com.py |
| Empleo anterior | **Soporte técnico** en **Grupo Empresarial Franz**, 2026 (antes de Klien). Es el proyecto "IT para red de sucursales" (RustDesk en 15 sucursales, NAS QNAP, FortiClient) |
| Independiente | Proyectos propios para negocios (lo que muestra el portfolio) |
| Estudios | Ingeniería en Informática, **Universidad Católica "Nuestra Señora de la Asunción", Campus Itapúa**. Le faltan 2 semestres; **egreso estimado 2027**. Nunca "Ingeniero", "Graduate" ni "B.Sc." |
| Idiomas | Español nativo; inglés conversacional y profesional (lo usa a diario en el trabajo) |
| Mbarete | Lo usan **5 gimnasios** en Argentina y Paraguay |
| Años de proyectos | **No se muestran** (todo empezó en 2026; el campo `year` queda opcional en el schema y no se renderiza) |
| Foto, dominio, testimonios | Sin foto por ahora (slot oculto si `site.photo` está vacío). Sin dominio propio todavía (`site.url` sigue siendo la única línea a cambiar). Sin testimonios: no hay sección |
| Búsqueda de empleo | No confirmada: no se muestra "open to work" (`site.openToWork: false`) |

### R.2 Idioma y rutas

- **Español en `/`** (idioma por defecto, sin prefijo) e **inglés en `/en/`**. Casos: `/proyectos/<slug>/` (ES) y `/en/projects/<slug>/` (EN). Los slugs no se traducen.
- Astro i18n: `locales: ['es','en']`, `defaultLocale: 'es'`, `routing.prefixDefaultLocale: false`. Salida estática.
- Selector ES/EN visible en el header (≥ 44×44, `aria-current` en el activo, lleva a la página equivalente). **Sin redirección automática** por idioma del navegador.
- `hreflang` recíproco (`es`, `en`, `x-default` → ES), canonical propio por idioma, `og:locale` `es_PY` / `en_US`, OG por idioma.
- Textos de UI en un diccionario tipado (`src/i18n/ui.ts`: `es` completo, `en` con las mismas claves; build falla si falta una clave EN cuando se generan páginas EN). Proyectos: los `.md` de `src/content/projects/` son ES y canónicos para datos compartidos (estado, orden, stack, links, capturas); la traducción EN (R3) va en `src/content/projects-en/<slug>.md` solo con campos traducibles + cuerpo.
- Uso: a clientes se comparte `/` o el caso en ES; LinkedIn, CV y postulaciones apuntan a `/en/`.
- La versión EN reordena: experiencia antes que servicios, contacto con email · LinkedIn · CV primero y WhatsApp después, "Cómo trabajo" reducido. El Enter del teclado en EN va a `#contact` (no a WhatsApp).

### R.3 Jerarquía de proyectos (por peso)

Destacados (`featured: true`), en este orden: **1. Mbarete · 2. Catálogo para florerías · 3. Estación de Carretera · 4. Lhoney · 5. Ecodespensa · 6. AVM Gran Asunción**.
Más proyectos (en este orden): **CPO Tech** (nuevo, `links` al portfolio de CPO Tech, rol "Co-founder y Team Leader"), KEVJER, Mercado Jopoi, Figus del Mundial, Dashboard IoT.
**Ocultos** hasta tener contenido completo (`draft: true`: sin card, sin página, fuera del sitemap): Chapa, MenuQR, Mírame, Turnos psicología.
**IT para red de sucursales** sale del grid y se enlaza desde la entrada de Grupo Empresarial Franz en Experiencia (su página `/proyectos/it-sucursales/` se mantiene; campo `inGrid: false`). Cliente nombrado: Grupo Empresarial Franz.

### R.4 Hero y teclado (R1: cambios de contenido; el rediseño visual es R2)

- Debajo de la línea del `<h1>`: **línea de rol** chica: "Software developer en **Klien IT Systems** (Países Bajos) · Co-founder de **CPO Tech**" / EN: "Software developer at **Klien IT Systems** (Netherlands) · Co-founder of **CPO Tech**".
- El teclado se mantiene como firma. Tecla **K2: "MI PROCESO" → "EXPERIENCIA"** (`#experiencia`; EN "EXPERIENCE" → `#experience`). Se sigue leyendo LEKI WORKS.
- Easter egg (R2): tipear letras en el teclado físico hunde la tecla correspondiente en pantalla (sin navegar; Enter físico no hace nada). Respeta `prefers-reduced-motion` y no captura teclas si el foco está en un input o hay modificadores.
- Reloj de Encarnación (R2): "Son las 21:34 en Encarnación · UTC−3" (`America/Asuncion`), texto real, actualizado por minuto, sin layout shift.

### R.5 Sección Experiencia (`#experiencia` / `#experience`), nueva, inmediatamente después de Proyectos

Datos en `src/config/experience.ts` (tipado, campos `{ es, en }`). Orden y copy:

1. **Software Developer — Klien IT Systems** · Países Bajos, remoto · media jornada · ago 2026 – hoy
   ES: "Desarrollo de software para una empresa de IT de Países Bajos, en equipo remoto y en inglés." EN: "Software development for a Dutch IT company, working remotely in an English-speaking team."
2. **Co-founder y Team Leader — CPO Tech** · Paraguay · oct 2026 – hoy · link "Ver portfolio de CPO Tech ↗"
   ES: "Empresa de desarrollo que fundamos entre 7 colegas. Lidero el equipo técnico." EN: "Software company founded by 7 colleagues. I lead the technical team."
3. **Desarrollo independiente** · Paraguay · 2026 – hoy
   ES: "Catálogos, sistemas e integraciones para negocios: los proyectos de este sitio." EN: "Catalogs, systems and integrations for businesses — the projects on this site."
4. **Soporte técnico — Grupo Empresarial Franz** · Paraguay · 2026 · link "Ver caso" → `/proyectos/it-sucursales/`
   ES: "Acceso remoto corporativo en 15 sucursales, permisos por departamento en NAS y despliegues de FortiClient." EN: "Corporate remote access across 15 branches, per-department NAS permissions and FortiClient rollouts."
5. **Ingeniería en Informática — Universidad Católica, Campus Itapúa** · egreso estimado 2027
   ES: "Último año de la carrera." EN: "Computer Engineering — final year, expected 2027."

Estructura: lista ordenada semántica (`<ol>`), fechas en `<time>`. Sin logos inventados ni porcentajes.

### R.6 Sobre mí (reescrito)

No abre con "estudiante". ES: "Soy Brian, desarrollador full-stack de Encarnación. Trabajo como software developer para Klien IT Systems, una empresa de Países Bajos, y lidero el equipo de CPO Tech, la empresa que armamos con colegas en Paraguay. Por mi cuenta hago catálogos, sistemas e integraciones para negocios de todo el país, siempre con una demo funcionando antes de cerrar nada. Estoy en el último año de Ingeniería en Informática en la Universidad Católica." + línea de idiomas ("Español nativo · Inglés profesional, lo uso a diario"). Bloque Stack sin "MCP"/"Claude API" salvo que haya proyecto que los use (se quitan). GitHub y LinkedIn ≥ 44px de alto.

### R.7 Reglas de copy (anti "hecho con IA")

- Sin raya "—" dentro de títulos visibles: título + subtítulo como campos/elementos separados (las cards mini también).
- Sin la fórmula "X, no Y"; sin frases de folleto ("ahorran horas", "100% construido en…", "demanda replicable"); sin etiqueta "MI DIFERENCIAL" (el paso 2 se destaca solo con el diseño).
- Un solo recurso de itálica serif por pantalla.
- `↗` solo en links que salen del sitio.
- Crédito del footer: "Teclado inspirado en un diseño de ui.debbie" (nunca la palabra "prompt").
- Cada frase con un dato que solo Brian puede escribir (nombre, número, lugar, decisión). Nada inventado: si falta un dato, se omite.

### R.8 Mobile y profesionalismo (objetivos medibles, R2)

Texto visible ≥ 14px salvo metadatos; touch targets ≥ 44px; máx. 3 chips de stack por card; un solo CTA de WhatsApp por pantallazo; primer proyecto visible en ≤ 1 scroll a 390×844; home a 390 ≤ 7.000px; capturas grandes (en mobile el teléfono ocupa la card). Todas las capturas se rehacen (Jopoi sin modal, KEVJER sin splash, desktop de Ornella/Rocío/Lhoney, Estación sin la línea de la inauguración). Maqueta 390 y 1440 aprobada por Brian antes de implementar.

### R.8b Dirección visual aprobada: "Editorial" (Brian, 24/11/2026)

Referencia visual y de comportamiento: la maqueta A (`docs/design/editorial/index.html` + `shot-390.png` / `shot-1440.png`). Elegida entre tres direcciones (Editorial, Taller, Cuaderno). Esta sección reemplaza §4, §5, §6 (salvo colores de teclas), §7 y §8.3 del SPEC original donde choquen.

- **Tono:** CV con aire de revista. Fondo papel cálido, casi monocromo; el color aparece solo en las teclas y en el número/estado/subrayado de cada caso.
- **Tipografía:** Schibsted Grotesk (todo) + IBM Plex Mono (metadatos), self-hosted vía `@fontsource`. Se retiran Satoshi, Inter e Instrument Serif del sitio (la OG puede seguir usando lo que tenga hasta que se rehaga).
- **Hero tipográfico:** reloj "HH:MM en Encarnación, Paraguay · UTC−3" en vivo; "Brian Leckie" muy grande; "Desarrollador full-stack."; párrafo corto con el demo-first; línea "AHORA" con Klien IT Systems y CPO Tech; botón "Escribime por WhatsApp" + "Ver trabajos ↓".
- **Teclado LEKI WORKS como firma compacta** (teclas ~44–50px, links reales, se hunden al tocarlas; tipear L-E-K-I / W-O-R-K-S en el teclado físico las hunde). Se retira el teclado en arco gigante, la animación automática y el marquee.
- **Trabajos:** índice numerado 01–06 + casos grandes (número, estado, título, bajada, texto, ROL/STACK en mono, captura desktop + captura mobile al lado en desktop; en mobile la captura ocupa casi todo el ancho). "Fig. 0N · Producción" bajo la captura y "Ver el caso →".
- **Experiencia** como tabla tipo CV; **Cómo trabajo** y **Contacto** breves; un solo CTA de WhatsApp por pantallazo (el del header aparece solo cuando no se ven ni el del hero ni el de contacto).
- Las páginas de caso adoptan el mismo sistema.

### R.9 Fases del rediseño (cada una: `npm run build` + `npm run check:layout` + resumen, y se espera el OK)

- **R1 — Contenido y estructura:** este §R en el SPEC; i18n plumbing (config, diccionario ES, helpers de rutas, selector oculto hasta R3); `experience.ts` + sección Experiencia con el estilo actual; línea de rol; K2; jerarquía y `draft`; años fuera; copy limpio; JSON-LD con `worksFor` (Klien, CPO Tech) y `knowsLanguage`; `check:layout` actualizado a estos cambios.
- **R2 — Rediseño visual + mobile** (§R.4 easter egg y reloj, §R.8).
- **R3 — Inglés** completo en `/en/` (§R.2).
- **R4 — Pulido:** check final, Lighthouse, CV PDF ES/EN, preview en Vercel.

---

## 0. Rol y reglas de trabajo (para Claude Code)

Construí el portfolio completo, funcional y desplegable de Brian Leckie ("Leki"), desarrollador full-stack en Encarnación, Paraguay. No entregues conceptos, wireframes ni explicaciones: entregá código funcionando.

Reglas:

- **Trabajá por fases (sección 12).** Al terminar cada fase: corré `npm run build` y `npm run check:layout`, mostrame un resumen corto (qué hiciste, qué verificaste, qué quedó dudoso) y **pará** hasta que yo diga "seguí".
- Este documento es la fuente de verdad. Donde no especifique algo, tomá decisiones sensatas que respeten la intención de diseño y anotalas en `docs/DECISIONS.md` (una línea por decisión).
- **No inventes nada:** ni clientes, ni testimonios, ni métricas, ni resultados, ni links, ni redes sociales. Todo dato que falte va como `TODO:` en los archivos de config/datos y el sitio lo oculta si está vacío.
- **Nunca mejores el estado de un proyecto:** si dice `demo`, se muestra como demo. Un portfolio que exagera se cae en la primera llamada con un cliente.
- Mantené el CSS limpio y organizado por componente/sección. Nada de reglas duplicadas, overrides viejos apilados al final ni `!important` salvo justificado.
- Texto, navegación y teclas son elementos reales de interfaz (nunca bitmaps). Sin `contenteditable`, sin modos de edición, sin controles de autoría visibles.

---

## 1. Objetivo de negocio (esto manda sobre la estética)

El sitio tiene que **conseguir clientes**: dueños de PyMEs y negocios locales de Paraguay (florerías, tiendas, gimnasios, gastronomía, comercios) y, en segundo lugar, empresas/reclutadores técnicos.

Eso implica:

1. En menos de 5 segundos se entiende **qué hago y para quién**.
2. Los **proyectos reales son el centro** del sitio, no un diálogo de relleno.
3. El contacto principal es **WhatsApp** (así se cierra negocio en Paraguay); el email es secundario.
4. **Mobile primero de verdad:** la mayoría de los clientes van a abrir el link desde WhatsApp en un Android. Tiene que verse impecable a 360px y 390px.
5. Cada proyecto tiene **su propia URL** con preview (Open Graph) para mandarla por WhatsApp: "mirá lo que hice para una florería".

La estética (teclado de colores, tipografía gigante, marquee editorial) es el gancho memorable. Los proyectos y el contacto son lo que vende.

---

## 2. Stack

- **Astro (última versión estable) + TypeScript**, salida estática (SSG). Motivo: el sitio debe ser HTML real para SEO y previews de links; nada de SPA renderizada en cliente.
- JavaScript liviano y vanilla (TS) para teclado, marquee, filtros y CTA sticky. Sin frameworks de UI salvo que algo lo justifique (si hace falta una isla, Vue 3).
- CSS propio con custom properties (sin Tailwind). Un archivo de tokens + CSS por componente.
- Proyectos como **Astro Content Collections** (un `.md`/`.mdx` por proyecto con frontmatter tipado con Zod).
- Playwright (dev dependency) para verificación visual y para generar capturas de los proyectos.
- Deploy en **Vercel**.

Estructura sugerida:

```
src/
  config/site.ts          ← ÚNICO lugar con nombre, WhatsApp, email, redes
  content/projects/*.md   ← un archivo por proyecto
  components/ (Header, Hero, Keyboard, Marquee, ProjectCard, ProjectGrid, Services, Process, About, Contact, StickyCta, Footer)
  styles/ (tokens.css, base.css, + uno por componente si no usás <style> scoped)
  pages/index.astro
  pages/proyectos/[slug].astro
scripts/
  check-layout.mjs        ← verificación con Playwright
  screenshots.mjs         ← capturas de demos
docs/ (SPEC.md, DECISIONS.md)
```

---

## 3. Configuración central (`src/config/site.ts`)

```ts
export const site = {
  name: "Brian Leckie",
  nickname: "Leki",
  wordmark: "leki.",                 // el punto va en color de acento
  role: "Desarrollador full-stack",
  location: "Encarnación, Paraguay",
  whatsapp: "TODO:595XXXXXXXXX",     // formato E.164 sin "+"
  whatsappMessage: "Hola Brian, vi tu portfolio y quiero consultarte por un proyecto.",
  email: "TODO:email@dominio.com",
  github: "TODO:https://github.com/brianleckie",
  linkedin: "TODO:",
  instagram: "",                     // vacío = no se muestra
  showDesignCredit: true,            // crédito de inspiración en el footer
  url: "TODO:https://dominio-final",
};
```

- Helper `whatsappHref()` que arme `https://wa.me/<numero>?text=<mensaje codificado>`.
- Si un valor empieza con `TODO:` o está vacío, el componente correspondiente **no se renderiza** (y el build loguea un warning con la lista de TODOs pendientes). Nunca mostrar `TODO` al visitante.

---

## 4. Diseño global

### Tipografías
- **Satoshi** (wordmark, títulos, letras de las teclas) desde Fontshare (`api.fontshare.com`), pesos 700 y 900.
- **Inter** (nav, cuerpo, captions, controles) desde Google Fonts.
- **Instrument Serif** italic (énfasis editorial y marquee) desde Google Fonts. Fallback: Georgia.
- `font-display: swap`, fallbacks definidos, `preconnect` a los orígenes. Nada de referencias a fuentes inexistentes.

### Colores (tokens en `:root`)
- Fondo hero: gradiente sutil entre `#f7f9ff`, `#ffffff` y `#f3f0ff`.
- Texto de teclas y contornos: `#111111`. Texto primario: `#1d2033`. Texto secundario: `#55586b`.
- Acento editorial: `#4f5bd5` (índigo). Usalo en el punto del wordmark, el énfasis del titular, links y estados de foco.
- Sección de contacto: fondo `#151a33`, texto `#eef0ff`, acento del link `#a9b4ff`.
- Foco visible: outline 3px en acento con offset 3px, contraste AA sobre todos los fondos.

### Espaciado y ancho
- Padding horizontal: ~48px desktop, ~32px tablet, 20px mobile. Fondos y marquee de borde a borde.
- Referencia principal 1440px. Verificar también 1440×810, 1440×1002, 1024, 768, 390 y **360**.
- Nada de alturas fijas que recorten texto al cargar fuentes, al achicar el viewport o con zoom 200%.

---

## 5. Header

- Izquierda: wordmark **"leki."** en Satoshi 900, tracking ajustado, punto final en acento.
- Derecha: "Proyectos", "Servicios", "Sobre mí" y botón **"Hablemos ↗"** (abre WhatsApp en pestaña nueva).
- En mobile (<700px): el wordmark y "Hablemos ↗" quedan visibles; los otros tres links pasan a un menú simple (botón nativo con `aria-expanded`) o a una fila scrolleable debajo. Elegí lo más limpio y documentalo.
- Divisor sutil debajo opcional. Sin badges de disponibilidad, sin puntitos de estado.

---

## 6. Hero

> Reemplaza el hero original (titular en tres líneas, bajada, dos CTAs y teclado 900×312 con Enter alto), por pedido del cliente: teclado en arco, centrado, con Enter ancho. Maqueta aprobada en 1440×810 y 390×844.

### Titular
- Renglón chico sobre el titular: **"Encarnación, Paraguay"** (`site.location`), `<p class="hero-location">`, Inter 600, 13px, mayúsculas con tracking 0.1em, `--color-text-secondary`. Desktop y mobile; cuesta ~16px de alto y no rompe el fold.
- `<h1>` centrado en dos partes: **"Hola, soy [Brian]"** (Satoshi 900, `clamp(2.375rem, 1.6rem + 3vw, 4rem)`, lh 1.1, tracking −0.03em) con "Brian" dentro de una **pastilla-tecla** (cara `--key-e-face`, base `--key-e-side` visible abajo, contorno 2px `--kb-line`, sombra dura 0.07em, −2°), y **"Hago webs y sistemas que *trabajan* para tu negocio."** (Inter 500, `clamp(1.0625rem, .9rem + .5vw, 1.375rem)`, `--color-text-secondary`, `text-wrap: balance`; "trabajan" en Instrument Serif itálica `--color-accent`, 1.2em). Punto `.sr-only` tras "Brian".
- **Sin bajada ni botones en desktop:** el CTA del hero es el Enter; además "Hablemos ↗" del header.
- **Solo mobile (< 700px):** botón primario **"Escribime por WhatsApp"** (`btn btn-primary btn-lg`, `whatsappHref()`, pestaña nueva, `rel="noopener noreferrer"`) debajo del teclado, dentro del hero. Condición: el teclado completo y el botón entran sin scroll en 390×844 (y 360×740). La barra sticky sigue apareciendo recién después del hero (`after="#hero"`), así que no convive con este botón.
- Fondo `--color-bg-hero` con grilla de puntos (`radial-gradient` 1.1px cada 24px; 20px en mobile), `--color-hero-dot`.
- Padding superior `clamp(20px, 4svh, 40px)`; teclado a `clamp(12px, 3svh, 32px)` del titular.

### Teclado
9 teclas en dos filas **en arco** (L E K I / W O R K S, se lee "LEKI WORKS") y un **Enter ancho** centrado debajo. Nada se superpone. Toda la composición se centra en el hero.

**Unidad:** `u` = lado de la tecla (cuadrada). Todo en `u`, calculado en CSS (sin JS de escala):
- Desktop/tablet (contenedor ≥ 560px): `u = clamp(56px, min(100cqi / 5.88, (100svh − 330px) / 3.473), 140px)`.
- Mobile (< 560px): `u = min(100cqi / 5.565, 104px)` → 57.5px a 360, 62.9px a 390.

**Fórmulas** (i = lugar en la fila desde el centro; arriba ±0.5, ±1.5; abajo 0, ±1, ±2):
`x = i·pitch`, `y = y0 + fila·row + sag·i²` (centro, desde el borde superior), `rot = i·tilt`.
Enter: centro en x = 0, y = y0 + row + enterDy; ancho enterW·u, alto u.

| | pitch | tilt | sag | row | y0 | Enter (ancho, Δy) | W × H |
|---|---|---|---|---|---|---|---|
| Desktop | 1.18 | 5° | 0.075 | 1.20 | 0.503 | 3.36, 1.27 | 5.88 × 3.473 |
| Mobile | 1.12 | 2.5° | 0.04 | 1.14 | 0.501 | 3.24, 1.18 | 5.565 × 3.321 |

Centros resultantes (x, y en u; rotación):

| Tecla | Desktop | Mobile |
|---|---|---|
| L | −1.770, 0.671, −7.5° | −1.680, 0.591, −3.75° |
| E | −0.590, 0.521, −2.5° | −0.560, 0.511, −1.25° |
| K | 0.590, 0.521, 2.5° | 0.560, 0.511, 1.25° |
| I | 1.770, 0.671, 7.5° | 1.680, 0.591, 3.75° |
| W | −2.360, 2.003, −10° | −2.240, 1.801, −5° |
| O | −1.180, 1.778, −5° | −1.120, 1.681, −2.5° |
| R | 0, 1.703, 0° | 0, 1.641, 0° |
| K | 1.180, 1.778, 5° | 1.120, 1.681, 2.5° |
| S | 2.360, 2.003, 10° | 2.240, 1.801, 5° |
| Enter | 0, 2.973, 0° (3.36 × 1) | 0, 2.821, 0° (3.24 × 1) |

Separación mínima entre polígonos rotados: 0.120u desktop, 0.098u mobile. Fuente única: `src/styles/tokens.css` (colores, arco desktop, `--kb-reserve`) + override mobile en `Keyboard.astro`; la imagen OG de la home lee `tokens.css` (`kbToken()` en `src/config/keyboard.ts`).

**Teclas, colores (cara / pared / letra), caption y destino, en orden de lectura:**

| Tecla | Cara | Pared | Letra | Caption | Destino |
|---|---|---|---|---|---|
| L | `#ff6b3d` | `#c4441c` | `#111111` | PROYECTOS | `#proyectos` |
| E | `#ffc83d` | `#c98a00` | `#111111` | SERVICIOS | `#servicios` |
| K | `#ff8fc8` | `#cc4c8e` | `#111111` | STACK | `#stack` |
| I | `#276b4c` | `#17402e` | `#fff4df` | SOBRE MÍ | `#sobre-mi` |
| W | `#ffe2b5` | `#d29a55` | `#111111` | WEBS Y CATÁLOGOS | `#proyectos` + filtro `web` |
| O | `#22b3a1` | `#12786b` | `#111111` | SISTEMAS | `#proyectos` + filtro `sistemas` |
| R | `#ff9a3d` | `#c9670e` | `#111111` | INTEGRACIONES | `#proyectos` + filtro `integraciones` |
| K | `#8e3a6e` | `#5a1f45` | `#fff4df` | MI PROCESO | `#proceso` |
| S | `#b48cff` | `#7a52d1` | `#111111` | IT Y SOPORTE | `#proyectos` + filtro `it` |
| Enter | `#2a2140` | `#141020` | ↵ `#ffc83d`, caption `#ffe2b5` | HABLEMOS | WhatsApp (pestaña nueva) |

Letra/cara ≥ 4.5:1 en todas (5.85–15.1). Contorno `#111111`.

**Anatomía:** el `<a>` es la pared lateral (`--side`) con contorno 2px, radio 0.22u, sombra dura 0.05u + sombra suave. Cara inset 0.05u arriba, 0.085u a los lados, 0.2u abajo; radio 0.16u; bisel (brillo inset arriba, sombra inset abajo). Costuras diagonales en las esquinas inferiores y pared inferior más oscura (`::before`). Letra Satoshi 900 a 0.44u. Caption Inter 650 `max(10px, .078u)`, visible **solo si u ≥ 116px**; si no, 0px (el nombre accesible se mantiene). Enter: ↵ en SVG inline (Satoshi no tiene el glifo) arriba a la izquierda, 0.58u; "HABLEMOS" abajo a la derecha, `max(11px, .085u)`, siempre visible. Decorados con `pointer-events: none`.

**Animación:** cada tecla `rotate(rot) translateY(--dz)`: el hundimiento es en su eje local. Press: tecla +0.03u, sombra dura 0.05u → 0.02u, cara +0.07u, 140ms. Secuencia automática L, E, K, I, W, O, R, K, S, Enter (Enter participa): paso 340ms, tecla abajo 170ms, reposo 1400ms tras el Enter; nunca más de una abajo. Pausa con puntero sobre el teclado, foco dentro, pestaña oculta y fuera del viewport (IntersectionObserver 0.1). Hover (solo `hover: hover`) y foco: tecla +0.015u, cara +0.045u. `:active` = press (sin hover pegado en táctil). Sin botón de pausa. `prefers-reduced-motion: reduce` → sin secuencia ni transiciones. Timers/observers/listeners se limpian en `astro:before-swap`.

**Fold (medido en el build):** a 1440×810 entran línea de ubicación, titular, línea y teclado completo (Enter incluido; u ≈ 138px, borde inferior del Enter ≈ 761px). Mobile 390×844: Enter ≈ 524px y botón de WhatsApp hasta ≈ 609px; 360×740: Enter ≈ 496px y botón hasta ≈ 578px.

**Accesibilidad:** anchors reales con `aria-label` = caption ("Webs y catálogos", "IT y soporte"); Enter "Hablemos por WhatsApp", `rel="noopener noreferrer"`. `data-filter` en W/O/R/S (sin JS llevan a `#proyectos`). DOM = orden de lectura = tabulación. Foco 3px `--color-accent` offset 4px y `z-index` sobre las vecinas. Teclas ≥ 56px de lado en 360/390. Hit areas: la tecla entera es el link.

---

## 7. Marquee

Inmediatamente debajo del teclado, **una sola tira** recta, continua, de borde a borde.

- Fondo `#ffdfa0`, texto `#7a4318`, Instrument Serif ~28–40px desktop, ~22–28px mobile, padding vertical generoso. Sin forma de píldora, sin bordes redondeados, sin filas apiladas.
- Mensaje exacto:
  > "Catálogos con pedido por WhatsApp. · Sistemas a medida. · Integraciones que ahorran horas. · Webs que se ven bien en el celular. · Elegí una tecla."
- Implementación: track `display: flex; width: max-content` con **dos grupos idénticos que no se encogen**, mismo espaciado incluido el gap final. Animar `translateX(0 → -50%)`. Repetir la frase dentro de cada grupo las veces necesarias para que un grupo sea al menos tan ancho como el viewport (incluido monitores grandes; recalcular en resize). No usar `padding-left: 100%`.
- Velocidad calma de ~40–60px/s: calcular la duración en JS según el ancho real del grupo.
- Sin hueco vacío, sin salto al reiniciar, sin overflow horizontal de la página. Texto visible apenas carga.
- Accesibilidad: la frase expuesta una sola vez; las copias con `aria-hidden="true"`.
- Reduced motion: sin animación, mensaje estático legible (puede envolver en varias líneas).
- Solo transforms, nunca animar propiedades de layout.

---

## 8. Proyectos (`#proyectos`) — el corazón del sitio

### 8.1 Modelo de datos (Content Collection `projects`, frontmatter con Zod)

```ts
{
  title: string,
  slug: string,
  summary: string,              // 1 línea, qué es y para quién
  category: ("web" | "sistemas" | "integraciones" | "it" | "academico")[],
  status: "en-produccion" | "entregado" | "en-desarrollo" | "demo" | "academico",
  featured: boolean,
  order: number,
  client?: string,              // solo si clientNamePublic === true
  clientNamePublic: boolean,    // default false → se muestra la descripción genérica
  clientGeneric: string,        // ej. "Boutique de regalos en Paraguay"
  role: string,                 // ej. "Diseño + desarrollo completo"
  stack: string[],
  highlights: string[],         // 2–4 decisiones técnicas o funcionalidades concretas
  results?: string[],           // SOLO datos reales; si no hay, se omite la sección
  demoUrl?: string,
  repoUrl?: string,             // solo repos públicos
  year: number,
  accent: string,               // color de la card (reusar caras de teclas)
}
```

El cuerpo del `.md` es el caso de estudio: **Contexto → Problema → Qué construí → Decisiones técnicas → Resultado (si hay datos reales)**.

### 8.2 Contenido inicial

Creá estos archivos con lo que está acá. Todo lo que no figure va como `TODO:` y **no se inventa**. Los nombres de clientes van con `clientNamePublic: false` hasta que yo confirme permiso.

**Destacados (`featured: true`)**

1. **Lhoney — catálogo con carrito y pedido por WhatsApp.** Boutique de regalos multi-categoría (belleza, hogar y mesa, regalos personalizados, termos, accesorios, canastas). Catálogo con estado de stock por producto (disponible/agotado), carrito y checkout por WhatsApp. Contenido centralizado en un solo archivo de datos. Fase 2 planificada: login para que la dueña y empleadas actualicen stock. Stack: Vite, Vue 3 (Composition API). Categoría: web. Estado: `en-desarrollo` (TODO confirmar). Rol: diseño + desarrollo.
2. **Catálogo web para florerías — un producto, dos clientes.** Catálogo con fotos y precios, pedido por WhatsApp y panel para cargar/bajar productos, con mantenimiento mensual. Primero como demo para una florería con sucursales en Hohenau y Mariano Roque Alonso; después rediseñado y vendido a una segunda florería. Contalo como **producto replicable** (esto es un argumento de venta fuerte). Stack: Vite, Vue 3; backend futuro en Railway. Categoría: web. Estado: `entregado` / `demo` (TODO confirmar cuál). Repos: TODO.
3. **Sincronización Bistrosoft → Tiendanube.** Integración que sincroniza el sistema de gestión del local con la tienda online. Arquitectura con interfaz `ExcelSource` / `ApiSource` que permitió avanzar ~80% del desarrollo antes de tener credenciales de la API. Stack: FastAPI, PostgreSQL, Railway, app OAuth de Tiendanube. Categorías: integraciones, sistemas. Estado: TODO.
4. **Sistema de gestión de préstamos y cobros.** Cliente anonimizado ("financiera local"). Tres roles (superadmin, admin, cobrador). Montos manejados como enteros en guaraníes con componente de input de monto compartido; ajustes de pool de conexiones de SQLAlchemy y eliminación de queries N+1. Stack: FastAPI, PostgreSQL, React, Railway. Categoría: sistemas. Estado: `entregado` (TODO confirmar). Sin capturas con datos reales: usar datos ficticios o el placeholder.
5. **Oro Bruto 24 — streetwear.** Sitio de marca con estética retro de fútbol de los 90, catálogo completo de la colección `.003` y carrito por WhatsApp; evolucionó de tienda transaccional a "archivo de marca". Categoría: web. Estado: `demo`.
6. **Valuador automático de inmuebles (Gran Asunción).** Proyecto final de carrera, en equipo con Oscar Arce. Stack y alcance: TODO. Categoría: academico, sistemas. Estado: `academico` / `en-desarrollo`.

**Más proyectos (`featured: false`)**

- **Chapa.com.py** — búsqueda semántica de autos usados con pgvector. Categoría: sistemas. Estado: TODO.
- **Figus del Mundial** — plataforma de intercambio de figuritas; reservas seguras ante concurrencia con `SELECT FOR UPDATE`, rate limiting y suite de smoke tests. Stack: FastAPI, React, PostgreSQL. Estado: TODO.
- **Mírame** — MVP de showroom para emprendedores, mobile-first, imágenes vía Cloudinary. Estado: TODO.
- **Mbarete** — TODO: descripción (SaaS sobre WhatsApp / sección para un gimnasio).
- **MenuQR** — menús digitales bilingües ES/EN para gastronomía. Estado: TODO.
- **Sistema de turnos para consultorio de psicología.** Estado: TODO.
- **IT para red de sucursales** — APK de RustDesk personalizado (servidor corporativo fijo, firmado con keystore corporativo) desplegado en 15 sucursales con GitHub Actions; permisos ACL en NAS QNAP por departamento; despliegues de FortiClient. Categoría: it. Empresa: no nombrar hasta que confirme.
- **Dashboard IoT con MQTT + emulador en Python** — trabajo universitario. Categoría: academico.

### 8.3 Presentación

- **Destacados:** cards grandes. Desktop: grid de 2 columnas (o layout alterno imagen/texto). Mobile: una columna, mostrando la **captura mobile** primero.
- Cada card: título, resumen, badge de estado (texto + color, nunca solo color), chips de stack (máx. 4 + "+N"), y botones "Ver caso" (página propia) y "Ver demo" (si hay `demoUrl`).
- **Más proyectos:** grid compacto (3 col desktop / 2 tablet / 1 mobile) con filtros por categoría: Todos, Webs y catálogos, Sistemas, Integraciones, IT y soporte, Académico. Filtros como botones nativos con `aria-pressed`; en mobile, fila horizontal scrolleable con scroll-snap **sin generar overflow de la página**. El filtro activo también se refleja en la URL (`?cat=web`).
- Las teclas del teclado con `data-filter` activan el filtro correspondiente.

### 8.4 Capturas (`scripts/screenshots.mjs`, `npm run shots`)

- Para cada proyecto con `demoUrl`, Playwright captura a 1440×900 y 390×844 (deviceScaleFactor 2), convierte a WebP con `sharp` y guarda en `src/assets/projects/<slug>/desktop.webp` y `mobile.webp`.
- Mostrar con `<picture>`/`astro:assets` (lazy, tamaños responsive). La captura mobile se presenta dentro de un marco de teléfono hecho en CSS; la desktop dentro de un marco de navegador en CSS.
- Sin `demoUrl` ni capturas: placeholder generado en CSS con el color `accent` del proyecto y sus iniciales. **Nunca imágenes falsas ni generadas por IA que aparenten ser el producto.**

### 8.5 Página de caso (`/proyectos/[slug]`)

- Header compartido, título grande, resumen, metadatos (año, rol, estado, stack), capturas, cuerpo del caso, links, y CTA final "¿Querés algo así para tu negocio?" → WhatsApp con mensaje que mencione el proyecto.
- Navegación anterior/siguiente entre proyectos destacados.
- Open Graph por proyecto: título, descripción e imagen 1200×630. Generá las imágenes OG renderizando una ruta interna `/og/[slug]` con Playwright en el build de capturas (o con la librería OG que mejor funcione con Astro) — documentá la elección.

---

## 9. Resto de secciones (en orden, después de proyectos)

### Servicios (`#servicios`)
Cuatro bloques, cada uno con título, 1–2 líneas y un link "Ver ejemplos" que filtra proyectos:
1. **Webs y catálogos para negocios** — catálogo con fotos, precios y pedido por WhatsApp; panel para que el negocio actualice sus productos.
2. **Sistemas a medida** — gestión, cobros, turnos, roles y permisos.
3. **Integraciones y automatización** — conectar sistemas existentes (ej. gestión ↔ tienda online), automatizaciones.
4. **IT y soporte para empresas** — acceso remoto, redes de sucursales, permisos y almacenamiento.

Sin precios por defecto. Dejá en config `showPrices: false` y un campo `fromPrice` opcional por servicio, por si los quiero mostrar.

### Proceso (`#proceso`)
Cuatro pasos numerados:
1. **Charlamos** — me contás qué necesita tu negocio.
2. **Te muestro una demo** — antes de comprometerte, ves una versión funcionando.
3. **Desarrollo y ajustes** — construimos con tu feedback.
4. **Lanzamiento y mantenimiento** — queda online y te acompaño después.

(El paso 2 es mi diferencial real: lo trabajo demo-first. Que se destaque visualmente.)

### Sobre mí (`#sobre-mi`)
- Texto corto (TODO: lo reviso yo): estudiante de 4º año de Ingeniería en Informática, desarrollador full-stack, experiencia en IT empresarial, base en Encarnación, trabajo con negocios de todo Paraguay.
- Bloque **Stack**: chips agrupados — Frontend (Vue 3, Quasar, React, Vite, TypeScript), Backend (Python, FastAPI, PostgreSQL, Supabase), Infra y herramientas (Railway, Vercel, Cloudinary, GitHub Actions, n8n), IA (Claude API, MCP).
- Links a GitHub/LinkedIn desde config (solo si están cargados).

### Contacto (`#contacto`)
- Fondo `#151a33`, texto claro, espacioso.
- Titular: **"Tu próximo proyecto"** / **"empieza con un hola."**
- Invitación: "¿Tenés un negocio, una idea a medio armar o solo querés consultar? Escribime."
- Botón grande **WhatsApp** (primario) + email como link subrayado (con `overflow-wrap: anywhere` para que no desborde en mobile). Sin formularios, sin badges, sin redes inventadas.
- En mobile se apila con gracia.

### CTA sticky mobile
- Solo en <700px: barra fija inferior con "Escribime por WhatsApp" que aparece después de pasar el hero y se oculta cuando la sección de contacto está en pantalla. Respetar `env(safe-area-inset-bottom)`. No debe tapar contenido (agregar padding inferior al body cuando está visible) ni el focus.

### Footer
- © año Brian Leckie · links mínimos.
- Si `showDesignCredit`: "Diseño inspirado en un prompt de ui.debbie" en tamaño pequeño.

---

## 10. Calidad, SEO y performance

- HTML semántico y válido, IDs únicos, sin requests a assets inexistentes, sin errores en consola.
- `<title>` y meta description por página, Open Graph + Twitter cards, `lang="es"`, sitemap, `robots.txt`, JSON-LD `Person` en la home.
- Objetivo Lighthouse mobile: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95, SEO 100. Un portfolio lento de un desarrollador web es un autogol.
- Fuentes: subset/preload de las críticas. Imágenes lazy salvo la primera visible.
- Accesibilidad: contraste AA, foco visible de alto contraste en todo, navegación completa por teclado, legible a zoom 200%, `prefers-reduced-motion` respetado en todo el sitio, estados hover que no queden "pegados" en táctil.

---

## 11. Verificación automatizada (`scripts/check-layout.mjs`, `npm run check:layout`)

Con Playwright contra el build (`astro preview`), para viewports **1440×810, 1440×1002, 1024×768, 768×1024, 390×844 y 360×740**:

- `document.documentElement.scrollWidth <= window.innerWidth` (sin overflow horizontal).
- Teclado: composición centrada (±4px), sin teclas superpuestas (SAT sobre los polígonos rotados), todas clickeables en centro y puntos internos (Enter incluido), lado ≥ 56px (360 y 390), captions de 0px o ≥ 10px, fold completo a 1440×810 (Enter incluido).
- Hero: línea "Encarnación, Paraguay" sobre el titular; botón "Escribime por WhatsApp" solo por debajo de 700px, debajo del teclado y dentro del primer pantallazo (390×844 y 360×740); el CTA sticky aparece recién después del hero.
- Cero errores de consola y cero requests fallidas (404).
- Todas las teclas tienen `href` y nombre accesible; el Enter es clickeable en su área expuesta (click en coordenadas reales).
- No existe `contenteditable` en el DOM.
- Guardar screenshots full-page en `.checks/<viewport>.png` para que yo los revise.
- Con `reducedMotion: 'reduce'`: el teclado no anima y el marquee es estático.

Verificación manual que tenés que hacer y reportar: ver al menos un ciclo completo del teclado (incluido Enter) y del marquee sin saltos; probar hover/press del Enter; probar filtros desde teclas y desde chips; probar los links de WhatsApp y email.

---

## 12. Fases

- **Fase 0 — Base:** proyecto Astro + TS, fuentes, tokens, `site.ts`, schema de la colección, archivos de proyectos con el contenido de 8.2, scripts de npm, `check-layout.mjs` mínimo, `CLAUDE.md`, `docs/DECISIONS.md`. **Parar.**
- **Fase 1 — Hero:** header, titular, CTAs, teclado completo (geometría, estados, animación, escalado) y marquee. Verificar en todos los viewports. **Parar.**
- **Fase 2 — Proyectos:** destacados, grid con filtros, conexión con teclas, páginas de caso, placeholders. **Parar.**
- **Fase 3 — Resto:** servicios, proceso, sobre mí, contacto, CTA sticky, footer. **Parar.**
- **Fase 4 — Pulido y entrega:** script de capturas, imágenes OG, SEO, auditoría Lighthouse y a11y, README, deploy a Vercel. Listar todos los `TODO:` pendientes en el resumen final.

---

## 13. README

Breve: cómo instalar y correr (`npm i`, `npm run dev`, `build`, `check:layout`, `shots`), **dónde cambiar WhatsApp/email/redes (`src/config/site.ts`)**, cómo agregar un proyecto nuevo (copiar un `.md` de `src/content/projects/`), cómo regenerar capturas, y una línea de crédito: "Diseño del hero inspirado en un prompt de ui.debbie (uso personal)."
