# Portfolio — Brian "Leki" Leckie

Sitio estático (Astro 5 + TypeScript, salida SSG) para conseguir clientes: proyectos reales, contacto por WhatsApp y una página con preview propio por cada proyecto. Deploy en Vercel. La fuente de verdad del diseño y las reglas es [`docs/SPEC.md`](docs/SPEC.md); las decisiones tomadas están en [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Instalar y correr

```bash
npm i
npm run dev            # servidor de desarrollo
npm run build          # build estático en dist/ (antes lista los TODO pendientes)
npm run preview        # sirve dist/ en local
npm run typecheck      # astro check (tipos de .astro y .ts)
npm run check:layout   # verificación con Playwright contra el build (ver abajo)
npm run shots          # capturas de las demos (corre en tu máquina, ver abajo)
npm run todos          # lista los TODO: pendientes de config y proyectos
```

Playwright usa el Chromium de `npx playwright install chromium`.

## Dónde cambiar WhatsApp, email, redes y URL

Todo está en **`src/config/site.ts`**: nombre, WhatsApp (formato E.164 sin `+`), mensaje por defecto, email, GitHub, LinkedIn, Instagram y **`url`** (la URL pública del sitio).

- Un valor vacío o que empiece con `TODO:` hace que esa pieza **no se renderice**; el sitio nunca muestra "TODO".
- `url` es el único lugar con el dominio: de ahí salen `site` de `astro.config.mjs`, los canonical, las imágenes Open Graph, el sitemap, `robots.txt` y el JSON-LD. Al cambiar de dominio se edita **una línea**.
- Los servicios se ordenan en `src/config/services.ts` y sus textos están en el diccionario de UI.

## Agregar un proyecto

1. Copiá un archivo de `src/content/projects/` (por ejemplo `lhoney.md`) con el slug nuevo como nombre: la URL será `/proyectos/<slug>/`.
2. Completá el frontmatter (el schema valida los campos en el build): `title`, `summary`, `category` (`web`, `sistemas`, `integraciones`, `it`, `academico`), `status` (`en-produccion`, `entregado`, `en-desarrollo`, `demo`, `academico`), `featured`, `order`, `clientGeneric`, `role`, `stack`, `highlights`, `year`, `accent`, y opcionalmente `demoUrl`, `repoUrl`, `results`, `cover`/`coverMobile`, `links` y `preview`.
3. El cuerpo del `.md` es el caso de estudio: Contexto → Problema → Qué construí → Decisiones técnicas → Resultado.

`links` agrega botones "Ver <label> ↗" (se abren en pestaña nueva; nunca se muestra la URL cruda):

```yaml
links:
  - label: "Rocío Florería"
    url: "https://rociofloreria.vercel.app"
```

`preview` elige qué captura va en cada marco cuando el proyecto tiene varios sitios (ver abajo): `preview: { desktop: ornella, mobile: rocio }`.

`flow` es para proyectos **sin interfaz gráfica** (backend, integraciones, modelos): en lugar del placeholder muestra un diagrama "Cómo funciona" (3–4 pasos, con ramas opcionales). Su texto sale del frontmatter y el schema rechaza TODO y porcentajes en el diagrama.

```yaml
flow:
  steps:
    - label: "Bistrosoft"
      detail: "Sistema de gestión del local"
      icon: sistema        # sistema, datos, codigo, servidor, tienda, mapa, modelo, precio, despliegue, sucursal
    - label: "Interfaz abstracta"
      icon: codigo
      code: true           # las ramas se muestran como código
      branches:
        - { label: "ExcelSource", detail: "exportaciones de Excel" }
        - { label: "ApiSource", detail: "API de Bistrosoft" }
  note: "Texto corto opcional al pie"
```

Reglas: el estado se muestra tal cual (nunca se mejora); `results` solo con datos reales; `clientNamePublic: false` hasta tener permiso del cliente. Cualquier campo o párrafo que empiece con `TODO:` se oculta (y un heading que quede vacío también). Los destacados (`featured: true`) se ordenan por `order`.

## Diseño Editorial

La maqueta aprobada está en `docs/design/editorial/`. Los estilos compartidos viven en `src/styles/`. La home organiza los trabajos en casos destacados y archivo. Los enlaces antiguos con `?cat=` llevan a la misma home con todos los trabajos.

## Capturas de las demos (`npm run shots`)

```bash
npm run shots                # todos los proyectos con demoUrl
npm run shots -- mbarete     # solo algunos slugs
npm run shots -- --full-only mbarete  # solo las vistas de página completa
```

Captura cada sitio (`demoUrl` y cada `links[].url`) a 1440×900 y 390×844 (deviceScaleFactor 2), convierte a WebP con `sharp` y guarda en `src/assets/projects/<slug>/`:

- un solo sitio por proyecto → `desktop.webp` y `mobile.webp` (el sitio las toma solo, sin editar el `.md`);
- varios sitios por proyecto → `desktop-<clave>.webp` y `mobile-<clave>.webp`, con `<clave>` = primera palabra del label sin tildes y en minúsculas (`Rocío Florería` → `rocio`). El `.md` elige cuál va en cada marco con `preview`; si falta un archivo, ese marco simplemente no se muestra.

Si el `.md` tiene `cover`/`coverMobile`, esa imagen manual tiene prioridad. También podés soltar capturas propias con esos nombres: para que queden parejas, **desktop ≈2,2:1** (ej. 1440×655) y **mobile ≈9:16 a 9:19,5** (ej. 738×1326 o 390×844 a @2x); otra proporción se recorta desde arriba sin deformarse.

La home muestra capturas grandes en AVIF y WebP. En escritorio se pueden ver juntas las vistas de escritorio y celular. En mobile se muestra la de celular, con Rocío y Ornella lado a lado. El caso incluye todas las vistas disponibles. Para agregar una galería secundaria, usá `desktop-alt.webp` y `mobile-alt.webp`, o `desktop-alt-<clave>.webp` y `mobile-alt-<clave>.webp` en proyectos con variantes.

Las vistas de página completa se guardan como `mobile-full.webp` y `desktop-full.webp`, con sufijo del sitio cuando corresponde. Se capturan a 390 y 1440 px de viewport y se limitan a 6.000 y 5.000 px CSS de alto. Mbarete usa el panel de la demo pública para estas vistas.

El script necesita salida a internet hacia las demos, así que se corre en tu máquina (en el entorno de cloud de Claude Code las demos están bloqueadas por la política de red).

## Imágenes Open Graph

Se generan en el build (`src/pages/og/[slug].png.ts`): una por proyecto (`/og/<slug>.png`) y una para la home (`/og/home.png`), de 1200×630. Usan `satori` (SVG) + `@resvg/resvg-js` (PNG), que corren en Vercel sin servidor. Fuentes: `src/assets/fonts/Satoshi-Black.ttf`, Inter desde `@fontsource` (`woff`; satori no lee `woff2`). Son de colores planos para que pesen < 300 KB, porque WhatsApp ignora previews pesados.

## Verificación

`npm run typecheck` verifica los tipos. `npm run build && npm run check:layout` sirve el build en local y usa Chromium con Playwright.

- Home en seis tamaños, desde 360×740 hasta 1440×1002, y todos los casos en 390×844 y 1440×900. Verifica overflow, errores de consola, recursos e imágenes.
- Índice de trabajos, nombre accesible y efecto de tipeo del título, navegación móvil, teléfono del hero, composiciones de dispositivos, reloj de Contacto, foco y movimiento reducido.
- Texto principal desde 14px, enlaces de al menos 44×44, un CTA de WhatsApp durante el scroll, home de hasta 8.000px y comienzo del primer caso con un scroll a 390×844.
- Rutas públicas, ausencia de drafts y TODO, estados, enlaces, SEO, Open Graph, robots y sitemap.

Deja capturas en `.checks/` (no se versionan). Lighthouse mobile sobre el build:

```bash
npm run build && npm run preview -- --port 4323 &
CHROME_PATH=/ruta/a/chromium npx lighthouse http://localhost:4323/ --form-factor=mobile --view
```

También se puede correr PageSpeed Insights sobre el preview de Vercel.

## Deploy

Vercel detecta Astro solo. `vercel.json` fija `trailingSlash: true` para que las URL coincidan con los canonical y el sitemap. Para un dominio nuevo: cambiar `url` en `src/config/site.ts` y volver a desplegar (los previews de WhatsApp ya cacheados se renuevan con el depurador de links de Facebook/Meta).

## Créditos

El sitio carga Schibsted Grotesk e IBM Plex Mono de forma local mediante `@fontsource`. Las imágenes Open Graph usan Satoshi e Inter.


### Idiomas y experiencia

El sitio publica español en `/` y reserva `/en/` para la versión inglesa. Los textos de interfaz viven en `src/i18n/ui.ts`. El selector se habilita con `site.enableEnglish` cuando se publican las páginas equivalentes.

Las entradas de Experiencia se editan en `src/config/experience.ts`, con texto en ambos idiomas.

En el frontmatter de proyectos, `draft: true` excluye el proyecto de publicación. `inGrid: false` conserva su página y la omite del grid. `subtitle` separa el subtítulo del título. Si se omite, se conserva el subtítulo después de la raya en títulos anteriores.
