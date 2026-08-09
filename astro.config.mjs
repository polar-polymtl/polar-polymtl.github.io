// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Deployed as a GitHub Pages *user/org site* at the root (no `base` needed).
  // If you later move to the custom domain, change this to https://www.polarlab.ca
  site: 'https://polar-polymtl.github.io',
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
