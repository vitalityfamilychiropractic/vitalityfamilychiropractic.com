// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.vitalityfamilychiropractic.com',
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        // The office chooser is noindex, and 404 is not a page to advertise.
        return path !== '/' && !path.includes('/404');
      },
    }),
  ],
  build: {
    // Emit `/celebration/pricing/index.html` so URLs stay directory-style.
    format: 'directory',
  },
  compressHTML: true,
});
