import type { PersistedData } from '../types';
import { createSeed } from '../data/seed';

const STORAGE_KEY = 'tascal.v1';

/** localStorage から本体データを読み込む。無ければサンプルデータを返す。 */
export function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    // 最低限の健全性チェック（壊れていればサンプルへフォールバック）
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) {
      return createSeed();
    }
    return {
      projects: parsed.projects,
      tasks: parsed.tasks,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return createSeed();
  }
}

/** 本体データを localStorage に保存する。 */
export function saveData(data: PersistedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 容量超過などは黙って無視（アプリの動作は継続）
  }
}
