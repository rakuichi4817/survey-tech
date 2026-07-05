---
name: research-organizer
description: research/配下のMarkdown調査ファイルを整理、再構成、分類、重複整理、リンク修正、保守するときに使用します。
---

# Research Organizer

ユーザーが調査ファイルの整理、カテゴリ修正、リンク再構築、ナビゲーション改善、重複ページ統合、Markdownの閲覧性改善を依頼したときに使用します。

## 目的

`research/`を、増え続けても使いやすい知識ベースとして保ちます。有用な調査内容を残しながら、構造、リンク、タイトル、frontmatter、カテゴリ配置を改善します。

## 対象範囲

基本的には`research/`配下を対象にします。サイト同期やナビゲーション設定の更新が必要な場合だけ、関連する設定ファイルも更新します。

対象カテゴリ:

- `research/library-catalogs/`
- `research/framework-surveys/`
- `research/comparisons/`
- `research/poc-plans/`
- `research/release-notes/`
- `research/cheatsheets/`

## 整理ルール

- 明らかにカテゴリが違うファイルは、適切なカテゴリへ移動する。
- ファイル名は英小文字のkebab-caseにする。
- frontmatterの`title`と`description`を追加または正規化する。
- Astro Starlightで読みやすい見出し階層に整える。
- 関連ページがある場合は`## 関連ページ`を追加する。
- `## 参照情報`を残し、参照URLを保持する。
- 不明点や追跡事項がある場合は`## 追加調査TODO`を残す。
- ページを短くするためだけに有用な内容を削除しない。
- 2つのページが重複している場合は、より適切なページへ統合し、必要に応じて関連リンクを残す。
- 大きな統合や破壊的な再構成の判断が曖昧な場合は、実行前にユーザーへ確認する。

## リンクルール

調査ファイル間のリンクは、相対Markdownリンクを使います。

例:

- `research/library-catalogs/vueuse.md`から`research/comparisons/vueuse-vs-custom-composables.md`: `../comparisons/vueuse-vs-custom-composables.md`
- `research/framework-surveys/astro.md`から`research/comparisons/astro-vs-vitepress.md`: `../comparisons/astro-vs-vitepress.md`

生成済みの`site/src/content/docs/`ではなく、`research/`配下の原本Markdownへリンクしてください。

GitHub Pagesで公開するURLへの変換は`scripts/sync-research-to-site.ts`が担当します。`research/`配下の原本では、公開URLや`site/src/content/docs/`へのリンクではなく、読み書きしやすい相対Markdownリンクを維持します。

`research/`外のMarkdownへリンクする場合は、公開サイトではGitHub上のファイルURLへ変換されます。サイト内ページとして見せたい内容は、原則として`research/`配下へ置いてください。

## カテゴリ索引

`site/src/content/docs/`配下の生成ファイルは手動編集しません。同期スクリプトが`research/`からStarlightページを生成します。

新しいカテゴリが必要な場合は、次をまとめて更新します。

- `research/<category>/`
- `scripts/sync-research-to-site.ts`
- `site/astro.config.mjs`
- READMEの利用手順

## 最終回答

整理後の最終回答は簡潔にします。次を含めてください。

- 移動または更新したファイル
- 主な統合やリンク変更
- 次の閲覧コマンド: `mise run dev`
