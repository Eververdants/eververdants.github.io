import { Project, ArtItem, BlogPost } from '../types';
import { Language } from '../utils/translations';

// 使用 fetch 从 public 目录加载数据
async function fetchData<T>(path: string): Promise<T[]> {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${path}`);
        }
        return await response.json();
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

export async function getProjects(language: Language): Promise<Project[]> {
    const data = await fetchData<any>('/data/projects.json');
    return filterByLanguage(data, language) as Project[];
}

export async function getPhotography(language: Language): Promise<ArtItem[]> {
    const data = await fetchData<any>('/data/photography.json');
    return filterByLanguage(data, language) as ArtItem[];
}

export async function getCalligraphy(language: Language): Promise<ArtItem[]> {
    const data = await fetchData<any>('/data/calligraphy.json');
    return filterByLanguage(data, language) as ArtItem[];
}

export async function getBlogPosts(language: Language): Promise<BlogPost[]> {
    const data = await fetchData<any>('/data/blog.json');
    return filterByLanguage(data, language) as BlogPost[];
}

// 清除缓存（本地模式不需要，保留接口兼容性）
export function clearCache() {
    // No-op for local data
}
