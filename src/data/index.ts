
import { ArtItem, Project, BlogPost, VideoItem } from "../types";
import { Language } from "../utils/translations";

// --- ENGLISH DATA ---

const PROJECTS_EN: Project[] = [
  {
    id: '1',
    title: 'ETB Save Manager',
    description: 'A Tauri desktop app for managing game saves of Escape The Backrooms.',
    fullDescription: 'ETB Save Manager is a cross-platform desktop application built with Tauri, designed specifically for Escape The Backrooms players. It provides an intuitive interface to backup, restore, and manage game save files, ensuring players never lose their progress.',
    category: 'Desktop App',
    features: [
      'One-click save backup and restore',
      'Save file version management',
      'Cross-platform support (Windows, macOS, Linux)',
      'Lightweight and fast with Rust backend'
    ],
    tags: ['Tauri', 'Vue', 'Rust', 'TypeScript'],
    imageUrl: '/ETBSaveManager.jpg',
    demoUrl: 'https://eververdants.github.io/ETBSaveManager/',
    repoUrl: 'https://github.com/Eververdants/ETBSaveManager'
  },
  {
    id: '2',
    title: 'ArtTextStudio',
    description: 'A creative tool for generating artistic text compositions and visual typography.',
    fullDescription: 'ArtTextStudio is a web-based creative application that enables users to craft artistic text layouts and typographic compositions. It combines text rendering with visual effects to produce unique digital artworks.',
    category: 'Creative Tool',
    features: [
      'Rich text styling and formatting',
      'Visual effect filters and overlays',
      'Export to high-resolution images',
      'Real-time preview and editing'
    ],
    tags: ['Web App', 'Canvas', 'TypeScript'],
    imageUrl: '/ArtTextStudio.jpg',
    demoUrl: 'https://eververdants.github.io/ArtText-Studio/',
    repoUrl: 'https://github.com/Eververdants'
  },
  {
    id: '3',
    title: 'MicrophoneController',
    description: 'A utility app for advanced microphone input control and audio monitoring.',
    fullDescription: 'MicrophoneController provides granular control over microphone input settings, including gain adjustment, noise suppression, and real-time audio level monitoring. Perfect for streamers, podcasters, and content creators.',
    category: 'Utility',
    features: [
      'Real-time audio level monitoring',
      'Gain and volume control',
      'Noise suppression settings',
      'Multiple device support'
    ],
    tags: ['Web Audio API', 'MediaDevices', 'TypeScript'],
    imageUrl: '/MicController.jpg',
    demoUrl: 'https://eververdants.github.io/MicrophoneController/',
    repoUrl: 'https://github.com/Eververdants'
  },
  {
    id: '4',
    title: 'VideoAnalytics',
    description: 'A video analysis platform for extracting insights and metrics from video content.',
    fullDescription: 'VideoAnalytics processes video files to extract meaningful data including scene detection, motion analysis, and visual metrics. It provides an interactive dashboard for exploring video content at scale.',
    category: 'Data Tool',
    features: [
      'Scene detection and segmentation',
      'Motion and object tracking',
      'Timeline visualization dashboard',
      'Batch processing support'
    ],
    tags: ['Video Processing', 'Canvas', 'Charts'],
    imageUrl: '/video-analytics.jpg',
    demoUrl: 'https://eververdants.github.io/video-analytics/',
    repoUrl: 'https://github.com/Eververdants'
  },
  {
    id: '5',
    title: '终线',
    description: 'A Suzhou high school entrance exam encouragement platform.',
    fullDescription: '终线 is a web platform designed to encourage and support students preparing for the Suzhou high school entrance exam (中考). It provides motivational content, study resources, and a community space for students.',
    category: 'Web App',
    features: [
      'Motivational content and messages',
      'Exam countdown and schedule',
      'Study tips and resources',
      'Community support space'
    ],
    tags: ['Web', 'Community', 'Education'],
    imageUrl: '/ZhongXian.jpg',
    demoUrl: 'https://eververdants.github.io/ZhongKaoEncouragement/',
    repoUrl: 'https://github.com/Eververdants'
  }
];

