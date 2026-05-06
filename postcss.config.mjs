import path from "node:path";

const projectRoot = process.cwd();
const globalCssFallback = path.join(projectRoot, "app", "globals.css");
const postcssFromFallbackPlugin = path.join(
  projectRoot,
  "scripts",
  "postcss-from-fallback.cjs",
);

const config = {
  plugins: [
    [
      postcssFromFallbackPlugin,
      {
        from: globalCssFallback,
      },
    ],
    [
      "@tailwindcss/postcss",
      {
        base: projectRoot,
      },
    ],
  ],
};

export default config;
