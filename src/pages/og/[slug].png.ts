// Imágenes Open Graph 1200×630 generadas en el build (satori → SVG, resvg → PNG).
// Una por proyecto (/og/<slug>.png) y una para la home (/og/home.png).
// Las fuentes se leen con fs desde process.cwd(): el bundle de endpoints rompe las rutas
// relativas a import.meta.url. Colores planos para que el PNG pese poco (WhatsApp descarta previews pesados).
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { site } from '../../config/site';
import { getProjects, shortTitle, slugOf, summaryOf, type Project } from '../../lib/projects';
import { cleanList } from '../../lib/todo';

import { t } from '../../i18n/ui';

const ui = t('es');
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

let fontsPromise: Promise<unknown[]> | undefined;
function loadFonts() {
  const read = (...p: string[]) => readFile(path.join(process.cwd(), ...p));
  fontsPromise ??= Promise.all([
    read('src/assets/fonts/Satoshi-Black.ttf'),
    read('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
    read('node_modules/@fontsource/inter/files/inter-latin-600-normal.woff'),
  ]).then(([satoshi, inter400, inter600]) => [
    { name: 'Satoshi', data: satoshi, weight: 900, style: 'normal' },
    { name: 'Inter', data: inter400, weight: 400, style: 'normal' },
    { name: 'Inter', data: inter600, weight: 600, style: 'normal' },
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
            ui.status[data.status],
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

function homeCard(): OgNode {
  return div({
    width: W, height: H, padding: '56px 68px', flexDirection: 'column',
    justifyContent: 'space-between', background: '#f3efe6', color: '#17150f', fontFamily: 'Inter',
  }, [
    div({ borderBottom: '2px solid #17150f', paddingBottom: 22 }, wordmark(52)),
    div({ flexDirection: 'column', gap: 10 }, [
      div({ fontFamily: 'Satoshi', fontWeight: 900, fontSize: 138, letterSpacing: -7 }, site.name),
      div({ fontSize: 42 }, ui.siteRole),
    ]),
    div({ borderTop: '1px solid #d6cfbf', paddingTop: 18, fontSize: 23 }, site.location),
  ]);
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
