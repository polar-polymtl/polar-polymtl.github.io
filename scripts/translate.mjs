// Fill in MISSING French project descriptions using Microsoft Azure Translator.
// Run locally (never in CI) so your key stays off GitHub. The key + region come
// from environment variables — nothing secret is written to disk:
//
//   AZURE_TRANSLATOR_KEY=xxxx AZURE_TRANSLATOR_REGION=canadacentral node scripts/translate.mjs
//
// It only adds a French `description` for projects that don't already have one
// in src/data/i18n/projects.fr.json — existing French (name/title/summary or a
// description you've hand-written) is never overwritten. Re-runnable and safe.
// Publications are intentionally left untranslated (academic convention).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const KEY = process.env.AZURE_TRANSLATOR_KEY;
const REGION = process.env.AZURE_TRANSLATOR_REGION || 'canadacentral';
const ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';

if (!KEY) {
  console.error('Missing AZURE_TRANSLATOR_KEY. Run:\n  AZURE_TRANSLATOR_KEY=xxxx AZURE_TRANSLATOR_REGION=canadacentral node scripts/translate.mjs');
  process.exit(1);
}

/** Translate an array of plain-text strings EN → FR (one Azure request). */
async function translate(texts) {
  const res = await fetch(`${ENDPOINT}/translate?api-version=3.0&from=en&to=fr`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Ocp-Apim-Subscription-Region': REGION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(texts.map((t) => ({ Text: t }))),
  });
  if (!res.ok) throw new Error(`Azure ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.map((d) => d.translations[0].text);
}

const projectsPath = path.join(ROOT, 'src', 'data', 'projects.json');
const frPath = path.join(ROOT, 'src', 'data', 'i18n', 'projects.fr.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

let filled = 0;
for (const p of projects) {
  const en = p.description;
  const hasFr = fr[p.id]?.description && fr[p.id].description.length > 0;
  if (!Array.isArray(en) || en.length === 0 || hasFr) continue;
  process.stdout.write(`translating ${p.id} (${en.length} paragraph(s))… `);
  try {
    const translated = await translate(en);
    fr[p.id] = { ...(fr[p.id] || {}), description: translated };
    filled++;
    console.log('done');
  } catch (err) {
    console.log('FAILED');
    console.error('  ' + err.message);
  }
}

if (filled > 0) {
  fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n');
  console.log(`\nWrote ${filled} French description(s) into ${path.relative(ROOT, frPath)}.`);
  console.log('Review the French (esp. technical terms), then commit.');
} else {
  console.log('\nNothing to do — every project already has a French description.');
}
