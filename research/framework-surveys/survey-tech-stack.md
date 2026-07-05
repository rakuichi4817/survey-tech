---
title: Survey Tech 技術構成まとめ
description: opencode run、Astro Starlight、mise、pnpm、Biomeなど、このプロジェクトで使っている技術要素と処理の流れを初心者向けに整理する
---

# Survey Tech 技術構成まとめ

## 要約

このプロジェクトは、気になる技術やフレームワークを`opencode run`で調査し、その結果をMarkdownとして`research/`配下に保存し、Astro Starlightで閲覧できる静的サイトに変換するための仕組みです。

普段の流れは次の通りです。

```text
opencode runで調査を依頼
↓
research/配下にMarkdownが作成・更新される
↓
mise run devを実行
↓
sync-research-to-site.tsがMarkdownをサイト用ディレクトリへ同期
↓
Astro Starlightでブラウザ閲覧
```

初心者向けに一言でいうと、「AIに調査メモを書かせ、それを自動でドキュメントサイト化するプロジェクト」です。

## このプロジェクトの目的

目的は、技術調査をチャットの中だけで終わらせず、後から見返せる形で蓄積することです。

特に重視していることは次の通りです。

- ざっくりした調査依頼からMarkdownを作る
- 保存先カテゴリを毎回考えなくてよいようにする
- 参照URLを残して、後から根拠を確認できるようにする
- Astro Starlightで検索・サイドバー付きのサイトとして閲覧する
- コマンド実行は`mise run ...`に寄せて覚えることを減らす

## 全体の流れ

### 1. 調査を依頼する

```bash
opencode run "VueUseで使える様々な便利ツールを教えて。具体例と参照情報も残して"
```

このプロジェクトでは、`AGENT.md`と`.opencode/skills/`に方針を置いているため、保存先を明示しなくても`research/`配下の適切な場所にMarkdownを作る運用です。

### 2. 調査Markdownが保存される

依頼内容に応じて、たとえば次のような場所に保存されます。

```text
research/library-catalogs/vueuse.md
research/framework-surveys/astro.md
research/comparisons/astro-vs-vitepress.md
research/poc-plans/hono-api.md
research/release-notes/vue-3-5.md
research/cheatsheets/vueuse.md
```

### 3. サイトに同期する

```bash
mise run dev
```

`mise run dev`は内部で`pnpm site:dev`を実行し、さらに`pnpm sync`を通じて`scripts/sync-research-to-site.ts`を実行します。

### 4. Astro Starlightで閲覧する

同期されたMarkdownは`site/src/content/docs/`へコピーされ、Astro Starlightのドキュメントページとして表示されます。

## ディレクトリ構成

```text
.
├─ AGENT.md
├─ opencode.json
├─ .opencode/skills/
│  ├─ research-writer/
│  └─ research-organizer/
├─ research/
│  ├─ library-catalogs/
│  ├─ framework-surveys/
│  ├─ comparisons/
│  ├─ poc-plans/
│  ├─ release-notes/
│  └─ cheatsheets/
├─ scripts/
│  └─ sync-research-to-site.ts
├─ site/
│  ├─ astro.config.mjs
│  └─ src/content/docs/
├─ .mise.toml
├─ biome.json
├─ package.json
└─ pnpm-workspace.yaml
```

## opencode関連

### opencode run

`opencode run`は、ターミナルからopencodeに依頼を渡して実行するためのコマンドです。

このプロジェクトでは、技術調査の依頼をすると、チャット回答だけで終わらせず、Markdownファイルとして保存する方針にしています。

例:

```bash
opencode run "Honoを小規模APIで採用するべきか調査して"
```

### AGENT.md

`AGENT.md`は、このプロジェクトでopencodeに守ってほしい方針を書いたファイルです。

主な方針は次の通りです。

- 技術調査依頼は`research-writer`の方針でMarkdown化する
- 整理依頼は`research-organizer`の方針で処理する
- 保存先はユーザーに聞かず、内容から判断する
- 公式ドキュメントやGitHubなどの参照URLを残す
- 不確かな情報は断定しない

### opencode.json

`opencode.json`はopencodeのプロジェクト設定です。

