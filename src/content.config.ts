import { defineCollection, z } from 'astro:content';

const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
  series: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  repoUrl: z.string(),
  demoUrl: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  date: z.coerce.date(),
  featured: z.boolean().default(false),
});

const blogZh = defineCollection({ type: 'content', schema: blogSchema });
const blogEn = defineCollection({ type: 'content', schema: blogSchema });
const projectsZh = defineCollection({ type: 'content', schema: projectSchema });
const projectsEn = defineCollection({ type: 'content', schema: projectSchema });

export const collections = {
  'blog-zh': blogZh,
  'blog-en': blogEn,
  'projects-zh': projectsZh,
  'projects-en': projectsEn,
};
