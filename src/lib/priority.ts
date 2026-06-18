import type { Priority } from '../types';

/** 優先度ごとの表示色（CSS 変数）とラベル */
export const PRIORITY: Record<Priority, { color: string; label: string }> = {
  high: { color: 'var(--p-high)', label: '高' },
  med: { color: 'var(--p-med)', label: '中' },
  low: { color: 'var(--p-low)', label: '低' },
};

/** ソート用の優先度ランク（高いほど先頭） */
export const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  med: 1,
  low: 2,
};

/** 追加バーで優先度を循環させる順序 */
export const PRIORITY_CYCLE: Priority[] = ['low', 'med', 'high'];
