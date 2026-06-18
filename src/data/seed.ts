import type { PersistedData, Project, Task } from '../types';
import { addDays, todayMid, toISO } from '../lib/date';

/**
 * 初期サンプルデータを生成する。
 * プロトタイプは締切を相対日数で持っていたので、生成時の「今日」を基準に絶対日付へ変換する。
 */
export function createSeed(): PersistedData {
  const t = todayMid();
  // 相対日数 → ISO 日付（null はそのまま）
  const due = (offset: number | null): string | null =>
    offset == null ? null : toISO(addDays(t, offset));

  const projects: Project[] = [
    { id: 'inbox', name: '受信トレイ', color: '#7d8597' },
    { id: 'work', name: '仕事', color: '#5b8def' },
    { id: 'design', name: 'デザイン制作', color: '#42d3a8' },
    { id: 'life', name: 'プライベート', color: '#f0b95b' },
    { id: 'learn', name: '学習', color: '#c08bf0' },
  ];

  const tasks: Task[] = [
    { id: 't1', project: 'work', title: '週次レポートを提出する', done: false, priority: 'high', due: due(0), tags: ['締切'], subs: [] },
    {
      id: 't2', project: 'design', title: 'ランディングページのリデザイン', done: false, priority: 'high', due: due(0), tags: ['UI'],
      subs: [
        { id: 's1', title: 'ワイヤーフレーム', done: true },
        { id: 's2', title: 'ヒーローのビジュアル', done: true },
        { id: 's3', title: 'モバイル対応', done: false },
        { id: 's4', title: 'レビュー依頼', done: false },
      ],
    },
    { id: 't3', project: 'work', title: 'クライアントMTGの議事録を共有', done: false, priority: 'med', due: due(0), tags: [], subs: [] },
    { id: 't4', project: 'learn', title: 'TypeScript の型パズルを2問解く', done: false, priority: 'low', due: due(1), tags: ['学習'], subs: [] },
    {
      id: 't5', project: 'life', title: '夜ご飯の食材を買う', done: false, priority: 'med', due: due(0), tags: [],
      subs: [
        { id: 's5', title: '野菜', done: false },
        { id: 's6', title: 'お米', done: false },
      ],
    },
    { id: 't6', project: 'design', title: 'アイコンセットを書き出し', done: true, priority: 'low', due: due(-1), tags: [], subs: [] },
    { id: 't7', project: 'work', title: '請求書を作成して送付', done: false, priority: 'med', due: due(2), tags: ['経理'], subs: [] },
    { id: 't8', project: 'learn', title: '読書: デザインの心理学 第3章', done: false, priority: 'low', due: due(3), tags: [], subs: [] },
    { id: 't9', project: 'life', title: '歯医者の予約を取る', done: true, priority: 'high', due: due(-1), tags: [], subs: [] },
  ];

  return { projects, tasks, theme: 'dark' };
}
