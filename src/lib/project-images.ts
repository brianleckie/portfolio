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

/** Las portadas manuales ganan en la vista principal. Las demás se buscan por variante. */
export function projectImages(p: Project, options: { variant?: string; alternate?: boolean } = {}) {
  const slug = slugOf(p);
  const { variant, alternate = false } = options;
  function image(device: 'desktop' | 'mobile', cover?: ImageMetadata) {
    const selected = variant ?? p.data.preview?.[device];
    // Mbarete abre con la app; la landing queda como segunda vista.
    if (slug === 'mbarete' && !selected) {
      return alternate ? cover ?? findGenerated(slug, device) :
        findGenerated(slug, device, 'alt') ?? cover ?? findGenerated(slug, device);
    }
    const suffix = alternate ? (selected ? 'alt-' + selected : 'alt') : selected;
    return (!variant && !alternate ? cover : undefined) ?? findGenerated(slug, device, suffix);
  }
  return { desktop: image('desktop', p.data.cover), mobile: image('mobile', p.data.coverMobile) };
}

export function projectFullImages(p: Project, variants: { desktop?: string; mobile?: string } = {}) {
  const slug = slugOf(p);
  const image = (device: 'desktop' | 'mobile') => {
    const variant = variants[device] ?? p.data.preview?.[device];
    return findGenerated(slug, device, variant ? 'full-' + variant : 'full');
  };
  return { desktop: image('desktop'), mobile: image('mobile') };
}

/** Barra o botón fijo al pie de la captura mobile (se superpone en el teléfono del hero). */
export function projectStickyBar(p: Project, variant?: string) {
  const selected = variant ?? p.data.preview?.mobile;
  return findGenerated(slugOf(p), 'mobile', selected ? 'full-bar-' + selected : 'full-bar');
}
