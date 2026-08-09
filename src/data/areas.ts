/**
 * Research themes. `key` matches the `area` field on each project.
 * `color` is a CSS custom property defined in global.css.
 */
export interface Area {
  key: 'wearables' | 'robots' | 'neuro' | 'assistive';
  name: string;
  short: string;
  description: string;
  color: string;
  image: string; // representative photo (public path)
  icon: string; // inline SVG path data, drawn on a 24x24 viewBox
}

export const areas: Area[] = [
  {
    key: 'wearables',
    name: 'Wearables & Prosthetics',
    short: 'Wearables',
    description:
      'Body-worn sensing and actuation — smart insoles, exo-devices, and prosthetic interfaces that measure movement and give support where people need it most.',
    color: 'var(--c-wear)',
    image: '/images/areas/wearables.webp',
    icon: 'M12 2a3 3 0 0 1 3 3v3a3 3 0 0 1-1 2.24V14l3 6h-2.5l-2.5-5-2.5 5H7l3-6v-3.76A3 3 0 0 1 9 8V5a3 3 0 0 1 3-3Z',
  },
  {
    key: 'robots',
    name: 'Rehabilitation Robots',
    short: 'Robots',
    description:
      'Robotic and haptic platforms that guide, resist, and adapt to a patient’s effort — retraining reaching, grasping, and gait through precise, repeatable therapy.',
    color: 'var(--c-robot)',
    image: '/images/areas/robots.webp',
    icon: 'M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M4 12h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6Zm5 3h.01M15 15h.01M12 4V2',
  },
  {
    key: 'neuro',
    name: 'Neuromuscular Control',
    short: 'Neuromuscular',
    description:
      'Understanding how the nervous system drives movement — combining biomechanics, EMG, and modelling to decode and restore neuromotor control.',
    color: 'var(--c-neuro)',
    image: '/images/areas/neuro.webp',
    icon: 'M12 3v18M8 6a3 3 0 1 0-3 3M16 6a3 3 0 1 1 3 3M8 18a3 3 0 1 1-3-3M16 18a3 3 0 1 0 3-3',
  },
  {
    key: 'assistive',
    name: 'Assistive Technologies',
    short: 'Assistive',
    description:
      'Human-centred devices that extend independence in daily life — from EMG-driven assistive robots to tools co-designed with patients and clinicians.',
    color: 'var(--c-assist)',
    image: '/images/areas/assistive.webp',
    icon: 'M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-3 3 3-1 3 1m-3 0v5m0 0-3 6m3-6 3 6M6 8h12',
  },
];

export const areaMap = Object.fromEntries(areas.map((a) => [a.key, a])) as Record<Area['key'], Area>;
