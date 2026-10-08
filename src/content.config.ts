import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
    year: z.number(),
    accent: z.string(),
  }),
});

export const collections = { projects };
