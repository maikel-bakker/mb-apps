// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  // Storybook stories often use `render: () => { ... }` functions that call hooks.
  // Disable hooks rules there to avoid false positives.
  {
    files: ["**/*.stories.{ts,tsx}", "**/*.story.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      // Optional: stories frequently use effects without exhaustive deps on purpose.
      // 'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
