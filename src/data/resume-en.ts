import type { ResumeData } from './resume-zh';

export const resumeEn: ResumeData = {
  name: 'Eververdants',
  title: 'Creative Developer · Technical Educator',
  slogan: 'Write code. Write words.',
  avatar: '/images/avatar.png',
  skills: [
    { group: 'Frontend', items: ['TypeScript', 'React', 'Astro', 'Tailwind CSS'] },
    { group: 'Backend', items: ['Node.js', 'Rust'] },
    { group: 'Creative', items: ['Three.js', 'Generative imagery'] },
  ],
  experience: [
    { period: '2023 — Present', org: 'Freelance', role: 'Full-stack Developer', desc: 'Building personal products and open source projects.' },
  ],
  education: [
    { period: '—', org: '—', desc: 'Placeholder.' },
  ],
  contacts: [
    { label: 'GitHub', href: 'https://github.com/Eververdants' },
    { label: 'Email', href: 'mailto:eververdants@example.com' },
  ],
};
