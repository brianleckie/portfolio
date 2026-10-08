import { defineConfig } from 'astro/config';
import { remarkStripTodo } from './src/lib/remark-strip-todo.mjs';

export default defineConfig({
  output: 'static',
  site: 'https://brianleckie.dev',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkStripTodo],
  },
});
