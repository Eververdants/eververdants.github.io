import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/detect';

const blogKey: Record<Lang, 'blog-zh' | 'blog-en'> = { zh: 'blog-zh', en: 'blog-en' };
const projKey: Record<Lang, 'projects-zh' | 'projects-en'> = { zh: 'projects-zh', en: 'projects-en' };

export async function getPosts(lang: Lang): Promise<CollectionEntry<'blog-zh'>[]> {
  const posts = (await getCollection(blogKey[lang])) as unknown as CollectionEntry<'blog-zh'>[];
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPost(lang: Lang, slug: string) {
  const posts = await getPosts(lang);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getProjects(lang: Lang): Promise<CollectionEntry<'projects-zh'>[]> {
  const projects = (await getCollection(projKey[lang])) as unknown as CollectionEntry<'projects-zh'>[];
  return projects.sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || b.data.date.getTime() - a.data.date.getTime()
  );
}

export function otherLang(lang: Lang): Lang {
  return lang === 'zh' ? 'en' : 'zh';
}
