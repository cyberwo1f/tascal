// タスクが 1 件もないときの空状態
import { useStore } from '../store';
import { EmptyCheckIcon } from './icons';

export function EmptyState() {
  const { view } = useStore();
  const isToday = view === 'today';
  const title = isToday ? 'インボックスゼロ達成！' : 'まだタスクがありません';
  const sub = isToday
    ? '今日やるべきことは全部片付きました。少し休憩しましょう。'
    : '上のバーから最初のタスクを追加してみましょう。';

  return (
    <div className="empty">
      <div className="empty__icon">
        <EmptyCheckIcon />
      </div>
      <div className="empty__title">{title}</div>
      <div className="empty__sub">{sub}</div>
    </div>
  );
}
