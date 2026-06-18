// ストアの生データから、表示に必要な派生データを計算する純粋関数群。
// プロトタイプの renderVals() に相当する役割。

import type { Project, Task, View } from './types';
import { dayOffset, fromISO, keyOf, todayMid, WEEKDAYS } from './lib/date';
import { PRIORITY_RANK } from './lib/priority';
import { TAG_PALETTE } from './lib/color';

/** 締切オフセット（締切なしは大きな値にして末尾へ） */
function dueRank(task: Task): number {
  return task.due == null ? 99 : dayOffset(task.due);
}

/** タスクが現在のビューに含まれるか */
export function inView(task: Task, view: View): boolean {
  if (view === 'all') return true;
  if (view === 'today') return task.due != null && dayOffset(task.due) === 0;
  if (view === 'upcoming') return task.due != null && dayOffset(task.due) > 0;
  if (view.startsWith('tag:')) return task.tags.includes(view.slice(4));
  return task.project === view;
}

export interface ViewTasks {
  viewTasks: Task[];
  active: Task[];
  done: Task[];
}

/** 現在のビューのタスクを抽出・ソートし、未完/完了に分ける */
export function selectViewTasks(tasks: Task[], view: View): ViewTasks {
  const viewTasks = tasks.filter((t) => inView(t, view));
  const sorted = viewTasks
    .slice()
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || dueRank(a) - dueRank(b));
  return {
    viewTasks,
    active: sorted.filter((t) => !t.done),
    done: sorted.filter((t) => t.done),
  };
}

/** 未完タスクのうち述語にマッチする件数 */
function countActive(tasks: Task[], pred: (t: Task) => boolean): number {
  return tasks.filter((t) => !t.done && pred(t)).length;
}

export interface SmartListDef {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  count: number;
}

/** サイドバーのスマートリスト定義（件数つき） */
export function selectSmartLists(tasks: Task[]): SmartListDef[] {
  return [
    { id: 'today', label: '今日', icon: '◉', iconColor: 'var(--accent)', count: countActive(tasks, (t) => t.due != null && dayOffset(t.due) === 0) },
    { id: 'upcoming', label: '今後の予定', icon: '◷', iconColor: 'var(--p-med)', count: countActive(tasks, (t) => t.due != null && dayOffset(t.due) > 0) },
    { id: 'all', label: 'すべてのタスク', icon: '≡', iconColor: 'var(--muted)', count: countActive(tasks, () => true) },
    { id: 'calendar', label: 'カレンダー', icon: '▦', iconColor: 'var(--accent2)', count: countActive(tasks, (t) => t.due != null) },
  ];
}

/** プロジェクトごとの未完件数 */
export function projectCount(tasks: Task[], projectId: string): number {
  return countActive(tasks, (t) => t.project === projectId);
}

export interface TagDef {
  id: string;
  label: string;
  count: number;
  hashColor: string;
}

/** タグ一覧（未完件数で集計、件数降順→名前順） */
export function selectTags(tasks: Task[]): TagDef[] {
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    if (t.done) continue;
    for (const tag of t.tags) counts[tag] = (counts[tag] || 0) + 1;
  }
  const names = Object.keys(counts).sort(
    (a, b) => counts[b] - counts[a] || a.localeCompare(b, 'ja'),
  );
  return names.map((tag, i) => ({
    id: `tag:${tag}`,
    label: tag,
    count: counts[tag],
    hashColor: TAG_PALETTE[i % TAG_PALETTE.length],
  }));
}

export interface HeaderInfo {
  date: string;
  title: string;
  subtitle: string;
  dotColor: string | null;
}

/** ヘッダーの日付・タイトル・サブタイトル・ドット色 */
export function selectHeader(
  tasks: Task[],
  projects: Project[],
  view: View,
  monthCount: number,
): HeaderInfo {
  const today = todayMid();
  const date = `${today.getMonth() + 1}月${today.getDate()}日 (${WEEKDAYS[today.getDay()]})`;

  const titles: Record<string, string> = {
    today: '今日',
    upcoming: '今後の予定',
    all: 'すべてのタスク',
    calendar: 'カレンダー',
  };
  const curProj = projects.find((p) => p.id === view) ?? null;
  const isTag = view.startsWith('tag:');
  const title = titles[view] ?? (curProj ? curProj.name : isTag ? `#${view.slice(4)}` : '');
  const dotColor = curProj ? curProj.color : null;

  const { viewTasks, active, done } = selectViewTasks(tasks, view);
  let subtitle: string;
  if (view === 'calendar') {
    subtitle = `この月に ${monthCount} 件の締切`;
  } else if (viewTasks.length === 0) {
    subtitle = 'タスクはありません';
  } else {
    subtitle = `${active.length} 件のタスク${done.length ? ` ・ ${done.length} 件完了` : ''}`;
  }

  return { date, title, subtitle, dotColor };
}

export interface RingData {
  percent: number;
  circ: number;
  offset: number;
  label: string;
}

/** サイドバー下部「今日の達成」リング */
export function selectRing(tasks: Task[]): RingData {
  const todayAll = tasks.filter((t) => t.due != null && dayOffset(t.due) === 0);
  const todayDone = todayAll.filter((t) => t.done).length;
  const percent = todayAll.length ? Math.round((todayDone / todayAll.length) * 100) : 0;
  const circ = 2 * Math.PI * 19;
  return {
    percent,
    circ,
    offset: circ * (1 - percent / 100),
    label: todayAll.length ? `${todayDone} / ${todayAll.length} タスク完了` : '今日の予定はありません',
  };
}

export interface CalCell {
  key: string;
  day: number;
  isToday: boolean;
  isOther: boolean;
  isWeekend: boolean;
  tasks: Task[];
  extra: number;
}

export interface CalendarData {
  title: string;
  cells: CalCell[];
  monthCount: number;
}

/** カレンダー（6 週 = 42 セル）の表示データ */
export function selectCalendar(tasks: Task[], calMonth: number): CalendarData {
  const today = todayMid();
  const base = new Date(today.getFullYear(), today.getMonth() + calMonth, 1);
  const calY = base.getFullYear();
  const calM = base.getMonth();
  const startDow = new Date(calY, calM, 1).getDay();
  const todayKey = keyOf(today);

  const byDay: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (t.due == null) continue;
    const k = keyOf(fromISO(t.due));
    (byDay[k] ??= []).push(t);
  }

  let monthCount = 0;
  const cells: CalCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(calY, calM, 1 - startDow + i);
    const k = keyOf(d);
    const isOther = d.getMonth() !== calM;
    const dayTasks = byDay[k] ?? [];
    if (!isOther) monthCount += dayTasks.length;
    const dow = d.getDay();
    cells.push({
      key: k,
      day: d.getDate(),
      isToday: k === todayKey,
      isOther,
      isWeekend: dow === 0 || dow === 6,
      tasks: dayTasks.slice(0, 3),
      extra: Math.max(0, dayTasks.length - 3),
    });
  }

  return { title: `${calY}年 ${calM + 1}月`, cells, monthCount };
}

/** 曜日ヘッダー（色つき） */
export function selectWeekdays(): { label: string; color: string }[] {
  return WEEKDAYS.map((label, i) => ({
    label,
    color: i === 0 ? 'var(--p-high)' : i === 6 ? 'var(--accent)' : 'var(--muted)',
  }));
}

/** プロジェクト ID → Project のマップ */
export function projectMap(projects: Project[]): Record<string, Project> {
  return Object.fromEntries(projects.map((p) => [p.id, p]));
}
