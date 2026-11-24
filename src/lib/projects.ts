import { getCollection, type CollectionEntry } from 'astro:content';
import { site, whatsappHref } from '../config/site';
import { t } from '../i18n/ui';
import type { Locale } from '../i18n/routes';
import { clean, cleanList } from './todo';

export type Project = CollectionEntry<'projects'>;
export type Flow = NonNullable<Project['data']['flow']>;

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

export function projectWhatsappHref(p: Project, locale: Locale = 'es'): string {
  return whatsappHref(
    t(locale).projectMessage.replace('{title}', shortTitle(p)), locale,
  );
}
