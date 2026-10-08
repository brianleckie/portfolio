import type { ImageMetadata } from 'astro';
import type { Project } from './projects';
import { slugOf } from './projects';

// Capturas generadas por `npm run shots`: src/assets/projects/<slug>/{desktop,mobile}.webp
const generated = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/projects/*/*.{webp,jpeg,jpg,png}',
  { eager: true },
);

function findGenerated(slug: string, name: 'desktop' | 'mobile'): ImageMetadata | undefined {
  const key = Object.keys(generated).find((k) =>
    new RegExp(`^/src/assets/projects/${slug}/${name}\\.(webp|jpe?g|png)$`).test(k),
  );
  return key ? generated[key].default : undefined;
}

/** `cover`/`coverMobile` del frontmatter (curadas a mano) ganan sobre las capturas automáticas. */
export function projectImages(p: Project): { desktop?: ImageMetadata; mobile?: ImageMetadata } {
  const slug = slugOf(p);
  return {
    desktop: p.data.cover ?? findGenerated(slug, 'desktop'),
    mobile: p.data.coverMobile ?? findGenerated(slug, 'mobile'),
  };
}
