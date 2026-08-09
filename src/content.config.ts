import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/**
 * People — a single editable roster file. To add or update a member,
 * edit `src/data/people.json`. `group` controls which section they
 * appear in on the People page; `order` sorts within a group.
 */
const people = defineCollection({
  loader: file('src/data/people.json'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    group: z.enum([
      'director',
      'postdoc',
      'grad',
      'cosupervised',
      'undergrad',
      'alumni-grad',
      'intern',
      'alumni-undergrad',
    ]),
    institution: z.string().optional(),
    years: z.string().optional(),
    note: z.string().optional(),
    email: z.string().optional(),
    photo: z.string().optional(),
    links: z
      .object({
        scholar: z.string().optional(),
        linkedin: z.string().optional(),
        x: z.string().optional(),
        github: z.string().optional(),
      })
      .optional(),
    order: z.number().default(50),
  }),
});

/**
 * Research projects — edit `src/data/projects.json`. `area` maps to a
 * research theme (see `src/data/areas.ts`); `featured` surfaces the
 * project on the home page.
 */
const projects = defineCollection({
  loader: file('src/data/projects.json'),
  schema: z.object({
    name: z.string(),
    title: z.string().optional(),
    area: z.enum(['wearables', 'robots', 'neuro', 'assistive']),
    summary: z.string(),
    description: z.array(z.string()).default([]),
    team: z.array(z.object({ name: z.string(), role: z.string().optional(), email: z.string().optional() })).default([]),
    publications: z.array(z.string()).default([]),
    videos: z.array(z.object({ id: z.string(), title: z.string().default('') })).default([]),
    images: z.array(z.string()).default([]),
    thumb: z.string().nullable().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(50),
  }),
});

export const collections = { people, projects };
