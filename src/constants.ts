
import { ArtItem, Project, BlogPost } from "./types";
import { Language } from "./utils/translations";

// --- ENGLISH DATA ---

const PROJECTS_EN: Project[] = [
  {
    id: '1',
    title: 'EcoTrack Dashboard',
    description: 'A comprehensive analytics platform for tracking personal carbon footprints and sustainable habits.',
    fullDescription: 'EcoTrack is designed to help individuals visualize their environmental impact through intuitive data visualization. The dashboard aggregates data from smart home devices and manual inputs to calculate daily carbon footprints.',
    category: 'Web App',
    features: [
      'Real-time energy consumption visualization using D3.js',
      'Gamified goal tracking system',
      'Smart device integration (IoT)',
      'Exportable PDF reports'
    ],
    tags: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    imageUrl: 'https://picsum.photos/800/600?random=1',
    demoUrl: 'https://example.com/ecotrack',
    repoUrl: 'https://github.com/eververdants/ecotrack'
  },
  {
    id: '2',
    title: 'Verdant UI Kit',
    description: 'An open-source React component library focused on accessibility and nature-inspired aesthetics.',
    fullDescription: 'Verdant UI is a set of accessible, reusable React components built with Tailwind CSS. It features a unique design system inspired by organic shapes and colors, making it perfect for eco-friendly brands.',
    category: 'Open Source',
    features: [
      'Fully accessible (WCAG 2.1 AA compliant)',
      '30+ pre-built components',
      'Dark mode support out of the box',
      'Comprehensive Storybook documentation'
    ],
    tags: ['TypeScript', 'Tailwind', 'Storybook', 'NPM'],
    imageUrl: 'https://picsum.photos/800/600?random=2',
    demoUrl: 'https://example.com/verdant-ui',
    repoUrl: 'https://github.com/eververdants/verdant-ui'
  },
  {
    id: '3',
    title: 'Forest Whisperer',
    description: 'An ambient sound generator app that brings the sounds of different forest ecosystems to your browser.',
    fullDescription: 'An immersive audio experience that uses the Web Audio API to procedurally generate nature sounds. Users can mix different layers like rain, wind, and wildlife to create their perfect focus environment.',
    category: 'Creative',
    features: [
      'Procedural audio generation',
      'Spatial audio effects',
      'Offline support (PWA)',
      'Background play capability'
    ],
    tags: ['Web Audio API', 'Vue', 'Firebase', 'PWA'],
    imageUrl: 'https://picsum.photos/800/600?random=3',
    demoUrl: 'https://example.com/forest',
    repoUrl: 'https://github.com/eververdants/forest-whisperer'
  },
  {
    id: '4',
    title: 'Zen Notes',
    description: 'A distraction-free markdown editor for writers who need focus.',
    fullDescription: 'Zen Notes is a minimal text editor that removes all UI clutter. It supports markdown syntax highlighting, local storage auto-save, and a unique "Typewriter Mode" that keeps the active line centered.',
    category: 'Web App',
    features: [
      'Minimalist interface',
      'Markdown support',
      'Typewriter scrolling mode',
      'Dark/Light themes'
    ],
    tags: ['React', 'Zustand', 'LocalForage'],
    imageUrl: 'https://picsum.photos/800/600?random=4',
    demoUrl: 'https://example.com/zen-notes',
    repoUrl: 'https://github.com/eververdants/zen-notes'
  },
  {
    id: '5',
    title: 'Botanical ID',
    description: 'AI-powered mobile web app for identifying plants from photos.',
    fullDescription: 'Using TensorFlow.js, this application runs a lightweight image classification model directly in the browser to identify common house plants and provide care instructions.',
    category: 'AI / ML',
    features: [
      'On-device image classification',
      'Plant care database',
      'Watering reminders',
      'Camera API integration'
    ],
    tags: ['TensorFlow.js', 'React', 'PWA'],
    imageUrl: 'https://picsum.photos/800/600?random=5',
    demoUrl: 'https://example.com/botanical-id',
    repoUrl: 'https://github.com/eververdants/botanical-id'
  }
];

