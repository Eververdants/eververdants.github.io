
export type Language = 'en' | 'zh';

export type TranslationKey = string;

export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      noData: 'No data yet',
      noDataDesc: 'Nothing here at the moment.',
    },
    nav: {
      home: 'Home',
      projects: 'Projects',
      photography: 'Photography',
      calligraphy: 'Calligraphy',
      blog: 'Blog',
      videos: 'Videos'
    },
    hero: {
      title: 'Code, Lens,',
      titleHighlight: '& Teach.',
      intro: 'Hi, I\'m',
      introDesc: 'A creative developer who finds balance through photography and traditional calligraphy.',
      viewProjects: 'View Projects',
      viewGallery: 'View Gallery',
      viewBlog: 'Browse Blog',
      findMe: 'Find me on',
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
        back: 'Back to Projects',
        demo: 'Website',
        source: 'Source Code',
        features: 'Key Features',
        tech: 'Technologies'
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
      footer: {
        madeWith: 'Made with',
        and: 'and'
      },
      videos: {
        title: 'Video Tutorials',
        subtitle: 'Step-by-step guides to mastering development skills.',
        archiveTitle: 'Video Library',
        archiveSubtitle: 'A collection of tutorials, walkthroughs, and deep dives.',
        viewAll: 'View All Videos',
        back: 'Back to Videos',
        watchOnBilibili: 'Watch on Bilibili',
        notes: 'Notes',
        duration: 'Duration',
        published: 'Published',
        relatedResources: 'Related Resources',
        relatedArticle: 'Related Article',
        sourceCode: 'Source Code',
        empty: 'No videos found',
        emptyDesc: 'Check back later for new tutorials and content.',
        category: 'Category',
      }
    }
  },
  zh: {
    common: {
      loading: '加载中...',
      noData: '暂无数据',
      noDataDesc: '这里还没有内容。',
    },
    nav: {
      home: '首页',
      projects: '项目',
      photography: '摄影',
      calligraphy: '书法',
      blog: '日志',
      videos: '视频'
    },
    hero: {
      title: '代码、光影，',
      titleHighlight: '与分享。',
      intro: '你好，我是',
      introDesc: '一名在摄影与传统书法中寻找平衡的创意开发者。',
      viewProjects: '查看项目',
      viewGallery: '浏览画廊',
      viewBlog: '浏览博客',
      findMe: '关注我',
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
        back: '返回项目列表',
        demo: '官网',
        source: '源代码',
        features: '核心特性',
        tech: '技术栈'
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
      footer: {
        madeWith: '制作于',
        and: '使用'
      },
      videos: {
        title: '视频教程',
        subtitle: '一步步教你掌握开发技能。',
        archiveTitle: '视频库',
        archiveSubtitle: '教程合集、实战演练与技术深潜。',
        viewAll: '查看所有视频',
        back: '返回视频列表',
        watchOnBilibili: '在 Bilibili 观看',
        notes: '文案笔记',
        duration: '时长',
        published: '发布于',
        relatedResources: '相关资源',
        relatedArticle: '关联文章',
        sourceCode: '源码下载',
        empty: '暂无视频',
        emptyDesc: '请稍后再来查看新的教程和内容。',
        category: '分类',
      }
    }
  }
};
