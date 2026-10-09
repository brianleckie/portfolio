// Imágenes Open Graph 1200×630 generadas en el build (satori → SVG, resvg → PNG).
// Una por proyecto (/og/<slug>.png) y una para la home (/og/home.png).
// Las fuentes se leen con fs desde process.cwd(): el bundle de endpoints rompe las rutas
// relativas a import.meta.url. Colores planos para que el PNG pese poco (WhatsApp descarta previews pesados).
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { KEYS, ENTER, ARC, kbToken, keyColors, keyPlacement } from '../../config/keyboard';
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
  props: { style?: Style; children?: Child | Child[]; [attr: string]: unknown };
}

const div = (style: Style, children?: Child | Child[]): OgNode => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

// ↵ como SVG (Satoshi no tiene el glifo); mismo trazo que el Enter de Keyboard.astro
const returnIcon = (color: string, width: number, height: number): OgNode => ({
  type: 'img',
  props: {
    src: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M54 5v21H12"/><path d="M24 13 11 26l13 13"/></svg>`,
    )}`,
    width,
    height,
    style: { alignSelf: 'flex-start' },
  },
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

const LINE = kbToken('kb-line');

// Misma anatomía que Keyboard.astro: el contenedor es la pared lateral y la cara va inset (0.05u / 0.085u / 0.2u abajo)
function ogKey(c: { face: string; side: string }, box: Style, rotate: number, u: number, content: Child | Child[]): OgNode {
  return div(
    {
      position: 'absolute',
      ...box,
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'center',
      background: c.side,
      border: `3px solid ${LINE}`,
      borderRadius: u * 0.22,
      boxShadow: `0 ${u * 0.05}px 0 ${LINE}`,
    },
    div(
      {
        position: 'absolute',
        left: u * 0.085,
        right: u * 0.085,
        top: u * 0.05,
        bottom: u * 0.2,
        alignItems: 'center',
        justifyContent: 'center',
        background: c.face,
        border: `3px solid ${LINE}`,
        borderRadius: u * 0.16,
      },
      content,
    ),
  );
}

// Composición centrada como el hero: pastilla "Brian", línea, y el teclado en arco leído de tokens.css (ARC)
function homeCard(): OgNode {
  const u = 104; // lado de la tecla en px de la imagen (composición ≈ 611×361)
  const stageW = ARC.w * u;
  const keys = KEYS.map((k, index) => {
    const { x, y, rotate } = keyPlacement(index);
    const c = keyColors(k.id);
    return ogKey(
      c,
      { left: stageW / 2 + (x - 0.5) * u, top: (y - 0.5) * u, width: u, height: u },
      rotate,
      u,
      div({ fontFamily: 'Satoshi', fontWeight: 900, fontSize: u * 0.44, lineHeight: 1, color: c.ink }, k.letter),
    );
  });

  const ec = keyColors('enter');
  const ew = ARC.enterW * u;
  const enter = ogKey(
    ec,
    { left: (stageW - ew) / 2, top: (ARC.y0 + ARC.row + ARC.enterDy - 0.5) * u, width: ew, height: u },
    0,
    u,
    div(
      { flexGrow: 1, alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end', padding: `${u * 0.08}px ${u * 0.12}px` },
      [
        returnIcon(ec.ink, u * 0.58, u * 0.4),
        div({ fontFamily: 'Inter', fontWeight: 600, fontSize: 17, letterSpacing: 2.4, color: kbToken('key-enter-caption') }, ENTER.caption),
      ],
    ),
  );

  const p = keyColors('E');
  const pill = div(
    { background: p.side, border: `3px solid ${LINE}`, borderRadius: 14, boxShadow: `0 4px 0 ${LINE}`, paddingBottom: 7, transform: 'rotate(-2deg)' },
    div({ background: p.face, borderRadius: 11, padding: '0 16px 2px', color: p.ink }, 'Brian'),
  );
  const pre = { whiteSpace: 'pre' };

  return div(
    {
      width: W,
      height: H,
      position: 'relative',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: kbToken('color-bg-hero'),
      backgroundSize: '24px 24px',
      backgroundImage: `radial-gradient(circle, ${kbToken('color-hero-dot')} 1.2px, transparent 1.8px)`,
    },
    [
      // Wordmark y host en las esquinas, fuera del recorte cuadrado que hace WhatsApp
      div({ position: 'absolute', left: 48, top: 36 }, wordmark(44)),
      div({ position: 'absolute', right: 48, bottom: 30, fontFamily: 'Inter', fontSize: 20, fontWeight: 600, color: MUTED }, host),
      div({ alignItems: 'center', gap: 18, fontFamily: 'Satoshi', fontWeight: 900, fontSize: 64, lineHeight: 1.1, letterSpacing: -1.9, color: INK }, [
        div({}, 'Hola, soy'),
        pill,
      ]),
      div({ marginTop: 10, alignItems: 'baseline', fontFamily: 'Inter', fontSize: 28, color: MUTED }, [
        div(pre, 'Hago webs y sistemas que '),
        div({ ...pre, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 34, color: ACCENT }, 'trabajan'),
        div(pre, ' para tu negocio.'),
      ]),
      div({ position: 'relative', marginTop: 26, width: stageW, height: ARC.h * u + 6, flexShrink: 0 }, [...keys, enter]),
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
