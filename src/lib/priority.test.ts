import { describe, it, expect } from 'vitest';
import { PRIORITY, PRIORITY_RANK, PRIORITY_CYCLE } from './priority';

describe('priority ユーティリティ', () => {
  it('PRIORITY_RANK は high < med < low（数値が小さいほど先頭）', () => {
    expect(PRIORITY_RANK.high).toBeLessThan(PRIORITY_RANK.med);
    expect(PRIORITY_RANK.med).toBeLessThan(PRIORITY_RANK.low);
  });

  it('PRIORITY_CYCLE は low → med → high の順', () => {
    expect(PRIORITY_CYCLE).toEqual(['low', 'med', 'high']);
  });

  it('PRIORITY は各優先度にラベルと色を持つ', () => {
    expect(PRIORITY.high.label).toBe('高');
    expect(PRIORITY.med.label).toBe('中');
    expect(PRIORITY.low.label).toBe('低');
    expect(PRIORITY.high.color).toMatch(/^var\(--/);
  });
});
