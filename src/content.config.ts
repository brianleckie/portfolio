import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { FLOW_ICONS } from './lib/flow';

// Texto del diagrama: corto, sin TODO ni %, y sin palabras que no entren en un nodo angosto.
const flowText = (max: number, maxWord: number) =>
  z.string().trim().min(1).max(max)
    .refine((s) => !/TODO|%/.test(s), 'El diagrama no admite TODO ni porcentajes: solo datos reales.')
    .refine((s) => s.split(/\s+/).every((w) => w.length <= maxWord), `Palabras de hasta ${maxWord} caracteres (el nodo no corta palabras).`);

const flowBranch = z
  .union([flowText(22, 12), z.object({ label: flowText(22, 12), detail: flowText(32, 14).optional() })])
  .transform((b) => (typeof b === 'string' ? { label: b, detail: undefined } : b));

const flowStep = z.object({
  label: flowText(24, 12),
  detail: flowText(72, 14).optional(),
  icon: z.enum(FLOW_ICONS).optional(),
  code: z.boolean().default(false), // ramas como identificadores de código (monospace)
  branches: z.array(flowBranch).min(2).max(3).optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    category: z.array(z.enum(['web', 'sistemas', 'integraciones', 'it', 'academico'])),
    status: z.enum(['en-produccion', 'entregado', 'en-desarrollo', 'demo', 'academico']),
    featured: z.boolean().default(false),
    order: z.number(),
    client: z.string().optional(),
    clientNamePublic: z.boolean().default(false),
    clientGeneric: z.string(),
    role: z.string(),
    stack: z.array(z.string()),
    highlights: z.array(z.string()),
    results: z.array(z.string()).optional(),
    cover: image().optional(),
    coverMobile: image().optional(),
    demoUrl: z.string().url().optional(),
    links: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).optional(),
    // Claves que eligen desktop-<clave>.webp / mobile-<clave>.webp en src/assets/projects/<slug>/
    preview: z.object({ desktop: z.string().optional(), mobile: z.string().optional() }).optional(),
    repoUrl: z.string().url().optional(),
    // Esquema "Cómo funciona" para proyectos sin interfaz (se muestra si no hay capturas)
    flow: z.object({
      title: flowText(24, 14).default('Cómo funciona'),
      steps: z.array(flowStep).min(3).max(4),
      note: flowText(90, 14).optional(),
    }).optional(),
    year: z.number(),
    accent: z.string(),
  }),
});

export const collections = { projects };
