/* /about copy. Facts that also appear on the hub (school, award names, the
 * focus list, contact handles) are read from src/data/resume.ts, not
 * repeated here — this file holds only what is specific to this page. */

const en = {
  docTitle: "About — Eververdants",
  docDescription:
    "Eververdants (万山青未阑) is a high-school student and open-source developer in Kunshan, Jiangsu: Tauri/Rust/Vue/TypeScript tools, essays on Mao Zedong's Selected Works, photography and calligraphy. Available for small paid projects.",
  title: "About",
  subtitle: "万山青未阑 · High-school student & open-source developer",
  lede: "I build tools, write essays, and take photographs while finishing high school in Kunshan. This page is the plain summary — the work itself is in the other three sections.",
  sections: {
    glance: "At a glance",
    bio: "In short",
    education: "Education",
    awards: "Awards",
    focus: "What I work on",
    work: "Working with me",
    elsewhere: "Elsewhere",
  },
  /* The summary answers what the other cards do not, so nothing appears
     twice on the page. */
  glance: {
    born: "Born",
    since: "Shipping since",
    sinceValue: "2025",
    languages: "Languages",
    languagesValue: "Chinese (native) · English",
    contact: "Contact",
  },
  education: {
    role: "Role",
    location: "Location",
  },
  work: {
    pitch:
      "Paid, but at a student rate, and with real deadlines. If it is small and useful, I will take it.",
    items: [
      {
        title: "Web apps and sites",
        note: "React or Vue front ends, TypeScript throughout, deployed and maintained.",
      },
      {
        title: "Desktop tools",
        note: "Tauri 2.0 and Rust wrappers where a browser tab is the wrong shape for the job.",
      },
      {
        title: "Deployment",
        note: "Getting an LLM running, or a repository built and shipped to GitHub Pages or a VPS.",
      },
      {
        title: "AI × creative",
        note: "Calligraphy rendering, photography tooling, generative visuals.",
      },
    ],
    wechat: "WeChat",
    wechatNote: "fastest way to reach me",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Select and copy manually",
  },
  elsewhere: {
    blog: "Blog — essays, notes, field records",
    works: "Works — the open-source index",
    photos: "Photographs — the photo journal",
    github: "GitHub",
    bilibili: "Bilibili",
  },
  back: "Back to the hub",
  footer: "© {year} Eververdants — Code MIT · Writing CC BY-NC-SA · Photographs all rights reserved",
};

const zh: typeof en = {
  docTitle: "关于 — Eververdants",
  docDescription:
    "Eververdants（万山青未阑），江苏昆山的高中生与开源开发者：Tauri/Rust/Vue/TypeScript 工具、《毛选》研读随笔、摄影与书法。接受有偿小项目。",
  title: "关于",
  subtitle: "万山青未阑 · 高中生 · 开源开发者",
  lede: "我在读高中期间做工具、写随笔、拍照。这一页是平实的自我介绍——作品本身在另外三个栏目里。",
  sections: {
    glance: "速览",
    bio: "简而言之",
    education: "学业",
    awards: "获奖",
    focus: "方向",
    work: "合作方式",
    elsewhere: "更多",
  },
  glance: {
    born: "出生",
    since: "开始开源",
    sinceValue: "2025",
    languages: "语言",
    languagesValue: "中文（母语）· 英语",
    contact: "联系",
  },
  education: {
    role: "身份",
    location: "地区",
  },
  work: {
    pitch: "有偿，但按学生价，并且按时交付。项目小、确实有用，我就接。",
    items: [
      {
        title: "网页应用与网站",
        note: "React 或 Vue 前端，全程 TypeScript，负责部署与后续维护。",
      },
      {
        title: "桌面工具",
        note: "当浏览器标签页不适合这件事时，用 Tauri 2.0 与 Rust 来做。",
      },
      {
        title: "部署",
        note: "把大模型跑起来，或把仓库构建好并发布到 GitHub Pages 与服务器。",
      },
      {
        title: "AI × 创意",
        note: "书法渲染、摄影工具、程序化生成视觉。",
      },
    ],
    wechat: "微信",
    wechatNote: "最快联系到我",
    copy: "复制",
    copied: "已复制",
    copyFailed: "请手动选中复制",
  },
  elsewhere: {
    blog: "博客 — 随笔、札记、田野手记",
    works: "作品 — 开源索引",
    photos: "摄影 — 相册",
    github: "GitHub",
    bilibili: "哔哩哔哩",
  },
  back: "返回导航页",
  footer: "© {year} Eververdants — 代码 MIT · 文字 CC BY-NC-SA · 照片版权所有",
};

export const ABOUT_COPY = { en, zh } as const;
export type AboutCopy = typeof en;
