/* Resume content, shared by the hub's About portal and the /about sub-site.

   Every human-readable field is a {en, zh} pair so neither page can render
   English copy inside the other language — the earlier English-only shape
   leaked "First Prize (Jiangsu Provincial)" and the focus list into Chinese
   mode. These values are also read in inline contexts (the hub's fact list,
   the /about summary), so they carry no hard line breaks — display type
   wraps them with text-wrap instead. */

export interface Localized {
  en: string;
  zh: string;
}

export interface Resume {
  about: Localized;
  birthYear: number;
  education: {
    role: Localized;
    school: Localized;
    location: Localized;
  };
  awards: Array<{
    campaign?: Localized;
    contest: Localized;
    event: Localized;
    results: Array<{ tier: Localized; scope: Localized }>;
  }>;
  focus: Localized[];
  contact: {
    label: Localized;
    handle: string;
    href: string;
    wechat?: string;
  };
}

export const resume: Resume = {
  about: {
    en: "High-school student building at the intersection of code, design, photography, and essays on Mao Zedong's Selected Works. Reach me on WeChat: evervdev.",
    zh: "高中生，在代码、设计、摄影与《毛选》研读之间做东西。微信联系：evervdev。",
  },
  birthYear: 2011,
  education: {
    role: { en: "Student", zh: "学生" },
    school: {
      en: "Kunshan Bailu Senior High School",
      zh: "昆山市柏庐高级中学",
    },
    location: { en: "Kunshan, Jiangsu", zh: "江苏昆山" },
  },
  awards: [
    {
      campaign: {
        en: 'China "Chip" Powers China Dream',
        zh: "「中国芯 助力中国梦」",
      },
      contest: {
        en: "National Youth Communication Technology Innovation Competition",
        zh: "全国青少年通信科技创新大赛",
      },
      event: {
        en: "Zhenxin Tech · Communication Intelligence Innovation Contest",
        zh: "振芯科技 · 通信智能创新赛",
      },
      results: [
        {
          tier: { en: "First Prize", zh: "一等奖" },
          scope: { en: "Jiangsu Provincial", zh: "江苏省级" },
        },
        {
          tier: { en: "Third Prize", zh: "三等奖" },
          scope: { en: "National Finals", zh: "全国总决赛" },
        },
      ],
    },
  ],
  focus: [
    { en: "Development", zh: "开发" },
    { en: "Design", zh: "设计" },
    { en: "Photography", zh: "摄影" },
    { en: "Calligraphy", zh: "书法" },
    { en: "Gaming", zh: "游戏" },
    { en: "Digital Creation", zh: "数字创作" },
    { en: "Chinese Literature", zh: "中文写作" },
    { en: "Self-Expression", zh: "自我表达" },
  ],
  contact: {
    label: { en: "GitHub", zh: "GitHub" },
    handle: "Eververdants",
    href: "https://github.com/Eververdants",
    wechat: "evervdev",
  },
};
