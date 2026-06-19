#!/usr/bin/env python3
"""
PostToolUse フック: docs/ 配下の Markdown が編集されたら、
docs/overview.html（Tascal ドキュメント・オーバービュー）の更新を Claude にリマインドする
（additionalContext として注入）。

overview.html はリポジトリ内で完結して管理する独立 HTML。
外部ホスティングへの再デプロイは行わない（リポジトリ内更新のみ）。

登録: .claude/settings.json の hooks.PostToolUse（matcher: Edit|Write|MultiEdit）。
実際の HTML 更新は Claude が行う（フックは通知のみ）。
スコープ: このプロジェクト限定（.claude/ 配下で版管理）。
"""
import json
import sys


def main() -> int:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    tool_input = data.get("tool_input") or {}
    path = (tool_input.get("file_path") or "").replace("\\", "/")

    # 対象: docs/ 配下の .md（overview.html 自身は .md ではないので除外＝ループしない）
    is_docs_md = "/docs/" in path and path.endswith(".md")
    if not is_docs_md:
        return 0

    msg = (
        "docs/ 配下の Markdown を更新しました。整合性のため "
        "docs/overview.html（Tascal ドキュメント・オーバービュー）の該当セクションと"
        "末尾の「最終更新」日付も更新してください。"
        "overview.html はリポジトリ内で完結して管理する独立 HTML です"
        "（外部ホスティングへの再デプロイは不要）。"
        "手順は memory: docs-overview-artifact を参照。"
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": msg,
        }
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
