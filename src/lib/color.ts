// 色ユーティリティ

/** #rrggbb / #rgb を rgba(...) へ変換（アクセントカラーの薄い背景生成などに使う） */
export function hexA(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** 新規プロジェクトに割り当てる色のパレット */
export const PROJECT_PALETTE = [
  '#5b8def',
  '#42d3a8',
  '#f0b95b',
  '#c08bf0',
  '#f2796d',
  '#5ed3e0',
];

/** サイドバーのタグ「#」に使う色のパレット */
export const TAG_PALETTE = [
  'var(--accent)',
  'var(--accent2)',
  'var(--p-med)',
  '#c08bf0',
  '#5ed3e0',
  'var(--p-high)',
];
