import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { PersistedData, Priority, Project, Subtask, Task, Theme, View } from './types';
import { loadData, saveData } from './lib/storage';
import { uid } from './lib/id';
import { addDays, todayMid, toISO } from './lib/date';
import { PRIORITY_CYCLE, PRIORITY_RANK } from './lib/priority';
import { PROJECT_PALETTE } from './lib/color';

/** 完了アニメーション（バースト）の表示時間 */
const BURST_MS = 700;
/** 完了時に祝祭アニメを出すか（プロトタイプの celebrate プロップ相当） */
const CELEBRATE = true;

export interface Store {
  // ---- 永続化データ ----
  projects: Project[];
  tasks: Task[];
  theme: Theme;

  // ---- UI 状態 ----
  view: View;
  showDone: boolean;
  addingProject: boolean;
  newProjectName: string;
  newTaskTitle: string;
  newPriority: Priority;
  selectedId: string | null;
  newTag: string;
  newSub: string;
  calMonth: number;
  expanded: Record<string, boolean>;
  justCompleted: string | null;

  // ---- アクション ----
  toggleTheme(): void;
  selectView(view: View): void;

  setNewTaskTitle(v: string): void;
  cycleNewPriority(): void;
  addTask(): void;

  toggleTask(id: string): void;
  removeTask(id: string): void;
  toggleExpand(id: string): void;
  patchTask(id: string, patch: Partial<Task>): void;

  toggleSub(taskId: string, subId: string): void;
  addSubTo(taskId: string): void;
  removeSubFrom(taskId: string, subId: string): void;
  setNewSub(v: string): void;

  addTagTo(taskId: string): void;
  removeTagFrom(taskId: string, tag: string): void;
  setNewTag(v: string): void;

  startAddProject(): void;
  setNewProjectName(v: string): void;
  commitProject(): void;
  cancelAddProject(): void;

  toggleShowDone(): void;
  prevMonth(): void;
  nextMonth(): void;
  goToday(): void;

  openDetail(id: string): void;
  closeDetail(): void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef<PersistedData | null>(null);
  if (initial.current === null) initial.current = loadData();

  // 永続化データ
  const [projects, setProjects] = useState<Project[]>(initial.current.projects);
  const [tasks, setTasks] = useState<Task[]>(initial.current.tasks);
  const [theme, setTheme] = useState<Theme>(initial.current.theme);

