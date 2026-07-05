---
name: research-organizer
description: Use when asked to organize, restructure, categorize, deduplicate, relink, or maintain Markdown research files under research/ for the Astro Starlight site.
---

# Research Organizer

Use this skill when the user asks to organize research files, fix categories, rebuild links, improve navigation, merge duplicate pages, or make the Markdown easier to browse.

## Goal

Keep `research/` useful as a growing knowledge base. Improve structure, links, titles, frontmatter, and category placement while preserving useful research content.

## Scope

Work under `research/` unless the site sync or navigation config needs an update.

Relevant categories:

- `research/library-catalogs/`
- `research/framework-surveys/`
- `research/comparisons/`
- `research/poc-plans/`
- `research/release-notes/`
- `research/cheatsheets/`

## Organization Rules

- Move files to the best category when clearly misplaced.
- Use lowercase kebab-case file names.
- Add or normalize frontmatter with `title` and `description`.
- Normalize heading hierarchy for readability in Astro Starlight.
- Add `## 関連ページ` when related pages exist.
- Keep `## 参照情報` and preserve reference URLs.
- Keep `## 追加調査TODO` when there are unknowns or follow-up items.
- Do not delete useful content just to shorten a page.
- If two pages duplicate each other, merge them into the better canonical page and leave related links where appropriate.
- If a large merge or destructive rewrite is ambiguous, ask the user before proceeding.

## Link Rules

Use relative Markdown links when linking between research files.

Examples:

- From `research/library-catalogs/vueuse.md` to `research/comparisons/vueuse-vs-custom-composables.md`: `../comparisons/vueuse-vs-custom-composables.md`
- From `research/framework-surveys/astro.md` to `research/comparisons/astro-vs-vitepress.md`: `../comparisons/astro-vs-vitepress.md`

Prefer links to source Markdown files under `research/`, not generated files under `site/src/content/docs/`.

## Category Indexes

Do not manually edit generated files under `site/src/content/docs/`. The sync script generates Starlight pages from `research/`.

If a new category is needed, update all of these together:

- `research/<category>/`
- `scripts/sync-research-to-site.ts`
- `site/astro.config.mjs`
- README usage documentation

## Final Response

After organizing, keep the final response concise. Include:

- moved/updated files
- notable merges or link changes
- next command: `mise run dev`
