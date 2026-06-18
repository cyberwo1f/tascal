// リスト表示（追加バーは別コンポーネント）。アクティブ / 空状態 / 完了済みをまとめる。
import { useStore } from '../store';
import { projectMap, selectViewTasks } from '../selectors';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { CompletedSection } from './CompletedSection';

export function TaskList() {
  const { tasks, projects, view } = useStore();
  const { viewTasks, active, done } = selectViewTasks(tasks, view);
  const projMap = projectMap(projects);

  return (
    <div className="task-scroll">
      {active.length > 0 && (
        <div className="task-list">
          {active.map((t) => (
            <TaskCard key={t.id} task={t} projMap={projMap} />
          ))}
        </div>
      )}

      {viewTasks.length === 0 && <EmptyState />}

      {done.length > 0 && <CompletedSection done={done} />}
    </div>
  );
}
