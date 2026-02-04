import { Project, ArtItem, BlogPost } from '../types';
import { Language } from '../utils/translations';

// 使用 Vite 的 ?url 导入来获取正确的路径，然后动态加载
// 或者直接使用动态 import
async function loadJSON<T>(path: string): Promise<T[]> {
    try {
        // 使用动态 import 来加载 JSON
        const module = await import(/* @vite-ignore */ path);
        return module.default || [];
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        return [];
    }
}

// 根据语言过滤数据
function filterByLanguage<T extends Record<string, any>>(
    items: T[],
    language: Language
): T[] {
    return items.map(item => {
        const filtered: any = { ...item };

        // 根据语言选择对应的字段
        if (language === 'zh') {
            filtered.title = item.title || item.titleEn;
            filtered.description = item.description || item.descriptionEn;
            filtered.fullDescription = item.fullDescription || item.fullDescriptionEn;
            filtered.category = item.category || item.categoryEn;
            filtered.features = item.features || item.featuresEn;
            filtered.location = item.location || item.locationEn;
            filtered.date = item.date || item.dateEn;
            filtered.excerpt = item.excerpt || item.excerptEn;
            filtered.content = item.content || item.contentEn;
            filtered.readTime = item.readTime || item.readTimeEn;
            filtered.tags = item.tags || item.tagsEn;
        } else {
            filtered.title = item.titleEn || item.title;
            filtered.description = item.descriptionEn || item.description;
            filtered.fullDescription = item.fullDescriptionEn || item.fullDescription;
            filtered.category = item.categoryEn || item.category;
            filtered.features = item.featuresEn || item.features;
            filtered.location = item.locationEn || item.location;
            filtered.date = item.dateEn || item.date;
            filtered.excerpt = item.excerptEn || item.excerpt;
            filtered.content = item.contentEn || item.content;
            filtered.readTime = item.readTimeEn || item.readTime;
            filtered.tags = item.tagsEn || item.tags;
        }

        return filtered;
    });
}

// 缓存数据
let projectsCache: any[] | null = null;
let photographyCache: any[] | null = null;
let calligraphyCache: any[] | null = null;
let blogCache: any[] | null = null;

export async function getProjects(language: Language): Promise<Project[]> {
    if (!projectsCache) {
        const module = await import('/data/projects.json');
        projectsCache = module.default;
    }
    return filterByLanguage(projectsCache, language) as Project[];
}

export async function getPhotography(language: Language): Promise<ArtItem[]> {
    if (!photographyCache) {
        const module = await import('/data/photography.json');
        photographyCache = module.default;
    }
    return filterByLanguage(photographyCache, language) as ArtItem[];
}

export async function getCalligraphy(language: Language): Promise<ArtItem[]> {
    if (!calligraphyCache) {
        const module = await import('/data/calligraphy.json');
        calligraphyCache = module.default;
    }
    return filterByLanguage(calligraphyCache, language) as ArtItem[];
}

export async function getBlogPosts(language: Language): Promise<BlogPost[]> {
    if (!blogCache) {
        const module = await import('/data/blog.json');
        blogCache = module.default;
    }
    return filterByLanguage(blogCache, language) as BlogPost[];
}

// 清除缓存
export function clearCache() {
    projectsCache = null;
    photographyCache = null;
    calligraphyCache = null;
    blogCache = null;
}
