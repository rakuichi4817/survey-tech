import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://rakuichi4817.github.io",
  base: "/survey-tech",
  integrations: [
    starlight({
      title: "Tech Survey",
      sidebar: [
        {
          label: "Library Catalogs",
          items: [{ autogenerate: { directory: "library-catalogs" } }],
        },
        {
          label: "Framework Surveys",
          items: [{ autogenerate: { directory: "framework-surveys" } }],
        },
        {
          label: "Comparisons",
          items: [{ autogenerate: { directory: "comparisons" } }],
        },
        {
          label: "PoC Plans",
          items: [{ autogenerate: { directory: "poc-plans" } }],
        },
        {
          label: "Release Notes",
          items: [{ autogenerate: { directory: "release-notes" } }],
        },
        {
          label: "Cheatsheets",
          items: [{ autogenerate: { directory: "cheatsheets" } }],
        },
      ],
    }),
  ],
})
