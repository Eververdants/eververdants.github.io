export interface ResumeData {
  name: string;
  title: string;
  slogan: string;
  avatar?: string;
  skills: { group: string; items: string[] }[];
  experience: { period: string; org: string; role: string; desc: string }[];
  education: { period: string; org: string; desc: string }[];
  contacts: { label: string; href: string }[];
}

export const resumeZh: ResumeData = {
  name: 'Eververdants',
  title: '创意开发者 · 技术教育者',
  slogan: '写代码，也写字。',
  avatar: '/images/avatar.png',
  skills: [
    { group: '前端', items: ['TypeScript', 'React', 'Astro', 'Tailwind CSS'] },
    { group: '后端', items: ['Node.js', 'Rust'] },
    { group: '创意', items: ['Three.js', '生成式图像'] },
  ],
  experience: [
    { period: '2023 — 至今', org: '自由职业', role: '全栈开发者', desc: '构建个人产品与开源项目。' },
  ],
  education: [
    { period: '—', org: '—', desc: '占位，待填。' },
  ],
  contacts: [
    { label: 'GitHub', href: 'https://github.com/Eververdants' },
    { label: 'Email', href: 'mailto:eververdants@example.com' },
  ],
};
