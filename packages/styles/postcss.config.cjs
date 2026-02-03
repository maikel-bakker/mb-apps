module.exports = {
  plugins: [
    /**
     * IMPORTANT:
     * `postcss-import` only inlines imports that are at the top-level of the file.
     * Your `src/index.css` nests `@import` inside `@layer`, so it will not inline them.
     *
     * Fix: tell `postcss-import` to process "layered imports" too.
     * This will inline `@import` statements that appear inside `@layer` blocks.
     */
    require("postcss-import")({
      // postcss-import supports this option to inline `@import` nested in `@layer`.
      // (If you ever remove nested imports, this can be removed.)
      // See: postcss-import layered imports support
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      layer: true,
    }),

    // Adds vendor prefixes based on browserslist targets (if present in repo/package).
    require("autoprefixer"),

    // Minify only for production builds (e.g. when NODE_ENV=production).
    ...(process.env.NODE_ENV === "production"
      ? [
          require("cssnano")({
            preset: "default",
          }),
        ]
      : []),
  ],
};
