// 完了時に弾けるパーティクル（プロトタイプの renderBurst を移植）
import type { CSSProperties } from 'react';

const N = 7;

export function Burst() {
  return (
    <span className="burst" aria-hidden>
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2;
        const style = {
          background: i % 2 ? 'var(--accent2)' : 'var(--accent)',
          '--dx': `${Math.cos(a) * 20}px`,
          '--dy': `${Math.sin(a) * 20}px`,
        } as CSSProperties;
        return <span key={i} className="burst__dot" style={style} />;
      })}
    </span>
  );
}
