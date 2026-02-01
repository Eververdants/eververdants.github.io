import { Project, ArtItem, BlogPost } from '../types';
import { Language } from '../utils/translations';

// Cloudflare Worker API 地址
const API_BASE_URL = import.meta.env.VITE_API_URL as string || 'https://eververdants-content-api.llzgd.workers.dev';

// 缓存时间（5分钟）
const CACHE_TIME = 5 * 60 * 1000;

interface CacheItem<T> {
    data: T;
    timestamp: number;
}

// 内存缓存
const cache = new Map<string, CacheItem<any>>();

async function fetchWithCache<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;
    const cached = cache.get(cacheKey);

    // 检查缓存是否有效
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
        return cached.data;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 更新缓存
        cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
        });

        return data;
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        // 如果有缓存数据，即使过期也返回
        if (cached) {
            return cached.data;
        }
        throw error;
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
    const data = await fetchWithCache<any[]>('/api/projects');
    return filterByLanguage(data, language) as Project[];
}

export async function getPhotography(language: Language): Promise<ArtItem[]> {
    const data = await fetchWithCache<any[]>('/api/photography');
    return filterByLanguage(data, language) as ArtItem[];
}

export async function getCalligraphy(language: Language): Promise<ArtItem[]> {
    const data = await fetchWithCache<any[]>('/api/calligraphy');
    return filterByLanguage(data, language) as ArtItem[];
}

export async function getBlogPosts(language: Language): Promise<BlogPost[]> {
    const data = await fetchWithCache<any[]>('/api/blog');
    return filterByLanguage(data, language) as BlogPost[];
}

// 清除缓存（用于强制刷新）
export function clearCache() {
    cache.clear();
}
