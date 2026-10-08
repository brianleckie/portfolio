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
- **`check-layout.mjs`:** skeleton en Fase 0, implementación completa en Fase 4 per SPEC §11.
