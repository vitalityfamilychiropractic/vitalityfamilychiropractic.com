import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Generated so the sitemap URL can never drift from `astro.config.mjs`. */
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
