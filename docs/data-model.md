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

### Commitment 🆕（= 約束。**第一級エンティティ** ✅ Q-PROD-2 / [ADR-0001](./adr/0001-commitment-model.md)）
```
Commitment {
  id, workspaceId🆕, projectId,
  title,
  status🆕: 'todo' | 'doing' | 'done' | 'blocked',   // done フラグを状態へ拡張
  priority,
  due,                       // 確定締切（対外的な約束）。当面はこれ1本
  softDue🆕?,                // 努力目標（任意・段階開示）
  ownerId🆕?,                // 担当者（任意。単独=自分。将来 AI 社員も）
  ownerType🆕?: 'human' | 'ai',  // 既定 human。AI 着手フェーズで後方互換に追加
  stakeholder🆕?,            // 約束の相手（任意。当面 自由記述、構造化は M2 共有時）
  tags,
  recurrence🆕?,             // 繰り返し規則（後続）
  createdBy🆕, createdAt🆕, updatedAt🆕,
  source🆕?: 'manual' | 'ai' | 'integration:<name>'  // 由来
  // riskLevel は持たない = 派生算出（Q-PROD-3、保存しない）
}
```
- **1 つの Commitment が複数の Task（作業／文脈）を束ねられる**＝「一人ではやり切れない規模＝1 約束が複数作業に枝分かれ」を表現。
- 最頻ケース（1 約束＝1 作業）では Commitment と Task を 1:1 で生成し、**1 行として見せる**（段階開示）。約束を分割した時だけ束ねが顕在化する。
- `owner`/`stakeholder`/`softDue`/`ownerType` は**任意・段階開示**。単独ユーザーは今と同じ軽さで使える（柱①と両立）。
- 遅延（late）は status に入れず**派生算出**（`due` 超過かつ未完）。
- フィールドの厳密な配置（Commitment 側 / Task 側）は実装時に詰める。

### Task ✏️（= 作業の単位。Commitment にぶら下がる）
```
Task {
  id, commitmentId🆕,        // 所属する約束（1:1 が最頻、分割時に 1:N）
  title, notes,
  status🆕: 'todo' | 'doing' | 'done' | 'blocked',
  subs: Subtask[],
  createdAt🆕, updatedAt🆕
}
```
- `done: boolean` → `status` へ移行。互換のためマイグレーション要（`tascal.v1`→`v2`）。
- 既存タスクは「Commitment 1 件＋Task 1 件（1:1）」へ変換する。

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
- ~~コミットメントを Task 拡張で表すか別エンティティか（**Q-PROD-2**）~~ → ✅ **第一級エンティティ化で決定**（[ADR-0001](./adr/0001-commitment-model.md)）
- リスクの算出方法と保存有無（**Q-PROD-3**）— 提案は派生算出（保存しない）・初期 2 要素ルール（proposals 参照）
- マルチユーザー / 永続化の基盤（**Q-ARCH-2**、現フェーズは保留）
- 「AI 社員」をどうモデル化するか（owner に AI を含める等）（**Q-AI-9**）
