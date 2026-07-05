# プロジェクト指示

このプロジェクトは、技術調査Markdownを`research/`配下に蓄積し、Astro Starlightで閲覧するための調査ノートです。

## デフォルトの振る舞い

ユーザーが`opencode run`で技術、ライブラリ、フレームワーク、ツール、設計手法などの調査を依頼した場合は、保存先をユーザーに聞かず、`research-writer` skillの方針で適切なMarkdownファイルを作成または更新してください。

ユーザーが調査ファイルの整理、再構成、分類、リンク修正、索引化、重複整理を依頼した場合は、`research-organizer` skillの方針で`research/`配下を整理してください。

使用する自然言語は日本語にしてください。

## 出力ルール

- 調査結果はチャット回答だけで終わらせず、原則として`research/`配下の適切なMarkdownファイルに保存する。
- 保存先カテゴリとファイル名は依頼内容から判断する。
- ファイル名は英小文字のkebab-caseにする。
- 既存ファイルがある場合は、内容を読んで追記、更新、再構成する。無条件上書きはしない。
- 公式ドキュメント、GitHub、npm、リリースノートなどの参照URLを必ず残す。
- 不確かな情報は断定せず、追加調査TODOに残す。
- Astro Starlightで閲覧しやすい見出し構造にする。

## 調査カテゴリ

- `research/library-catalogs/`: ライブラリ、ツール、API群の便利機能カタログ。
- `research/framework-surveys/`: フレームワーク、技術要素、設計手法の採用判断調査。
- `research/comparisons/`: 複数技術や選択肢の比較。
- `research/poc-plans/`: 小さく試すためのPoC計画。
- `research/release-notes/`: リリース、変更点、移行情報のまとめ。
- `research/cheatsheets/`: 実装時に参照する短い早見表。

## 調査Markdown作成後

調査Markdownを作成または更新したら、最後に保存先と次の閲覧コマンドを簡潔に伝えてください。

```bash
mise run dev
```