  // UI 状態
  const [view, setView] = useState<View>('today');
  const [showDone, setShowDone] = useState(true);
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('med');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newSub, setNewSub] = useState('');
  const [calMonth, setCalMonth] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ t2: true });
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const burstTimer = useRef<number | undefined>(undefined);

  // テーマを DOM に反映
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 変更を localStorage に保存
  useEffect(() => {
    saveData({ projects, tasks, theme });
  }, [projects, tasks, theme]);

  // タスクへの部分更新（共通処理）
  const patchTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const selectView = useCallback((v: View) => setView(v), []);

  const cycleNewPriority = useCallback(() => {
    setNewPriority((p) => PRIORITY_CYCLE[(PRIORITY_CYCLE.indexOf(p) + 1) % PRIORITY_CYCLE.length]);
  }, []);

  const addTask = useCallback(() => {
    setNewTaskTitle((title) => {
      const trimmed = title.trim();
      if (!trimmed) return '';
      const isProject = projects.some((p) => p.id === view);
      const project = isProject ? view : 'inbox';
      const t = todayMid();
      const due =
        view === 'today' ? toISO(t) : view === 'upcoming' ? toISO(addDays(t, 1)) : null;
      const task: Task = {
        id: uid('t'),
        project,
        title: trimmed,
        done: false,
        priority: newPriority,
        due,
        tags: [],
        subs: [],
      };
      setTasks((prev) => [task, ...prev]);
      return '';
    });
  }, [projects, view, newPriority]);

  const toggleTask = useCallback((id: string) => {
    let becameDone = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        becameDone = !t.done;
        return { ...t, done: !t.done };
      }),
    );
    if (becameDone && CELEBRATE) {
      setJustCompleted(id);
      window.clearTimeout(burstTimer.current);
      burstTimer.current = window.setTimeout(() => setJustCompleted(null), BURST_MS);
    }
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSub = useCallback((taskId: string, subId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== taskId
          ? t
          : { ...t, subs: t.subs.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) },
      ),
    );
  }, []);

  const addSubTo = useCallback((taskId: string) => {
    setNewSub((v) => {
      const trimmed = v.trim();
      if (!trimmed) return '';
      const sub: Subtask = { id: uid('s'), title: trimmed, done: false };
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, subs: [...t.subs, sub] } : t)),
      );
      return '';
    });
  }, []);

  const removeSubFrom = useCallback((taskId: string, subId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id !== taskId ? t : { ...t, subs: t.subs.filter((s) => s.id !== subId) },
      ),
    );
  }, []);

  const addTagTo = useCallback((taskId: string) => {
    setNewTag((v) => {
      const trimmed = v.trim();
      if (!trimmed) return '';
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId && !t.tags.includes(trimmed)
            ? { ...t, tags: [...t.tags, trimmed] }
            : t,
        ),
      );
      return '';
    });
  }, []);

  const removeTagFrom = useCallback((taskId: string, tag: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id !== taskId ? t : { ...t, tags: t.tags.filter((x) => x !== tag) })),
    );
  }, []);

  const startAddProject = useCallback(() => {
    setAddingProject(true);
    setNewProjectName('');
  }, []);

  const commitProject = useCallback(() => {
    setNewProjectName((name) => {
      const trimmed = name.trim();
      if (trimmed) {
        const id = uid('p');
        setProjects((prev) => {
          const color = PROJECT_PALETTE[prev.length % PROJECT_PALETTE.length];
          return [...prev, { id, name: trimmed, color }];
        });
        setView(id);
      }
      setAddingProject(false);
      return '';
    });
  }, []);

  const cancelAddProject = useCallback(() => {
    setAddingProject(false);
    setNewProjectName('');
  }, []);

  const toggleShowDone = useCallback(() => setShowDone((v) => !v), []);
  const prevMonth = useCallback(() => setCalMonth((m) => m - 1), []);
  const nextMonth = useCallback(() => setCalMonth((m) => m + 1), []);
  const goToday = useCallback(() => setCalMonth(0), []);

  const openDetail = useCallback((id: string) => {
    setSelectedId(id);
    setNewTag('');
    setNewSub('');
  }, []);
  const closeDetail = useCallback(() => setSelectedId(null), []);

  const store: Store = useMemo(
    () => ({
      projects,
      tasks,
      theme,
      view,
      showDone,
      addingProject,
      newProjectName,
      newTaskTitle,
      newPriority,
      selectedId,
      newTag,
      newSub,
      calMonth,
      expanded,
      justCompleted,
      toggleTheme,
      selectView,
      setNewTaskTitle,
      cycleNewPriority,
      addTask,
      toggleTask,
      removeTask,
      toggleExpand,
      patchTask,
      toggleSub,
      addSubTo,
      removeSubFrom,
      setNewSub,
      addTagTo,
      removeTagFrom,
      setNewTag,
      startAddProject,
      setNewProjectName,
      commitProject,
      cancelAddProject,
      toggleShowDone,
      prevMonth,
      nextMonth,
      goToday,
      openDetail,
      closeDetail,
    }),
    [
      projects, tasks, theme, view, showDone, addingProject, newProjectName, newTaskTitle,
      newPriority, selectedId, newTag, newSub, calMonth, expanded, justCompleted,
      toggleTheme, selectView, cycleNewPriority, addTask, toggleTask, removeTask, toggleExpand,
      patchTask, toggleSub, addSubTo, removeSubFrom, addTagTo, removeTagFrom, startAddProject,
      commitProject, cancelAddProject, toggleShowDone, prevMonth, nextMonth, goToday,
      openDetail, closeDetail,
    ],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

/** ストアを取得する。Provider 配下でのみ利用可。 */
export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore は StoreProvider 配下で使用してください');
  return ctx;
}

export { PRIORITY_RANK };
