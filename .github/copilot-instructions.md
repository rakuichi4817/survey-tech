# Copilotレビュー指示

このリポジトリは、`opencode run`で作成した技術調査Markdownを`research/`配下に蓄積し、Astro Starlightで静的サイトとして閲覧するためのプロジェクトです。

## レビューで重視すること

- `research/`配下のMarkdownが、適切なカテゴリに配置されているか確認してください。
- `site/src/content/docs/`は生成物です。直接編集されている場合は指摘してください。
- `site/dist/`、`site/.astro/`、`node_modules/`などの生成物がコミット対象に含まれていないか確認してください。
- 調査Markdownには、原則として`## 参照情報`があり、公式ドキュメント、GitHub、npm、リリースノートなどのURLが残っているか確認してください。
- 不確かな情報を断定していないか確認してください。
- 既存ファイル更新時に、既存の有用な内容や参照URLを不用意に消していないか確認してください。
- Markdown同士の関連リンクは、`research/`配下の原本Markdownへの相対リンクになっているか確認してください。
- 新しいカテゴリを追加した場合は、`research/`、`scripts/sync-research-to-site.ts`、`site/astro.config.mjs`、READMEが一貫して更新されているか確認してください。

## プロジェクトのルール

- 調査Markdownの原本は`research/`配下です。
- Starlight用の`site/src/content/docs/`は`scripts/sync-research-to-site.ts`で生成されます。
- コマンド実行は基本的に`mise run ...`を使います。
- Node.jsとpnpmは`.mise.toml`で管理します。
- formatter/linterはBiomeです。

## 期待する検査

PRでは次のコマンドが通ることを重視してください。

```bash
mise run format-check
mise run check
mise run build
```

## Markdownカテゴリ

- `research/library-catalogs/`: ライブラリ、ツール、API群の便利機能カタログ。
- `research/framework-surveys/`: フレームワーク、技術要素、設計手法の採用判断調査。
- `research/comparisons/`: 複数技術や選択肢の比較。
- `research/poc-plans/`: 小さく試すためのPoC計画。
- `research/release-notes/`: リリース、変更点、移行情報のまとめ。
- `research/cheatsheets/`: 実装時に参照する短い早見表。

## GitHub Pages

- GitHub Pagesの公開元はGitHub Actionsです。
- Astroの出力先は`site/dist/`です。
- `site/astro.config.mjs`にはGitHub Pages用の`site`と`base`があります。
- Pages公開URLは`https://rakuichi4817.github.io/survey-tech/`です。