const BLOG_POSTS_EN: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Digital Silence',
    excerpt: 'Exploring minimalism in web design and how negative space creates room for thought.',
    date: 'Oct 12, 2024',
    readTime: '5 min read',
    tags: ['Design', 'Minimalism', 'Philosophy'],
    imageUrl: '/ArtTextStudio.jpg',
    content: `In a world screaming for attention, silence is a luxury. Digital silence isn't about emptiness; it's about clarity. It's the deliberate choice to remove the non-essential to let the essential speak.

When we design with negative space, we aren't just leaving empty pixels. We are creating a pause. A breath. This pause allows the user to process, to understand, and to appreciate the content that remains.

## The Power of Subtraction

Subtraction is harder than addition. It requires confidence. It requires us to say, "This is enough." In my recent projects, I've been experimenting with removing borders, reducing color palettes, and relying heavily on typography and spacing to create structure.

The result? Interfaces that feel lighter, faster, and more honest. We stop hiding behind decoration and let the content stand on its own feet.

## Cognitive Load and White Space

Every element on a screen adds to the user's cognitive load. By increasing white space (or negative space), we reduce the density of information the brain needs to process at once. This isn't just an aesthetic choice; it's an accessibility one.

## Conclusion

As we move forward in the digital age, I believe the most successful products will be those that respect the user's time and attention. Those that offer a sanctuary of calm in the chaos of the internet. Let us design for silence.`
  },
  {
    id: '2',
    title: 'Growing Algorithms',
    excerpt: 'Procedural generation techniques inspired by organic growth patterns in nature.',
    date: 'Sep 28, 2024',
    readTime: '8 min read',
    tags: ['Generative Art', 'Algorithms', 'Nature'],
    imageUrl: '/ETBSaveManager.jpg',
    content: `Nature is the ultimate coder. From the branching of trees to the spiral of a shell, biology follows mathematical rules. As creative developers, we can mimic these rules to create "organic" digital experiences.

One of my favorite techniques is L-systems (Lindenmayer systems), a parallel rewriting system and a type of formal grammar. Originally developed to describe the behavior of plant cells, it is now widely used in computer graphics to model the growth processes of plant development.

## The Beauty of Randomness

True randomness can feel chaotic and harsh. Nature isn't random; it's guided randomness. It's "Perlin Noise" rather than "Math.random()". 

When implementing generative growth in my projects, I often use noise functions to determine direction and length, ensuring that while no two trees are alike, they all look like they belong to the same forest.

## Code as a Garden

I like to think of my codebases as gardens. You plant the seeds (algorithms), you water them (data), and you prune them (refactoring). Sometimes, unexpected bugs turn into beautiful features—a digital mutation that creates something entirely new.`
  }
];

// --- CHINESE DATA ---

const PROJECTS_ZH: Project[] = [
  {
    id: '1',
    title: 'ETB 存档管理器',
    description: '基于 Tauri 的桌面应用，专为 Escape The Backrooms 游戏打造的存档管理工具。',
    fullDescription: 'ETB 存档管理器是一款使用 Tauri 构建的跨平台桌面应用，专为 Escape The Backrooms 玩家设计。它提供直观的界面来备份、恢复和管理游戏存档文件，确保玩家永远不会丢失进度。',
    category: '桌面应用',
    features: [
      '一键备份与恢复存档',
      '存档版本管理',
      '跨平台支持 (Windows, macOS, Linux)',
      'Rust 后端，轻量高效'
    ],
    tags: ['Tauri', 'Vue', 'Rust', 'TypeScript'],
    imageUrl: '/ETBSaveManager.jpg',
    demoUrl: 'https://eververdants.github.io/ETBSaveManager/',
    repoUrl: 'https://github.com/Eververdants/ETBSaveManager'
  },
  {
    id: '2',
    title: 'ArtTextStudio',
    description: '创意文字排版与视觉艺术生成工具。',
    fullDescription: 'ArtTextStudio 是一款基于 Web 的创意应用，让用户能够制作艺术化的文字排版和视觉构图。它将文字渲染与视觉效果相结合，创作出独特的数字艺术作品。',
    category: '创意工具',
    features: [
      '丰富的文字样式与排版',
      '视觉滤镜与叠加效果',
      '导出高分辨率图像',
      '实时预览与编辑'
    ],
    tags: ['Web App', 'Canvas', 'TypeScript'],
    imageUrl: '/ArtTextStudio.jpg',
    demoUrl: 'https://eververdants.github.io/ArtText-Studio/',
    repoUrl: 'https://github.com/Eververdants'
  },
  {
    id: '3',
    title: 'MicrophoneController',
    description: '麦克风输入控制与音频监控实用工具。',
    fullDescription: 'MicrophoneController 提供对麦克风输入设置的精细控制，包括增益调节、降噪和实时音频电平监控。适用于主播、播客创作者和内容制作者。',
    category: '实用工具',
    features: [
      '实时音频电平监控',
      '增益与音量控制',
      '降噪设置',
      '多设备支持'
    ],
    tags: ['Web Audio API', 'MediaDevices', 'TypeScript'],
    imageUrl: '/MicController.jpg',
    demoUrl: 'https://eververdants.github.io/MicrophoneController/',
    repoUrl: 'https://github.com/Eververdants'
  },
  {
    id: '4',
    title: 'VideoAnalytics',
    description: '视频分析平台，从视频内容中提取洞察与数据指标。',
    fullDescription: 'VideoAnalytics 处理视频文件以提取有意义的数据，包括场景检测、运动分析和视觉指标。提供交互式仪表盘，用于大规模探索视频内容。',
    category: '数据工具',
    features: [
      '场景检测与分割',
      '运动与目标追踪',
      '时间线可视化仪表盘',
      '批量处理支持'
    ],
    tags: ['视频处理', 'Canvas', 'Charts'],
    imageUrl: '/video-analytics.jpg',
    demoUrl: 'https://eververdants.github.io/video-analytics/',
    repoUrl: 'https://github.com/Eververdants'
  },
  {
    id: '5',
    title: '终线',
    description: '苏州中考加油平台。',
    fullDescription: '终线是一个为苏州中考考生加油打气的网页平台。提供励志内容、学习资源和考生社区空间，帮助学生备战中考。',
    category: 'Web 应用',
    features: [
      '励志内容与加油语',
      '考试倒计时与日程',
      '学习技巧与资源',
      '考生社区空间'
    ],
    tags: ['Web', '社区', '教育'],
    imageUrl: '/ZhongXian.jpg',
    demoUrl: 'https://eververdants.github.io/ZhongKaoEncouragement/',
    repoUrl: 'https://github.com/Eververdants'
  }
];

