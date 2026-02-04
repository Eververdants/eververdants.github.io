
export type Language = 'en' | 'zh';

export type TranslationKey = string;

export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      noData: 'No Data Found',
      noDataDesc: 'There is no content available at the moment',
    },
    nav: {
      home: 'Home',
      projects: 'Projects',
      photography: 'Photography',
      calligraphy: 'Calligraphy',
      blog: 'Blog',
      contact: 'Contact Me',
      letsTalk: "Let's Talk"
    },
    hero: {
      title: 'Code, Lens,',
      titleHighlight: '& Ink.',
      intro: 'Hi, I\'m',
      introDesc: 'A creative developer who finds balance through photography and traditional calligraphy.',
      viewProjects: 'View Projects',
      viewGallery: 'View Gallery',
      cards: {
        code: 'Code',
        codeDesc: 'Frontend Architecture',
        photo: 'Photo',
        ink: 'Ink'
      }
    },
    sections: {
      projects: {
        title: 'Selected Works',
        subtitle: 'Digital experiments and production applications.',
        archiveTitle: 'Project Archive',
        archiveSubtitle: 'A complete collection of my digital experiments, open-source libraries, and client work.',
        viewAll: 'View All Projects',
        demo: 'Website',
        source: 'Source Code',
        features: 'Key Features',
        tech: 'Technologies'
      },
      photography: {
        title: 'Visual Stories',
        subtitle: 'Frozen moments of light and shadow.',
        galleryTitle: 'Captured Moments',
        gallerySubtitle: 'A visual diary of light, shadows, and the quiet spaces in between.',
        viewGallery: 'View Gallery',
        techDetails: 'Technical Details',
        download: 'Download Original',
        camera: 'Camera',
        aperture: 'Aperture',
        lens: 'Lens',
        iso: 'ISO',
        shutter: 'Shutter',
        license: 'Free for personal use. Attribution appreciated.'
      },
      calligraphy: {
        title: 'Ink & Paper',
        subtitle: 'Traditional aesthetics in a modern world.',
        galleryTitle: 'Ink & Paper',
        gallerySubtitle: 'Exploring the balance between negative space, flow, and traditional aesthetics.',
        viewCollection: 'View Collection',
        originalText: 'Original Text',
        meaning: 'Meaning & Context',
        download: 'Download Artwork',
        license: 'High-resolution digital scan. Personal use only.'
      },
      blog: {
        title: 'The Journal',
        subtitle: 'Reflections on code, design, and nature.',
        readAll: 'Read All Articles',
        readFull: 'Read Full Story',
        back: 'Back to Journal',
        close: 'Close Article',
        by: 'By'
      },
      contact: {
        title: "Let's Connect",
        desc: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
        follow: 'Follow Me',
        location: 'Jiangsu, China',
        form: {
          name: 'Name',
          email: 'Email',
          message: 'Message',
          send: 'Send Message',
          sent: 'Message Sent!'
        }
      },
      footer: {
        madeWith: 'Made with',
        and: 'and'
      },
      aiMuse: {
        title: 'AI Muse',
        poweredBy: 'Powered by Gemini 3 Flash',
        greeting: 'Greetings. I am your creative muse. Give me a seed word, and I shall grow a thought.',
        placeholder: "Type a word (e.g., 'Silence', 'Ocean', 'Code')...",
        error: 'The connection to the ether is weak. Please try again.'
      },
      gallery: {
        title: 'Visual Harmony',
        subtitle: 'Exploring the balance between negative space and ink. A collection of calligraphy works.',
        category: 'Calligraphy'
      }
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      noData: '未发现数据',
      noDataDesc: '暂时没有内容',
    },
    nav: {
      home: '首页',
      projects: '项目',
      photography: '摄影',
      calligraphy: '书法',
      blog: '日志',
      contact: '联系我',
      letsTalk: '保持联系'
    },
    hero: {
      title: '代码、光影，',
      titleHighlight: '与翰墨。',
      intro: '你好，我是',
      introDesc: '一名在摄影与传统书法中寻找平衡的创意开发者。',
      viewProjects: '查看项目',
      viewGallery: '浏览画廊',
      cards: {
        code: '代码',
        codeDesc: '前端架构',
        photo: '摄影',
        ink: '书法'
      }
    },
    sections: {
      projects: {
        title: '精选作品',
        subtitle: '数字实验与生产级应用。',
        archiveTitle: '项目归档',
        archiveSubtitle: '我的数字实验、开源库和客户工作的完整合集。',
        viewAll: '查看所有项目',
        demo: '官网',
        source: '源代码',
        features: '核心特性',
        tech: '技术栈'
      },
      photography: {
        title: '视觉故事',
        subtitle: '凝固光影的瞬间。',
        galleryTitle: '捕捉瞬间',
        gallerySubtitle: '关于光、影以及它们之间静谧空间的视觉日记。',
        viewGallery: '查看画廊',
        techDetails: '拍摄参数',
        download: '下载原图',
        camera: '相机',
        aperture: '光圈',
        lens: '镜头',
        iso: 'ISO',
        shutter: '快门',
        license: '仅限个人使用，转载请注明出处。'
      },
      calligraphy: {
        title: '水墨纸砚',
        subtitle: '现代世界中的传统美学。',
        galleryTitle: '水墨纸砚',
        gallerySubtitle: '探索留白、流动与传统美学之间的平衡。',
        viewCollection: '查看合集',
        originalText: '原文',
        meaning: '释义与背景',
        download: '下载作品',
        license: '高分辨率数字扫描件。仅限个人使用。'
      },
      blog: {
        title: '日志',
        subtitle: '关于代码、设计与自然的思考。',
        readAll: '阅读所有文章',
        readFull: '阅读全文',
        back: '返回日志',
        close: '关闭文章',
        by: '作者'
      },
      contact: {
        title: '保持联系',
        desc: '我随时欢迎讨论新项目、创意点子，或者参与您愿景的机会。无论您有问题还是只想打个招呼，我都会尽力回复！',
        follow: '关注我',
        location: '中国江苏',
        form: {
          name: '姓名',
          email: '邮箱',
          message: '留言内容',
          send: '发送留言',
          sent: '发送成功！'
        }
      },
      footer: {
        madeWith: '制作于',
        and: '使用'
      },
      aiMuse: {
        title: 'AI 灵感缪斯',
        poweredBy: '由 Gemini 3 Flash 驱动',
        greeting: '你好。我是你的创意缪斯。给我一个词，我将为你生长出一个思想。',
        placeholder: '输入一个词（例如："静默"、"海洋"、"代码"）...',
        error: '与灵感之源的连接微弱。请稍后再试。'
      },
      gallery: {
        title: '视觉和谐',
        subtitle: '探索留白与墨迹之间的平衡。书法作品集。',
        category: '书法'
      }
    }
  }
};