const PHOTOGRAPHY_ITEMS_EN: ArtItem[] = [
  {
    id: '1',
    title: 'Urban Solitude',
    description: 'A quiet moment amidst the hustle of Shinjuku station. The contrast between the stationary figure and the blur of the crowd emphasizes the feeling of isolation in a megacity.',
    url: 'https://picsum.photos/600/800?random=10',
    aspectRatio: 'tall',
    location: 'Shinjuku, Tokyo',
    date: 'November 2023',
    technicalDetails: {
      camera: 'Sony A7R IV',
      lens: '35mm f/1.4 GM',
      aperture: 'f/2.8',
      shutterSpeed: '1/60s',
      iso: '800'
    }
  },
  {
    id: '2',
    title: 'Neon Nights',
    description: 'The cyberpunk aesthetic of Hong Kong streets after rain. The reflections on the wet pavement create a mirror world of neon signs.',
    url: 'https://picsum.photos/800/600?random=11',
    aspectRatio: 'wide',
    location: 'Mong Kok, Hong Kong',
    date: 'January 2024',
    technicalDetails: {
      camera: 'Fujifilm X-T5',
      lens: '23mm f/2',
      aperture: 'f/2.0',
      shutterSpeed: '1/125s',
      iso: '1600'
    }
  },
  {
    id: '3',
    title: 'Morning Fog',
    description: 'Early morning at the bamboo grove. The mist softened the light, creating an ethereal atmosphere that felt timeless.',
    url: 'https://picsum.photos/600/600?random=12',
    aspectRatio: 'square',
    location: 'Arashiyama, Kyoto',
    date: 'March 2023',
    technicalDetails: {
      camera: 'Canon R5',
      lens: '24-70mm f/2.8',
      aperture: 'f/4.0',
      shutterSpeed: '1/200s',
      iso: '400'
    }
  },
  {
    id: '4',
    title: 'Glass & Steel',
    description: 'Looking up at the monolithic structures of Manhattan. The geometry of modern architecture creates abstract patterns against the sky.',
    url: 'https://picsum.photos/600/800?random=13',
    aspectRatio: 'tall',
    location: 'Manhattan, NYC',
    date: 'September 2023',
    technicalDetails: {
      camera: 'Sony A7R IV',
      lens: '16-35mm f/2.8',
      aperture: 'f/8.0',
      shutterSpeed: '1/500s',
      iso: '100'
    }
  },
  {
    id: '5',
    title: 'Horizon',
    description: 'The stark contrast of black sand beaches against the white crashing waves. Iceland offers a landscape that feels alien yet deeply grounded.',
    url: 'https://picsum.photos/800/600?random=14',
    aspectRatio: 'wide',
    location: 'Reykjavik, Iceland',
    date: 'October 2023',
    technicalDetails: {
      camera: 'DJI Mavic 3',
      lens: '24mm Equiv.',
      aperture: 'f/2.8',
      shutterSpeed: '1/1000s',
      iso: '100'
    }
  },
  {
    id: '6',
    title: 'Shadow Play',
    description: 'Harsh sunlight creating deep shadows in the Gothic Quarter. The interplay of light and dark reveals the textures of the ancient walls.',
    url: 'https://picsum.photos/600/600?random=15',
    aspectRatio: 'square',
    location: 'Barcelona, Spain',
    date: 'July 2023',
    technicalDetails: {
      camera: 'Leica Q2',
      lens: '28mm f/1.7',
      aperture: 'f/5.6',
      shutterSpeed: '1/1000s',
      iso: '200'
    }
  },
];

