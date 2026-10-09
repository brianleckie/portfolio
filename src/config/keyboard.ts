// Teclado del hero (SPEC §6). Acá vive el CONTENIDO en orden de lectura.
// Colores y geometría del arco viven en src/styles/tokens.css (fuente única): el CSS los usa directo
// y la imagen OG de la home los lee de ese mismo archivo con kbToken().
import tokensCss from '../styles/tokens.css?raw';

export interface KeyDef {
  id: string;
  letter: string;
  caption: string;
  href: string;
  filter: string | null;
}

/** Orden de lectura = orden del DOM = tabulación. Las 4 primeras son la fila de arriba. */
export const KEYS: KeyDef[] = [
  { id: 'L', letter: 'L', caption: 'PROYECTOS', href: '#proyectos', filter: null },
  { id: 'E', letter: 'E', caption: 'SERVICIOS', href: '#servicios', filter: null },
  { id: 'K1', letter: 'K', caption: 'STACK', href: '#stack', filter: null },
  { id: 'I', letter: 'I', caption: 'SOBRE MÍ', href: '#sobre-mi', filter: null },
  { id: 'W', letter: 'W', caption: 'WEBS Y CATÁLOGOS', href: '#proyectos', filter: 'web' },
  { id: 'O', letter: 'O', caption: 'SISTEMAS', href: '#proyectos', filter: 'sistemas' },
  { id: 'R', letter: 'R', caption: 'INTEGRACIONES', href: '#proyectos', filter: 'integraciones' },
  { id: 'K2', letter: 'K', caption: 'MI PROCESO', href: '#proceso', filter: null },
  { id: 'S', letter: 'S', caption: 'IT Y SOPORTE', href: '#proyectos', filter: 'it' },
];

/** El Enter abre WhatsApp: el href lo arma quien lo renderiza (whatsappHref()). */
export const ENTER = { id: 'Enter', caption: 'HABLEMOS' } as const;

/** Valor de `--<name>` en tokens.css. Si falta, falla el build (la OG nunca se desincroniza). */
export function kbToken(name: string): string {
  const match = tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`[keyboard] falta --${name} en src/styles/tokens.css`);
  return match[1].trim();
}

const num = (name: string) => Number.parseFloat(kbToken(name));

/** Arco desktop en u (mismas fórmulas que .key en Keyboard.astro). */
export const ARC = {
  pitch: num('kb-pitch'),
  tilt: num('kb-tilt'),
  sag: num('kb-sag'),
  row: num('kb-row'),
  y0: num('kb-y0'),
  enterW: num('kb-enter-w'),
  enterDy: num('kb-enter-dy'),
  w: num('kb-w'),
  h: num('kb-h'),
};

/** Centro (x desde el eje central, y desde el borde superior, en u) y rotación de KEYS[index]. */
export function keyPlacement(index: number) {
  const row = index < 4 ? 0 : 1;
  const i = row === 0 ? index - 1.5 : index - 6;
  return { x: i * ARC.pitch, y: ARC.y0 + row * ARC.row + ARC.sag * i * i, rotate: i * ARC.tilt };
}

export const keyColors = (id: string) => {
  const k = id.toLowerCase();
  return { face: kbToken(`key-${k}-face`), side: kbToken(`key-${k}-side`), ink: kbToken(`key-${k}-ink`) };
};
