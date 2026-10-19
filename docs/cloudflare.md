# Cloudflare deployment

Production Worker: `new-biz-zucca100`. GitHub `feel2174/new-biz`, branch `main`.
Build: `pnpm run cf:build`; deploy: `pnpm run cf:deploy`.
Cloudflare Workers Builds installs dependencies from the lockfile.

The original Vercel project has no project or shared environment variables and
no cron jobs. Content is bundled from `content/posts.json`; WordPress is not
configured. No database or R2 was added. The OpenNext default does not persist
the ISR/data cache; configure persistent cache and tag invalidation before
enabling the optional WordPress integration. Server search/filter and OG API
continue to run in the Worker.

Next.js 16.4.1 is required by the current OpenNext adapter. The OG route uses the
Node runtime supported by the adapter. Existing 100-route Next build and
OpenNext bundle passed. Preview home, article, search, sitemap, SVG, and English
and Korean OG images returned 200; an unauthenticated revalidation request
returned 401. Existing tests: 52 passed, 5 traffic-gate assertions failed; those
source and test files were not changed by this migration.

Keep the Vercel project and deployments for rollback. Only disconnect its Git
integration after the production domain passes verification. DNS rollback also
requires Vercel service availability because the original account is paused.
