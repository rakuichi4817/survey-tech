---
title: Astro Starlight サイト構成まとめ
description: Survey Techで使っているAstro、Astro Starlight、content collections、サイドバー、同期先ディレクトリの役割を初心者向けに整理する
---

# Astro Starlight サイト構成まとめ

## 要約

このプロジェクトでは、`research/`配下に保存した調査Markdownを、Astro Starlightでドキュメントサイトとして閲覧できるようにしています。

Astroは静的サイトを作る土台、Starlightはドキュメントサイト向けの見た目・サイドバー・検索などを提供する仕組みです。

```text
research/**/*.md
↓ sync-research-to-site.ts
site/src/content/docs/**/*.md
↓ Astro Starlight
ブラウザで閲覧できる静的サイト
```

## 解決する課題

Markdownをただファイルとして置くだけだと、数が増えたときに探しにくくなります。

Astro Starlightを使うと、次のことができます。

- MarkdownをHTMLページとして表示する
- カテゴリごとのサイドバーを作る
- ドキュメントサイトらしいレイアウトにする
- ビルドして静的サイトとして配布できる
- Pagefindによる検索インデックスを作れる

## 主要概念

### Astro

Astroは、Markdown、MDX、コンポーネントなどを元にWebサイトを生成するフレームワークです。

このプロジェクトでは、アプリケーションUIを作るよりも、調査Markdownを静的HTMLへ変換する目的で使っています。

### Astro Starlight

StarlightはAstro公式のドキュメントサイト向け統合です。

主に次を担当します。

- ドキュメントページのレイアウト
- サイドバー
- ナビゲーション
- Markdown表示
- 検索インデックス
- 404ページなどの基本ページ

### Content Collections

Astroでは、Markdownなどのコンテンツを型付きで扱う仕組みとしてContent Collectionsがあります。

このプロジェクトでは`site/src/content.config.ts`でStarlight用の`docs` collectionを定義しています。

```ts
import { docsLoader } from "@astrojs/starlight/loaders"
import { docsSchema } from "@astrojs/starlight/schema"
import { defineCollection } from "astro:content"

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
}
```

これにより、`site/src/content/docs/`配下のMarkdownがStarlightのページとして扱われます。

### frontmatter

Markdown先頭の`---`で囲まれたメタ情報です。

```markdown
---
title: Survey Tech 技術構成まとめ
description: このページの説明
---
```

Starlightでは、ページタイトルや説明文として使われます。

このプロジェクトでは、frontmatterがないMarkdownにも`scripts/sync-research-to-site.ts`が`title`と`description`を自動付与します。

## このプロジェクトでの構成

Astroサイト本体は`site/`配下にあります。

```text
site/
  astro.config.mjs
  package.json
  src/
    content.config.ts
    content/
      docs/
```

### site/package.json

`site/package.json`では、Astroサイト側の依存関係とスクリプトを定義しています。

主な依存関係:

| パッケージ | 役割 |
| --- | --- |
| `astro` | 静的サイト生成の本体 |
| `@astrojs/starlight` | ドキュメントサイト機能 |
| `@astrojs/check` | Astroプロジェクトの検査 |
| `sharp` | 画像処理で使われる依存関係 |

