// タスク追加バー（タイトル入力 + 優先度トグル + 追加ボタン）
import { useStore } from '../store';
import { PRIORITY } from '../lib/priority';

export function AddTaskBar() {
  const store = useStore();
  const { newTaskTitle, newPriority, projects, view } = store;

  const curProj = projects.find((p) => p.id === view);
  const placeholder = curProj ? `「${curProj.name}」にタスクを追加…` : '新しいタスクを追加…';

  return (
    <div className="add-bar-wrap">
      <div className="add-bar">
        <span className="add-bar__plus">+</span>
        <input
          className="add-bar__input"
          value={newTaskTitle}
          placeholder={placeholder}
          onChange={(e) => store.setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') store.addTask();
          }}
        />
        <button className="add-bar__priority" onClick={store.cycleNewPriority} title="優先度">
          <span className="dot-8" style={{ background: PRIORITY[newPriority].color }} />
          優先度 {PRIORITY[newPriority].label}
        </button>
        <button className="add-bar__submit" onClick={store.addTask}>
          追加
        </button>
      </div>
    </div>
  );
}
