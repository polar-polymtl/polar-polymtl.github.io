# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website for the **POLAR Lab** (Polytechnique Lab for Assistive and Rehabilitation Technologies), a research lab at Polytechnique Montréal led by Prof. Abolfazl Mohebbi. It is a rebuild of the lab's old Google Sites site (`polarlab.ca`). Built with **Astro 5** as a static, content-driven site — host-agnostic output that runs on any static host.

## Commands

Node is required (installed here via Homebrew — `/opt/homebrew/bin` must be on `PATH`; there is no nvm/system node).

```bash
npm run dev       # dev server with HMR at http://localhost:4321
npm run build     # static build into dist/
npm run preview   # serve the built dist/ locally
```

There is no test suite, linter, or formatter configured. "Verification" means `npm run build` succeeding and checking pages in the browser.

Note: this repo's `package.json` uses npm's `allowScripts` allowlist (esbuild, sharp, fsevents). After `npm install`, if install scripts are blocked, run `npm approve-scripts <pkg>` then reinstall — Astro's build needs esbuild's and sharp's postinstall to have run.

## Architecture

**Content is data, not markup.** Adding a person or project is a JSON edit, never an HTML change. The three data sources:

- `src/data/people.json` — the full lab roster. `group` (`director` | `postdoc` | `grad` | `cosupervised` | `undergrad` | `alumni-grad` | `intern` | `alumni-undergrad`) decides which section a person renders in on the People page; `order` sorts within a group. `photo` is optional (falls back to an auto-generated monogram avatar in `PersonCard.astro`). `links` is optional (`scholar`/`linkedin`/`x`/`github`) → social icons.
- `src/data/projects.json` — the 17 research projects. `name` is the card/badge label; `title` is the full title on the detail page (these differ deliberately — e.g. name `"INSTRUMENTED INSOLE"`, title `"Smart Instrumented Insole for…"`). `area` (`wearables` | `robots` | `neuro` | `assistive`) ties a project to a theme; `featured` surfaces it on the home page. Also: `description` (paragraph array), `team` (`{name, role, email}`), `publications` (string[]), `videos` (`{id, title}` YouTube), `images` (gallery), `thumb` (card image) — all rendered on the detail page.
- `src/data/areas.ts` — the four research themes (name, color CSS var, category `image`, SVG `icon` path). `area` values in projects.json must match these keys.
- `src/data/experiments.json` — the "Participate in Experiments" studies on the Opportunities page. Imported directly by `opportunities.astro` (not a content collection).

`src/content.config.ts` wires people.json and projects.json into Astro **content collections** via the `file()` loader with Zod schemas. Pages read them with `getCollection('people' | 'projects')`. When adding a JSON field, extend the Zod schema there first or the build fails.

**Routing.** Pages in `src/pages/` are file-routed. `src/pages/research/[id].astro` generates one detail page per project via `getStaticPaths()` over the projects collection — the route `id` is the project's collection id (its key in projects.json). `research/index.astro` groups projects by area; `people.astro` groups by `group`.

**Layout & components.** `src/layouts/BaseLayout.astro` is the shell (head/SEO, `Header`, `Footer`, global CSS, and the scroll-reveal script). Reusable pieces in `src/components/`: `ProjectCard`, `PersonCard`, `ResearchAreaCard`, `PartnerLogos`, `Logo`, `Hero`/`PageHero`. Styling is plain CSS — design tokens (colors, type scale, spacing) live in `:root` in `src/styles/global.css`; components use scoped `<style>` blocks. No CSS framework.

**Internationalization (English default + French).** Astro i18n is configured in `astro.config.mjs` (`defaultLocale: 'en'`, `locales: ['en','fr']`, `prefixDefaultLocale: false`) — English serves at `/…`, French at `/fr/…`. Architecture:
- `src/i18n/ui.ts` — all interface strings as `ui.en` / `ui.fr`, plus helpers: `useTranslations(lang)` → `t(key)` (falls back to English when a `fr` value is missing), `localizePath(path, lang)` (prefixes `/fr` for French), `getLangFromUrl`, `stripLang`.
- `src/i18n/content.ts` — localizes **data**: `localizeProject(id, data, lang)`, `localizeExperiment`, `localizeArea`, and rule-based `localizeRole` / `localizeNote`. French content lives in `src/data/i18n/projects.fr.json` + `experiments.fr.json` (keyed by id) and inline maps in `content.ts`. Missing French → English fallback. **Project long `description` paragraphs and publications intentionally fall back to English** (not yet translated).
- **Pages are single-source.** Each page (`src/pages/*.astro`) takes a `lang` prop (default `'en'`) and uses `t()` + `localize*`. The `/fr/` routes (`src/pages/fr/*.astro`) are one-line wrappers that import the English page and render it with `lang="fr"`. The dynamic `research/[id].astro` and its `fr/` twin each declare `getStaticPaths` and render the same file. `BaseLayout`, `Header`, `Footer`, `ProjectCard`, `ResearchAreaCard`, `PersonCard` all accept `lang`. Adding a nav/UI string = add a key to both `ui.en` and `ui.fr`; `localizeProject` needs the entry **id** (it's `project.id`, not in `.data`).

**Scroll reveal gotcha.** Elements with class `reveal` start dimmed and animate in on scroll — but **only** when `document.documentElement` has class `js` (added by an inline script in BaseLayout's `<head>`). This means with no JS the content is fully visible (never trapped hidden). It intentionally uses a scroll + `requestAnimationFrame` listener plus timeout fallbacks rather than IntersectionObserver.

## Images and the original-site extraction

All real content (project descriptions, videos, publications, contributor emails, team photos, social links, category/partner images) was extracted once from a wget mirror of the old site in `polargsite/` (plus the official logo in `logo/` and user-supplied `polargsite/home_banner.gif` + `People_banner.jpg`) by two throwaway scripts:

- `scripts/extract.mjs` — parses `polargsite/` HTML (images via an explicit chrome-exclude list so all project photos are kept; YouTube iframes; per-person social links by slicing the people page between names), optimizes images with `sharp` into `public/images/`, converts the 32 MB header GIF to a ~2.5 MB **animated WebP** (`home-banner.webp`, source is only 800px wide), and writes `scripts/extracted.json`.
- `scripts/build-data.mjs` — merges `extracted.json` (+ a curation table of card names/summaries/ordering) into `src/data/projects.json`, and adds photos + social links to `people.json`. Also un-mangles Google-Sites drop-cap spacing (incl. broken emails).

Do **not** re-run these to make content edits — edit the JSON directly. They only matter if re-importing from a fresh `polargsite/` download. `polargsite/` and `logo/` are source-only and never ship (outside `src/`/`public/`).

Images live in `public/images/` and are referenced by absolute path (e.g. `/images/projects/insole-perl-1.webp`); all optimized WebP. **Known gap:** some original project images (all of `emg-robot_1`'s, one each on several others) were never saved by the wget mirror and Google blocks re-fetching them, so they're absent until manually supplied.
