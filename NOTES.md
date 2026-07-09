# Build Journal — Pokédex

## 2026-07-09

- Starting build. Env: node v24.17.0, npm 11.17.0, gh 2.92.0. Empty dir except SPEC.md. ai-memory empty (scratch build repo — skipping bootstrap).
- Plan: scaffold SvelteKit (Svelte 5) → toolchain → API layer → pages → verify live → CI/CD → Pages → Lighthouse.

## 2026-07-09 (cont.)

- SURPRISE: pokedex.svelte.ts Write landed on disk as a 140B placeholder string ("[trimwire: wrote ...]") instead of my actual 4790B content. All other Writes were intact (verified via head/grep). Trimwire test harness quirk — my Read/cat of that file also returned the placeholder. Re-authoring the store from scratch. Ground truth = disk bytes + `npm run check`, not tool read echoes.

## 2026-07-09 (deploy phase)

- Subagent review caught 2 real race conditions (detail loadAll, store resolveTypes) + audio overlap + FilterBar a11y — all fixed with sequence guards / aria-pressed.
- oxlint --fix introduced bugs: renamed catch(e)->catch(error) shadowing error state (3 files); converted mutated $state let->const. Reverted; disabled prefer-const & catch-error-name rules.
- SPEC said remote repo "already created" but it 404'd — had to `gh repo create`.
- CI run #1 failed: node 20 vs ultracite dep commander@15 needing node>=22.12 (+ engine-strict). Bumped setup-node to 22.
- adapter-static fallback switched 404.html->index.html + postbuild cp to 404.html + static/.nojekyll for Pages SPA routing.

## 2026-07-09 — DONE

- Live: https://azagatti.github.io/pokedex-tw-opuslo-on-1/ (HTTP 200, real data loads).
- CI green (build+test+deploy). 5 commits + fixes.
- Lighthouse (desktop): Accessibility 100, Best Practices 100, SEO 100, Agentic 100, 0 failed audits. Perf trace: LCP 780ms, CLS 0.00, TTFB 2ms.
- a11y iterations: type badges needed darkened bg (text-shadow alone doesn't count in contrast algo); footer slate-400→500; card headings h3→h2 for sequential order.
- Toolchain gotchas: oxfmt can't format .svelte (excluded) → removed from lefthook glob. oxlint autofix wrongly const-ified mutated $state and renamed catch e→error (shadowed state) — both caught by svelte-check/review. CI needed Node 22 (ultracite dep engine).

## 2026-07-09 — DONE

- All 8 tasks complete. CI green, live at https://azagatti.github.io/pokedex-tw-opuslo-on-1/ (HTTP 200).
- Lighthouse: A11y 100, Best Practices 100, SEO 100, Agentic 100; LCP 780ms, CLS 0.00.
- Post-launch subagent review caught 3 bugs (typeLoading stuck, unhandled type-fetch error, image placeholder fallback) — all fixed, e2e still 5/5, redeployed.
- Deep-link routes return HTTP 404 header but render correctly via SPA 404.html fallback (expected GitHub Pages SPA behavior).
