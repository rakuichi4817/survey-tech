---
title: pnpm / workspace / mise タスク早見表
description: Survey Techで使っているpnpm workspace、package scripts、miseタスクの関係を初心者向けに整理する
---

# pnpm / workspace / mise タスク早見表

## よく使うパターン

このプロジェクトでは、普段の操作は`pnpm`を直接実行せず、`mise run ...`経由で行います。

```bash
mise run install
mise run dev
mise run build
mise run check
mise run format
```

内部ではmiseタスクが`pnpm`コマンドを呼び出しています。

```text
ユーザー
↓ mise run dev
mise task
↓ pnpm site:dev
package.json scripts
↓ pnpm sync && pnpm --filter survey-tech-site dev
Astro dev server
```

## API早見表

| コマンド | 役割 | 内部で実行される主な処理 |
| --- | --- | --- |
| `mise run install` | 依存関係をインストール | `pnpm install` |
| `mise run sync` | Markdownをサイト用に同期 | `pnpm sync` |
| `mise run dev` | 開発サーバー起動 | `pnpm site:dev` |
| `mise run build` | 静的サイトをビルド | `pnpm site:build` |
| `mise run preview` | ビルド結果を確認 | `pnpm site:preview` |
| `mise run format` | 整形 | `pnpm format` |
| `mise run lint` | lint | `pnpm lint` |
| `mise run check` | まとめて検査 | `pnpm check` |
| `mise run typecheck` | TypeScript検査 | `pnpm typecheck` |
| `mise run site-check` | Astro検査 | `pnpm site:check` |

## このプロジェクトのpnpm構成

### pnpm-workspace.yaml

`pnpm-workspace.yaml`は、pnpm workspaceに含めるパッケージを指定するファイルです。

このプロジェクトでは、`site/`をworkspace packageとして扱っています。

```yaml
packages:
  - "site"
```

ルートプロジェクトとAstroサイトを分けることで、役割を整理しています。

```text
root package
  scripts/sync-research-to-site.ts
  Biome / TypeScript / tsx

site package
  Astro / Starlight
```

### ルートpackage.json

ルートの`package.json`は、同期スクリプト、整形、検査、サイト操作の入口です。

主なscripts:

```json
{
  "sync": "tsx scripts/sync-research-to-site.ts",
  "site:dev": "pnpm sync && pnpm --filter survey-tech-site dev",
  "site:build": "pnpm sync && pnpm --filter survey-tech-site build",
  "site:preview": "pnpm --filter survey-tech-site preview",
  "format": "biome format --write .",
  "lint": "biome lint .",
  "check": "pnpm lint && pnpm typecheck && pnpm site:check"
}
```

### site/package.json

`site/package.json`はAstroサイト側のpackageです。

```json
{
  "name": "survey-tech-site",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  }
}
```

ルートからは`--filter survey-tech-site`でこのpackageを指定しています。

```bash
pnpm --filter survey-tech-site dev
```

これは「workspace内の`survey-tech-site` packageで`dev` scriptを実行する」という意味です。

## miseとの関係

### miseが管理しているもの

`.mise.toml`では、Node.jsとpnpmのバージョン、よく使うタスクを管理しています。

```toml
[tools]
node = "24"
pnpm = "latest"
```

これにより、このプロジェクトではNode.js 24とpnpmを使うことが明示されます。

### なぜmise runに寄せるのか

pnpm scriptsを直接覚えるより、`mise run`に寄せた方が初心者には分かりやすくなります。

例えば、サイト起動に必要な実体は少し長いです。

```bash
pnpm sync && pnpm --filter survey-tech-site dev
```

これを次のように短くできます。

```bash
mise run dev
```

## コード例

### 初回セットアップ

```bash
mise install
mise run install
```

### 調査後にサイトで見る

```bash
opencode run "Astro周りについて初心者向けにまとめて"
mise run dev
```

### 静的サイトをビルドする

```bash
mise run build
```

### 変更前後の確認

```bash
mise run format
mise run check
```

## pnpmで知っておくとよい概念

### workspace

複数のpackageを1つのリポジトリで管理する仕組みです。

このプロジェクトでは、ルートと`site/`を分けて管理しています。

### --filter

workspace内の特定packageを指定してコマンドを実行するためのオプションです。

```bash
pnpm --filter survey-tech-site build
```

### lockfile

`pnpm-lock.yaml`は、実際に解決された依存関係のバージョンを記録するファイルです。

同じ依存関係を再現するために重要なので、通常はGit管理します。

### node_modules

依存パッケージがインストールされるディレクトリです。

生成物なのでGit管理しません。

## 注意点

### pnpm install時のbuild scripts警告

このプロジェクトでは、環境によって`esbuild`のbuild scriptに関する警告が出る場合があります。

現状の`mise run check`と`mise run build`には影響していません。

必要になった場合は、pnpmのbuild approval設定を見直します。

### pnpmを直接叩かない運用

直接pnpmを使っても動きますが、プロジェクト内では`mise run ...`を推奨します。

理由は、コマンド入口を統一し、Node.js/pnpmのバージョンもmiseで揃えやすくするためです。

### site/src/content/docsは編集しない

`mise run sync`で再生成されるため、直接編集しないでください。

原本は`research/`配下です。

## 関連ページ

- [Survey Tech 技術構成まとめ](../framework-surveys/survey-tech-stack.md)
- [Astro Starlight サイト構成まとめ](../framework-surveys/astro-starlight-site.md)

## 参照情報

- pnpm documentation: https://pnpm.io/
- pnpm workspaces: https://pnpm.io/workspaces
- pnpm filtering: https://pnpm.io/filtering
- pnpm scripts: https://pnpm.io/cli/run
- mise documentation: https://mise.jdx.dev/
- mise tasks: https://mise.jdx.dev/tasks/
- Node.js official site: https://nodejs.org/

## 追加調査TODO

- pnpmのbuild approval方針をこのプロジェクトで明示するか検討する。
- 将来packageが増えた場合、workspace構成図を更新する。
- CIを導入する場合は、`mise run check`と`mise run build`を実行する設定を追加する。
