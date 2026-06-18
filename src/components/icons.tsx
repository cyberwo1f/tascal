// アイコン群（プロトタイプの SVG をそのまま移植）

/** Tascal のロゴマーク（中心の白丸 + 3 色の衛星 + リング） */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5" />
      <circle cx="50" cy="50" r="11" fill="#fff" />
      <circle cx="50" cy="20" r="9" fill="#5b8def" />
      <circle cx="24" cy="66" r="9" fill="#42d3a8" />
      <circle cx="76" cy="66" r="9" fill="#f0b95b" />
    </svg>
  );
}

interface CheckProps {
  size: number;
  /** 線幅（プロトタイプはサイズによって 3.2〜3.4 を使い分け） */
  strokeWidth?: number;
  /** チェックの描画アニメーションを付けるか */
  animate?: boolean;
  color?: string;
}

/** チェックマーク（チェックボックスがオンのとき表示） */
export function CheckIcon({ size, strokeWidth = 3.2, animate = false, color = 'var(--on-accent)' }: CheckProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12.5l5 5L20 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={animate ? 20 : undefined}
        className={animate ? 'check-anim' : undefined}
      />
    </svg>
  );
}

/** 空状態に表示する大きなチェック */
export function EmptyCheckIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="var(--accent2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
