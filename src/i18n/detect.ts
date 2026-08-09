export type Lang = 'zh' | 'en';

export function detectLanguage(languages: readonly string[]): Lang {
  const list = languages.length > 0 ? languages : ['zh'];
  for (const item of list) {
    const primary = item.toLowerCase().slice(0, 2);
    if (primary === 'zh') return 'zh';
    if (primary === 'en') return 'en';
  }
  return 'zh';
}