const CALLIGRAPHY_ITEMS_EN: ArtItem[] = [
  {
    id: '1',
    title: 'Flow',
    content: '行云流水',
    description: 'Floating clouds, flowing water. Natural and smooth.',
    url: 'https://picsum.photos/500/1000?random=20',
    aspectRatio: 'tall'
  },
  {
    id: '2',
    title: 'Silence',
    content: '宁静致远',
    description: 'Tranquility yields transcendence.',
    url: 'https://picsum.photos/800/400?random=21',
    aspectRatio: 'wide'
  },
  {
    id: '3',
    title: 'Chaos',
    content: '龙飞凤舞',
    description: 'Dragon flies, phoenix dances. Flamboyant style.',
    url: 'https://picsum.photos/500/900?random=22',
    aspectRatio: 'tall'
  },
  {
    id: '4',
    title: 'Harmony',
    content: '上善若水',
    description: 'The highest excellence is like water.',
    url: 'https://picsum.photos/600/600?random=23',
    aspectRatio: 'square'
  },
];

const BLOG_POSTS_EN: BlogPost[] = [
  {
    id: '1',
    title: 'The Art of Digital Silence',
    excerpt: 'Exploring minimalism in web design and how negative space creates room for thought.',
    date: 'Oct 12, 2024',
    readTime: '5 min read',
    tags: ['Design', 'Minimalism', 'Philosophy'],
    imageUrl: 'https://picsum.photos/1200/600?random=101',
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
    imageUrl: 'https://picsum.photos/1200/600?random=102',
    content: `Nature is the ultimate coder. From the branching of trees to the spiral of a shell, biology follows mathematical rules. As creative developers, we can mimic these rules to create "organic" digital experiences.

One of my favorite techniques is L-systems (Lindenmayer systems), a parallel rewriting system and a type of formal grammar. Originally developed to describe the behavior of plant cells, it is now widely used in computer graphics to model the growth processes of plant development.

## The Beauty of Randomness

True randomness can feel chaotic and harsh. Nature isn't random; it's guided randomness. It's "Perlin Noise" rather than "Math.random()". 

When implementing generative growth in my projects, I often use noise functions to determine direction and length, ensuring that while no two trees are alike, they all look like they belong to the same forest.

## Code as a Garden

I like to think of my codebases as gardens. You plant the seeds (algorithms), you water them (data), and you prune them (refactoring). Sometimes, unexpected bugs turn into beautiful features—a digital mutation that creates something entirely new.`
  },
  {
    id: '3',
    title: 'Through the Lens: Urban Geometry',
    excerpt: 'A photo essay on finding order and symmetry in chaotic cityscapes.',
    date: 'Sep 15, 2024',
    readTime: '4 min read',
    tags: ['Photography', 'Urban', 'Composition'],
    imageUrl: 'https://picsum.photos/1200/600?random=103',
    content: `Cities are chaotic beasts. Noise, traffic, endless movement. But if you stop and look up, you find a hidden order.

My latest photography series focuses on the geometry of the city. The hard lines of skyscrapers against the soft clouds. The repeating patterns of windows. The perfect symmetry of a subway station.

## Finding the Frame

Photography is an act of exclusion. It's about what you choose to leave out of the frame. In a busy street, finding a clean composition is a challenge. It requires patience. You have to wait for the crowd to clear, for the light to hit just right.

## Shadows and Light

In urban environments, buildings act as giant sundials. The shadows they cast create dynamic shapes that change throughout the day. I prefer shooting in the early morning or late afternoon, where the shadows are long and dramatic, carving the city into high-contrast abstract shapes.`
  }
];

// --- CHINESE DATA ---

