import type { Lang } from './detect';

export function readingTime(text: string, lang: Lang): number {
  const cjk = (text.match(/[一-鿿]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
  let minutes: number;
  if (lang === 'zh') {
    minutes = cjk / 300 + latin / 150;
  } else {
    minutes = latin / 200 + cjk / 600;
  }
  return Math.max(1, Math.round(minutes));
}
