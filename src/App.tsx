// アプリ全体のレイアウト
import { useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { MainHeader } from './components/MainHeader';
import { AddTaskBar } from './components/AddTaskBar';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';

export function App() {
  const { view } = useStore();
  const isCalendar = view === 'calendar';

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <MainHeader />

        {isCalendar ? (
          <CalendarView />
        ) : (
          <>
            <AddTaskBar />
            <TaskList />
          </>
        )}
      </main>

      <TaskDetailDrawer />
    </div>
  );
}
