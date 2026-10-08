import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkStripTodo } from './src/lib/remark-strip-todo.mjs';
import { site } from './src/config/site.ts';

// La URL del sitio vive solo en src/config/site.ts (site.url).
export default defineConfig({
  output: 'static',
  site: site.url,
  trailingSlash: 'always',
  // CSS inline: sin requests que bloqueen el render (el sitio es una sola página + casos)
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkStripTodo],
  },
});
