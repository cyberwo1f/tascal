import { describe, it, expect } from 'vitest';
import {
  toISO,
  fromISO,
  addDays,
  dayOffset,
  dueInfo,
  weekdayLabel,
  todayMid,
} from './date';

describe('date ユーティリティ', () => {
  it('toISO は YYYY-MM-DD 形式にする', () => {
    expect(toISO(new Date(2026, 5, 19))).toBe('2026-06-19');
    expect(toISO(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('fromISO と toISO は往復で一致する', () => {
    const iso = '2026-06-19';
    expect(toISO(fromISO(iso))).toBe(iso);
  });

  it('addDays は日付を正しくずらす（月またぎ含む）', () => {
    const base = new Date(2026, 5, 19);
    expect(toISO(addDays(base, 1))).toBe('2026-06-20');
    expect(toISO(addDays(base, -1))).toBe('2026-06-18');
    expect(toISO(addDays(new Date(2026, 5, 30), 1))).toBe('2026-07-01');
  });

  it('dayOffset は今日からの相対日数を返す', () => {
    expect(dayOffset(toISO(todayMid()))).toBe(0);
    expect(dayOffset(toISO(addDays(todayMid(), 3)))).toBe(3);
    expect(dayOffset(toISO(addDays(todayMid(), -2)))).toBe(-2);
  });

  it('dueInfo は締切状態（今日・明日・過去・未来）を表す', () => {
    expect(dueInfo(null)).toBeNull();
    expect(dueInfo(toISO(todayMid()))).toMatchObject({ label: '今日', today: true });
    expect(dueInfo(toISO(addDays(todayMid(), 1)))).toMatchObject({ label: '明日', soon: true });
    expect(dueInfo(toISO(addDays(todayMid(), -1)))).toMatchObject({ label: '昨日', overdue: true });
    expect(dueInfo(toISO(addDays(todayMid(), 5)))).toMatchObject({ label: '5日後' });
    expect(dueInfo(toISO(addDays(todayMid(), -3)))).toMatchObject({ label: '3日前', overdue: true });
  });

  it('weekdayLabel は日本語 1 文字の曜日を返す', () => {
    // 2026-06-19 は金曜日
    expect(weekdayLabel(new Date(2026, 5, 19))).toBe('金');
  });
});
