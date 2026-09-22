/* /about copy. Facts that also appear on the hub (school, award names, the
 * focus list, contact handles) are read from src/data/resume.ts, not
 * repeated here — this file holds only what is specific to this page. */

const en = {
  docTitle: "About — Eververdants",
  docDescription:
    "Eververdants (万山青未阑) is a high-school student and open-source developer in Kunshan, Jiangsu: Tauri/Rust/Vue/TypeScript tools, essays on Mao Zedong's Selected Works, photography and calligraphy. Available for small paid projects.",
  title: "About",
  subtitle: "万山青未阑 · High-school student & open-source developer",
  lede: "I go to school in Kunshan and I build things on the side: desktop tools, small web apps, essays I actually finished, photographs I stopped for.",
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
      "Paid, but at a student rate, and with deadlines I keep. If it is small and actually useful, I will take it.",
    items: [
      {
        title: "Web apps and sites",
        note: "React or Vue on the front, TypeScript through it, deployed and then kept working.",
      },
      {
        title: "Desktop tools",
        note: "Tauri 2.0 and Rust, for the things a browser tab cannot hold.",
      },
      {
        title: "Deployment",
        note: "I get a model running, or a repository built and shipped to GitHub Pages or a server.",
      },
      {
        title: "AI × creative",
        note: "Calligraphy rendering, photography tooling, visuals made by code.",
      },
    ],
    wechat: "WeChat",
    wechatNote: "the fastest way to reach me",
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
  lede: "我在昆山读书，课余做东西：桌面工具、小网站、写得完的随笔，和愿意为我停下来的照片。",
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
    pitch: "收费，但只是学生价，答应的时间我会守住。项目小、确实有用，我就接。",
    items: [
      {
        title: "网页应用与网站",
        note: "前端 React 或 Vue，全程 TypeScript，部署之后也继续维护。",
      },
      {
        title: "桌面工具",
        note: "浏览器标签页装不下的东西，用 Tauri 2.0 与 Rust 做。",
      },
      {
        title: "部署",
        note: "把模型跑起来，或者把仓库构建好，发到 GitHub Pages 和自己的服务器上。",
      },
      {
        title: "AI × 创意",
        note: "书法渲染、摄影工具、用代码生成的视觉。",
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
