import { site } from './site';

type Localized = { es: string; en: string };
interface ExperienceEntry {
  title: Localized;
  context?: Localized;
  date: Localized;
  datetime: string;
  ongoing?: boolean;
  description: Localized;
  external?: string;
  project?: string;
}

export const experience: ExperienceEntry[] = [
  {
    title: { es: 'Software Developer — Klien IT Systems', en: 'Software Developer — Klien IT Systems' },
    context: { es: 'Países Bajos, remoto · media jornada', en: 'Netherlands, remote · part-time' },
    date: { es: 'ago 2026', en: 'Aug 2026' },
    datetime: '2026-08',
    ongoing: true,
    description: {
      es: 'Desarrollo de software en inglés.',
      en: 'Software development in English.',
    },
  },
  {
    title: { es: 'Co-founder y Team Leader — CPO Tech', en: 'Co-founder and Team Leader — CPO Tech' },
    context: { es: 'Paraguay', en: 'Paraguay' },
    date: { es: 'oct 2026', en: 'Oct 2026' },
    datetime: '2026-10',
    ongoing: true,
    description: {
      es: 'Fundada entre 7 colegas. Lidero el equipo técnico.',
      en: 'Software company founded by 7 colleagues. I lead the technical team.',
    },
    external: site.cpoTechUrl,
  },
  {
    title: { es: 'Desarrollo independiente', en: 'Independent development' },
    context: { es: 'Paraguay', en: 'Paraguay' },
    date: { es: '2026', en: '2026' },
    datetime: '2026',
    ongoing: true,
    description: {
      es: 'Catálogos, sistemas e integraciones para negocios.',
      en: 'Catalogs, systems and integrations for businesses — the projects on this site.',
    },
  },
  {
    title: { es: 'Soporte técnico — Grupo Empresarial Franz', en: 'Technical Support — Grupo Empresarial Franz' },
    context: { es: 'Paraguay', en: 'Paraguay' },
    date: { es: '2026', en: '2026' },
    datetime: '2026',
    description: {
      es: 'Acceso remoto en 15 sucursales, permisos por departamento en NAS y FortiClient.',
      en: 'Corporate remote access across 15 branches, per-department NAS permissions and FortiClient rollouts.',
    },
    project: 'it-sucursales',
  },
  {
    title: {
      es: 'Ingeniería en Informática — Universidad Católica, Campus Itapúa',
      en: 'Computer Engineering — Universidad Católica, Campus Itapúa',
    },
    date: { es: 'egreso estimado 2027', en: 'expected graduation 2027' },
    datetime: '2027',
    description: { es: 'Último año de la carrera.', en: 'Computer Engineering — final year, expected 2027.' },
  },
];
