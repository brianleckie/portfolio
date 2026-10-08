import { getCollection, type CollectionEntry } from 'astro:content';
import { site, whatsappHref } from '../config/site';
import { clean, cleanList } from './todo';

export type Project = CollectionEntry<'projects'>;
export type Category = Project['data']['category'][number];

export const FILTERS: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'web', label: 'Webs y catálogos' },
  { id: 'sistemas', label: 'Sistemas' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'it', label: 'IT y soporte' },
  { id: 'academico', label: 'Académico' },
];

export const CATEGORY_IDS = FILTERS.filter((f) => f.id !== 'all').map((f) => f.id);

/** Estados tal cual están en los .md: nunca se "mejoran". */
export const STATUS_LABEL: Record<Project['data']['status'], string> = {
  'en-produccion': 'En producción',
  entregado: 'Entregado',
  'en-desarrollo': 'En desarrollo',
  demo: 'Demo',
  academico: 'Académico',
};

export const slugOf = (p: Project) => p.id.replace(/\.md$/, '');
export const caseHref = (p: Project) => `/proyectos/${slugOf(p)}/`;

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getFeatured(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured);
}

export async function getOthers(): Promise<Project[]> {
  return (await getProjects()).filter((p) => !p.data.featured);
}

/** Texto de una línea para cards/meta. Si el resumen está en TODO usa el primer highlight (dato real). */
export function summaryOf(p: Project): string | null {
  return clean(p.data.summary) ?? cleanList(p.data.highlights)[0] ?? null;
}

/** Descripción para meta/OG: nunca queda vacía ni contiene TODO. */
export function descriptionOf(p: Project): string {
  return (
    clean(p.data.summary) ??
    `Caso de estudio: ${p.data.title}. ${site.name}, ${site.role.toLowerCase()} en ${site.location}.`
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

export function projectWhatsappHref(p: Project): string {
  return whatsappHref(
    `Hola Brian, vi el proyecto "${shortTitle(p)}" en tu portfolio y quiero algo parecido para mi negocio.`,
  );
}

/** Features para chips: stack limpio, máx. 4 + "+N". */
export function stackChips(p: Project, max = 4): { shown: string[]; extra: number } {
  const stack = cleanList(p.data.stack);
  return { shown: stack.slice(0, max), extra: Math.max(0, stack.length - max) };
}
