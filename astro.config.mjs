// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.vitalityfamilychiropractic.com',
  integrations: [sitemap()],
  build: {
    // Emit `/celebration/pricing/index.html` so URLs stay directory-style.
    format: 'directory',
  },
  compressHTML: true,
});