const BLOG_POSTS_ZH: BlogPost[] = [
  {
    id: '1',
    title: '数字静默的艺术',
    excerpt: '探索网页设计中的极简主义，以及留白如何为思考创造空间。',
    date: '2024年10月12日',
    readTime: '5分钟阅读',
    tags: ['设计', '极简主义', '哲学'],
    imageUrl: '/ArtTextStudio.jpg',
    content: `在一个渴望注意力的世界里，沉默是一种奢侈。数字静默不是关于空虚；它是关于清晰。这是一种刻意的选择，去除不必要的东西，让本质发声。

当我们用负空间（留白）进行设计时，我们不仅仅是留下空的像素。我们正在创造一个停顿。一次呼吸。这种停顿允许用户处理、理解并欣赏保留下来的内容。

## 减法的力量

减法比加法更难。它需要自信。它需要我们说："这就够了。"在我最近的项目中，我一直在尝试去除边框，减少调色板，并严重依赖排版和间距来构建结构。

结果呢？界面感觉更轻盈、更快速、更诚实。我们不再躲在装饰后面，而是让内容自己站得住脚。

## 认知负荷与留白

屏幕上的每一个元素都会增加用户的认知负荷。通过增加留白（或负空间），我们降低了大脑需要一次性处理的信息密度。这不仅仅是一个审美选择；这是一个无障碍选择。

## 结论

随着我们在数字时代的推进，我相信最成功的产品将是那些尊重用户时间和注意力的产品。那些在互联网的混乱中提供宁静避风港的产品。让我们为静默而设计。`
  },
  {
    id: '2',
    title: '生长的算法',
    excerpt: '受自然界有机生长模式启发的程序化生成技术。',
    date: '2024年9月28日',
    readTime: '8分钟阅读',
    tags: ['生成艺术', '算法', '自然'],
    imageUrl: '/ETBSaveManager.jpg',
    content: `大自然是终极的程序员。从树木的分支到贝壳的螺旋，生物学遵循数学规则。作为创意开发者，我们可以模仿这些规则来创造"有机"的数字体验。

我最喜欢的技术之一是 L-系统（Lindenmayer systems），这是一种并行重写系统和一种形式语法。最初开发用于描述植物细胞的行为，现在广泛用于计算机图形学中，模拟植物发育的生长过程。

## 随机之美

真正的随机可能让人感觉混乱和刺耳。大自然不是随机的；它是有引导的随机。它是"柏林噪声"而不是"Math.random()"。

在我的项目中实施生成式生长时，我经常使用噪声函数来确定方向和长度，确保虽然没有两棵树是完全相同的，但它们看起来都属于同一片森林。

## 代码如花园

我喜欢把我的代码库看作花园。你播种（算法），浇水（数据），修剪（重构）。有时，意想不到的错误会变成美丽的功能——一种创造全新事物的数字突变。`
  }
];

