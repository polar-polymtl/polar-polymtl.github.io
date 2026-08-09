// One-off extractor: pull real titles, descriptions, images, videos, and
// social links out of the wget-downloaded original site (polargsite/) into
// optimized web assets + a JSON manifest. Run: `node scripts/extract.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const SRC = path.join(ROOT, 'polargsite');
const SITE = path.join(SRC, 'www.polarlab.ca');
const OUT_IMG = path.join(ROOT, 'public', 'images');

const AREAS = {
  'wearables-and-prosthetics': 'wearables',
  'rehabilitation-robots': 'robots',
  'neuromuscular-control': 'neuro',
  'assistive-technologies': 'assistive',
};

// ---------- disk image index (match by hash prefix before '=') ----------
const imgDirs = [
  path.join(SRC, 'lh3.googleusercontent.com', 'sitesv'),
  path.join(SRC, 'lh7-us.googleusercontent.com', 'sitesv-images-rt'),
];
const diskIndex = new Map(); // hashPrefix -> absolute path
for (const dir of imgDirs) {
  if (!fs.existsSync(dir)) continue;
  for (const name of fs.readdirSync(dir)) {
    const prefix = name.split('=')[0];
    if (!diskIndex.has(prefix)) diskIndex.set(prefix, path.join(dir, name));
  }
}
function resolveImg(ref) {
  const m = ref.match(/(?:lh3\.googleusercontent\.com\/sitesv|lh7-us\.googleusercontent\.com\/sitesv-images-rt)\/([^"'?]+)/);
  if (!m) return null;
  const prefix = m[1].split('=')[0];
  return diskIndex.get(prefix) || null;
}

// ---------- html helpers ----------
const read = (f) => fs.readFileSync(f, 'utf8');
function textBlocks(htmlStr) {
  const blocks = [...htmlStr.matchAll(/class="[^"]*zfr3Q[^"]*"[^>]*>([\s\S]*?)<\/(?:h1|h2|h3|h4|p|div)>/g)];
  const out = [];
  for (const b of blocks) {
    let x = b[1].replace(/<[^>]+>/g, ' ');
    x = x.replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"')
         .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '');
    x = x.replace(/\s+/g, ' ').trim();
    if (x && (out.length === 0 || out[out.length - 1] !== x)) out.push(x);
  }
  return out;
}
function imageRefs(htmlStr) {
  const refs = [...htmlStr.matchAll(/<img[^>]+src="([^"]*(?:lh3\.googleusercontent|lh7-us\.googleusercontent)[^"]*)"/g)].map((m) => m[1]);
  const seen = new Set();
  const ordered = [];
  for (const r of refs) {
    const file = resolveImg(r);
    if (!file) continue;
    if (seen.has(file)) continue;
    seen.add(file);
    ordered.push(file);
  }
  return ordered;
}
// YouTube embeds on a page, in order: [{ id, title }]
function videoRefs(htmlStr) {
  const out = [];
  const seen = new Set();
  for (const m of htmlStr.matchAll(/<iframe\b[^>]*>/g)) {
    const tag = m[0];
    const idm = tag.match(/youtube\.com\/embed\/([^"?&]+)/);
    if (!idm) continue;
    const id = idm[1];
    if (seen.has(id)) continue;
    seen.add(id);
    const al = tag.match(/aria-label="([^"]*)"/);
    const title = al ? al[1].replace(/^YouTube Video,\s*/i, '').replace(/&amp;/g, '&').trim() : '';
    out.push({ id, title });
  }
  return out;
}

// ---------- chrome (site-wide furniture) exclusion ----------
// Explicit list of the shared logo/banner image hashes so genuine per-project
// photos are never dropped, even when reused across a few pages.
const CHROME_PREFIXES = ['ACHe0d0ujiHh10', 'ACHe0d0Sa35z8A', 'AA5AbUB1P3B', 'AA5AbUCHX9B'];
const projectFiles = [];
for (const [dir] of Object.entries(AREAS)) {
  const d = path.join(SITE, 'research-projects', dir);
  for (const f of fs.readdirSync(d)) if (f.endsWith('.html')) projectFiles.push(path.join(d, f));
}
const allPages = [
  ...projectFiles,
  path.join(SITE, 'home.html'),
  path.join(SITE, 'about.html'),
  path.join(SITE, 'people.html'),
];
const freq = new Map();
for (const f of allPages) for (const img of imageRefs(read(f))) freq.set(img, (freq.get(img) || 0) + 1);
// Chrome if it matches a known furniture hash, or is on a huge number of pages.
const isChrome = (file) =>
  CHROME_PREFIXES.some((p) => path.basename(file).startsWith(p)) || (freq.get(file) || 0) >= 8;

// ---------- image optimization ----------
fs.mkdirSync(OUT_IMG, { recursive: true });
async function toWebp(srcFile, destRel, { width = 1400, square = false, quality = 82 } = {}) {
  const dest = path.join(OUT_IMG, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let img = sharp(srcFile).rotate();
  if (square) img = img.resize(width, width, { fit: 'cover', position: 'attention' });
  else img = img.resize({ width, withoutEnlargement: true });
  await img.webp({ quality }).toFile(dest);
  return '/images/' + destRel.split(path.sep).join('/');
}

const manifest = { projects: {}, people: [], social: {}, home: [], media: {} };

// ---------- projects: text, images, videos, publications, contributors ----------
function classify(block) {
  if (/^\[\s*\d+\s*\]/.test(block)) return 'ref';
  if (/©|all rights reserved/i.test(block)) return 'footer';
  if (/@[\w.-]+\.\w+/.test(block) && block.length < 200) return 'contributor';
  return 'para';
}
for (const f of projectFiles) {
  const id = path.basename(f, '.html');
  const area = AREAS[path.basename(path.dirname(f))];
  const html = read(f);
  const blocks = textBlocks(html);
  const title = blocks[0] || id;
  const paras = [], refs = [], contributors = [];
  for (const b of blocks.slice(1)) {
    const k = classify(b);
    if (k === 'para') paras.push(b);
    else if (k === 'ref') refs.push(b);
    else if (k === 'contributor') contributors.push(b);
  }
  const contentImgs = imageRefs(html).filter((img) => !isChrome(img));
  const outImgs = [];
  for (let i = 0; i < contentImgs.length; i++) {
    outImgs.push(await toWebp(contentImgs[i], path.join('projects', `${id}-${i + 1}.webp`), { width: 1400 }));
  }
  const videos = videoRefs(html);
  manifest.projects[id] = { id, area, title, paras, refs, contributors, images: outImgs, videos };
  console.log(`project ${id.padEnd(16)} imgs=${outImgs.length} videos=${videos.length} pubs=${refs.length}`);
}

// ---------- header badge logo (kept for the site header) ----------
{
  let logo = null, best = 0;
  for (const [file, c] of freq) if (c > best && path.basename(file).startsWith('ACHe0d0ujiHh10')) { best = c; logo = file; }
  if (logo) {
    await sharp(logo).resize({ width: 256 }).webp({ quality: 90 }).toFile(path.join(OUT_IMG, 'logo.webp'));
    await sharp(logo).resize({ width: 256 }).png().toFile(path.join(OUT_IMG, 'logo.png'));
    console.log(`header badge logo ok`);
  }
}

// ---------- people photos (confirmed DOM order) ----------
const PEOPLE_ORDER = [
  'abolfazl-mohebbi', 'leila-pezeshki', 'amandine-gesta', 'armineh-rahmanian',
  'aiman-feghoul', 'thomas-imbeault-nepton', 'parsa-maghsoudloo', 'mena-samir-abouseffien',
];
{
  const imgs = imageRefs(read(path.join(SITE, 'people.html'))).filter((f) => !isChrome(f));
  for (let i = 0; i < imgs.length && i < PEOPLE_ORDER.length; i++) {
    const rel = await toWebp(imgs[i], path.join('people', `${PEOPLE_ORDER[i]}.webp`), { width: 600, square: true });
    manifest.people.push({ id: PEOPLE_ORDER[i], photo: rel });
  }
  console.log(`people photos: ${manifest.people.length}`);
}

// ---------- social links per person (slice people.html between names) ----------
{
  const html = read(path.join(SITE, 'people.html'));
  const peopleData = JSON.parse(read(path.join(ROOT, 'src', 'data', 'people.json')));
  const nameKey = (n) => n.split(',')[0].trim();
  const positioned = peopleData
    .map((p) => ({ id: p.id, pos: html.indexOf(nameKey(p.name)) }))
    .filter((x) => x.pos >= 0)
    .sort((a, b) => a.pos - b.pos);
  const grab = (slice, re) => { const m = slice.match(re); return m ? m[1].replace(/&amp;/g, '&') : undefined; };
  for (let i = 0; i < positioned.length; i++) {
    const slice = html.slice(positioned[i].pos, positioned[i + 1]?.pos ?? html.length);
    const links = {
      scholar: grab(slice, /href="(https?:\/\/scholar\.google[^"]+)"/),
      linkedin: grab(slice, /href="(https?:\/\/[^"]*linkedin\.com[^"]+)"/),
      x: grab(slice, /href="(https?:\/\/(?:x\.com|twitter\.com)[^"]+)"/),
      github: grab(slice, /href="(https?:\/\/[^"]*github[^"]*)"/),
    };
    const clean = Object.fromEntries(Object.entries(links).filter(([, v]) => v));
    if (Object.keys(clean).length) manifest.social[positioned[i].id] = clean;
  }
  console.log(`people with social links: ${Object.keys(manifest.social).length}`);
}

// ---------- home images: gait banner, 4 category cards, partners wall ----------
{
  const imgs = imageRefs(read(path.join(SITE, 'home.html'))).filter((f) => !isChrome(f));
  const HOME_MAP = [
    ['gait-banner.webp', 1600, false],
    ['areas/wearables.webp', 900, true],
    ['areas/robots.webp', 900, true],
    ['areas/neuro.webp', 900, true],
    ['areas/assistive.webp', 900, true],
    ['partners.webp', 1600, false],
  ];
  for (let i = 0; i < imgs.length && i < HOME_MAP.length; i++) {
    const [name, width, square] = HOME_MAP[i];
    const rel = await toWebp(imgs[i], name, { width, square });
    manifest.home.push({ file: name, path: rel });
  }
  console.log(`home images: ${manifest.home.length}`);
}

// ---------- user-provided media: official logo, animated header, group banner ----------
{
  // Official logo (bear + wordmark + tagline), transparent PNG -> lossless-ish webp.
  const logoSrc = path.join(ROOT, 'logo', 'EPS polar-logo-english-color-cmyk.png');
  if (fs.existsSync(logoSrc)) {
    await sharp(logoSrc).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 92 }).toFile(path.join(OUT_IMG, 'polar-logo-full.webp'));
    manifest.media.logoFull = '/images/polar-logo-full.webp';
    console.log('official logo -> polar-logo-full.webp');
  }
  // Group photo banner.
  const banSrc = path.join(SRC, 'People_banner.jpg');
  if (fs.existsSync(banSrc)) {
    await sharp(banSrc).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT_IMG, 'people-banner.webp'));
    manifest.media.peopleBanner = '/images/people-banner.webp';
    console.log('people banner -> people-banner.webp');
  }
  // Animated header GIF -> animated WebP (GIF is ~32 MB; must shrink hard).
  const gifSrc = path.join(SRC, 'home_banner.gif');
  if (fs.existsSync(gifSrc)) {
    const out = path.join(OUT_IMG, 'home-banner.webp');
    await sharp(gifSrc, { animated: true })
      .resize({ width: 1000, withoutEnlargement: true }) // source is 800px; capped there
      .webp({ quality: 68, effort: 4 })
      .toFile(out);
    const mb = (fs.statSync(out).size / 1e6).toFixed(1);
    manifest.media.homeBanner = '/images/home-banner.webp';
    console.log(`home banner (animated) -> home-banner.webp (${mb} MB)`);
  }
}

fs.writeFileSync(path.join(ROOT, 'scripts', 'extracted.json'), JSON.stringify(manifest, null, 2));
console.log('\nWrote scripts/extracted.json');
