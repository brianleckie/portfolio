# SPEC — Portfolio de Brian "Leki" Leckie

> Cómo usar este archivo con Claude Code: guardalo en el repo como `docs/SPEC.md`, creá un `CLAUDE.md` corto que diga "La fuente de verdad del proyecto es docs/SPEC.md. Trabajá por fases y no avances de fase sin mi OK", y arrancá con: **"Leé docs/SPEC.md completo, armá un plan para la Fase 0 y ejecutala."**

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

La estética (teclado pastel, tipografía gigante, marquee editorial) es el gancho memorable. Los proyectos y el contacto son lo que vende.

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

### Titular (saltos de línea intencionales)
> **"Hola, soy Brian."** / **"Hago webs y sistemas"** / **"que *trabajan* para tu negocio."**

- "trabajan" en Instrument Serif italic con color de acento.
- Desktop: ~72–96px según largo de línea, line-height 1.02–1.08, tracking ajustado pero legible. Mobile: ~38–46px fluido con `clamp()`. Que envuelva natural sin recortes ni letras pisadas.

### Bajada y CTAs (debajo del titular)
- Una línea en Inter, ~18–20px: "Desarrollador full-stack en Encarnación, Paraguay. Catálogos con pedido por WhatsApp, sistemas a medida e integraciones."
- Dos botones: **"Ver proyectos"** (ancla a `#proyectos`) y **"Escribime por WhatsApp"** (primario). Altura mínima 44px.

### Teclado (el objeto visual más fuerte)
Debe quedar cerca del titular, integrado al hero, sin espaciadores vacíos ni márgenes negativos que se rompan en mobile.

**Composición:** 9 teclas normales + 1 Enter alta, como una sola pieza táctil.
- Fila superior: **L, E, K, I**. Fila inferior: **W, O, R, K, S**. (Se lee "LEKI WORKS".)
- Sistema de coordenadas desktop: **900 × 312px**.
- Tecla normal: **146 × 161px**.
- Fila superior en y=0, x = **73, 219, 365, 511**.
- Fila inferior en y=139, x = **0, 146, 292, 438, 584** (se superpone levemente a la superior).
- Enter en x=**657**, y=0, **218 × 300px**, ocupa ambas filas a la derecha. La última tecla (S) se superpone a la parte izquierda del Enter.
- El área expuesta del Enter debe seguir siendo clickeable: ninguna capa decorativa ni tecla superpuesta puede bloquearla.

**Teclas, colores (cara / base), caption y destino, en orden de lectura:**

| Tecla | Cara | Base | Caption | Destino |
|---|---|---|---|---|
| L | `#a9ddff` | `#3886c9` | PROYECTOS | `#proyectos` |
| E | `#d9f28f` | `#7aa52d` | SERVICIOS | `#servicios` |
| K | `#ffb7d5` | `#d94f8a` | STACK | `#sobre-mi` (bloque stack) |
| I | `#c8b6ff` | `#7153c7` | SOBRE MÍ | `#sobre-mi` |
| W | `#ffd98e` | `#d28a24` | WEBS Y CATÁLOGOS | `#proyectos` + filtro `web` |
| O | `#b9f2df` | `#2caa85` | SISTEMAS | `#proyectos` + filtro `sistemas` |
| R | `#ffc3a0` | `#d96c44` | INTEGRACIONES | `#proyectos` + filtro `integraciones` |
| K | `#c6d7ff` | `#5a78c9` | MI PROCESO | `#proceso` |
| S | `#f4b8ff` | `#a34cbf` | IT Y SOPORTE | `#proyectos` + filtro `it` |
| Enter | `#9be7a8` | `#25a244` | HABLEMOS | WhatsApp |

- Todas las teclas son **anchors reales** (`<a href>`), con nombre accesible igual al caption (ej. "Webs y catálogos"). Las de filtro llevan `data-filter`; con JS aplican el filtro y hacen scroll; sin JS igual llevan a `#proyectos`.
- El Enter abre WhatsApp en pestaña nueva (`rel="noopener"`), nombre accesible "Hablemos por WhatsApp".

**Anatomía de cada tecla:**
- Contorno oscuro de 2px, radio exterior ~38px, pared lateral más oscura (la base), sombra inferior dura de 5px negra.
- Cara elevada con contorno de 2px y radio ~29px, inset ~10px horizontal, dejando ~33px de base visible abajo.
- Costuras finas en ángulo entre cara y base. Costuras e íconos con `pointer-events: none`.
- Letra negra ~70–76px, Satoshi 900, tracking ajustado. Caption ~10–12px (en la composición sin escalar) que entre en la cara.
- Enter: símbolo grande de "return" y caption vertical "HABLEMOS" sobre el lado derecho.

**Animación automática:**
- Presiona y suelta en orden: L, E, K, I, W, O, R, K, S, **Enter** (Enter participa).
- En cada press: cara baja ~12–14px, base ~3–5px. Mantener un instante, soltar suave, avanzar cada ~300–380ms. Después del Enter, pausa de reposo antes de repetir. Nunca dejar una tecla trabada abajo.
- Hover (solo con `@media (hover: hover)`) y foco de teclado: la cara baja ~8px en ~180ms. Press activo: la base baja ~5px.
- Pausar la secuencia: durante interacción con puntero, con una tecla enfocada, con la pestaña oculta (`visibilitychange`) y **cuando el teclado sale del viewport** (`IntersectionObserver`). Reanudar limpio.
- Sin botón visible de pausa. `prefers-reduced-motion: reduce` → sin movimiento automático, controles estáticos usables, sin flashes.
- Limpiar timers/observers correctamente.

**Escalado responsive (crítico para mobile):**
- `scale = min(1, anchoDisponible / 900)`, calculado por el ancho real del contenedor (ResizeObserver o `container queries` + CSS). Nunca una escala fija por breakpoint que haga la composición más ancha que la pantalla.
- El wrapper debe tener altura = `312 × scale` (+ holgura para sombra y focus ring) para que el contenido siguiente fluya bien.
- Ejemplo: 390px de viewport con 20px de padding → 350px → scale ≈ 0.389.
- **Cuando scale < 0.6 ocultar visualmente los captions** de las teclas (quedarían ilegibles a ~4px); el nombre accesible se mantiene. Las letras siguen visibles.
- Hit areas mínimas 24×24, apuntando a 44×44 donde se pueda. La navegación normal y los CTAs del hero son la ruta principal en mobile; el teclado ahí es gancho visual clickeable.

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
- El teclado nunca es más ancho que su contenedor y la altura del wrapper coincide con la composición escalada.
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
