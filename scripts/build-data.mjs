// Merge extracted.json (real content) with a curation table into the final
// src/data/projects.json, and add photos + social links to src/data/people.json.
// Run after extract.mjs: `node scripts/build-data.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'extracted.json'), 'utf8'));

// Fix Google-Sites drop-cap spacing ("S ensory" -> "Sensory", "P ostdoc" -> "Postdoc")
const fixCaps = (s) => s.replace(/\b([A-Z]) (?=[a-z])/g, '$1').replace(/\s+,/g, ',').replace(/\s+/g, ' ').trim();

// Curation: card/badge label (`name`), card summary, ordering, featured.
const C = {
  'insole-perl':   { name: 'INSTRUMENTED INSOLE',           order: 1, featured: true,  summary: 'A low-cost instrumented insole that reads gait in real time to help control lower-limb exoskeletons.' },
  'perl':          { name: 'PERL',                          order: 2, featured: false, summary: 'A personalized ankle exoskeleton giving children with cerebral palsy adaptive gait assistance.' },
  'open-arms':     { name: 'OPEN-ARMS',                     order: 3, featured: true,  summary: 'An open-source, lightweight pediatric arm exoskeleton offering assist-as-needed shoulder and elbow support.' },
  'flora':         { name: 'FLORA',                         order: 4, featured: false, summary: 'A semi-active ankle orthosis that tunes joint stiffness to assist walking without restricting it.' },
  'tens':          { name: 'TENS PROSTHESIS',               order: 5, featured: false, summary: 'Non-invasive nerve stimulation that restores proprioceptive feedback to a robotic hand prosthesis.' },
  'tentacle':      { name: 'TENTACLE ROBOT',                order: 6, featured: false, summary: 'A soft, myoelectric tentacle prosthesis that coils to grasp objects of many shapes and sizes.' },
  'crutch':        { name: 'INSTRUMENTED CRUTCH',           order: 7, featured: false, summary: 'An instrumented smart crutch that senses load and intent to inform exoskeleton control.' },
  'care':          { name: 'CARE',                          order: 8, featured: false, summary: 'A compact, high-torque cycloidal actuator designed for wearable robotic exoskeletons.' },

  'roborehab-6d':  { name: 'ROBOREHAB-6D',                  order: 1, featured: true,  summary: 'Adaptive assist-as-needed control that tailors robotic upper-limb therapy to each patient’s effort.' },
  'roborehab-2d':  { name: 'ROBOREHAB-2D',                  order: 2, featured: false, summary: 'A low-cost, open-source planar robot for motivating, game-based upper-limb rehabilitation.' },
  'haptic3d':      { name: 'HAPTIC3D',                      order: 3, featured: true,  summary: 'A reproducible, affordable 3-DOF haptic robot for pediatric upper-limb rehabilitation.' },
  'hapticmaster':  { name: 'HAPTICMASTER',                  order: 4, featured: false, summary: 'A 3-DOF arm-support mechanism that adds wrist motion to the HapticMaster rehab robot.' },

  'vision-pc':     { name: 'POSTURAL CONTROL VISION',       order: 1, featured: true,  summary: 'Modelling how vision drives human balance using VR perturbations and system identification.' },
  'pedal-pc':      { name: 'POSTURAL CONTROL INTERACTIONS', order: 2, featured: false, summary: 'Quantifying how vision and proprioception interact in human postural control.' },
  'ankle-dynamics':{ name: 'ANKLE-DYNAMICS',               order: 3, featured: false, summary: 'A 3D-printed interface for accurate identification of dynamic ankle-joint stiffness.' },

  'emg-robot_1':   { name: 'EMG HAND GESTURE',              order: 1, featured: true,  summary: 'Deep-learning recognition of hand gestures from EMG signals for assistive robots.' },
  'emg-robot_2':   { name: 'EMG ROBOT CONTROL',             order: 2, featured: false, summary: 'A real-time EMG pipeline that telecontrols an assistive robotic arm from forearm muscle activity.' },
};

// Titles that need manual cleanup beyond fixCaps.
const TITLE_OVERRIDE = {
  'crutch': 'Instrumented Crutch for Use with Robotic Exoskeletons',
  'perl': 'Pediatric Exoskeleton for Rehabilitation of the Lower Limb (PERL)',
  'roborehab-6d': 'Physical Human–Robot Interaction (pHRI) Strategies in Robotic Rehabilitation',
  'pedal-pc': 'Identification of Sensory Interactions Between Vision and Proprioception in Human Postural Control',
};

// Parse "Name, Role at Institution, email" -> { name, role, email }
function team(contribs) {
  return contribs.map((c) => {
    const parts = c.split(',');
    const name = fixCaps(parts[0]);
    const role = fixCaps((parts[1] || '').replace(/ at .*/, '').trim());
    const emailRaw = (parts[parts.length - 1] || '').replace(/\s+/g, ''); // drop-cap spacing can break emails
    const email = /^[\w.+-]+@[\w.-]+\.\w+$/.test(emailRaw) ? emailRaw : undefined;
    const t = { name };
    if (role) t.role = role;
    if (email) t.email = email;
    return t;
  });
}

// Normalize publication citations: "[ 1 ] ..." -> "[1] ..."
function publications(refs) {
  return refs.map((r) => fixCaps(r.replace(/^\[\s*(\d+)\s*\]/, '[$1]')));
}

const order = ['insole-perl','perl','open-arms','flora','tens','tentacle','crutch','care',
  'roborehab-6d','roborehab-2d','haptic3d','hapticmaster',
  'vision-pc','pedal-pc','ankle-dynamics','emg-robot_1','emg-robot_2'];

const projects = order.map((id) => {
  const p = m.projects[id];
  const c = C[id];
  return {
    id,
    name: c.name,
    title: TITLE_OVERRIDE[id] || fixCaps(p.title),
    area: p.area,
    summary: c.summary,
    description: p.paras.map((x) => x.trim()),
    team: team(p.contributors),
    publications: publications(p.refs),
    videos: p.videos || [],
    images: p.images,
    thumb: p.images[0] || null,
    featured: c.featured,
    order: c.order,
  };
});

fs.writeFileSync(path.join(ROOT, 'src', 'data', 'projects.json'), JSON.stringify(projects, null, 2) + '\n');
console.log(`Wrote projects.json (${projects.length} projects)`);

// ---- add photos + social links to people.json ----
const peoplePath = path.join(ROOT, 'src', 'data', 'people.json');
const people = JSON.parse(fs.readFileSync(peoplePath, 'utf8'));
const photoById = Object.fromEntries(m.people.map((p) => [p.id, p.photo]));
let nPhoto = 0, nLinks = 0;
for (const person of people) {
  if (photoById[person.id]) { person.photo = photoById[person.id]; nPhoto++; }
  if (m.social[person.id]) { person.links = m.social[person.id]; nLinks++; }
}
fs.writeFileSync(peoplePath, JSON.stringify(people, null, 2) + '\n');
console.log(`people.json: ${nPhoto} photos, ${nLinks} with social links`);
