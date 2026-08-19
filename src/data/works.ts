/* Portfolio content for the third screen (SELECTED WORKS — the finale).
   Keep copy here, layout in PortfolioScene.tsx, so editing text never
   touches markup.

   License: the photographs (works.photos, files under public/assets) are
   All Rights Reserved (see LICENSE-PHOTOS.md). Code is MIT (see LICENSE). */

export interface Project {
  name: string;
  description: string;
  tags: string[];
  href?: string;
  // 项目截图：WebP，放 public/assets，路径填这里。
  image?: string;
}

export interface Photo {
  title: string;
  description: string;
  meta: string;
  // 拍摄参数（EXIF）：f/光圈 · 快门 · ISO · 焦距
  params: string;
  // 照片原图含盲水印，勿随意盗用
  image?: string;
}

export interface Works {
  masthead: { year: number };
  photography: {
    lede: string;
    // 盲水印声明：所有照片原图含盲水印
    notice: string;
  };
  projects: Project[];
  photos: Photo[];
}

export const works: Works = {
  masthead: { year: 2026 },
  photography: {
    lede: "Frames from the road — the ordinary made still. Each photograph is a held breath.",
    notice:
      "Every original carries a blind watermark — please do not repost or reuse.",
  },
  projects: [
    {
      name: "ETBSaveManager",
      description:
        "A Tauri 2.0 save manager for Escape The Backrooms — full CRUD, multilingual UI, virtual-scrolled item list. The most-starred tool here, shipped with a live demo.",
      tags: ["Vue", "Tauri", "TypeScript"],
      href: "https://github.com/Eververdants/ETBSaveManager",
      image: "/assets/works-etb-save.webp",
    },
    {
      name: "AppAudioRouter",
      description:
        "A Windows audio routing tool — point each application's sound at the device you want, with automatic refresh and route memory across sessions.",
      tags: ["Python", "Windows", "Audio"],
      href: "https://github.com/Eververdants/AppAudioRouter",
      image: "/assets/works-audio-router.webp",
    },
    {
      name: "ArtText-Studio",
      description:
        "Turn words into shareable visual masterpieces — hundreds of procedurally generated styles, or let AI match the vibe. Code and design in one tool.",
      tags: ["TypeScript", "Canvas", "Creative"],
      href: "https://github.com/Eververdants/ArtText-Studio",
      image: "/assets/works-arttext.webp",
    },
  ],
  photos: [
    {
      title: "Nanjing Museum",
      description:
        "The museum's name plaque — gilt characters on deep red, caught in late-afternoon light.",
      meta: "NANJING · 07/2026",
      params: "f/8 · 1/1250s · ISO 800 · 135mm",
      image: "/assets/works-photo-museum.webp",
    },
    {
      title: "Huangyangjie",
      description:
        "The pass where the Jinggang foothills roll into cloud — an HDR frame of the ridgeline.",
      meta: "JIANGXI · 08/2026",
      params: "f/11 · 1/4000s · ISO 800 · 33mm",
      image: "/assets/works-photo-huangyangjie.webp",
    },
    {
      title: "Loyal-Soul Pavilion",
      description:
        "The pavilion of the martyrs at Yuhuatai, roofed against the summer trees.",
      meta: "NANJING · 07/2026",
      params: "f/8 · 1/1250s · ISO 1000 · 49mm",
      image: "/assets/works-photo-zhonghunting.webp",
    },
  ],
};
