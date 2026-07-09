# Architecture

## Overview

A **static single-page application**. There is no server at runtime — SvelteKit is compiled with `@sveltejs/adapter-static` in SPA mode and the whole app is a bundle of HTML/CSS/JS served by GitHub Pages. All data comes from the public [PokéAPI](https://pokeapi.co/api/v2) directly from the browser.

```
Browser ── fetch ──▶ PokéAPI (api/v2)
   │                     │
   │  ◀── JSON ──────────┘
   ▼
Zod schema validation ──▶ URL-keyed Map cache ──▶ Svelte 5 rune stores ──▶ Components
```

## Rendering model

- `src/routes/+layout.ts` sets `ssr = false` and `prerender = false` — everything renders client-side.
- `adapter-static` emits a `fallback` document (`index.html`); the build step copies it to `404.html` so GitHub Pages serves the SPA for **any** deep link (e.g. `/pokemon/charizard/`), and client-side routing takes over.
- `paths.base` is set to `/pokedex-tw-opuslo-on-1` at build time (from `$BASE_PATH`) so all asset and link URLs are correct under the project-pages sub-path. Every internal link uses `import { base } from '$app/paths'`.

## Data layer (`src/lib/api/`)

| File | Responsibility |
| --- | --- |
| `schemas.ts` | **Zod** schemas + inferred types for every PokéAPI shape used (pokemon, species, evolution, generation, type, berry). Malformed responses fail loudly rather than corrupting the UI. |
| `cache.ts` | A module-level `Map<string, unknown>` keyed by request URL, plus an **in-flight promise map** so concurrent requests for the same URL are de-duplicated into one network call. |
| `client.ts` | Typed fetch helpers (`getPokemon`, `getPokemonIndex`, `getEvolutionChain`, `getBerry`, …). Each wraps `fetchJson(url, schema)` → checks cache → dedupes in-flight → fetches → validates → stores. Also pure URL helpers (`artworkUrl`, `spriteUrl`, `idFromUrl`) that hit the sprite CDN with **zero** API calls. |

Because PokéAPI data is immutable, the cache never needs invalidation for a session — revisiting any resource is instant.

## State (`src/lib/stores/*.svelte.ts`)

Svelte 5 **rune classes** exported as singletons:

- `pokedex.svelte.ts` — loads the full 1,025-entry index once, then runs the **filter pipeline** (search → generation → type-intersection → sort) as `$derived` getters, with client-side pagination feeding the infinite-scroll grid. Type filtering resolves type→member sets from the API with a sequence guard against out-of-order responses.
- `favorites.svelte.ts` — `number[]` of dex ids, persisted to `localStorage`, exposed via `has/toggle/clear`.
- `theme.svelte.ts` — `'light' | 'dark'`, system-aware default, toggles `.dark` on `<html>`, persisted.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Pokédex grid + search/filter/sort + infinite scroll |
| `/pokemon/[name]` | Detail: artwork, stats, abilities, evolution, sprites, cry |
| `/berries` | Berry index |
| `/berries/[name]` | Berry detail: firmness, flavors, growth, size |
| `/favorites` | Saved Pokémon (from `localStorage`) |
| `+error.svelte` | Friendly error boundary |

Dynamic routes (`[name]`) carry `prerender = false`; they are reached through the SPA fallback and render entirely on the client.

## Components (`src/lib/components/`)

Presentational and self-contained: `PokemonCard` (lazily fetches its own types), `PokemonImage` (skeleton + CDN fallback), `TypeBadge`, `StatBar`, `EvolutionChain`, `FilterBar`, `FavoriteButton`, `Header`, and the `CardSkeleton` / `Spinner` / `EmptyState` / `ErrorState` states.
