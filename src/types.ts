// Tascal のドメインモデル

/** タスクの優先度。high=高 / med=中 / low=低 */
export type Priority = 'high' | 'med' | 'low';

/** サブタスク（チェックリストの 1 項目） */
export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

/**
 * タスク本体。
 * due は ISO 日付文字列 'YYYY-MM-DD'（締切なしは null）。
 * プロトタイプは「今日からの相対日数」で持っていたが、永続化のため絶対日付で保持し、
 * 表示時に当日との差分（オフセット）へ変換する（lib/date.ts 参照）。
 */
export interface Task {
  id: string;
  project: string;
  title: string;
  done: boolean;
  priority: Priority;
  due: string | null;
  tags: string[];
  subs: Subtask[];
  notes?: string;
}

/** プロジェクト（タスクの所属先） */
export interface Project {
  id: string;
  name: string;
  color: string;
}

/** 永続化される本体データ */
export interface PersistedData {
  projects: Project[];
  tasks: Task[];
  theme: Theme;
}

export type Theme = 'dark' | 'light';

/**
 * 表示中のビュー。
 * - 'today' / 'upcoming' / 'all' / 'calendar' … スマートリスト
 * - プロジェクト ID … そのプロジェクト
 * - 'tag:<name>' … そのタグ
 */
export type View = string;
