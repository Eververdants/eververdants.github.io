import { describe, it, expect } from 'vitest';
import { detectLanguage } from './detect';

describe('detectLanguage', () => {
  it('returns zh when browser prefers Chinese', () => {
    expect(detectLanguage(['zh-CN', 'zh', 'en'])).toBe('zh');
  });
  it('returns en when browser prefers English', () => {
    expect(detectLanguage(['en-US', 'en', 'zh'])).toBe('en');
  });
  it('defaults to zh when no en preference', () => {
    expect(detectLanguage(['ja-JP'])).toBe('zh');
  });
  it('handles empty input', () => {
    expect(detectLanguage([])).toBe('zh');
  });
});
