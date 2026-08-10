# POLAR Lab Website

Website for the **POLAR** (Polytechnique Lab for Assistive and Rehabilitation Technologies), Polytechnique Montréal. 
**Non-coders** guide to update the website.
---

## 1. Running & updating the site

### First-time setup

You need **[Node.js](https://nodejs.org)** installed — pick the **LTS** version. You only do this once per computer.

**Windows**
Download the **LTS** installer (`.msi`) from [nodejs.org](https://nodejs.org), run it, and click through with the default options. (Advanced alternative, in PowerShell:)

```bash
winget install OpenJS.NodeJS.LTS
```

**macOS**
Download the **LTS** installer (`.pkg`) from [nodejs.org](https://nodejs.org), run it, and click through. (Or, if you use [Homebrew](https://brew.sh):)

```bash
brew install node
```

**Ubuntu / Debian Linux**
```bash
sudo apt update && sudo apt install -y nodejs npm
```

If that installs an old version, use the current LTS from [NodeSource](https://github.com/nodesource/distributions) (run their one-line setup script, then `sudo apt install -y nodejs`).

**Check it worked** (any operating system, in the Terminal / PowerShell):
```bash
node --version
```

You should see a version number (e.g. `v20.x` or newer). Then, once, from this project folder, install what the site needs:
```bash
npm install
```

### The everyday update loop

**One update publishes both English and French together**

**Step 1 — Edit.** Open the file for whatever you're changing and edit the text(Sections 2–10 below).

**Step 2 — Preview both languages.** Start the live preview, from inside the project folder run:
```bash
npm run dev
```

Then open both **http://localhost:4321/** (English) and **http://localhost:4321/fr/** (French) in your browser and check your change looks right in each. Press `Ctrl+C` in the Terminal to stop it.

**Step 3 — Publish.** When you're happy, this command pushes to the remote repo and makes it live:
```bash
git add -A && git commit -m "describe your change" && git push
```

That's an automated job rebuilds every page in **both languages** and republishes the site in about 2 minutes. (You never need to run `npm run build` yourself for a normal update; the publish step does it for you.)

### The rule for English vs. French

- Content that reads **the same** in both languages — a person's name, an email, a year, a photo, the logo, a partner — is edited **once** and both languages update automatically.
- Content that **differs** — a heading, a description, a summary — is edited in the English file **and** its French twin. They live side by side (see Section 7) so they're easy to keep in sync. If you ever forget the French, the site simply shows the English there — it never breaks.
- **Don't like a French wording?** Nothing is machine-translated on the fly — every French sentence is just text you can edit. Change it in its French file (Section 7 shows exactly where); editing the French never touches the English.

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

### The photo carousel (bottom of the People page)

At the very bottom of the People page there's a sliding **photo gallery**. It simply shows **every image in the `public/images/gallery/` folder**, in filename order — no code or list to edit.

- **To add photos:** drop image files (`.webp` or `.jpg`) into `public/images/gallery/`. They appear automatically. Tip: name them so they sort the way you want, e.g. `01-team.webp`, `02-lab.webp`, `03-demo.webp`.
- **To remove or reorder:** delete files, or rename them (the carousel sorts by filename).
- Visitors can click any photo to view it **full size**. If the whole folder is empty, the gallery section just doesn't show.

> Big photos straight off a phone/camera are heavy. For a fast site, resize them to about 1200px wide and save as `.webp` before dropping them in (any image tool or an online converter can do this).

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

**Good to know:** the site never machine-translates while it runs. It only ever shows French text that already exists in one of the files above; if none exists for a given piece, it falls back to English so the page never looks broken. That means **you are always in full control of the French** — to fix any wording you don't like, just edit its French text and save. (The one thing generated by a rule rather than stored word-for-word is people's **role labels** — e.g. "PhD Student" → "Doctorat". To change how a role is translated, edit the rules in `src/i18n/content.ts`, or ask a developer.)

### The long project descriptions (and publications)

The long **descriptions** on project pages are also translated to French. They were drafted with **Microsoft Azure Translator** by a helper script and stored in `src/data/i18n/projects.fr.json` (each project's `"description"` list). Like all the French, you can edit any wording by hand — a machine draft always benefits from your expert eye on technical terms (e.g. it may write *"exosquelettes assistatifs"* where you'd prefer *"exosquelettes d'assistance"*).

> **Important — the French does NOT update automatically.** Pushing to GitHub only rebuilds the site with whatever text is already in the files; it never translates. And the helper script only fills in French that is **missing** (so it can never overwrite French you've edited). One consequence to remember:

- **Adding a _brand-new_ project** → run the script once and it writes the French for you:

  ```bash
  AZURE_TRANSLATOR_KEY=your-key AZURE_TRANSLATOR_REGION=canadacentral node scripts/translate.mjs
  ```

- **Changing an _existing_ English description** → the script will **skip it** (that project already has French), so its French will *not* refresh on its own. To update it, do **one** of these:
  1. Edit the French directly: open `src/data/i18n/projects.fr.json`, find the project by its `id`, and edit its `"description"` paragraphs.
  2. Or delete that project's whole `"description"` block from `projects.fr.json` and re-run the script above. Now it counts as "missing", so it re-translates just that one.

After either method, preview with `npm run dev` (check `/fr/…`), then commit and push.

*(The Azure key comes from your "Translator" resource → **Keys and Endpoint**.)*

**Publications stay as-is on purpose.** Citations (author names, article and journal titles) are kept in their original language by academic convention, so they read the same in both languages — that's intentional, not a missing translation.

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

