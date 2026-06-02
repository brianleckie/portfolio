// src/data/projects.js
// Contenido del rediseño de portfolio. Strings en español (ES).
// Si querés ES/EN, mové los textos a tu translations.js y referencialos acá.

export const hero = {
  eyebrow: 'Ingeniero de Software Full-Stack',
  headline: 'Construyo sistemas digitales escalables para el crecimiento de tu negocio',
  subtitle:
    'Diseño y desarrollo productos full-stack de punta a punta — de interfaces en React a backends robustos en Python/FastAPI. Pensados para escalar, automatizar y rendir.',
  tags: ['React', 'Python', 'FastAPI', 'PostgreSQL'],
};

// Proyectos "grandes" (monitor + iPhone superpuesto), en orden.
export const projects = [
  {
    key: 'estacion',
    accent: '#3aa64a',
    accentSoft: 'rgba(58,166,74,0.22)',
    index: '01',
    name: 'Estación de Carretera',
    role: 'Project Lead',
    badge: 'Proyecto público · Inaugurado Nov 2024',
    desc: 'Marketplace y showroom digital para los emprendedores de Hohenau, sobre el modelo japonés Michi-no-eki. Conecta artesanos y productores con compradores, con dashboards de vendedor y gestión de pedidos.',
    note: 'Iniciativa de la Municipalidad de Hohenau — inaugurada con la presencia del Pdte. Santiago Peña.',
    metrics: [{ num: '100%', label: 'hecho en Itapúa, Paraguay' }],
    tags: ['React', 'Python', 'REST API', 'PostgreSQL'],
    href: 'https://www.estaciondecarretera.store',
    hrefLabel: 'estaciondecarretera.store',
    desktop: '/images/estacion.jpeg',
    desktopUrl: 'estaciondecarretera.store',
    mobile: '/images/estacion-mobile.jpeg',
  },
  {
    key: 'mbarete',
    accent: '#ef4136',
    accentSoft: 'rgba(239,65,54,0.20)',
    index: '02',
    name: 'Mbarete',
    role: 'Fundador & Lead Developer',
    badge: null,
    desc: 'Sistema integral para gimnasios chicos: socios, cuotas, kiosco, cierre de caja y avisos por WhatsApp en una sola app. Reemplaza el Excel y el ERP caro — pensado para boxes y estudios que no quieren contratar a otra persona.',
    note: null,
    metrics: [{ num: '3', label: 'gimnasios operando en producción' }],
    tags: ['React', 'FastAPI', 'PostgreSQL', 'Python'],
    href: 'https://www.mbarete.fit',
    hrefLabel: 'mbarete.fit',
    desktop: '/images/mbarete.jpeg',
    desktopUrl: 'app.mbarete.fit',
    mobile: '/images/mbarete-mobile-landing.jpeg',
  },
];

// Caso "Presencia digital de marca": header + dos showcases a ancho completo.
export const brandcase = {
  eyebrow: 'Caso · Presencia digital de marca',
  title: 'Dos marcas, dos universos — la misma mano que los construye',
  sub: 'Diseño y desarrollo la presencia digital completa de marcas de moda paraguayas: identidad, tienda online, catálogo y checkout por WhatsApp. Del archivo oscuro y editorial de Kevjer al universo cálido y hecho a pedido de Felinas.',
  brands: [
    {
      key: 'kevjer',
      accent: '#d8624c',
      accentSoft: 'rgba(216,98,76,0.20)',
      name: 'KEVJER.',
      tagline: 'Archivo · Second hand',
      desc: 'Dealer atemporal de piezas de archivo, originales y second hand. Catálogo con carrito multi-producto, modal de detalle por prenda, checkout directo a WhatsApp y panel admin con autenticación.',
      tags: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind'],
      href: 'https://kevjer.vercel.app/',
      desktop: '/images/kevjer.jpeg',
      desktopUrl: 'kevjer.vercel.app',
      mobile: '/images/kevjer-mobile.jpeg',
    },
    {
      key: 'felinas',
      accent: '#2ba596',
      accentSoft: 'rgba(43,165,150,0.20)',
      name: 'felinas.',
      tagline: 'Hecho a pedido',
      desc: 'Accesorios de satén, ropa y detalles hechos con cariño en Paraguay. Catálogo por categorías, productos disponibles y bajo pedido, y pedido fácil por WhatsApp con envíos a todo el país.',
      tags: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind'],
      href: 'https://felinas.vercel.app/',
      desktop: '/images/felinas.jpeg',
      desktopUrl: 'felinas.vercel.app',
      mobile: '/images/felinas-mobile.jpeg',
    },
  ],
};

// Proyecto en fila estándar (solo desktop).
export const row = {
  key: 'jopoi',
  accent: '#3b82f6',
  accentSoft: 'rgba(59,130,246,0.20)',
  index: '04',
  name: 'Mercado Jopoi',
  role: 'Full-Stack Developer',
  desc: 'Marketplace C2C para la comunidad universitaria — comprar, vender y cambiar libros, apuntes, equipos y servicios directo de tu facultad. Inventario en vivo, chat en tiempo real y feed dinámico con WebSockets.',
  tags: ['React', 'FastAPI', 'WebSockets', 'Python'],
  href: 'https://www.mercadojopoi.lat',
  hrefLabel: 'mercadojopoi.lat',
  desktop: '/images/jopoi.jpeg',
  desktopUrl: 'mercadojopoi.lat',
};

export const about = {
  name: 'Brian Leckie',
  role: 'Full-Stack Software Engineer · Paraguay',
  bio: 'Diseño y construyo productos full-stack de punta a punta — de interfaces en React a backends en Python/FastAPI. Trabajo con marcas y emprendedores para llevar tanto su operación como su presencia digital de cero a producción: SaaS, marketplaces y tiendas online.',
  photo: '/images/brian.jpeg', // ← reemplazá por tu foto
  links: [
    { label: 'WhatsApp', href: 'https://wa.me/595983763890' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/brianleckie' },
    { label: 'GitHub', href: 'https://github.com/brianleckie' },
    { label: 'Email', href: 'mailto:leckiebrian19@gmail.com' },
  ],
};

export const contact = {
  eyebrow: 'Hablemos',
  title: 'Construyamos algo escalable.',
  actions: [
    { label: 'Enviar mensaje', href: 'mailto:leckiebrian19@gmail.com', primary: true },
    { label: 'WhatsApp', href: 'https://wa.me/595983763890' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/brianleckie' },
    { label: 'GitHub', href: 'https://github.com/brianleckie' },
  ],
};

export const footer = {
  name: 'Brian Leckie',
  note: '© 2026 — Ingeniero de Software',
};
