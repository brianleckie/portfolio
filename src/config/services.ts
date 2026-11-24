import { t } from '../i18n/ui';
import type { Locale } from '../i18n/routes';
import type { Category } from '../lib/projects';

export interface Service {
  id: string;
  title: string;
  description: string;
  /** Categoría de proyectos que filtra el link "Ver ejemplos". */
  filter: Category;
  /** Color de la cara de la tecla correspondiente. */
  accent: string;
  /** Opcional, ej. "Desde Gs. 1.500.000". Solo se muestra si `site.showPrices` es true. */
  fromPrice?: string;
}

export function getServices(locale: Locale): Service[] {
  const ui = t(locale);
  return [
    {
      id: 'webs',
      title: ui.websTitle,
      description: ui.websDescription,
      filter: 'web',
      accent: '#ffd98e',
    },
    {
      id: 'sistemas',
      title: ui.sistemasTitle,
      description: ui.sistemasDescription,
      filter: 'sistemas',
      accent: '#b9f2df',
    },
    {
      id: 'integraciones',
      title: ui.integracionesTitle,
      description: ui.integracionesDescription,
      filter: 'integraciones',
      accent: '#ffc3a0',
    },
    {
      id: 'it',
      title: ui.itTitle,
      description: ui.itDescription,
      filter: 'it',
      accent: '#f4b8ff',
    },
  ];
}