const PROJECTS_ZH: Project[] = [
  {
    id: '1',
    title: 'EcoTrack 仪表盘',
    description: '一个用于追踪个人碳足迹和可持续习惯的综合分析平台。',
    fullDescription: 'EcoTrack 旨在通过直观的数据可视化帮助个人了解其环境影响。该仪表盘汇集了来自智能家居设备和手动输入的数据，以计算每日碳足迹。',
    category: 'Web 应用',
    features: [
      '使用 D3.js 实现实时能耗可视化',
      '游戏化目标追踪系统',
      '智能设备集成 (IoT)',
      '可导出 PDF 报告'
    ],
    tags: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    imageUrl: 'https://picsum.photos/800/600?random=1',
    demoUrl: 'https://example.com/ecotrack',
    repoUrl: 'https://github.com/eververdants/ecotrack'
  },
  {
    id: '2',
    title: 'Verdant UI 组件库',
    description: '专注于无障碍访问和自然美学的开源 React 组件库。',
    fullDescription: 'Verdant UI 是一套使用 Tailwind CSS 构建的无障碍、可复用 React 组件。它具有独特的设计系统，灵感来自有机形状和色彩，非常适合环保品牌。',
    category: '开源项目',
    features: [
      '完全无障碍 (符合 WCAG 2.1 AA 标准)',
      '30+ 预构建组件',
      '开箱即用的深色模式支持',
      '详尽的 Storybook 文档'
    ],
    tags: ['TypeScript', 'Tailwind', 'Storybook', 'NPM'],
    imageUrl: 'https://picsum.photos/800/600?random=2',
    demoUrl: 'https://example.com/verdant-ui',
    repoUrl: 'https://github.com/eververdants/verdant-ui'
  },
  {
    id: '3',
    title: 'Forest Whisperer',
    description: '一个环境音生成器应用，将不同森林生态系统的声音带到您的浏览器。',
    fullDescription: '一种沉浸式音频体验，使用 Web Audio API 程序化生成自然声音。用户可以混合雨声、风声和野生动物等不同层级，创造完美的专注环境。',
    category: '创意类',
    features: [
      '程序化音频生成',
      '空间音频效果',
      '离线支持 (PWA)',
      '后台播放功能'
    ],
    tags: ['Web Audio API', 'Vue', 'Firebase', 'PWA'],
    imageUrl: 'https://picsum.photos/800/600?random=3',
    demoUrl: 'https://example.com/forest',
    repoUrl: 'https://github.com/eververdants/forest-whisperer'
  },
  {
    id: '4',
    title: 'Zen Notes',
    description: '为需要专注的写作者设计的无干扰 Markdown 编辑器。',
    fullDescription: 'Zen Notes 是一个极简的文本编辑器，去除了所有 UI 干扰。它支持 Markdown 语法高亮、本地存储自动保存，以及独特的“打字机模式”，可将当前行保持在屏幕中央。',
    category: 'Web 应用',
    features: [
      '极简界面',
      'Markdown 支持',
      '打字机滚动模式',
      '深色/浅色主题'
    ],
    tags: ['React', 'Zustand', 'LocalForage'],
    imageUrl: 'https://picsum.photos/800/600?random=4',
    demoUrl: 'https://example.com/zen-notes',
    repoUrl: 'https://github.com/eververdants/zen-notes'
  },
  {
    id: '5',
    title: 'Botanical ID',
    description: '基于 AI 的移动 Web 应用，通过照片识别植物。',
    fullDescription: '该应用程序使用 TensorFlow.js，直接在浏览器中运行轻量级图像分类模型，以识别常见的室内植物并提供养护说明。',
    category: 'AI / ML',
    features: [
      '端侧图像分类',
      '植物养护数据库',
      '浇水提醒',
      '相机 API 集成'
    ],
    tags: ['TensorFlow.js', 'React', 'PWA'],
    imageUrl: 'https://picsum.photos/800/600?random=5',
    demoUrl: 'https://example.com/botanical-id',
    repoUrl: 'https://github.com/eververdants/botanical-id'
  }
];

