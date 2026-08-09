# POLAR Lab Website

Website for the **POLAR Lab** (Polytechnique Lab for Assistive and Rehabilitation Technologies), Polytechnique Montréal. Built with [Astro](https://astro.build).

This guide is written for **non-coders**. Almost everything on the site is edited by changing simple text files — you don't need to know how to program. Each section below tells you **which file to open** and **what to change**.

---

## 1. Running the site on your computer (one-time setup)

You need [Node.js](https://nodejs.org) installed (LTS version). Then, in the Terminal, from this folder:

```bash
npm install     # only the first time — downloads what the site needs
npm run dev     # starts a live preview at http://localhost:4321
```

Open **http://localhost:4321** in your browser. While `npm run dev` is running, any change you save to a file appears in the browser within a second. Press `Ctrl+C` in the Terminal to stop it.

When you're happy with your changes, build the final website:

```bash
npm run build   # creates the finished site in the "dist" folder
```

The `dist` folder is what gets uploaded to your web host.

> **Tip:** Files that end in `.json` are lists of information. They use quotes `"like this"`, commas between items, and curly braces `{ }`. The safest way to edit them: copy an existing entry, paste it, and change the words inside the quotes. Keep all the commas and braces exactly where they are.

---

## 2. Editing the team (People page)

**File to open:** `src/data/people.json`

Each person is one block like this:

```json
{
  "id": "jane-doe",
  "name": "Jane Doe",
  "role": "PhD Student, Biomedical Engineering",
  "group": "grad",
  "institution": "Polytechnique Montréal",
  "years": "2026–2030",
  "order": 7,
  "photo": "/images/people/jane-doe.webp",
  "links": {
    "scholar": "https://scholar.google.com/...",
    "linkedin": "https://www.linkedin.com/in/janedoe/",
    "x": "https://x.com/janedoe",
    "github": "https://github.com/janedoe"
  }
}
```

- **`group`** decides which section they appear in. Use one of:
  `director`, `postdoc`, `grad`, `cosupervised`, `undergrad`, `alumni-grad`, `intern`, `alumni-undergrad`.
- **`order`** sorts people within their section (1 comes first).
- **`photo`** is optional. If you leave it out, the person shows a colored circle with their initials. To add a photo, put an image in `public/images/people/` and set `"photo": "/images/people/their-name.webp"`.
- **`links`** is optional — include only the ones the person has (scholar / linkedin / x / github). Icons appear automatically.
- To **remove** someone, delete their whole block (and the comma before it).

---

## 3. Editing research projects

**File to open:** `src/data/projects.json`

Each project is one block. The important fields:

| Field | What it is |
| --- | --- |
| `name` | The short label on the project **card** (e.g. `"INSTRUMENTED INSOLE"`). |
| `title` | The full title shown at the top of the project's own page. |
| `area` | The research theme. One of: `wearables`, `robots`, `neuro`, `assistive`. |
| `summary` | The one-line description on the card. |
| `description` | The paragraphs on the project page. A list of sentences in `[ ]`, each in `"quotes"`. |
| `team` | People on the project: name, role, and email. |
| `publications` | List of publication citations (plain text). |
| `videos` | YouTube videos: `{ "id": "abc123", "title": "..." }`. The **id** is the code in a YouTube link after `watch?v=`. |
| `images` | List of image paths shown in the gallery. |
| `thumb` | The one image used on the card (usually the first image). |
| `featured` | `true` shows the project on the home page; `false` hides it there. |
| `order` | Sorts projects within their theme. |

To add a project image: put the file in `public/images/projects/`, then add its path (e.g. `"/images/projects/myproject-1.webp"`) to that project's `images` list.

---

## 4. Editing the "Participate in Experiments" list

**File to open:** `src/data/experiments.json`

Each study is one block:

```json
{
  "id": "new-study",
  "title": "New Study Name",
  "description": "What participants will do…",
  "duration": "2–3 hours",
  "location": "Polytechnique Montréal",
  "compensation": "Yes",
  "contact": "someone@polymtl.ca"
}
```

The **contact** email becomes the "Contact to participate" button.

---

## 5. Changing the research themes (the 4 categories)

**File to open:** `src/data/areas.ts`

Here you can change each theme's **name**, its **description**, its **color**, and its **photo** (`image`). The `key` (wearables / robots / neuro / assistive) must match the `area` used in `projects.json`.

---

## 6. Swapping images, logo, banners, and the animated header

All pictures live in the **`public/images/`** folder. To replace one, save your new file with the **same name** in the same place (or update the path in the matching data file). Use `.webp` or `.jpg`.

| What you see | File |
| --- | --- |
| Big logo on the Home hero and About page | `public/images/polar-logo-full.webp` |
| Small badge logo in the top menu bar | `public/images/logo.webp` (and `logo.png` for the browser tab icon) |
| Animated banner on the Home page | `public/images/home-banner.webp` |
| Team group photo on the People page | `public/images/people-banner.webp` |
| "Walking figures" banner on the About page | `public/images/gait-banner.webp` |
| Research theme photos | `public/images/areas/wearables.webp`, `robots.webp`, `neuro.webp`, `assistive.webp` |
| Partners / funders logo wall | `public/images/partners.webp` |
| A person's photo | `public/images/people/<their-id>.webp` |
| A project's photos | `public/images/projects/<project-id>-1.webp`, `-2.webp`, … |

> The animated Home banner is an **animated WebP** (a modern lightweight GIF). If you ever have a new animation as a `.gif`, ask a developer to convert it — a raw GIF is usually far too large to put on a website directly.

---

## 7. French / English (bilingual site)

The site is bilingual. **English** shows at the normal addresses (e.g. `/research/`) and **French** shows under `/fr/` (e.g. `/fr/research/`). Visitors switch with the 🌐 **Français / English** button in the top menu. Anything without a French translation automatically shows the English version, so the site never looks broken.

Where the French text lives:

| French text for… | File to open |
| --- | --- |
| Menus, buttons, headings, all page wording | `src/i18n/ui.ts` — each item has an `en:` and a `fr:` line; edit the `fr:` text |
| Project card names, titles, and summaries | `src/data/i18n/projects.fr.json` |
| Experiment studies | `src/data/i18n/experiments.fr.json` |
| Research theme names & descriptions, and people's role labels | `src/i18n/content.ts` |

**Not yet translated:** the long project *descriptions* and *publications* on project pages still show in English on the French side (the technical wording is best written by you). To add a French description, open `src/data/i18n/projects.fr.json`, find the project, and add a `"description"` list of French paragraphs — it will then replace the English one on `/fr/`.

## 8. Contact info, address, and social links (footer)

**File to open:** `src/components/Footer.astro`

Look near the top for the email, phone, and address text, and the social media links (X, LinkedIn, Instagram). Change the text/links inside the quotes.

---

## 9. Colors and fonts

**File to open:** `src/styles/global.css`

At the very top, inside `:root { … }`, are the site's colors (e.g. `--brand`) and font settings. Change a color's value (like `#12467b`) to restyle the whole site at once.

---

## 10. Page wording (headlines, intro text)

Almost all the fixed wording on the pages (headings, buttons, intro sentences) lives in **one file**: `src/i18n/ui.ts`. Each entry has an English line (`en:`) and a French line (`fr:`) — edit the text inside the quotes. For example, to change the Home page hero sentence, find `'home.lead'` and edit both the `en` and `fr` versions. This keeps English and French side by side so they stay in sync.

---

## For developers

The real content was originally imported from a `wget` copy of the old Google Sites site (`polargsite/`, and `logo/` for the official logo) by two one-off scripts:

```bash
node scripts/extract.mjs      # parse polargsite/ → optimized images + scripts/extracted.json
node scripts/build-data.mjs   # merge into src/data/projects.json + people.json
```

You normally **don't** run these — edit `src/data/*.json` directly. They only matter for a fresh re-import. `polargsite/` and `logo/` are source-only and never ship in `dist/`. See `CLAUDE.md` for architecture notes.

**Known gap:** a few original project images (all of `emg-robot_1`'s, and one each on several others) were never saved by the `wget` mirror and Google blocks re-downloading them, so those specific images are absent. Drop replacements into `public/images/projects/` and add them to the project's `images` list to fill the gaps.

## Deploying

The site is static — it works on any host (Netlify, Vercel, GitHub Pages, or a university server). Build command: `npm run build`; publish the `dist` folder. Point the `polarlab.ca` domain at your chosen host.
