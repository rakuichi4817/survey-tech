# Survey Tech

`opencode run`で技術調査Markdownを作成し、Astro Starlightの静的サイトとして閲覧するためのプロジェクトです。

## Setup

初回だけ、miseでNode.jsとpnpmを入れて依存関係をインストールします。

```bash
mise install
mise run install
```

`.opencode/skills/`や`opencode.json`を追加・変更した後は、opencodeを再起動してください。実行中のopencodeセッションは起動時点の設定を使い続けます。

## Usage

### 1. 調査する

保存先は指定しなくてOKです。`AGENT.md`と`.opencode/skills/`の方針により、依頼内容から適切なカテゴリとファイル名を判断して`research/`配下にMarkdownを作成または更新します。

```bash
opencode run "VueUseで使える様々な便利ツールを教えて。具体例と参照情報も残して"
```

例:

```bash
opencode run "TanStack Queryの便利機能を実務例と参照URLつきでまとめて"
opencode run "Astroを採用するべきか、メリット・デメリット・PoC案つきで調査して"
opencode run "AstroとVitePressを技術調査サイト用途で比較して"
opencode run "Honoを小規模APIで試すPoC計画を作って"
opencode run "Vue 3.5の主な変更点と移行時の注意点をまとめて"
```

調査依頼では`research-writer` skillが使われる想定です。毎回「skillを使って」と書く必要はありません。

### 2. サイトで閲覧する

```bash
mise run dev
```

`mise run dev`は内部で同期処理を実行し、`research/`のMarkdownをAstro Starlight用の`site/src/content/docs/`へ反映してから開発サーバーを起動します。

### 3. 静的サイトとしてビルドする

```bash
mise run build
```

ビルド結果は`site/dist/`に生成されます。

### 4. ビルド結果を確認する

```bash
mise run preview
```

### 5. GitHub Pagesで公開する

このリポジトリはGitHub Pagesで公開できるように設定しています。

公開URL:

```text
https://rakuichi4817.github.io/survey-tech/
```

公開前に、リポジトリをPublicに変更します。

```bash
gh repo edit rakuichi4817/survey-tech --visibility public
```

GitHub Actions workflowは`.github/workflows/deploy-pages.yml`です。`main`ブランチへpushすると、次の処理が自動実行されます。

```text
checkout
miseでNode.js/pnpmをセットアップ
mise run ci-install
mise run check
mise run build
site/distをGitHub Pagesへデプロイ
```

Astro側では、GitHub Pagesのproject siteに合わせて`site/astro.config.mjs`に`site`と`base`を設定しています。

```js
export default defineConfig({
  site: "https://rakuichi4817.github.io",
  base: "/survey-tech",
})
```

### 6. 調査Markdownを整理する

既存の調査ファイルの分類、見出し、frontmatter、関連ページリンク、重複ページを整理したい場合は、自然文で依頼します。

```bash
opencode run "調査Markdownを整理して、カテゴリやリンクを見直して"
```

整理依頼では`research-organizer` skillが使われる想定です。

## Categories

調査ファイルは以下のカテゴリへ自動配置します。

```text
research/library-catalogs/   ライブラリ、ツール、API群の便利機能カタログ
research/framework-surveys/  フレームワーク、技術要素、設計手法の採用判断調査
research/comparisons/        複数技術や選択肢の比較
research/poc-plans/          小さく試すためのPoC計画
research/release-notes/      リリース、変更点、移行情報のまとめ
research/cheatsheets/        実装時に参照する短い早見表
```

## Markdown Rules

調査MarkdownはAstro Starlightで読みやすい構成にします。frontmatterは自分で書いてもよいですが、省略した場合は`mise run sync`時に先頭の`# 見出し`またはファイル名から`title`と`description`を自動付与します。

```markdown
---
title: VueUse 便利ツール調査
description: VueUseの便利なComposableと実務活用例
---
```

基本的に、各ページには`## 参照情報`と`## 追加調査TODO`を含めます。

## Commands

普段使うコマンドはmiseタスクに寄せています。

```bash
mise run install     # 依存関係をインストール
mise run ci-install  # CI向けにlockfile固定で依存関係をインストール
mise run sync        # research/ のMarkdownをStarlight用に同期
mise run dev         # 同期して開発サーバーを起動
mise run build       # 同期して静的サイトをビルド
mise run preview     # ビルド結果をプレビュー
mise run format      # Biomeで整形
mise run format-check # Biomeで整形差分がないか検査
mise run lint        # Biomeでlint
mise run check       # lint、TypeScript、Astro checkを実行
mise run typecheck   # TypeScript checkを実行
mise run site-check  # Astro checkを実行
```

## Pull Request Checks

PR作成・更新時は`.github/workflows/pr-check.yml`が実行されます。

```text
mise run ci-install
mise run format-check
mise run check
mise run build
```

`mise run format-check`は`mise run format`と違い、ファイルを書き換えずに整形済みかだけ確認します。

PR本文の雛形は`.github/pull_request_template.md`です。調査Markdownを追加・更新した場合の参照情報、関連リンク、生成物混入を確認するチェック項目を入れています。

GitHub Copilot向けのレビュー方針は`.github/copilot-instructions.md`に置いています。Copilotレビューでは、`research/`が原本であること、`site/src/content/docs/`を直接編集しないこと、参照情報不足やカテゴリ違いを重点的に見るようにしています。

## Directories

```text
.opencode/skills/
  research-writer/      調査Markdown作成方針
  research-organizer/   調査Markdown整理方針
research/
  library-catalogs/
  framework-surveys/
  comparisons/
  poc-plans/
  release-notes/
  cheatsheets/
scripts/
  sync-research-to-site.ts
site/
  Astro Starlight site
```

## Tools

### mise

Node.jsやpnpmなど、プロジェクトで使うCLIツールのバージョンとタスクを管理します。このプロジェクトでは`.mise.toml`でNode.js 24、pnpm、各種タスクを指定しています。

### Node.js 24

Astro、tsx、TypeScriptなどを動かすJavaScript実行環境です。最新寄りのLTS系としてNode.js 24を採用しています。

### pnpm

Node.jsのパッケージマネージャーです。依存関係のインストールが速く、workspace構成との相性が良いため採用しています。普段は直接実行せず、`mise run ...`経由で使います。

### Astro

Markdownやコンポーネントから静的サイトを生成できるフレームワークです。今回の用途では、調査MarkdownをHTMLとして閲覧できるサイトに変換します。

### Astro Starlight

Astro公式のドキュメントサイト向けテンプレートです。サイドバー、検索、Markdown/MDXの表示などが最初から整っています。

### Biome

TypeScript、JavaScript、JSON向けのformatter/linterです。PrettierやESLintを細かく組み合わせるより軽く始められるため、TS周辺の整備に使っています。

### TypeScript

同期スクリプトなどを型付きで書くために使っています。`mise run typecheck`で`scripts/`配下のTypeScriptを検査します。

### tsx

TypeScriptファイルをビルドなしで直接実行するためのツールです。`scripts/sync-research-to-site.ts`を`mise run sync`で実行するために使っています。

## Sync Script

`scripts/sync-research-to-site.ts`は、`research/**/*.md`を`site/src/content/docs/`へコピーします。frontmatterがないMarkdownには、ファイル名や先頭見出しから`title`と`description`を自動で付与します。
