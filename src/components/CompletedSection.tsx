// 完了済みタスクの折りたたみセクション
import { useStore } from '../store';
import type { Task } from '../types';
import { CheckIcon } from './icons';

export function CompletedSection({ done }: { done: Task[] }) {
  const store = useStore();
  const { showDone } = store;

  return (
    <div className="done-section">
      <button className="done-toggle" onClick={store.toggleShowDone}>
        <span className="caret" style={{ transform: `rotate(${showDone ? 0 : -90}deg)` }}>
          ⌄
        </span>
        完了済み <span className="done-toggle__count">{done.length}</span>
      </button>

      {showDone && (
        <div className="done-list">
          {done.map((t) => (
            <div key={t.id} className="done-row">
              <button
                className="checkbox checkbox--done-row"
                onClick={() => store.toggleTask(t.id)}
                aria-label="未完了に戻す"
              >
                <CheckIcon size={13} strokeWidth={3.2} />
              </button>
              <span className="done-row__title">{t.title}</span>
              <button className="done-row__delete" onClick={() => store.removeTask(t.id)} title="削除">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
