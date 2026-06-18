// メイン上部のヘッダー（日付 / タイトル / サブタイトル）
import { useStore } from '../store';
import { selectCalendar, selectHeader } from '../selectors';

export function MainHeader() {
  const { tasks, projects, view, calMonth } = useStore();
  // カレンダー表示時のみ、その月の締切件数をサブタイトルに使う
  const monthCount = view === 'calendar' ? selectCalendar(tasks, calMonth).monthCount : 0;
  const header = selectHeader(tasks, projects, view, monthCount);

  return (
    <header className="main__header">
      <div style={{ minWidth: 0 }}>
        <div className="header__date">{header.date}</div>
        <h1 className="header__title">
          {header.dotColor && <span className="header__dot" style={{ background: header.dotColor }} />}
          {header.title}
        </h1>
        <div className="header__sub">{header.subtitle}</div>
      </div>
    </header>
  );
}
