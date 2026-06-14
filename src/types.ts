
export interface Project {
  id: string;
  title: string;
  description: string; // Short description for card
  fullDescription?: string; // Long description for detail page
  articleContent?: string; // Markdown-like long-form article content
  category: string; // e.g., "Web App", "Open Source", "Design"
  tags: string[];
  features?: string[]; // List of key features
  imageUrl: string;
  demoUrl: string;
  repoUrl?: string;
}

export interface ArtItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  aspectRatio: 'square' | 'wide' | 'tall';
  location?: string; // For photography
  content?: string;  // For calligraphy (what is written)
  date?: string;
  technicalDetails?: {
    camera: string;
    lens: string;
    aperture: string;
    shutterSpeed: string;
    iso: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string; // Full blog content
  tags: string[];
  imageUrl?: string; // Cover image
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  bilibiliUrl: string;
  bilibiliEmbedId: string;
  noteContent: string;
  duration: string;
  date: string;
  category: string;
  tags: string[];
  relatedArticleIds?: string[];
  relatedProjectIds?: string[];
}

/**
 * 双语文本容器
 * - `string` 形式：中英同字（如品牌名、专有名词）
 * - `{ en; zh }` 形式：需要分别翻译
 */
export type Bilingual = string | { en: string; zh: string };

/**
 * 数组形式的双语字段（每条都是独立段落 / 笔记）
 * 不允许用 union，因为数组内元素类型必须统一
 */
export type BilingualArray = { en: string[]; zh: string[] };
