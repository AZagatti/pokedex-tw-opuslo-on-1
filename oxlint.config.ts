import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

// SvelteKit conventions clash with a few of ultracite's stylistic defaults
// (PascalCase component files, `+page`/`+layout` names, top-level `export const
// ssr`, function declarations in `<script>`). We keep every correctness rule and
// relax only the purely stylistic ones so the lint signal stays meaningful.
export default defineConfig({
  extends: [core],
  ignorePatterns: [...core.ignorePatterns, ".svelte-kit/**", "build/**"],
  rules: {
    "unicorn/filename-case": "off",
    "sort-keys": "off",
    "func-style": "off",
    "no-inline-comments": "off",
    "promise/prefer-await-to-then": "off",
    "no-nested-ternary": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/no-array-sort": "off",
    "no-plusplus": "off",
    "unicorn/catch-error-name": "off",
    "prefer-const": "off",
  },
});
