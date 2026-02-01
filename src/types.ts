
export interface Project {
  id: string;
  title: string;
  description: string; // Short description for card
  fullDescription?: string; // Long description for modal
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

export enum Section {
  HERO = 'hero',
  PROJECTS = 'projects',
  PHOTOGRAPHY = 'photography',
  CALLIGRAPHY = 'calligraphy',
}
