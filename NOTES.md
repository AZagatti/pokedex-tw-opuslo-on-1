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