export const GALLERY_ITEMS: ArtItem[] = [
  { id: '1', title: 'Ink Flow', url: 'https://picsum.photos/600/800?random=30', aspectRatio: 'tall' },
  { id: '2', title: 'Abstract Thought', url: 'https://picsum.photos/800/600?random=31', aspectRatio: 'wide' },
  { id: '3', title: 'Serenity', url: 'https://picsum.photos/600/600?random=32', aspectRatio: 'square' },
];

export const VIDEOS_EN: VideoItem[] = [
  {
    id: '1',
    title: 'Building a React App from Scratch',
    description: 'A step-by-step guide to setting up a modern React project with Vite and TypeScript.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=100',
    bilibiliUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
    bilibiliEmbedId: 'BV1GJ411x7h7',
    noteContent: `## Getting Started\n\nIn this tutorial, we'll build a React application from scratch using Vite.\n\n### Prerequisites\n- Node.js 18+\n- Basic knowledge of JavaScript\n\n### Step 1: Project Setup\n\n\`\`\`bash\nnpm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install\n\`\`\`\n\n### Step 2: Project Structure\n\nWe'll organize our project with a clean component structure...`,
    duration: '45:32',
    date: '2024-10-12',
    category: 'React Tutorial',
    tags: ['React', 'Vite', 'TypeScript', 'Tutorial'],
  },
  {
    id: '2',
    title: 'Mastering Tailwind CSS',
    description: 'Learn advanced Tailwind CSS techniques for building beautiful, responsive UIs.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=101',
    bilibiliUrl: 'https://www.bilibili.com/video/BV1GJ411x7h8',
    bilibiliEmbedId: 'BV1GJ411x7h8',
    noteContent: `## Tailwind CSS Deep Dive\n\nIn this video, we explore advanced Tailwind CSS patterns.\n\n### Custom Configurations\n\n\`\`\`js\n// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          500: '#2d6a4f',\n        },\n      },\n    },\n  },\n};\n\`\`\`\n\n### Responsive Design\n\nTailwind makes responsive design easy with its breakpoint system...`,
    duration: '32:15',
    date: '2024-09-28',
    category: 'CSS',
    tags: ['Tailwind CSS', 'CSS', 'Design', 'Tutorial'],
  },
];

export const VIDEOS_ZH: VideoItem[] = [
  {
    id: '1',
    title: '从零搭建 React 应用',
    description: '一步步教你使用 Vite 和 TypeScript 搭建现代 React 项目的完整指南。',
    thumbnailUrl: 'https://picsum.photos/800/450?random=100',
    bilibiliUrl: 'https://www.bilibili.com/video/BV1GJ411x7h7',
    bilibiliEmbedId: 'BV1GJ411x7h7',
    noteContent: `## 开始\n\n在本教程中，我们将使用 Vite 从零搭建一个 React 应用。\n\n### 前置要求\n- Node.js 18+\n- JavaScript 基础知识\n\n### 第一步：项目初始化\n\n\`\`\`bash\nnpm create vite@latest my-app -- --template react-ts\ncd my-app\nnpm install\n\`\`\`\n\n### 第二步：项目结构\n\n我们将使用清晰的组件结构来组织项目...`,
    duration: '45:32',
    date: '2024年10月12日',
    category: 'React 教程',
    tags: ['React', 'Vite', 'TypeScript', '教程'],
  },
  {
    id: '2',
    title: 'Tailwind CSS 精通指南',
    description: '学习使用 Tailwind CSS 的高级技巧，构建美观、响应式的用户界面。',
    thumbnailUrl: 'https://picsum.photos/800/450?random=101',
    bilibiliUrl: 'https://www.bilibili.com/video/BV1GJ411x7h8',
    bilibiliEmbedId: 'BV1GJ411x7h8',
    noteContent: `## Tailwind CSS 深入探索\n\n在本视频中，我们将探索高级 Tailwind CSS 模式。\n\n### 自定义配置\n\n\`\`\`js\n// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          500: '#2d6a4f',\n        },\n      },\n    },\n  },\n};\n\`\`\`\n\n### 响应式设计\n\nTailwind 的断点系统让响应式设计变得非常简单...`,
    duration: '32:15',
    date: '2024年9月28日',
    category: 'CSS',
    tags: ['Tailwind CSS', 'CSS', '设计', '教程'],
  },
];

// --- SELECTORS ---

export const getProjects = (lang: Language) => lang === 'zh' ? PROJECTS_ZH : PROJECTS_EN;
export const getBlogPosts = (lang: Language) => lang === 'zh' ? BLOG_POSTS_ZH : BLOG_POSTS_EN;
export const getVideos = (lang: Language) => lang === 'zh' ? VIDEOS_ZH : VIDEOS_EN;
