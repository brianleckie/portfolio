// Geometría y colores del teclado (SPEC §6). Lo usan Keyboard.astro y la imagen OG de la home.
export interface KeyDef {
  id: string;
  letter: string;
  caption: string;
  href: string;
  filter: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  face: string;
  base: string;
}

export const KEYS: KeyDef[] = [
  // Row 1 (y=0): L, E, K, I
  { id: 'L', letter: 'L', caption: 'PROYECTOS', href: '#proyectos', filter: null,
    x: 73, y: 0, w: 146, h: 161, face: '#a9ddff', base: '#3886c9' },
  { id: 'E', letter: 'E', caption: 'SERVICIOS', href: '#servicios', filter: null,
    x: 219, y: 0, w: 146, h: 161, face: '#d9f28f', base: '#7aa52d' },
  { id: 'K1', letter: 'K', caption: 'STACK', href: '#stack', filter: null,
    x: 365, y: 0, w: 146, h: 161, face: '#ffb7d5', base: '#d94f8a' },
  { id: 'I', letter: 'I', caption: 'SOBRE MÍ', href: '#sobre-mi', filter: null,
    x: 511, y: 0, w: 146, h: 161, face: '#c8b6ff', base: '#7153c7' },
  // Row 2 (y=139): W, O, R, K, S
  { id: 'W', letter: 'W', caption: 'WEBS Y CATÁLOGOS', href: '#proyectos', filter: 'web',
    x: 0, y: 139, w: 146, h: 161, face: '#ffd98e', base: '#d28a24' },
  { id: 'O', letter: 'O', caption: 'SISTEMAS', href: '#proyectos', filter: 'sistemas',
    x: 146, y: 139, w: 146, h: 161, face: '#b9f2df', base: '#2caa85' },
  { id: 'R', letter: 'R', caption: 'INTEGRACIONES', href: '#proyectos', filter: 'integraciones',
    x: 292, y: 139, w: 146, h: 161, face: '#ffc3a0', base: '#d96c44' },
  { id: 'K2', letter: 'K', caption: 'MI PROCESO', href: '#proceso', filter: null,
    x: 438, y: 139, w: 146, h: 161, face: '#c6d7ff', base: '#5a78c9' },
  { id: 'S', letter: 'S', caption: 'IT Y SOPORTE', href: '#proyectos', filter: 'it',
    x: 584, y: 139, w: 146, h: 161, face: '#f4b8ff', base: '#a34cbf' },
];

/** El Enter abre WhatsApp: el href lo agrega quien lo renderiza (whatsappHref()). */
export const ENTER = {
  id: 'Enter',
  letter: '↵',
  caption: 'HABLEMOS',
  x: 657, y: 0, w: 218, h: 300,
  face: '#9be7a8', base: '#25a244',
};
