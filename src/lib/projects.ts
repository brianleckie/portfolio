import { getCollection, type CollectionEntry } from 'astro:content';
import { site, whatsappHref } from '../config/site';
import { t } from '../i18n/ui';
import type { Locale } from '../i18n/routes';
import { clean, cleanList } from './todo';

export type Project = CollectionEntry<'projects'>;
export type Category = Project['data']['category'][number];
export type Flow = NonNullable<Project['data']['flow']>;

export const FILTER_IDS = ['all', 'web', 'sistemas', 'integraciones', 'it', 'academico'] as const satisfies readonly ('all' | Category)[];

export const slugOf = (p: Project) => p.id.replace(/\.md$/, '');
export const subtitleOf = (p: Project) =>
  p.data.subtitle ?? (p.data.title.split(' — ').slice(1).join(' · ') || undefined);

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeatured(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.inGrid && p.data.featured);
}

export async function getOthers(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.inGrid && !p.data.featured);
}

/** Texto de una línea para cards/meta. Si el resumen está en TODO usa el primer highlight (dato real). */
export function summaryOf(p: Project): string | null {
  return clean(p.data.summary) ?? cleanList(p.data.highlights)[0] ?? null;
}

/** Descripción para meta/OG: nunca queda vacía ni contiene TODO. */
export function descriptionOf(p: Project, locale: Locale = 'es'): string {
  return (
    clean(p.data.summary) ??
    t(locale).caseDescription.replace('{title}', shortTitle(p)).replace('{name}', site.name)
      .replace('{role}', t(locale).siteRole.toLowerCase()).replace('{location}', site.location)
  );
}

/** Parte principal del título (antes del " — "). */
export const shortTitle = (p: Project) => p.data.title.split(' — ')[0];

const STOPWORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'para', 'y', 'con', 'en', 'un', 'una']);

/** Iniciales para el placeholder (máx. 2 letras). */
export function initials(title: string): string {
  const words = title
    .split(' — ')[0]
    .split(/[\s.]+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()));
  const letters = words.slice(0, 2).map((w) => w[0].toUpperCase());
  return letters.join('') || title[0].toUpperCase();
}

export function projectWhatsappHref(p: Project, locale: Locale = 'es'): string {
  return whatsappHref(
    t(locale).projectMessage.replace('{title}', shortTitle(p)), locale,
  );
}

/** Features para chips: stack limpio, máx. 4 + "+N". */
export function stackChips(p: Project, max = 4): { shown: string[]; extra: number } {
  const stack = cleanList(p.data.stack);
  return { shown: stack.slice(0, max), extra: Math.max(0, stack.length - max) };
}
