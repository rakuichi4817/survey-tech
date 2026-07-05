import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const researchDir = path.join(root, "research")
const docsDir = path.join(root, "site", "src", "content", "docs")

const markdownExtension = ".md"
const categories = [
  {
    directory: "library-catalogs",
    title: "Library Catalogs",
    description:
      "ライブラリやツールの便利機能をカタログ形式でまとめた調査ノート",
  },
  {
    directory: "framework-surveys",
    title: "Framework Surveys",
    description: "フレームワークや技術要素の採用判断向け調査ノート",
  },
  {
    directory: "comparisons",
    title: "Comparisons",
    description: "複数の技術や選択肢を比較した調査ノート",
  },
  {
    directory: "poc-plans",
    title: "PoC Plans",
    description: "小さく試すための検証計画やスパイク計画",
  },
  {
    directory: "release-notes",
    title: "Release Notes",
    description: "リリース、変更点、移行情報をまとめた調査ノート",
  },
  {
    directory: "cheatsheets",
    title: "Cheatsheets",
    description: "実装時にすばやく参照するための早見表",
  },
]

async function main() {
  await rm(docsDir, { recursive: true, force: true })
  await mkdir(docsDir, { recursive: true })

  const files = await collectMarkdownFiles(researchDir)

  for (const file of files) {
    const relativePath = path.relative(researchDir, file)
    const targetPath = path.join(docsDir, relativePath)
    const raw = await readFile(file, "utf8")
    const content = ensureFrontmatter(raw, relativePath)

    await mkdir(path.dirname(targetPath), { recursive: true })
    await writeFile(targetPath, content)
  }

  for (const category of categories) {
    const categoryDir = path.join(docsDir, category.directory)
    await mkdir(categoryDir, { recursive: true })
    await writeFile(
      path.join(categoryDir, "index.md"),
      `---
title: ${yamlString(category.title)}
description: ${yamlString(category.description)}
---

# ${category.title}

${category.description}。
`,
    )
  }

  await writeFile(
    path.join(docsDir, "index.md"),
    `---
title: Tech Survey
description: opencode runで作成した技術調査ノート
---

# Tech Survey

opencode runで作成した技術調査ノートを閲覧するためのサイトです。

## Categories

- [Library Catalogs](/library-catalogs/)
- [Framework Surveys](/framework-surveys/)
- [Comparisons](/comparisons/)
- [PoC Plans](/poc-plans/)
- [Release Notes](/release-notes/)
- [Cheatsheets](/cheatsheets/)
`,
  )
}

async function collectMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath)
      }

      if (entry.isFile() && entry.name.endsWith(markdownExtension)) {
        return [fullPath]
      }

      return []
    }),
  )

  return files.flat().sort()
}

function ensureFrontmatter(content: string, relativePath: string) {
  if (content.startsWith("---\n")) {
    return content
  }

  const title = extractTitle(content) ?? titleFromPath(relativePath)
  const description = `${title}の調査メモ`

  return `---
title: ${yamlString(title)}
description: ${yamlString(description)}
---

${content}`
}

function extractTitle(content: string) {
  const heading = content.match(/^#\s+(.+)$/m)
  return heading?.[1]?.trim()
}

function titleFromPath(relativePath: string) {
  const parsed = path.parse(relativePath)
  return parsed.name
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function yamlString(value: string) {
  return JSON.stringify(value)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
