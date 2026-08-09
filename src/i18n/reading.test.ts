import { describe, it, expect } from 'vitest';
import { readingTime } from './reading';

describe('readingTime', () => {
  it('counts Chinese at ~300 chars/min', () => {
    expect(readingTime('好。'.repeat(300), 'zh')).toBeGreaterThan(0);
    expect(readingTime('好。'.repeat(300), 'zh')).toBeLessThanOrEqual(1);
  });
  it('counts English at ~200 wpm', () => {
    expect(readingTime('word '.repeat(200), 'en')).toBeLessThanOrEqual(1);
  });
  it('returns at least 1 minute', () => {
    expect(readingTime('hi', 'en')).toBe(1);
  });
});
