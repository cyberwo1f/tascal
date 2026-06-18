// 左サイドバー：ブランド / テーマ切替 / スマートリスト / プロジェクト / タグ / 進捗リング
import { useStore } from '../store';
import { projectCount, selectSmartLists, selectTags } from '../selectors';
import { LogoMark } from './icons';
import { ProgressRing } from './ProgressRing';

export function Sidebar() {
  const store = useStore();
  const { view, projects, tasks, theme, addingProject, newProjectName } = store;

  const smartLists = selectSmartLists(tasks);
  const tags = selectTags(tasks);
  const themeLabel = theme === 'dark' ? 'ライト' : 'ダーク';

  return (
    <aside className="sidebar">
      {/* ブランド + テーマ切替 */}
      <div className="sidebar__top">
        <div className="brand">
          <div className="brand__badge">
            <LogoMark size={26} />
          </div>
          <div className="brand__name">Tascal</div>
        </div>
        <button className="theme-toggle" onClick={store.toggleTheme} title="テーマを切り替え">
          <span className="theme-toggle__dot" />
          {themeLabel}
        </button>
      </div>

      {/* スマートリスト */}
      <div className="nav-group">
        {smartLists.map((v) => (
          <button
            key={v.id}
            className={`nav-btn${view === v.id ? ' is-active' : ''}`}
            onClick={() => store.selectView(v.id)}
          >
            <span className="nav-btn__label">
              <span className="nav-btn__icon" style={{ color: v.iconColor }}>
                {v.icon}
              </span>
              {v.label}
            </span>
            <span className="count-pill">{v.count}</span>
          </button>
        ))}
      </div>

      {/* プロジェクト見出し */}
      <div className="sidebar__section-head">
        <span className="section-label">プロジェクト</span>
        <button className="icon-btn-plus" onClick={store.startAddProject} title="プロジェクトを追加">
          +
        </button>
      </div>

      {/* プロジェクト一覧（スクロール領域、タグも内包） */}
      <div className="sidebar__scroll">
        <div className="nav-group">
          {projects.map((p) => (
            <button
              key={p.id}
              className={`nav-btn${view === p.id ? ' is-active' : ''}`}
              onClick={() => store.selectView(p.id)}
            >
              <span className="nav-btn__label">
                <span className="nav-btn__dot" style={{ background: p.color }} />
                <span className="nav-btn__text">{p.name}</span>
              </span>
              <span className="count-pill">{projectCount(tasks, p.id)}</span>
            </button>
          ))}

          {addingProject && (
            <div className="project-add-row">
              <span className="project-add-row__dot" />
              <input
                className="project-add-row__input"
                value={newProjectName}
                placeholder="プロジェクト名…"
                autoFocus
                onChange={(e) => store.setNewProjectName(e.target.value)}
                onBlur={store.commitProject}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') store.commitProject();
                  if (e.key === 'Escape') store.cancelAddProject();
                }}
              />
            </div>
          )}
        </div>

        {/* タグ */}
        {tags.length > 0 && (
          <>
            <div className="sidebar__section-head">
              <span className="section-label">タグ</span>
            </div>
            <div className="nav-group">
              {tags.map((tg) => (
                <button
                  key={tg.id}
                  className={`nav-btn${view === tg.id ? ' is-active' : ''}`}
                  onClick={() => store.selectView(tg.id)}
                >
                  <span className="nav-btn__label">
                    <span className="nav-btn__hash" style={{ color: tg.hashColor }}>
                      #
                    </span>
                    <span className="nav-btn__text">{tg.label}</span>
                  </span>
                  <span className="count-pill">{tg.count}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <ProgressRing />
    </aside>
  );
}
