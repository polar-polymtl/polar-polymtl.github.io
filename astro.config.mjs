// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Deployed as a GitHub Pages *user/org site* at the root (no `base` needed),
  // served on the custom domain declared in `public/CNAME`. This drives the
  // canonical + hreflang URLs in BaseLayout, so it must match that domain.
  site: 'https://polarlab.ca',
  // Bilingual: English at the root (/…), French under /fr/…
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    format: 'directory',
  },
});
