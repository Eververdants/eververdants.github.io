export interface SocialPlatform {
  id: string;
  name: {
    zh: string;
    en: string;
  };
  icon: string;
  url: string;
  followers?: string;
  primary: boolean;
  color: string;
  gradient: [string, string];
}

export const socialPlatforms: SocialPlatform[] = [
  {
    id: 'bilibili',
    name: { zh: '哔哩哔哩', en: 'Bilibili' },
    icon: 'bilibili',
    url: 'https://space.bilibili.com/2019959464',
    followers: '290+',
    primary: true,
    color: '#FB7299',
    gradient: ['#FB7299', '#e85d8a'],
  },
  {
    id: 'douyin',
    name: { zh: '抖音', en: 'Douyin' },
    icon: 'douyin',
    url: 'https://www.douyin.com/user/MS4wLjABAAAA8MEFE6VVh4_nWkTLPbueZYywgSyN19xhUFkmDF-nkhlnWytZWiBZ9YWM5s3RsprJ',
    followers: '690+',
    primary: true,
    color: '#FE2C55',
    gradient: ['#25F4EE', '#FE2C55'],
  },
  {
    id: 'github',
    name: { zh: 'GitHub', en: 'GitHub' },
    icon: 'github',
    url: 'https://github.com/Eververdants',
    followers: '4.2k',
    primary: false,
    color: '#8b949e',
    gradient: ['#8b949e', '#6e7681'],
  },
  {
    id: 'qq',
    name: { zh: 'QQ群', en: 'QQ Group' },
    icon: 'qq',
    url: 'https://qm.qq.com/q/5rKPP37VJK',
    primary: false,
    color: '#12B7F5',
    gradient: ['#12B7F5', '#0d96d4'],
  },
  {
    id: 'wechat',
    name: { zh: '微信', en: 'WeChat' },
    icon: 'wechat',
    url: '#',
    followers: '5.6k',
    primary: false,
    color: '#07C160',
    gradient: ['#07C160', '#06ad56'],
  },
];

export const primaryPlatforms = socialPlatforms.filter((p) => p.primary);
export const secondaryPlatforms = socialPlatforms.filter((p) => !p.primary);
