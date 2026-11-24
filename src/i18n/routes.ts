export type Locale = 'es' | 'en';
export type AlternateRoutes = Record<Locale, string>;

export const localeOf = (value?: string): Locale => value === 'en' ? 'en' : 'es';

export const homeHref = (locale: Locale = 'es') => locale === 'en' ? '/en/' : '/';

export const caseHref = (slug: string, locale: Locale = 'es') =>
  (locale === 'en' ? '/en/projects/' : '/proyectos/') + slug + '/';
