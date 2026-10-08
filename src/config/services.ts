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

export const services: Service[] = [
  {
    id: 'webs',
    title: 'Webs y catálogos para negocios',
    description:
      'Catálogo con fotos, precios y pedido por WhatsApp, más un panel para que el negocio actualice sus productos.',
    filter: 'web',
    accent: '#ffd98e',
  },
  {
    id: 'sistemas',
    title: 'Sistemas a medida',
    description: 'Gestión, cobros, turnos, roles y permisos.',
    filter: 'sistemas',
    accent: '#b9f2df',
  },
  {
    id: 'integraciones',
    title: 'Integraciones y automatización',
    description: 'Conectar sistemas existentes (por ejemplo, gestión ↔ tienda online) y automatizar tareas.',
    filter: 'integraciones',
    accent: '#ffc3a0',
  },
  {
    id: 'it',
    title: 'IT y soporte para empresas',
    description: 'Acceso remoto, redes de sucursales, permisos y almacenamiento.',
    filter: 'it',
    accent: '#f4b8ff',
  },
];