const PHOTOGRAPHY_ITEMS_ZH: ArtItem[] = [
  {
    id: '1',
    title: '城市孤寂',
    description: '新宿车站喧嚣中的片刻宁静。静止的身影与模糊的人群形成鲜明对比，强调了特大城市中的孤独感。',
    url: 'https://picsum.photos/600/800?random=10',
    aspectRatio: 'tall',
    location: '东京，新宿',
    date: '2023年11月',
    technicalDetails: {
      camera: 'Sony A7R IV',
      lens: '35mm f/1.4 GM',
      aperture: 'f/2.8',
      shutterSpeed: '1/60s',
      iso: '800'
    }
  },
  {
    id: '2',
    title: '霓虹之夜',
    description: '雨后香港街道的赛博朋克美学。湿润路面的倒影创造了一个霓虹标志的镜像世界。',
    url: 'https://picsum.photos/800/600?random=11',
    aspectRatio: 'wide',
    location: '香港，旺角',
    date: '2024年1月',
    technicalDetails: {
      camera: 'Fujifilm X-T5',
      lens: '23mm f/2',
      aperture: 'f/2.0',
      shutterSpeed: '1/125s',
      iso: '1600'
    }
  },
  {
    id: '3',
    title: '晨雾',
    description: '竹林清晨。雾气柔化了光线，营造出一种永恒的空灵氛围。',
    url: 'https://picsum.photos/600/600?random=12',
    aspectRatio: 'square',
    location: '京都，岚山',
    date: '2023年3月',
    technicalDetails: {
      camera: 'Canon R5',
      lens: '24-70mm f/2.8',
      aperture: 'f/4.0',
      shutterSpeed: '1/200s',
      iso: '400'
    }
  },
  {
    id: '4',
    title: '玻璃与钢铁',
    description: '仰望曼哈顿的巨型建筑。现代建筑的几何结构在天空中创造出抽象的图案。',
    url: 'https://picsum.photos/600/800?random=13',
    aspectRatio: 'tall',
    location: '纽约，曼哈顿',
    date: '2023年9月',
    technicalDetails: {
      camera: 'Sony A7R IV',
      lens: '16-35mm f/2.8',
      aperture: 'f/8.0',
      shutterSpeed: '1/500s',
      iso: '100'
    }
  },
  {
    id: '5',
    title: '地平线',
    description: '黑沙滩与白色巨浪的强烈对比。冰岛提供了一种仿佛外星却又深深扎根于地球的景观。',
    url: 'https://picsum.photos/800/600?random=14',
    aspectRatio: 'wide',
    location: '冰岛，雷克雅未克',
    date: '2023年10月',
    technicalDetails: {
      camera: 'DJI Mavic 3',
      lens: '24mm 等效',
      aperture: 'f/2.8',
      shutterSpeed: '1/1000s',
      iso: '100'
    }
  },
  {
    id: '6',
    title: '光影游戏',
    description: '哥特区强烈的阳光投下深深的阴影。光与暗的交织揭示了古老墙壁的纹理。',
    url: 'https://picsum.photos/600/600?random=15',
    aspectRatio: 'square',
    location: '西班牙，巴塞罗那',
    date: '2023年7月',
    technicalDetails: {
      camera: 'Leica Q2',
      lens: '28mm f/1.7',
      aperture: 'f/5.6',
      shutterSpeed: '1/1000s',
      iso: '200'
    }
  },
];

const CALLIGRAPHY_ITEMS_ZH: ArtItem[] = [
  {
    id: '1',
    title: '流',
    content: '行云流水',
    description: '如云漂浮，如水流动。自然而流畅。',
    url: 'https://picsum.photos/500/1000?random=20',
    aspectRatio: 'tall'
  },
  {
    id: '2',
    title: '静',
    content: '宁静致远',
    description: '宁静以致远。平稳的心态有助于实现远大的目标。',
    url: 'https://picsum.photos/800/400?random=21',
    aspectRatio: 'wide'
  },
  {
    id: '3',
    title: '乱',
    content: '龙飞凤舞',
    description: '如龙飞翔，如凤起舞。形容笔势生动活泼。',
    url: 'https://picsum.photos/500/900?random=22',
    aspectRatio: 'tall'
  },
  {
    id: '4',
    title: '和',
    content: '上善若水',
    description: '最高尚的品德像水一样。',
    url: 'https://picsum.photos/600/600?random=23',
    aspectRatio: 'square'
  },
];

