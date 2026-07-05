---
name: research-writer
description: Use when an opencode run prompt asks for technology, library, framework, tool, API, release, comparison, PoC, or cheatsheet research. Writes or updates Markdown under research/ without asking for the destination.
---

# Research Writer

Use this skill when the user asks for a technology investigation, even if the request is vague, such as "VueUseで使える便利ツールを教えて" or "Honoを採用するべきか調べて".

## Goal

Create a useful Markdown research page that can be browsed in the Astro Starlight site. Do not only answer in chat. Write or update a file under `research/`.

## Destination Selection

Choose the destination without asking the user.

- `research/library-catalogs/`: library, package, API, plugin, utility, composable, SDK, or tool feature catalog.
- `research/framework-surveys/`: framework, runtime, platform, architecture, design method, or adoption decision.
- `research/comparisons/`: comparison between two or more technologies, tools, libraries, or approaches.
- `research/poc-plans/`: PoC, spike, experiment plan, validation plan, or trial roadmap.
- `research/release-notes/`: release notes, migration guide, breaking changes, new version summary.
- `research/cheatsheets/`: concise command/API/reference sheet intended for quick implementation lookup.

Use lowercase kebab-case file names. Examples:

- `research/library-catalogs/vueuse.md`
- `research/framework-surveys/astro.md`
- `research/comparisons/astro-vs-vitepress.md`
- `research/poc-plans/hono-api.md`
- `research/release-notes/vue-3-5.md`
- `research/cheatsheets/vueuse.md`

## Existing Files

Before writing, check whether a likely target file already exists.

- If it exists, read it and update it instead of overwriting blindly.
- Preserve useful existing notes and references.
- If the new request supersedes old content, restructure the page and keep old useful details under appropriate sections.
- If several related pages exist, link them from `## 関連ページ`.

## Research Standards

- Prefer official documentation first.
- Also use GitHub repository docs, npm/package registry pages, release notes, changelogs, and official examples when useful.
- Keep reference URLs in the Markdown, not only in the final chat response.
- Mark uncertain information as uncertain.
- Avoid hype. Explain practical usage, tradeoffs, maintenance cost, and adoption risk.
- Keep code examples minimal and focused.
- Include Japanese explanations unless the user asks otherwise.

## Format Selection

Choose the format that best fits the request.

### Library Catalog

Use for packages like VueUse, TanStack Query, Lodash, Zod, or date-fns.

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

Each feature detail should include:

- 何ができるか
- 使いどころ
- 最小コード例
- 注意点
- 参照URL

### Adoption Survey

Use for adopting a framework, runtime, architecture, or large tool.

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

### Comparison

Use for "A vs B", "compare", "比較", or selecting among options.

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

### PoC Plan

Use for validation plans, trials, spikes, or "小さく試す".

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

### Release Notes

Use for versions, migration, breaking changes, or changelogs.

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

### Cheatsheet

Use for compact reference pages.

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

## Final Response

After editing, keep the final response short. Include:

- saved file path
- whether a new file was created or an existing file was updated
- next command: `mise run dev`
