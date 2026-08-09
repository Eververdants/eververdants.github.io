import { describe, it, expect } from 'vitest';
import { useTranslations } from './ui';

describe('useTranslations', () => {
  it('returns zh value for zh', () => {
    expect(useTranslations('zh')('nav.blog')).toBe('博客');
  });
  it('returns en value for en', () => {
    expect(useTranslations('en')('nav.blog')).toBe('Blog');
  });
  it('falls back to zh when key missing in en', () => {
    expect(useTranslations('en')('site.name')).toBe('Eververdants');
  });
});
