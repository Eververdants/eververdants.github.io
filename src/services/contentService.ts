import { Project, ArtItem, BlogPost } from '../types';
import { Language } from '../utils/translations';

// 使用 Vite 的 glob import 功能导入所有 JSON 文件
const dataModules = import.meta.glob('/public/data/*.json', { eager: true });

// 提取数据
const projectsData = (dataModules['/public/data/projects.json'] as any)?.default || [];
const photographyData = (dataModules['/public/data/photography.json'] as any)?.default || [];
const calligraphyData = (dataModules['/public/data/calligraphy.json'] as any)?.default || [];
const blogData = (dataModules['/public/data/blog.json'] as any)?.default || [];

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
    return Promise.resolve(filterByLanguage(projectsData, language) as Project[]);
}

export async function getPhotography(language: Language): Promise<ArtItem[]> {
    return Promise.resolve(filterByLanguage(photographyData, language) as ArtItem[]);
}

export async function getCalligraphy(language: Language): Promise<ArtItem[]> {
    return Promise.resolve(filterByLanguage(calligraphyData, language) as ArtItem[]);
}

export async function getBlogPosts(language: Language): Promise<BlogPost[]> {
    return Promise.resolve(filterByLanguage(blogData, language) as BlogPost[]);
}

// 清除缓存
export function clearCache() {
    // No-op for static imports
}
