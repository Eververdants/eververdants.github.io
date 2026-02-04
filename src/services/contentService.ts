import { Project, ArtItem, BlogPost } from '../types';
import { Language } from '../utils/translations';

// 直接从本地 JSON 文件导入数据
import projectsData from '../../public/data/projects.json';
import photographyData from '../../public/data/photography.json';
import calligraphyData from '../../public/data/calligraphy.json';
import blogData from '../../public/data/blog.json';

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
    // 模拟异步加载，保持接口一致
    return Promise.resolve(filterByLanguage(projectsData as any[], language) as Project[]);
}

export async function getPhotography(language: Language): Promise<ArtItem[]> {
    return Promise.resolve(filterByLanguage(photographyData as any[], language) as ArtItem[]);
}

export async function getCalligraphy(language: Language): Promise<ArtItem[]> {
    return Promise.resolve(filterByLanguage(calligraphyData as any[], language) as ArtItem[]);
}

export async function getBlogPosts(language: Language): Promise<BlogPost[]> {
    return Promise.resolve(filterByLanguage(blogData as any[], language) as BlogPost[]);
}

// 清除缓存（本地模式不需要，保留接口兼容性）
export function clearCache() {
    // No-op for local data
}
