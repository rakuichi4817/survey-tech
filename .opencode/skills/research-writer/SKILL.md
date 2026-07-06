---
name: research-writer
description: 技術、ライブラリ、フレームワーク、ツール、API、リリース、比較、PoC、チートシートの調査依頼で使用します。保存先を質問せず、research/配下へMarkdownを作成または更新します。
---

# Research Writer

ユーザーが技術調査を依頼したときに使用します。依頼が「VueUseで使える便利ツールを教えて」「Honoを採用するべきか調べて」のように曖昧でも、このskillの方針で処理します。

## 目的

Astro Starlightサイトで閲覧できる、有用なMarkdown調査ページを作成します。チャット回答だけで終わらせず、`research/`配下にファイルを作成または更新してください。

## 保存先の選び方

保存先はユーザーに質問せず、依頼内容から判断します。

- `research/library-catalogs/`: ライブラリ、パッケージ、API、プラグイン、ユーティリティ、composable、SDK、ツールの機能カタログ。
- `research/framework-surveys/`: フレームワーク、ランタイム、プラットフォーム、アーキテクチャ、設計手法、採用判断。
- `research/comparisons/`: 複数の技術、ツール、ライブラリ、手法の比較。
- `research/poc-plans/`: PoC、スパイク、実験計画、検証計画、試行ロードマップ。
- `research/release-notes/`: リリースノート、移行ガイド、破壊的変更、新バージョンまとめ。
- `research/cheatsheets/`: 実装時にすばやく参照するための短いコマンド、API、参照表。

ファイル名は英小文字のkebab-caseにします。

例:

- `research/library-catalogs/vueuse.md`
- `research/framework-surveys/astro.md`
- `research/comparisons/astro-vs-vitepress.md`
- `research/poc-plans/hono-api.md`
- `research/release-notes/vue-3-5.md`
- `research/cheatsheets/vueuse.md`

## 既存ファイルの扱い

書き込み前に、想定される保存先の既存ファイルを確認します。

- 既存ファイルがある場合は、無条件上書きせず読んで更新する。
- 有用な既存メモと参照URLを残す。
- 新しい依頼が既存内容を置き換える場合は、ページを再構成し、有用な古い内容を適切な節に残す。
- 関連ページが複数ある場合は、`## 関連ページ`からリンクする。

## 記事分割ルール

1つのMarkdownに複数の主題を詰め込みすぎないでください。巨大な万能記事ではなく、あとから読み返しやすい小さめの関連ページ群を優先します。

- 1ページの中心テーマは1つに絞る。
- 技術そのものの紹介、採用判断、他技術との比較、PoC計画、チートシートは原則として別ページにする。
- 大きな調査では「親記事 + 詳細記事」の構成を優先する。親記事は全体像とリンク集に寄せ、詳細は個別ページへ分ける。
- 既存記事へ追記すると長大化する場合は、既存記事へ無理に追記せず、新規ページを作って`## 関連ページ`からリンクする。
- 同じ技術名を含んでいても、読者の目的が違う内容は分ける。例: `microsoft-agent-framework.md`は技術紹介、`agent-framework-low-level-vs-high-level.md`はLiteLLMや他フレームワークとの採用判断。
- 分割したページ同士は、相対Markdownリンクで相互に関連付ける。
- 分割判断に迷う場合は、まず概要記事を短く作り、詳細・比較・PoCを別ページの`追加調査TODO`に残す。

## サイドバー順序ルール

Astro Starlightで`autogenerate`を使っているため、複数ページを同時に作るときは、意図した読了順が伝わるようにfrontmatterへ`sidebar.order`を付けます。

- 連続して読むシリーズ (例: 基本/運用/実例、概要/詳細/比較) では`sidebar.order`を設定する。
- 単発ページでは必須ではない。
- 既存シリーズへページを追加するときは、前後ページとの順序整合を確認する。

例:

```markdown
---
title: Terraform入門 (Azure向け)
description: ...
sidebar:
  order: 1
---
```

## 調査基準

- 公式ドキュメントを最優先する。
- 必要に応じてGitHubリポジトリ、npm/package registry、リリースノート、changelog、公式exampleも使う。
- 参照URLは最終回答だけでなくMarkdown本文に残す。
- 不確かな情報は不確かと明記する。
- 宣伝文句に寄せず、実務での使いどころ、トレードオフ、保守コスト、採用リスクを説明する。
- コード例は短く、焦点を絞る。
- ユーザーが指定しない限り、日本語で説明する。

## 形式の選び方

依頼内容に合う形式を選びます。

### ライブラリカタログ

VueUse、TanStack Query、Lodash、Zod、date-fnsなどのパッケージ調査で使います。

```markdown
---
title: <title>
description: <description>
---

# <title>

## 要約
## 全体像
## カテゴリ別一覧
## まず試すべき機能
## 機能詳細
## 実務活用パターン
## 注意点
## 関連ページ
## 参照情報
## 追加調査TODO
```

各機能詳細には次を含めます。

- 何ができるか
- 使いどころ
- 最小コード例
- 注意点
- 参照URL

### 採用判断調査

フレームワーク、ランタイム、アーキテクチャ、大きめのツールを採用するか判断する調査で使います。

```markdown
---
title: <title>
description: <description>
---

# <title>

## 要約
## 解決する課題
## 主要概念
## メリット
## デメリット
## 採用に向くケース
## 採用しない方がよいケース
## 代替案
## PoC案
## 採用判断
## 関連ページ
## 参照情報
## 追加調査TODO
```

### 比較調査

「A vs B」「比較」「選定」など、複数候補から選ぶ依頼で使います。

```markdown
---
title: <title>
description: <description>
---

# <title>

## 要約
## 比較対象
## 比較表
## 観点別比較
## 採用シナリオ別の選び方
## 移行・運用コスト
## 結論
## 関連ページ
## 参照情報
## 追加調査TODO
```

### PoC計画

検証計画、試行、スパイク、「小さく試す」依頼で使います。

```markdown
---
title: <title>
description: <description>
---

# <title>

## 目的
## 検証したい仮説
## スコープ
## 手順
## 成功条件
## 失敗条件
## 必要な成果物
## 所要時間の目安
## リスク
## 関連ページ
## 参照情報
## 追加調査TODO
```

### リリースノート

バージョン、移行、破壊的変更、changelogのまとめで使います。

```markdown
---
title: <title>
description: <description>
---

# <title>

## 要約
## 主な変更点
## Breaking Changes
## 移行時の注意点
## 影響を受けるケース
## 確認TODO
## 関連ページ
## 参照情報
```

### チートシート

短い参照ページで使います。

```markdown
---
title: <title>
description: <description>
---

# <title>

## よく使うパターン
## API早見表
## コード例
## 注意点
## 関連ページ
## 参照情報
```

## 最終回答

編集後の最終回答は短くします。次を含めてください。

- 保存先ファイルパス
- 新規作成か既存更新か
- 次の閲覧コマンド: `mise run dev`
