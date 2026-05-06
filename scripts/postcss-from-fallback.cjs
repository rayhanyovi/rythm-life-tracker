"use strict";

function postcssFromFallback(options = {}) {
  const fallback = options.from || "app/globals.css";

  return {
    postcssPlugin: "rythm-postcss-from-fallback",
    Once(root, { result }) {
      result.opts.from ??= root.source?.input.file ?? fallback;
    },
  };
}

postcssFromFallback.postcss = true;

module.exports = postcssFromFallback;
