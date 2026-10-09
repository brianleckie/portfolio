import type { ImageMetadata } from 'astro';
import type { Project } from './projects';
import { slugOf } from './projects';

// Capturas generadas por `npm run shots`: src/assets/projects/<slug>/{desktop,mobile}.webp
// (o desktop-<clave>.webp / mobile-<clave>.webp cuando el proyecto tiene varios sitios; ver `preview` en el .md)
const generated = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/projects/*/*.{webp,jpeg,jpg,png}',
  { eager: true },
);

function findGenerated(slug: string, name: 'desktop' | 'mobile', variant?: string): ImageMetadata | undefined {
  const file = variant ? `${name}-${variant}` : name;
  const key = Object.keys(generated).find((k) =>
    new RegExp(`^/src/assets/projects/${slug}/${file}\\.(webp|jpe?g|png)$`).test(k),
  );
  return key ? generated[key].default : undefined;
}

/** `cover`/`coverMobile` del frontmatter (curadas a mano) ganan sobre las capturas automáticas. */
export function projectImages(p: Project): { desktop?: ImageMetadata; mobile?: ImageMetadata } {
  const slug = slugOf(p);
  return {
    desktop: p.data.cover ?? findGenerated(slug, 'desktop', p.data.preview?.desktop),
    mobile: p.data.coverMobile ?? findGenerated(slug, 'mobile', p.data.preview?.mobile),
  };
}