主なスクリプト:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check"
}
```

ただし普段は直接`pnpm --filter survey-tech-site ...`を叩かず、ルートの`mise run ...`を使います。

### astro.config.mjs

`site/astro.config.mjs`はAstroとStarlightの設定ファイルです。

このプロジェクトでは、Starlightのタイトルとサイドバーを定義しています。

```js
starlight({
  title: "Tech Survey",
  sidebar: [
    {
      label: "Library Catalogs",
      items: [{ autogenerate: { directory: "library-catalogs" } }],
    },
  ],
})
```

`autogenerate`は、指定したディレクトリ内のMarkdownからサイドバー項目を自動生成する設定です。

現在のサイドバーカテゴリ:

```text
Library Catalogs
Framework Surveys
Comparisons
PoC Plans
Release Notes
Cheatsheets
```

## research/とsite/src/content/docs/の違い

このプロジェクトでは、Markdownの原本と閲覧用コピーを分けています。

| ディレクトリ | 役割 | 編集するか |
| --- | --- | --- |
| `research/` | 調査Markdownの原本 | 編集する |
| `site/src/content/docs/` | Starlight用に同期されたコピー | 原則編集しない |

`site/src/content/docs/`は`mise run sync`や`mise run dev`で再生成されます。直接編集しても次回同期時に消える可能性があります。

## 同期から表示まで

### mise run dev

```bash
mise run dev
```

内部では次の順で処理されます。

```text
mise run dev
↓
pnpm site:dev
↓
pnpm sync
↓
tsx scripts/sync-research-to-site.ts
↓
pnpm --filter survey-tech-site dev
↓
astro dev
```

### mise run build

```bash
mise run build
```

内部ではMarkdown同期後に`astro build`が実行され、`site/dist/`へ静的ファイルが出力されます。

## メリット

- Markdownをそのまま調査ノートとして管理できる
- カテゴリごとの閲覧がしやすい
- 静的サイトなので配布しやすい
- Astro/Starlight側の設定が少なくて済む
- 調査Markdownの原本とサイト用コピーを分けられる

## デメリット

- `research/`から`site/src/content/docs/`へ同期する一手間がある
- Starlightのバージョン変更で設定形式が変わる可能性がある
- Markdown内リンクの検査は現状自動化していない
- 公開する場合は`astro.config.mjs`の`site`設定やデプロイ設定が追加で必要

## 採用に向くケース

- 技術調査メモをMarkdownで蓄積したい
- ドキュメントサイトを手早く作りたい
- 検索やサイドバー付きで閲覧したい
- 静的サイトとしてビルドしたい

## 採用しない方がよいケース

- CMSのようなGUI編集画面が必要
- Markdownではなくデータベースで厳密管理したい
- ユーザー投稿や認証付きアプリケーションを作りたい

## 代替案

| 代替案 | 特徴 |
| --- | --- |
| VitePress | Vue/Vite寄りのドキュメントサイトに向く |
| Docusaurus | 大規模なドキュメントやバージョニングに強い |
| MkDocs | Python系で定番のMarkdownドキュメントサイト |
| Next.js + MDX | 自由度は高いが自作量が増える |

## PoC案

今後確認するなら、次の観点が有用です。

- 調査Markdownが50件、100件に増えたときのサイドバーの見やすさ
- ページ間リンク切れの検出方法
- 公開先を決めた場合の`site`設定
- カテゴリトップページの一覧自動生成

## テーマ変更の考え方

Astro Starlightは、複数の完成済みテーマから選ぶというより、標準テーマをベースに設定とCSSで調整する方式です。

主な変更ポイントは次の通りです。

- `site/astro.config.mjs`でサイトタイトル、サイドバー、ロゴ、social linksを設定する
- `customCss`で独自CSSを読み込む
- CSS変数でアクセントカラーやライト/ダークテーマの色を調整する
- 必要になった場合だけcomponent overrideで内部コンポーネントを差し替える

このプロジェクトでは、最初は`customCss`による色と読みやすさの調整に留めるのが安全です。詳しい手順は[Astro Starlight テーマ変更早見表](../cheatsheets/starlight-theme-customization.md)にまとめています。

## 採用判断

このプロジェクトではAstro Starlight採用は妥当です。

理由は、目的が「Markdown調査ノートを静的サイトとして読みやすくすること」であり、Starlightの標準機能とよく合っているためです。

## 関連ページ

- [Survey Tech 技術構成まとめ](./survey-tech-stack.md)
- [pnpm / workspace / mise タスク早見表](../cheatsheets/pnpm-workspace-mise.md)
- [Astro Starlight テーマ変更早見表](../cheatsheets/starlight-theme-customization.md)

## 参照情報

- Astro documentation: https://docs.astro.build/
- Astro Starlight documentation: https://starlight.astro.build/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Starlight Sidebar Navigation: https://starlight.astro.build/guides/sidebar/
- Starlight Pages: https://starlight.astro.build/guides/pages/
- Astro CLI: https://docs.astro.build/en/reference/cli-reference/

## 追加調査TODO

- Starlightのカテゴリトップを、現在の固定文ではなく配下ページ一覧つきにするか検討する。
- `site`設定を入れてsitemap警告を解消するか、公開先決定後に判断する。
- Markdownリンク切れ検査を導入するか検討する。
