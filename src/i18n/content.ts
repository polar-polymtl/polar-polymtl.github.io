// Localizes data content (projects, areas, experiments, people roles) to the
// active language, always falling back to the original English when a French
// value is missing. French text lives in `src/data/i18n/*.fr.json` and below.
import type { Lang } from './ui';
import type { Area } from '../data/areas';
import projectsFr from '../data/i18n/projects.fr.json';
import experimentsFr from '../data/i18n/experiments.fr.json';

/** Merge a French override object over the English record (only defined keys). */
function merge<T extends Record<string, any>>(en: T, fr?: Partial<T>): T {
  if (!fr) return en;
  const out = { ...en };
  for (const [k, v] of Object.entries(fr)) if (v != null && v !== '') (out as any)[k] = v;
  return out;
}

/** Project: overrides name / title / summary (and description if provided).
 *  `id` is the collection entry id (lives on the entry, not in `.data`). */
export function localizeProject<T extends Record<string, any>>(id: string, data: T, lang: Lang): T {
  if (lang === 'en') return data;
  return merge(data, (projectsFr as Record<string, Partial<T>>)[id]);
}

/** Experiment: overrides title / description / duration / location / compensation. */
export function localizeExperiment<T extends { id: string }>(data: T, lang: Lang): T {
  if (lang === 'en') return data;
  return merge(data, (experimentsFr as Record<string, Partial<T>>)[data.id]);
}

// ---- Research areas ----
const areasFr: Record<Area['key'], Pick<Area, 'name' | 'short' | 'description'>> = {
  wearables: {
    name: 'Dispositifs portables et prothèses',
    short: 'Portables',
    description:
      'Détection et actionnement portés sur le corps — semelles intelligentes, exodispositifs et interfaces prothétiques qui mesurent le mouvement et offrent un soutien là où on en a le plus besoin.',
  },
  robots: {
    name: 'Robots de réadaptation',
    short: 'Robots',
    description:
      'Des plateformes robotiques et haptiques qui guident, résistent et s’adaptent à l’effort du patient — pour réentraîner l’atteinte, la préhension et la marche par une thérapie précise et reproductible.',
  },
  neuro: {
    name: 'Contrôle neuromusculaire',
    short: 'Neuromusculaire',
    description:
      'Comprendre comment le système nerveux commande le mouvement — en combinant biomécanique, EMG et modélisation pour décoder et restaurer le contrôle neuromoteur.',
  },
  assistive: {
    name: 'Technologies d’assistance',
    short: 'Assistance',
    description:
      'Des dispositifs centrés sur l’humain qui accroissent l’autonomie au quotidien — des robots d’assistance pilotés par EMG aux outils co-conçus avec les patients et les cliniciens.',
  },
};

export function localizeArea(area: Area, lang: Lang): Area {
  if (lang === 'en') return area;
  return merge(area, areasFr[area.key]);
}

// ---- People roles & notes (rule-based; unmatched fragments stay English) ----
const roleRules: [RegExp, string][] = [
  [/Lab Director · Associate Professor, Mechanical & Biomedical Engineering/, 'Directeur du laboratoire · Professeur agrégé, génie mécanique et biomédical'],
  [/Impact\+ Postdoctoral Fellow/, 'Stagiaire postdoctoral Impact+'],
  [/NSERC Undergraduate Researcher/, 'Stagiaire de recherche CRSNG (1er cycle)'],
  [/MITACS Globalink Undergraduate Researcher/, 'Stagiaire de recherche MITACS Globalink (1er cycle)'],
  [/MITACS Undergraduate Researcher/, 'Stagiaire de recherche MITACS (1er cycle)'],
  [/Undergraduate Researcher/, 'Stagiaire de recherche (1er cycle)'],
  [/PhD Candidate/, 'Doctorat'],
  [/PhD Student/, 'Doctorat'],
  [/MSc Student/, 'Maîtrise'],
  [/M\.Eng/, 'Maîtrise (M. Ing.)'],
  [/\bMSc\b/, 'Maîtrise'],
  [/\bBSc\b/, 'Baccalauréat'],
  [/\bPhD\b/, 'Doctorat'],
  [/Postdoc/, 'Stage postdoctoral'],
  [/Graduate Visiting Researcher/, 'Chercheur·euse invité·e, cycles supérieurs'],
  [/MITACS Visiting Researcher/, 'Chercheur·euse invité·e MITACS'],
  // fields (specific before generic)
  [/Industrial Engineering for Aeronautics & Space/, 'génie industriel pour l’aéronautique et le spatial'],
  [/Biomedical Engineering/, 'génie biomédical'],
  [/Mechanical Engineering/, 'génie mécanique'],
  [/Industrial Engineering/, 'génie industriel'],
  [/Information Engineering/, 'génie informatique'],
  [/Life Sciences? Engineering/, 'génie des sciences de la vie'],
  [/Mechatronics Engineering/, 'génie mécatronique'],
  [/Product Design Engineering/, 'génie de conception de produits'],
  [/Quantitative Life Sciences/, 'sciences de la vie quantitatives'],
  [/\bEngineering\b/, 'génie'],
];

export function localizeRole(role: string, lang: Lang): string {
  if (lang === 'en') return role;
  let out = role;
  for (const [re, fr] of roleRules) out = out.replace(re, fr);
  return out;
}

export function localizeNote(note: string | undefined, lang: Lang): string | undefined {
  if (!note || lang === 'en') return note;
  if (/iTMT Research Chair/.test(note))
    return 'Chaire de recherche iTMT en technologies de réadaptation et d’assistance';
  return note;
}
