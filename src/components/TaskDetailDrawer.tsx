// タスク詳細ドロワー（右からスライドイン）
import type { CSSProperties } from 'react';
import { useStore } from '../store';
import { PRIORITY } from '../lib/priority';
import { addDays, todayMid, toISO } from '../lib/date';
import { CheckIcon } from './icons';

const PRIORITY_KEYS = ['high', 'med', 'low'] as const;

export function TaskDetailDrawer() {
  const store = useStore();
  const { selectedId, tasks, projects } = store;
  const task = selectedId ? tasks.find((t) => t.id === selectedId) : null;
  if (!task) return null;

  const proj = projects.find((p) => p.id === task.project);
  const projectColor = proj?.color ?? 'var(--muted)';
  const projectName = proj?.name ?? '';

  const subDone = task.subs.filter((s) => s.done).length;
  const subPct = task.subs.length ? `${Math.round((subDone / task.subs.length) * 100)}%` : '0%';

  const t = todayMid();
  const dueOptions: { label: string; value: string | null }[] = [
    { label: 'なし', value: null },
    { label: '今日', value: toISO(t) },
    { label: '明日', value: toISO(addDays(t, 1)) },
    { label: '+3日', value: toISO(addDays(t, 3)) },
  ];

  // アクティブなセグメントは色をインラインで与える
  const activeSegStyle = (color: string): CSSProperties => ({ background: color, borderColor: color });

  return (
    <>
      <div className="drawer-overlay" onClick={store.closeDetail} />
      <aside className="drawer" role="dialog" aria-label="タスクの詳細">
        {/* ヘッダー */}
        <div className="drawer__head">
          <span className="drawer__project" style={{ color: projectColor }}>
            <span className="dot-8" style={{ background: projectColor }} />
            {projectName}
          </span>
          <button className="drawer__close" onClick={store.closeDetail} aria-label="閉じる">
            ✕
          </button>
        </div>

        {/* 本体 */}
        <div className="drawer__body">
          {/* タイトル */}
          <div className="drawer__title-row">
            <button
              className={`checkbox checkbox--detail${task.done ? ' is-done' : ''}`}
              onClick={() => store.toggleTask(task.id)}
              aria-label={task.done ? '未完了に戻す' : '完了にする'}
            >
              {task.done && <CheckIcon size={15} strokeWidth={3.2} />}
            </button>
            <textarea
              className="drawer__title-input"
              value={task.title}
              rows={2}
              onChange={(e) => store.patchTask(task.id, { title: e.target.value })}
            />
          </div>

          {/* メモ */}
          <div>
            <div className="field-label">メモ</div>
            <textarea
              className="notes-input"
              value={task.notes ?? ''}
              placeholder="詳細やメモを追加…"
              rows={3}
              onChange={(e) => store.patchTask(task.id, { notes: e.target.value })}
            />
          </div>

          {/* プロジェクト */}
          <div>
            <div className="field-label">プロジェクト</div>
            <div className="chip-wrap">
              {projects.map((p) => (
                <button
                  key={p.id}
                  className={`picker-chip${p.id === task.project ? ' is-active' : ''}`}
                  onClick={() => store.patchTask(task.id, { project: p.id })}
                >
                  <span className="dot-8" style={{ background: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 優先度 */}
          <div>
            <div className="field-label">優先度</div>
            <div className="chip-row">
              {PRIORITY_KEYS.map((k) => {
                const active = task.priority === k;
                return (
                  <button
                    key={k}
                    className={`seg-chip${active ? ' is-active' : ''}`}
                    style={active ? activeSegStyle(PRIORITY[k].color) : undefined}
                    onClick={() => store.patchTask(task.id, { priority: k })}
                  >
                    <span className="dot-8" style={{ background: PRIORITY[k].color }} />
                    {PRIORITY[k].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 締切 */}
          <div>
            <div className="field-label">締切</div>
            <div className="chip-row chip-row--wrap">
              {dueOptions.map((o) => {
                const active = task.due === o.value;
                return (
                  <button
                    key={o.label}
                    className={`seg-chip${active ? ' is-active' : ''}`}
                    style={active ? activeSegStyle('var(--accent)') : undefined}
                    onClick={() => store.patchTask(task.id, { due: o.value })}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* タグ */}
          <div>
            <div className="field-label">タグ</div>
            <div className="tag-edit-wrap">
              {task.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                  <button
                    className="tag-pill__remove"
                    onClick={() => store.removeTagFrom(task.id, tag)}
                    aria-label={`タグ ${tag} を削除`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                className="tag-input"
                value={store.newTag}
                placeholder="+ タグ"
                onChange={(e) => store.setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') store.addTagTo(task.id);
                }}
              />
            </div>
          </div>

          {/* サブタスク */}
          <div>
            <div className="drawer__subs-head">
              <div className="field-label" style={{ marginBottom: 0 }}>
                サブタスク
              </div>
              {task.subs.length > 0 && (
                <div className="drawer__subs-progress">
                  <span className="progress-track--wide">
                    <span className="progress-fill" style={{ width: subPct }} />
                  </span>
                  <span className="drawer__subs-label">
                    {subDone} / {task.subs.length}
                  </span>
                </div>
              )}
            </div>
            <div className="drawer__sub-list">
              {task.subs.map((s) => (
                <div key={s.id} className="drawer__sub-row">
                  <button
                    className={`checkbox checkbox--sub${s.done ? ' is-done' : ''}`}
                    onClick={() => store.toggleSub(task.id, s.id)}
                    aria-label={s.done ? '未完了に戻す' : '完了にする'}
                  >
                    {s.done && <CheckIcon size={11} strokeWidth={3.4} />}
                  </button>
                  <span className={`drawer__sub-title${s.done ? ' is-done' : ''}`}>{s.title}</span>
                  <button
                    className="drawer__sub-remove"
                    onClick={() => store.removeSubFrom(task.id, s.id)}
                    aria-label="サブタスクを削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="drawer__sub-add">
                <span className="drawer__sub-add-box" />
                <input
                  className="drawer__sub-add-input"
                  value={store.newSub}
                  placeholder="サブタスクを追加…"
                  onChange={(e) => store.setNewSub(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') store.addSubTo(task.id);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="drawer__foot">
          <button
            className="drawer__delete"
            onClick={() => {
              store.removeTask(task.id);
              store.closeDetail();
            }}
          >
            タスクを削除
          </button>
        </div>
      </aside>
    </>
  );
}
