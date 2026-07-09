# Decisions

Why each pinned choice was made.

## SvelteKit 5 + adapter-static (SPA)

GitHub Pages serves static files only. `adapter-static` in SPA mode (`ssr = false`, `fallback` document copied to `404.html`) gives client-side routing for arbitrary deep links without a server. Svelte 5 runes (`$state`/`$derived`/`$effect`) keep reactive state in plain `.svelte.ts` classes — no external state library.

## TypeScript (strict)

Catches shape mismatches against the (large, deeply-nested) PokéAPI at compile time. Paired with Zod, the data contract is enforced both statically and at runtime.

## Zod for every response

PokéAPI shapes are big and occasionally nullable in surprising places. Validating each response means a bad or changed payload throws a clear error at the boundary instead of producing `undefined`-access crashes deep in a component. Inferred types keep the schemas and the TS types in perfect sync (one source of truth).

## In-memory Map cache (no data-fetching library)

The spec calls for a small `cache.ts`, and it's the right tool here: PokéAPI data is immutable per session, so a URL-keyed `Map` + in-flight de-duplication delivers instant revisits and zero duplicate requests — without the bundle cost and conceptual overhead of TanStack Query / SWR.

## Tailwind CSS 4 (`@tailwindcss/vite`)

v4's Vite plugin needs no `tailwind.config.js` or PostCSS setup — theme tokens (brand palette, fonts) live in `@theme` inside `app.css`. Class-based dark mode via a `@custom-variant` lets the theme store toggle `.dark` on `<html>`. Utility classes keep styling colocated and the CSS output tiny.

## Ultracite → oxlint + oxfmt

Rust-based linting/formatting that's ~50–100× faster than ESLint/Prettier. The Ultracite preset is a strong, opinionated baseline; a few rules that conflict with Svelte idioms (`prefer-const` on template-mutated `$state`, `catch-error-name` vs. our `error` state) are disabled in `oxlint.config.ts`.

## lefthook

Fast, parallel git hooks with a single YAML file: **pre-commit** formats + lints staged files, **pre-push** runs `svelte-check`. Keeps `main` green before CI even sees it.

## Vitest + Playwright

Vitest for pure logic (the evolution flattener, formatters, type/stat maps) — fast and jsdom-based. Playwright drives the real built SPA end-to-end (grid loads, search filters, detail navigation, berries, theme toggle) against `npm run preview`, mirroring production.

## GitHub Actions → Pages

One workflow on push to `main`: install → lint → check → unit → e2e → build (with `BASE_PATH`) → deploy via `actions/upload-pages-artifact` + `actions/deploy-pages` with `pages: write` / `id-token: write`. A `.nojekyll` file ensures the `_app/` directory (leading underscore) is served.