このプロジェクトでは次のように`AGENT.md`を読み込ませています。

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENT.md"]
}
```

これにより、毎回長い指示を書かなくても、プロジェクトの基本方針がopencodeに伝わります。

### research-writer skill

`research-writer`は、調査Markdownを作るためのskillです。

場所:

```text
.opencode/skills/research-writer/SKILL.md
```

主な役割は次の通りです。

- ざっくりした調査依頼を受け取る
- 保存先カテゴリを判断する
- ファイル名を英小文字kebab-caseにする
- 既存ファイルがあれば読んで更新する
- 参照URLをMarkdown内に残す
- 調査内容に応じてページ構成を変える

対応するページ構成の例:

- ライブラリカタログ
- 採用判断レポート
- 比較調査
- PoC計画
- リリースノート
- チートシート

### research-organizer skill

`research-organizer`は、増えてきた調査Markdownを整理するためのskillです。

場所:

```text
.opencode/skills/research-organizer/SKILL.md
```

主な役割は次の通りです。

- カテゴリ違いのファイルを移動する
- frontmatterを整える
- 見出し構造を整える
- 重複ページを統合する
- 関連ページリンクを追加する
- 参照情報を維持する
- Markdown同士の相対リンクを貼り直す

整理依頼の例:

```bash
opencode run "調査Markdownを整理して、カテゴリやリンクを見直して"
```

## 調査Markdownの保存先

`research/`配下は、調査内容ごとにカテゴリを分けています。

| 保存先 | 用途 | 例 |
| --- | --- | --- |
| `research/library-catalogs/` | ライブラリやツールの便利機能一覧 | VueUse、TanStack Query、Zod |
| `research/framework-surveys/` | フレームワークや技術の採用判断 | Astro、Hono、Nuxt |
| `research/comparisons/` | 複数技術の比較 | Astro vs VitePress |
| `research/poc-plans/` | 小さく試す検証計画 | Hono API PoC |
| `research/release-notes/` | リリースや移行情報 | Vue 3.5変更点 |
| `research/cheatsheets/` | 実装時の短い早見表 | VueUse早見表 |

## Markdownをサイト化する仕組み

### sync-research-to-site.ts

`scripts/sync-research-to-site.ts`は、`research/`にあるMarkdownをAstro Starlight用のディレクトリへコピーする同期スクリプトです。

入力:

```text
research/**/*.md
```

出力:

```text
site/src/content/docs/**/*.md
```

やっていることは次の通りです。

1. `site/src/content/docs/`を削除する
2. `research/`配下のMarkdownを再帰的に探す
3. 同じ相対パスで`site/src/content/docs/`へコピーする
4. frontmatterがないMarkdownには`title`と`description`を自動追加する
5. カテゴリごとの`index.md`を自動生成する
6. トップページの`index.md`を自動生成する

### frontmatterの自動追加

Astro Starlightでは、Markdownの先頭にfrontmatterを書くとページタイトルや説明を設定できます。

例:

```markdown
---
title: VueUse 便利ツール調査
description: VueUseの便利なComposableと実務活用例
---
```

このプロジェクトでは、frontmatterがない場合でも同期スクリプトが自動で補完します。

タイトルの決め方:

- Markdown本文の先頭に`# 見出し`があれば、それを使う
- なければファイル名からタイトルを作る

## Astro / Starlight

### Astro

Astroは、Markdownやコンポーネントから静的サイトを生成するWebフレームワークです。

このプロジェクトでは、調査MarkdownをHTMLとして出力するために使っています。

### Astro Starlight

Astro Starlightは、Astro公式のドキュメントサイト向けツールです。

このプロジェクトでStarlightを使う理由は次の通りです。

- Markdown中心のドキュメントサイトを作りやすい
- サイドバーを設定できる
- 検索機能を組み込みやすい
- 技術ノートの閲覧に向いている

サイドバー設定は`site/astro.config.mjs`にあります。

現在のカテゴリ:

```text
Library Catalogs
Framework Surveys
Comparisons
PoC Plans
Release Notes
Cheatsheets
```

## mise / pnpm / Node.js

### mise

miseは、開発に使うCLIツールのバージョンとタスクを管理するツールです。

このプロジェクトでは`.mise.toml`でNode.jsとpnpmのバージョンを指定しています。

```toml
[tools]
node = "24"
pnpm = "latest"
```

また、よく使うコマンドをmiseタスクとして定義しています。

```bash
mise run dev
mise run build
mise run check
mise run format
```

### Node.js 24

Node.jsは、Astro、TypeScript、tsx、Biomeなどを動かすJavaScript実行環境です。

