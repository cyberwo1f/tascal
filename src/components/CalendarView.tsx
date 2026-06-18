// 月表示カレンダー
import { useStore } from '../store';
import { projectMap, selectCalendar, selectWeekdays } from '../selectors';

export function CalendarView() {
  const store = useStore();
  const { tasks, projects, calMonth } = store;
  const cal = selectCalendar(tasks, calMonth);
  const weekdays = selectWeekdays();
  const projMap = projectMap(projects);

  return (
    <div className="calendar">
      <div className="calendar__bar">
        <div className="calendar__bar-left">
          <div className="calendar__title">{cal.title}</div>
          <button className="btn-soft" onClick={store.goToday}>
            今日
          </button>
        </div>
        <div className="calendar__nav">
          <button className="nav-arrow" onClick={store.prevMonth} aria-label="前の月">
            ‹
          </button>
          <button className="nav-arrow" onClick={store.nextMonth} aria-label="次の月">
            ›
          </button>
        </div>
      </div>

      <div className="calendar__weekdays">
        {weekdays.map((w) => (
          <div key={w.label} className="calendar__weekday" style={{ color: w.color }}>
            {w.label}
          </div>
        ))}
      </div>

      <div className="calendar__grid">
        {cal.cells.map((c) => (
          <div
            key={c.key}
            className={`cal-cell${c.isToday ? ' is-today' : ''}${c.isOther ? ' is-other' : ''}`}
          >
            <div
              className={`cal-cell__day${c.isToday ? ' is-today' : ''}${
                c.isWeekend && !c.isToday ? ' is-weekend' : ''
              }`}
            >
              {c.day}
            </div>
            <div className="cal-cell__tasks">
              {c.tasks.map((t) => (
                <button
                  key={t.id}
                  className={`cal-chip${t.done ? ' is-done' : ''}`}
                  title={t.title}
                  onClick={() => store.openDetail(t.id)}
                >
                  <span
                    className="cal-chip__dot"
                    style={{ background: projMap[t.project]?.color ?? 'var(--muted)' }}
                  />
                  <span className="cal-chip__title">{t.title}</span>
                </button>
              ))}
              {c.extra > 0 && <div className="cal-cell__more">+{c.extra} 件</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
