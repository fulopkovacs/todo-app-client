import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import { transformerMetaHighlight } from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    mdx({
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: {
              light: "material-theme-lighter",
              dark: "material-theme-darker",
            },
            defaultColor: false,
            transformers: [
              transformerMetaHighlight(),
              {
                name: "add-language-data-attribute",
                pre(node: { properties: Record<string, string> }) {
                  const lang = (
                    this as unknown as { options: { lang?: string } }
                  ).options.lang;
                  if (lang) {
                    node.properties["data-language"] = lang;
                  }
                },
              },
            ],
          },
        ],
      ],
    }),
  ],
});

export default config;
