// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Dev and `astro build` redirects. Cloudflare production uses `public/_redirects`,
 * which lists the same destinations (including the slash and `.html` forms).
 * A real page at the same path would override these, so the old routes are gone.
 *
 * @type {Record<string, { status: 301, destination: string }>}
 */
const redirects = {};

/** @param {string} from @param {string} to */
function redirect(from, to) {
  const destination = to.endsWith('/') ? to : `${to}/`;
  // One key only. Astro treats `/path` and `/path/` as the same route, and
  // Cloudflare `_redirects` lists both forms for production.
  const path = from.endsWith('/') ? from : `${from}/`;
  if (path === destination) return;
  redirects[path] = { status: 301, destination };
}

const offices = ['celebration', 'college-station'];

for (const office of offices) {
  const base = `/${office}`;
  redirect(`${base}/our-values`, `${base}/`);
  redirect(`${base}/pricing`, `${base}/new-patients/pricing-insurance/`);
  redirect(`${base}/new-pricing`, `${base}/new-patients/pricing-insurance/`);
  redirect(`${base}/team`, `${base}/meet-our-team/`);
  redirect(`${base}/team/christie-mclarty`, `${base}/meet-our-team/`);
  redirect(`${base}/specialties/pregnancy-care`, `${base}/our-care/prenatal/`);
  redirect(`${base}/specialties/pediatric-care`, `${base}/our-care/pediatric/`);
  redirect(`${base}/specialties/family-wellness-care`, `${base}/our-care/adult-family/`);
  redirect(`${base}/contacts`, `${base}/contact/`);
}

const collegeStation = '/college-station';
const rootAliases = [
  ['/our-care/prenatal', `${collegeStation}/our-care/prenatal/`],
  ['/our-care/newborn-infant', `${collegeStation}/our-care/newborn-infant/`],
  ['/our-care/pediatric', `${collegeStation}/our-care/pediatric/`],
  ['/our-care/adult-family', `${collegeStation}/our-care/adult-family/`],
  ['/our-care/massage-therapy', `${collegeStation}/our-care/massage-therapy/`],
  ['/massage-therapy', `${collegeStation}/our-care/massage-therapy/`],
  ['/meet-our-team', `${collegeStation}/meet-our-team/`],
  ['/our-community', `${collegeStation}/our-community/`],
  ['/our-community/classes-events', `${collegeStation}/our-community/classes-events/`],
  ['/our-community/community-partners', `${collegeStation}/our-community/community-partners/`],
  ['/new-patients/first-visit', `${collegeStation}/new-patients/first-visit/`],
  ['/new-patients/pricing-insurance', `${collegeStation}/new-patients/pricing-insurance/`],
  ['/our-values', `${collegeStation}/`],
  ['/pricing', `${collegeStation}/new-patients/pricing-insurance/`],
  ['/new-pricing', `${collegeStation}/new-patients/pricing-insurance/`],
  ['/team', `${collegeStation}/meet-our-team/`],
  ['/team/christie-mclarty', `${collegeStation}/meet-our-team/`],
  ['/specialties/pregnancy-care', `${collegeStation}/our-care/prenatal/`],
  ['/specialties/pediatric-care', `${collegeStation}/our-care/pediatric/`],
  ['/specialties/family-wellness-care', `${collegeStation}/our-care/adult-family/`],
  ['/contact', `${collegeStation}/contact/`],
  ['/contacts', `${collegeStation}/contact/`],
];
for (const [from, to] of rootAliases) redirect(from, to);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.vitalityfamilychiropractic.com',
  redirects,
  vite: {
    plugins: [
      {
        name: 'events-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const requestUrl = req.url ?? '';
            const path = requestUrl.split('?')[0];
            if (path !== '/api/events' && path !== '/api/events/') {
              next();
              return;
            }
            const url = new URL(requestUrl, 'http://127.0.0.1');
            server
              .ssrLoadModule('/src/lib/events-api.ts')
              .then(async (mod) => {
                const response = await mod.eventsResponse(url);
                res.statusCode = response.status;
                /** @type {Headers} */
                const headers = response.headers;
                headers.forEach((value, key) => {
                  res.setHeader(key, value);
                });
                res.end(Buffer.from(await response.arrayBuffer()));
              })
              .catch((error) => {
                next(error);
              });
          });
        },
      },
    ],
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.includes('/404');
      },
    }),
  ],
  build: {
    // Emit `/celebration/contact/index.html` so URLs stay directory-style.
    format: 'directory',
  },
  compressHTML: true,
});
