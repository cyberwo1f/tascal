// タスクカード（アクティブなタスク 1 件）
import { useStore } from '../store';
import type { Project, Task } from '../types';
import { PRIORITY } from '../lib/priority';
import { dueInfo } from '../lib/date';
import { CheckIcon } from './icons';
import { Burst } from './Burst';

interface Props {
  task: Task;
  projMap: Record<string, Project>;
}

export function TaskCard({ task, projMap }: Props) {
  const store = useStore();
  const proj = projMap[task.project];
  const projectColor = proj?.color ?? 'var(--muted)';
  const projectName = proj?.name ?? '';
  const di = dueInfo(task.due);

  const subDone = task.subs.filter((s) => s.done).length;
  const subPct = task.subs.length ? `${Math.round((subDone / task.subs.length) * 100)}%` : '0%';
  const expanded = !!store.expanded[task.id];
  const showBurst = store.justCompleted === task.id;

  const dueClass = di?.overdue ? ' is-overdue' : di?.today ? ' is-today' : '';

  return (
    <div className="card">
      <div className="card__row">
        {/* チェックボックス + 完了バースト */}
        <div className="check-wrap">
          <button
            className={`checkbox checkbox--task${task.done ? ' is-done' : ''}`}
            onClick={() => store.toggleTask(task.id)}
            aria-label={task.done ? '未完了に戻す' : '完了にする'}
          >
            {task.done && <CheckIcon size={14} strokeWidth={3.2} animate />}
          </button>
          {showBurst && <Burst />}
        </div>

        {/* 本文 */}
        <div className="card__body">
          <div className="card__title-row">
            <span className="dot-7" style={{ background: PRIORITY[task.priority].color }} title="優先度" />
            <span
              className={`task-title${task.done ? ' is-done' : ''}`}
              onClick={() => store.openDetail(task.id)}
            >
              {task.title}
            </span>
          </div>

          <div className="card__meta">
            <span className="meta-project" style={{ color: projectColor }}>
              <span className="dot-6" style={{ background: projectColor }} />
              {projectName}
            </span>

            {di && (
              <span className={`meta-due${dueClass}`}>
                {di.icon} {di.label}
              </span>
            )}

            {task.tags.map((tag) => (
              <span key={tag} className="meta-tag">
                #{tag}
              </span>
            ))}

            {task.subs.length > 0 && (
              <button className="sub-toggle" onClick={() => store.toggleExpand(task.id)}>
                <span className="progress-track">
                  <span className="progress-fill" style={{ width: subPct }} />
                </span>
                {subDone}/{task.subs.length}{' '}
                <span className="caret" style={{ transform: `rotate(${expanded ? 180 : 0}deg)` }}>
                  ⌄
                </span>
              </button>
            )}
          </div>

          {/* 展開されたサブタスク */}
          {expanded && (
            <div className="subtasks-inline">
              {task.subs.map((s) => (
                <div key={s.id} className="subtask-row">
                  <button
                    className={`checkbox checkbox--sub${s.done ? ' is-done' : ''}`}
                    onClick={() => store.toggleSub(task.id, s.id)}
                    aria-label={s.done ? '未完了に戻す' : '完了にする'}
                  >
                    {s.done && <CheckIcon size={11} strokeWidth={3.4} />}
                  </button>
                  <span className={`subtask-title${s.done ? ' is-done' : ''}`}>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 削除 */}
        <button className="delete-btn" onClick={() => store.removeTask(task.id)} title="削除">
          ✕
        </button>
      </div>
    </div>
  );
}