const BLOG_POSTS_ZH: BlogPost[] = [
  {
    id: '1',
    title: '数字静默的艺术',
    excerpt: '探索网页设计中的极简主义，以及留白如何为思考创造空间。',
    date: '2024年10月12日',
    readTime: '5分钟阅读',
    tags: ['设计', '极简主义', '哲学'],
    imageUrl: 'https://picsum.photos/1200/600?random=101',
    content: `在一个渴望注意力的世界里，沉默是一种奢侈。数字静默不是关于空虚；它是关于清晰。这是一种刻意的选择，去除不必要的东西，让本质发声。

当我们用负空间（留白）进行设计时，我们不仅仅是留下空的像素。我们正在创造一个停顿。一次呼吸。这种停顿允许用户处理、理解并欣赏保留下来的内容。

## 减法的力量

减法比加法更难。它需要自信。它需要我们说：“这就够了。”在我最近的项目中，我一直在尝试去除边框，减少调色板，并严重依赖排版和间距来构建结构。

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
    imageUrl: 'https://picsum.photos/1200/600?random=102',
    content: `大自然是终极的程序员。从树木的分支到贝壳的螺旋，生物学遵循数学规则。作为创意开发者，我们可以模仿这些规则来创造“有机”的数字体验。

我最喜欢的技术之一是 L-系统（Lindenmayer systems），这是一种并行重写系统和一种形式语法。最初开发用于描述植物细胞的行为，现在广泛用于计算机图形学中，模拟植物发育的生长过程。

## 随机之美

真正的随机可能让人感觉混乱和刺耳。大自然不是随机的；它是有引导的随机。它是“柏林噪声”而不是“Math.random()”。

在我的项目中实施生成式生长时，我经常使用噪声函数来确定方向和长度，确保虽然没有两棵树是完全相同的，但它们看起来都属于同一片森林。

## 代码如花园

我喜欢把我的代码库看作花园。你播种（算法），浇水（数据），修剪（重构）。有时，意想不到的错误会变成美丽的功能——一种创造全新事物的数字突变。`
  },
  {
    id: '3',
    title: '镜头之下：城市几何',
    excerpt: '一篇关于在混乱的城市景观中寻找秩序和对称的摄影随笔。',
    date: '2024年9月15日',
    readTime: '4分钟阅读',
    tags: ['摄影', '城市', '构图'],
    imageUrl: 'https://picsum.photos/1200/600?random=103',
    content: `城市是混乱的野兽。噪音，交通，无休止的移动。但如果你停下来抬头看，你会发现一种隐藏的秩序。

我最新的摄影系列专注于城市的几何形状。摩天大楼的硬朗线条对比柔软的云层。窗户的重复图案。地铁站的完美对称。

## 寻找构图

摄影是一种排除的行为。它是关于你选择把什么留在画面之外。在繁忙的街道上，找到一个干净的构图是一个挑战。它需要耐心。你必须等待人群散去，等待光线恰到好处。

## 光与影

在城市环境中，建筑物充当巨大的日晷。它们投下的阴影创造了全天变化的动态形状。我更喜欢在清晨或傍晚拍摄，那时的阴影长而富有戏剧性，将城市切割成高对比度的抽象形状。`
  }
];

export const GALLERY_ITEMS: ArtItem[] = [
  { id: '1', title: 'Ink Flow', url: 'https://picsum.photos/600/800?random=30', aspectRatio: 'tall' },
  { id: '2', title: 'Abstract Thought', url: 'https://picsum.photos/800/600?random=31', aspectRatio: 'wide' },
  { id: '3', title: 'Serenity', url: 'https://picsum.photos/600/600?random=32', aspectRatio: 'square' },
];

// --- SELECTOR ---

export const getProjects = (lang: Language) => lang === 'zh' ? PROJECTS_ZH : PROJECTS_EN;
export const getPhotographyItems = (lang: Language) => lang === 'zh' ? PHOTOGRAPHY_ITEMS_ZH : PHOTOGRAPHY_ITEMS_EN;
export const getCalligraphyItems = (lang: Language) => lang === 'zh' ? CALLIGRAPHY_ITEMS_ZH : CALLIGRAPHY_ITEMS_EN;
export const getBlogPosts = (lang: Language) => lang === 'zh' ? BLOG_POSTS_ZH : BLOG_POSTS_EN;
