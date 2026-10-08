import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
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
    demoUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    year: z.number(),
    accent: z.string(),
  }),
});

export const collections = { projects };
