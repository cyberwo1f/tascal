// 日付ユーティリティ
// プロトタイプは締切を「今日からの相対日数」で扱っていたため、その表示ロジックを
// 絶対日付（ISO 文字列）ベースで再現する。

/** 今日の 0 時を表す Date */
export function todayMid(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Date → 'YYYY-MM-DD' */
export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 'YYYY-MM-DD' → Date（ローカル 0 時） */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 日付を n 日ずらした新しい Date */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** 今日から数えた相対日数（今日=0、明日=1、昨日=-1） */
export function dayOffset(iso: string): number {
  const today = todayMid();
  const target = fromISO(iso);
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / 86_400_000);
}

/** カレンダーのセルキー（年-月-日） */
export function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface DueInfo {
  label: string;
  icon: string;
  overdue?: boolean;
  today?: boolean;
  soon?: boolean;
}

/** 締切の表示情報（ラベル・アイコン・状態フラグ）。締切なしは null */
export function dueInfo(iso: string | null): DueInfo | null {
  if (iso == null) return null;
  const d = dayOffset(iso);
  if (d < -1) return { label: `${-d}日前`, icon: '⚑', overdue: true };
  if (d === -1) return { label: '昨日', icon: '⚑', overdue: true };
  if (d === 0) return { label: '今日', icon: '◉', today: true };
  if (d === 1) return { label: '明日', icon: '◷', soon: true };
  return { label: `${d}日後`, icon: '◷', soon: false };
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** 曜日（日本語 1 文字） */
export function weekdayLabel(d: Date): string {
  return WEEKDAYS[d.getDay()];
}

export { WEEKDAYS };
