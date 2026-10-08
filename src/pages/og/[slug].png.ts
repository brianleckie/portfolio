// Imágenes Open Graph 1200×630 generadas en el build (satori → SVG, resvg → PNG).
// Una por proyecto (/og/<slug>.png) y una para la home (/og/home.png).
// Las fuentes se leen con fs desde process.cwd(): el bundle de endpoints rompe las rutas
// relativas a import.meta.url. Colores planos para que el PNG pese poco (WhatsApp descarta previews pesados).
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { KEYS, ENTER } from '../../config/keyboard';
import { site } from '../../config/site';
import { STATUS_LABEL, getProjects, shortTitle, slugOf, summaryOf, type Project } from '../../lib/projects';
import { cleanList } from '../../lib/todo';

const W = 1200;
const H = 630;
const INK = '#1d2033';
const MUTED = '#55586b';
const ACCENT = '#4f5bd5';

// Mantener en sync con los badges de src/styles/ui.css
const STATUS_COLORS: Record<Project['data']['status'], [string, string]> = {
  'en-produccion': ['#dcf5e1', '#14532d'],
  entregado: ['#dbeafe', '#1e3a8a'],
  'en-desarrollo': ['#fef3c7', '#78350f'],
  demo: ['#ede9fe', '#4c1d95'],
  academico: ['#fce7f3', '#831843'],
};

type Style = Record<string, string | number>;
type Child = OgNode | string | false | null | undefined;
interface OgNode {
  type: string;
  props: { style: Style; children?: Child | Child[] };
}

const div = (style: Style, children?: Child | Child[]): OgNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

let fontsPromise: Promise<unknown[]> | undefined;
function loadFonts() {
  const read = (...p: string[]) => readFile(path.join(process.cwd(), ...p));
  fontsPromise ??= Promise.all([
    read('src/assets/fonts/Satoshi-Black.ttf'),
    read('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
    read('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff'),
    read('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff'),
  ]).then(([satoshi, inter400, inter600, serif]) => [
    { name: 'Satoshi', data: satoshi, weight: 900, style: 'normal' },
    { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
    { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
    { name: 'Instrument Serif', data: serif, weight: 400, style: 'italic' },
  ]);
  return fontsPromise;
}

const host = new URL(site.url).hostname;

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

const wordmark = (size: number): OgNode =>
  div({ fontFamily: 'Satoshi', fontWeight: 900, fontSize: size, letterSpacing: -size * 0.03, color: INK, lineHeight: 1 }, [
    'leki',
    div({ color: ACCENT }, '.'),
  ]);

function projectCard(p: Project): OgNode {
  const { data } = p;
  const title = shortTitle(p);
  const summary = clamp(summaryOf(p) ?? '', 150);
  const chips = cleanList(data.stack).slice(0, 4);
  const [badgeBg, badgeFg] = STATUS_COLORS[data.status];
  const titleSize = title.length > 42 ? 64 : title.length > 26 ? 80 : 96;

  return div({ width: W, height: H, background: data.accent, padding: 36, fontFamily: 'Inter' }, [
    div(
      {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '4px solid #111111',
        borderRadius: 40,
        boxShadow: '0 10px 0 #000000',
        padding: '44px 56px',
      },
      [
        div({ justifyContent: 'space-between', alignItems: 'center' }, [
          wordmark(52),
          div(
            { background: badgeBg, color: badgeFg, fontSize: 26, fontWeight: 600, padding: '8px 22px', borderRadius: 999 },
            STATUS_LABEL[data.status],
          ),
        ]),
        div({ flexDirection: 'column', gap: 20 }, [
          div(
            { fontFamily: 'Satoshi', fontWeight: 900, fontSize: titleSize, lineHeight: 1.02, letterSpacing: -titleSize * 0.03, color: INK },
            title,
          ),
          summary && div({ fontSize: 30, lineHeight: 1.35, color: MUTED }, summary),
        ]),
        div({ justifyContent: 'space-between', alignItems: 'center' }, [
          div(
            { gap: 12 },
            chips.map((c) =>
              div({ border: '2px solid #bbbbc4', borderRadius: 999, padding: '6px 18px', fontSize: 24, fontWeight: 600, color: INK }, c),
            ),
          ),
          div({ fontSize: 24, color: MUTED }, host),
        ]),
      ],
    ),
  ]);
}

function keyNode(k: { x: number; y: number; w: number; h: number; face: string; base: string }, s: number, content: OgNode): OgNode {
  return div(
    {
      position: 'absolute',
      left: k.x * s,
      top: k.y * s,
      width: k.w * s,
      height: k.h * s,
      background: k.base,
      border: '3px solid #111111',
      borderRadius: 38 * s,
      boxShadow: '0 5px 0 #000000',
    },
    div(
      {
        position: 'absolute',
        left: 10 * s,
        right: 10 * s,
        top: 0,
        bottom: 33 * s,
        alignItems: 'center',
        justifyContent: 'center',
        background: k.face,
        border: '3px solid #111111',
        borderRadius: 29 * s,
      },
      content,
    ),
  );
}

function homeCard(): OgNode {
  const s = 0.75; // el teclado de 900×312 escalado
  const line = { fontFamily: 'Satoshi', fontWeight: 900, fontSize: 66, lineHeight: 1.05, letterSpacing: -2, color: INK, whiteSpace: 'pre' };

  const enter = keyNode(
    ENTER,
    s,
    div({ fontFamily: 'Inter', fontWeight: 600, fontSize: 20, letterSpacing: 5, color: '#111111', transform: 'rotate(90deg)' }, 'HABLEMOS'),
  );
  const keys = KEYS.map((k) =>
    keyNode(k, s, div({ fontFamily: 'Satoshi', fontWeight: 900, fontSize: 72 * s, color: '#111111' }, k.letter)),
  );

  return div(
    {
      width: W,
      height: H,
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: 'linear-gradient(160deg, #f7f9ff 0%, #ffffff 50%, #f3f0ff 100%)',
      padding: '56px 64px 64px',
    },
    [
      div({ flexDirection: 'column' }, [
        div(line, 'Hola, soy Brian.'),
        div(line, 'Hago webs y sistemas'),
        div({ alignItems: 'baseline' }, [
          div(line, 'que '),
          div({ ...line, fontFamily: 'Instrument Serif', fontWeight: 400, fontStyle: 'italic', fontSize: 76, color: ACCENT }, 'trabajan'),
          div(line, ' para tu negocio.'),
        ]),
      ]),
      div({ justifyContent: 'space-between', alignItems: 'flex-end' }, [
        div({ position: 'relative', width: 900 * s, height: 312 * s, flexShrink: 0 }, [enter, ...keys]),
        div({ flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }, [
          wordmark(112),
          div({ fontSize: 20, fontWeight: 600, color: MUTED, whiteSpace: 'nowrap' }, host),
        ]),
      ]),
    ],
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getProjects();
  return [
    { params: { slug: 'home' }, props: {} },
    ...projects.map((project) => ({ params: { slug: slugOf(project) }, props: { project } })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const fonts = await loadFonts();
  const tree = props.project ? projectCard(props.project as Project) : homeCard();
  // satori acepta este árbol de objetos (sin JSX)
  const svg = await satori(tree as never, { width: W, height: H, fonts: fonts as never });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
