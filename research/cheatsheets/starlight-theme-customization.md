---
title: Astro Starlight テーマ変更早見表
description: Astro Starlightで色、ロゴ、favicon、CSS、サイドバー、コンポーネントを変更する方法の実装メモ
---

# Astro Starlight テーマ変更早見表

## よく使うパターン

Astro Starlightは、複数の既成テーマから選ぶというより、標準テーマをベースに設定とCSSで調整する方式です。

主な変更方法は次の通りです。

| やりたいこと | 触る場所 | 難易度 |
| --- | --- | --- |
| サイト名を変える | `site/astro.config.mjs`の`title` | 低 |
| サイドバーを変える | `site/astro.config.mjs`の`sidebar` | 低 |
| アクセントカラーを変える | custom CSSのCSS変数 | 低 |
| ロゴを追加する | `starlight({ logo })` | 中 |
| faviconを追加する | `site/public/favicon.svg`など | 中 |
| 全体の余白や表の見た目を変える | custom CSS | 中 |
| ヘッダーやページ部品を差し替える | component override | 高 |

## API早見表

### customCss

Starlightに独自CSSを読み込ませる設定です。

```js
starlight({
  title: "Tech Survey",
  customCss: ["./src/styles/custom.css"],
})
```

CSSファイル例:

```css
:root {
  --sl-color-accent-low: #e0f2fe;
  --sl-color-accent: #0284c7;
  --sl-color-accent-high: #0c4a6e;
}
```

### title

サイト名を変える設定です。

```js
starlight({
  title: "Tech Survey",
})
```

### sidebar

サイドバーを定義します。

```js
starlight({
  sidebar: [
    {
      label: "Library Catalogs",
      items: [{ autogenerate: { directory: "library-catalogs" } }],
    },
  ],
})
```

`autogenerate`を使うと、指定ディレクトリ配下のMarkdownからサイドバー項目を自動生成できます。

### logo

ロゴを設定できます。

```js
starlight({
  logo: {
    src: "./src/assets/logo.svg",
    alt: "Tech Survey",
  },
})
```

### social

GitHubなどのリンクをヘッダー周辺に出せます。

```js
starlight({
  social: {
    github: "https://github.com/<owner>/<repo>",
  },
})
```

## コード例

### 1. カスタムCSSを作る

```text
site/src/styles/custom.css
```

```css
:root {
  --sl-color-accent-low: #e0f2fe;
  --sl-color-accent: #0284c7;
  --sl-color-accent-high: #0c4a6e;
}

:root[data-theme="dark"] {
  --sl-color-accent-low: #082f49;
  --sl-color-accent: #38bdf8;
  --sl-color-accent-high: #e0f2fe;
}
```

### 2. astro.config.mjsで読み込む

```js
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    starlight({
      title: "Tech Survey",
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Library Catalogs",
          items: [{ autogenerate: { directory: "library-catalogs" } }],
        },
      ],
    }),
  ],
})
```

### 3. 確認する

```bash
mise run check
mise run build
mise run dev
```

## このプロジェクトに合う調整案

技術調査ノート用途なので、最初は過度にデザインを変えず、読みやすさを優先するのがよいです。

おすすめ順:

1. アクセントカラーを落ち着いた青系にする
2. 表の読みやすさを少し上げる
3. コードブロックの余白を確認する
4. 必要ならロゴとfaviconを追加する
5. 慣れてからcomponent overrideを検討する

## component override

Starlightでは、内部コンポーネントを差し替えるcomponent overrideも可能です。

使いどころ:

- ヘッダーの構造を変えたい
- フッターに独自情報を入れたい
- ページの前後ナビゲーションを変えたい
- Starlight標準の見た目では足りない

ただし、Starlightの内部構造やバージョン変更の影響を受けやすくなるため、最初はCSS変数とcustom CSSで済ませるのが安全です。

## 注意点

### site/src/content/docsは編集しない

テーマ変更は`site/astro.config.mjs`や`site/src/styles/`で行います。

`site/src/content/docs/`は同期スクリプトで再生成されるため、直接編集しないでください。

### CSS変数名は公式ドキュメントを確認する

StarlightのCSS変数は公式ドキュメントに一覧があります。バージョンによって追加・変更される可能性があるため、色を細かく調整する場合は公式を確認します。

### まずは小さく変える

大きく見た目を変えると、Starlightの更新追従が難しくなります。

このプロジェクトでは、まず`customCss`で色と読みやすさを調整する程度が向いています。

## 関連ページ

- [Astro Starlight サイト構成まとめ](../framework-surveys/astro-starlight-site.md)
- [Survey Tech 技術構成まとめ](../framework-surveys/survey-tech-stack.md)

## 参照情報

- Starlight CSS and Tailwind: https://starlight.astro.build/guides/css-and-tailwind/
- Starlight configuration reference: https://starlight.astro.build/reference/configuration/
- Starlight sidebar guide: https://starlight.astro.build/guides/sidebar/
- Starlight overriding components: https://starlight.astro.build/guides/overriding-components/
- Astro project structure: https://docs.astro.build/en/basics/project-structure/
