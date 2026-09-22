/* Navigation-hub copy. Two parallel objects rather than a key→{en,zh} map,
   so TypeScript rejects a string that exists in one language and not the
   other. Layout lives in ./App.tsx; nothing here is markup. */

const en = {
  docTitle: "Eververdants — High-school student & open-source developer",
  docDescription:
    "Eververdants (万山青未阑) builds open-source desktop and web tools in Tauri, Rust, Vue and TypeScript, writes essays on Mao Zedong's Selected Works, and photographs in Jiangsu. Start with the blog, the works index or the photo journal.",
  name: "Eververdants",
  chineseName: "万山青未阑",
  role: "High-school student · Open-source developer",
  tagline:
    "I would rather leave something behind than simply pass through.",
  availability: "Open to small paid projects",
  availabilityNote: "Full-stack builds · LLM & GitHub deployment",
  /* Labels only — the values come from src/data/resume.ts so the hub and
     /about cannot disagree about where I go to school. */
  facts: {
    based: "Based in",
    at: "Studying at",
    since: "Shipping since",
    sinceValue: "2025",
  },
  portals: {
    writing: {
      label: "Writing",
      blurb: "What I read, and what stayed with me afterwards.",
      cta: "All essays",
      empty: "Nothing published yet.",
    },
    works: {
      label: "Works",
      blurb: "Everything I have put online, kept running or not.",
      cta: "All repositories",
      empty: "No repositories yet.",
    },
    about: {
      label: "About",
      blurb: "School, the one award worth naming, how to reach me.",
      cta: "More",
      award: "Award",
      focus: "Focus",
    },
    photos: {
      label: "Photographs",
      blurb: "Frames I stopped for. Few of them, slowly.",
      cta: "All photographs",
      empty: "Nothing filed yet.",
    },
  },
  meta: {
    essays: "essays",
    repos: "repositories",
    series: "series",
    minRead: "min",
    stars: "stars",
    updated: "Updated",
  },
  contact: {
    heading: "Get in touch",
    pitch:
      "I am still in school, so I charge little and I finish what I take. Websites, desktop tools, and getting a repository or a model deployed and left running.",
    wechat: "WeChat",
    github: "GitHub",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Select and copy manually",
  },
  footer: {
    line: "Written and built in Kunshan.",
    code: "Code MIT",
    writing: "Writing CC BY-NC-SA",
    photos: "Photos all rights reserved",
    rss: "RSS",
    sitemap: "Sitemap",
    llms: "llms.txt",
    top: "Back to top",
  },
};

const zh: typeof en = {
  docTitle: "Eververdants（万山青未阑）— 高中生 · 开源开发者",
  docDescription:
    "Eververdants（万山青未阑）用 Tauri、Rust、Vue 与 TypeScript 做开源桌面与网页工具，写《毛选》研读随笔，也在江苏拍照。可从博客、作品索引或摄影集开始。",
  name: "Eververdants",
  chineseName: "万山青未阑",
  role: "高中生 · 开源开发者",
  tagline: "宁可留下些什么，也不愿只是路过。",
  availability: "接受有偿小项目",
  availabilityNote: "全栈开发 · LLM 与 GitHub 部署",
  facts: {
    based: "所在地",
    at: "就读于",
    since: "开始开源",
    sinceValue: "2025",
  },
  portals: {
    writing: {
      label: "写作",
      blurb: "我读过的，和读完之后留下来的。",
      cta: "全部文章",
      empty: "还没有发布内容。",
    },
    works: {
      label: "作品",
      blurb: "我放到网上的一切，维护着的和没维护的。",
      cta: "全部仓库",
      empty: "还没有仓库。",
    },
    about: {
      label: "关于",
      blurb: "学业、唯一拿得出手的奖、怎么找到我。",
      cta: "更多",
      award: "获奖",
      focus: "方向",
    },
    photos: {
      label: "摄影",
      blurb: "我停下来拍的那几张。不多，也很慢。",
      cta: "全部照片",
      empty: "还没有照片。",
    },
  },
  meta: {
    essays: "篇文章",
    repos: "个仓库",
    series: "组作品",
    minRead: "分钟",
    stars: "星标",
    updated: "更新于",
  },
  contact: {
    heading: "联系我",
    pitch: "我还在读书，所以收费很低，但接了就会做完。网站、桌面工具，以及把仓库或大模型部署起来、跑下去。",
    wechat: "微信",
    github: "GitHub",
    copy: "复制",
    copied: "已复制",
    copyFailed: "请手动选中复制",
  },
  footer: {
    line: "在昆山写下、做出来的。",
    code: "代码 MIT",
    writing: "文字 CC BY-NC-SA",
    photos: "照片版权所有",
    rss: "RSS 订阅",
    sitemap: "站点地图",
    llms: "llms.txt",
    top: "回到顶部",
  },
};

export const COPY = { en, zh } as const;
export type HubCopy = typeof en;
