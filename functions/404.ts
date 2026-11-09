/**
 * Cloudflare Pages serves `404.html` with status 200 when `/404` is requested
 * directly, which Google can read as a soft 404. Serve the same page with a
 * real 404 status. Unknown URLs are unaffected: Pages already returns 404.html
 * with status 404 for those.
 */

interface Env {
  ASSETS: { fetch: (input: string) => Promise<Response> };
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const page = await context.env.ASSETS.fetch(new URL('/404', context.request.url).toString());
  const headers = new Headers(page.headers);
  headers.set('X-Robots-Tag', 'noindex');
  return new Response(page.body, { status: 404, headers });
}
