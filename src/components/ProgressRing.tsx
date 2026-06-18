// サイドバー下部「今日の達成」リング
import { useStore } from '../store';
import { selectRing } from '../selectors';

export function ProgressRing() {
  const { tasks } = useStore();
  const ring = selectRing(tasks);

  return (
    <div className="ring-card">
      <div className="ring">
        <svg width="46" height="46" viewBox="0 0 46 46" className="ring__svg" aria-hidden>
          <circle cx="23" cy="23" r="19" fill="none" className="ring__track" strokeWidth="5" />
          <circle
            cx="23"
            cy="23"
            r="19"
            fill="none"
            className="ring__value"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={ring.circ.toFixed(1)}
            strokeDashoffset={ring.offset.toFixed(1)}
          />
        </svg>
        <div className="ring__label">{ring.percent}%</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="ring-card__title">今日の達成</div>
        <div className="ring-card__sub">{ring.label}</div>
      </div>
    </div>
  );
}