このプロジェクトでは、最新寄りの安定版としてNode.js 24を使っています。

### pnpm

pnpmはNode.jsのパッケージマネージャーです。

このプロジェクトでは、AstroやBiomeなどの依存関係を管理しています。普段は`pnpm`を直接叩くのではなく、`mise run ...`経由で使う方針です。

## TypeScript / tsx

### TypeScript

TypeScriptは、JavaScriptに型を追加した言語です。

このプロジェクトでは、`scripts/sync-research-to-site.ts`を型付きで書くために使っています。

メリット:

- ファイルパスや関数の扱いを型で確認できる
- スクリプトの変更ミスに気づきやすい
- `mise run typecheck`で事前検査できる

### tsx

tsxは、TypeScriptファイルを事前ビルドなしで実行するためのツールです。

このプロジェクトでは、次のスクリプトを実行するために使っています。

```bash
tsx scripts/sync-research-to-site.ts
```

実際には`mise run sync`から呼び出されます。

## Biome

Biomeは、TypeScript、JavaScript、JSONなどのformatter/linterです。

このプロジェクトでは次の用途で使っています。

- コード整形
- lint
- JSON設定ファイルの整形

実行コマンド:

```bash
mise run format
mise run lint
```

`biome.json`では、Astroの生成物や同期で作られるファイルを対象外にしています。

対象外にしている主なパス:

```text
node_modules/
site/.astro/
site/dist/
site/src/content/docs/
```

理由は、これらが自分たちで編集するソースではなく、依存関係や生成物だからです。

## よく使うコマンド

| コマンド | 用途 |
| --- | --- |
| `mise run install` | 依存関係をインストールする |
| `mise run dev` | Markdownを同期して開発サーバーを起動する |
| `mise run sync` | MarkdownをStarlight用に同期する |
| `mise run build` | 静的サイトをビルドする |
| `mise run preview` | ビルド結果をプレビューする |
| `mise run format` | Biomeで整形する |
| `mise run lint` | Biomeでlintする |
| `mise run check` | lint、TypeScript、Astro checkをまとめて実行する |

## 初心者向けの理解ポイント

### research/が原本

調査結果の原本は`research/`配下です。

`site/src/content/docs/`は同期スクリプトで生成される閲覧用コピーです。基本的には直接編集しません。

### opencodeは調査を書く担当

`opencode run`は、調査内容をMarkdownとして作る担当です。

`AGENT.md`とskillにより、毎回細かい保存ルールを指定しなくてもよいようにしています。

### Astro Starlightは見る担当

Astro Starlightは、作成済みMarkdownをWebサイトとして見やすく表示する担当です。

### miseはコマンドを覚えやすくする担当

`pnpm`や`tsx`の細かいコマンドを直接覚えなくても、`mise run dev`や`mise run check`で実行できるようにしています。

## 採用判断

この構成は、個人や小さなチームで技術調査ノートを継続的に蓄積する用途に向いています。

向いているケース:

- 調査メモをMarkdownで残したい
- AIに調査の下書きや整理を任せたい
- 後から検索・閲覧できるサイトにしたい
- ツールやコマンドをなるべく統一したい

向いていないケース:

- 厳密なレビュー承認フローが必要な社内ドキュメント
- CMSのような編集画面が必要な運用
- 非エンジニア中心でGitやMarkdownを触らない運用

## 関連ページ

- [README](../../README.md)
- [Astro Starlight サイト構成まとめ](./astro-starlight-site.md)
- [pnpm / workspace / mise タスク早見表](../cheatsheets/pnpm-workspace-mise.md)

## 参照情報

- opencode documentation: https://opencode.ai/docs/
- opencode config schema: https://opencode.ai/config.json
- Astro documentation: https://docs.astro.build/
- Astro Starlight documentation: https://starlight.astro.build/
- mise documentation: https://mise.jdx.dev/
- pnpm documentation: https://pnpm.io/
- Biome documentation: https://biomejs.dev/
- TypeScript documentation: https://www.typescriptlang.org/docs/
- tsx GitHub: https://github.com/privatenumber/tsx

## 追加調査TODO

- 公開先を決める場合は、Astroの`site`設定とデプロイ先の設定を追加で確認する。
- 調査Markdownが増えたら、カテゴリごとの索引ページやタグ設計を検討する。
- `research/`内リンクを自動検査する仕組みが必要か検討する。
