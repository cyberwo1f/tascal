# データモデル

現状の実装（`src/types.ts`）を起点に、コミットメント / マルチユーザー / AI を見据えて拡張する案。
**🟡 提案**段階であり、`open-questions.md` の決定に応じて確定する。

## 現状（プロトタイプ）

```ts
type Priority = 'high' | 'med' | 'low';
interface Subtask { id; title; done; }
interface Task {
  id; project; title; done; priority;
  due: string | null;   // 'YYYY-MM-DD'
  tags: string[]; subs: Subtask[]; notes?;
}
interface Project { id; name; color; }
```

- 締切は絶対日付（`YYYY-MM-DD`）。表示時に当日との差分へ変換（`src/lib/date.ts`）。
- 永続化は `localStorage`（キー `tascal.v1`）。

## 拡張案（目標形）

> 凡例：🆕 新規 / ✏️ 変更 / 既存はそのまま。多くが Q への依存あり。

### User 🆕（Q-ARCH-2 に依存）
```
User { id, name, email, avatarColor, createdAt }
```

### Workspace / Membership 🆕（マルチユーザー）
```
Workspace { id, name, ownerId, createdAt }
Membership { workspaceId, userId, role: 'owner' | 'member' }
```
- 単独利用時も「自分 1 人の Workspace」を暗黙に持つ設計にできる。

### Project ✏️
```
Project { id, workspaceId🆕, name, color, archived🆕 }
```

### Task ✏️（= コミットメント）
```
Task {
  id, workspaceId🆕, projectId,
  title, notes,
  status🆕: 'todo' | 'doing' | 'done' | 'blocked',   // done フラグを状態へ拡張
  priority,
  due,                       // 確定締切（対外的な約束）
  softDue🆕?,                // 努力目標（任意） ← Q-PROD-2
  ownerId🆕?,                // 担当者
  stakeholder🆕?,            // 約束の相手（自由記述 or 連絡先参照）← Q-PROD-2
  tags, subs,
  recurrence🆕?,             // 繰り返し規則（後続）
  riskLevel🆕?,              // 算出 or AI 推定（派生 or 保存）← Q-PROD-3
  createdBy🆕, createdAt🆕, updatedAt🆕,
  source🆕?: 'manual' | 'ai' | 'integration:<name>'  // 由来
}
```
- `done: boolean` → `status` へ移行。互換のためマイグレーション要。
- `riskLevel` を保存するか毎回算出するかは要決定。

### Subtask ✏️
```
Subtask { id, title, done, assigneeId🆕? }
```

### Ai まわり 🆕（詳細は ai-collaboration.md）
```
AgentSuggestion {
  id, workspaceId, kind: 'triage' | 'plan' | 'risk' | 'brief' | 'extract',
  targetTaskId?, payload (提案内容), status: 'pending' | 'accepted' | 'dismissed',
  createdByAgent, createdAt
}
ActivityLog {  // 監査・通知の元
  id, workspaceId, actorType: 'user' | 'agent', actorId,
  action, targetType, targetId, at, meta
}
```

### Integration 💤（将来）
```
IntegrationAccount { id, workspaceId, provider, ... }
```

## 派生値（保存しない計算値）

現状 `src/selectors.ts` が担う領域。拡張後も「保存データ」と「派生表示値」を分離する方針を維持。
- 締切オフセット / 締切ラベル（今日・明日・遅延）
- ビュー別の絞り込み・件数
- 達成率・進捗（タスク / プロジェクト / 担当者 / 週単位）
- 遅延リスク（ルール or AI）

## マイグレーション方針 🟡
- ローカル → バックエンド移行時、`localStorage` の `tascal.v1` を初期インポートできるようにする。
- スキーマ変更時はバージョン付き（`tascal.v2` …）で前方互換の読み込みを行う。

## 現フェーズの適用範囲（2026-06-18 決定を反映）
- **当面ローカル継続**（Q-ARCH-2）のため、`User` / `Workspace` / `Membership` と共有系は**保留**。
  まずは**単独利用**で `Task`（=コミットメント）の拡張（`status` 化・`due`・リスク等）に集中する。
- **AI 系エンティティ**（`AgentSuggestion` 等）も AI 保留（Q-AI-1）に伴い後続。
  長期の「AI 社員」では、AI もタスクの担当者（owner）になり得る前提でモデルを拡張する（Q-AI-9）。
- ローカルでも価値が出る順：`status` 化 → リスク（`riskLevel`）→ ダッシュボード用の集計（派生）。

## 主要な未決事項
- コミットメントを Task 拡張で表すか別エンティティか（**Q-PROD-2**）
- リスクの算出方法と保存有無（**Q-PROD-3**）
- マルチユーザー / 永続化の基盤（**Q-ARCH-2**、現フェーズは保留）
- 「AI 社員」をどうモデル化するか（owner に AI を含める等）（**Q-AI-9**）
