import type { z } from "zod";

import {
  clearInflight,
  getCached,
  getInflight,
  setCached,
  setInflight,
} from "./cache";
import {
  berrySchema,
  evolutionChainSchema,
  generationSchema,
  paginatedSchema,
  pokemonSchema,
  pokemonSpeciesSchema,
  typeDetailSchema,
  typeListSchema,
} from "./schemas";
import type {
  Berry,
  EvolutionChain,
  Generation,
  Paginated,
  Pokemon,
  PokemonSpecies,
  TypeDetail,
} from "./schemas";

export const API_BASE = "https://pokeapi.co/api/v2";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Fetch JSON from a URL, validate with a zod schema, and cache the result.
 * Concurrent calls for the same URL share a single request.
 */
async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  fetcher: typeof fetch = fetch
): Promise<T> {
  const cached = getCached<T>(url);
  if (cached !== undefined) {
    return cached;
  }

  const existing = getInflight<T>(url);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const res = await fetcher(url);
    if (!res.ok) {
      throw new ApiError(
        `Request failed for ${url}: ${res.status} ${res.statusText}`,
        res.status
      );
    }
    const json = await res.json();
    const parsed = schema.parse(json);
    setCached(url, parsed);
    return parsed;
  })();

  setInflight(url, promise);
  try {
    return await promise;
  } finally {
    clearInflight(url);
  }
}

export function getPokemonList(
  limit = 30,
  offset = 0,
  fetcher: typeof fetch = fetch
): Promise<Paginated> {
  return fetchJson(
    `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`,
    paginatedSchema,
    fetcher
  );
}

/** Fetch the full national dex index (names + urls) in one request. */
export function getPokemonIndex(
  fetcher: typeof fetch = fetch
): Promise<Paginated> {
  return fetchJson(
    `${API_BASE}/pokemon?limit=100000&offset=0`,
    paginatedSchema,
    fetcher
  );
}

export function getPokemon(
  nameOrId: string | number,
  fetcher: typeof fetch = fetch
): Promise<Pokemon> {
  return fetchJson(`${API_BASE}/pokemon/${nameOrId}`, pokemonSchema, fetcher);
}

export function getPokemonSpecies(
  nameOrId: string | number,
  fetcher: typeof fetch = fetch
): Promise<PokemonSpecies> {
  return fetchJson(
    `${API_BASE}/pokemon-species/${nameOrId}`,
    pokemonSpeciesSchema,
    fetcher
  );
}

export function getEvolutionChain(
  url: string,
  fetcher: typeof fetch = fetch
): Promise<EvolutionChain> {
  return fetchJson(url, evolutionChainSchema, fetcher);
}

export function getGeneration(
  nameOrId: string | number,
  fetcher: typeof fetch = fetch
): Promise<Generation> {
  return fetchJson(
    `${API_BASE}/generation/${nameOrId}`,
    generationSchema,
    fetcher
  );
}

export function getTypeList(fetcher: typeof fetch = fetch) {
  return fetchJson(`${API_BASE}/type`, typeListSchema, fetcher);
}

export function getTypeDetail(
  name: string,
  fetcher: typeof fetch = fetch
): Promise<TypeDetail> {
  return fetchJson(`${API_BASE}/type/${name}`, typeDetailSchema, fetcher);
}

export function getBerryList(
  limit = 30,
  offset = 0,
  fetcher: typeof fetch = fetch
): Promise<Paginated> {
  return fetchJson(
    `${API_BASE}/berry?limit=${limit}&offset=${offset}`,
    paginatedSchema,
    fetcher
  );
}

export function getBerry(
  nameOrId: string | number,
  fetcher: typeof fetch = fetch
): Promise<Berry> {
  return fetchJson(`${API_BASE}/berry/${nameOrId}`, berrySchema, fetcher);
}

/** Extract the numeric id from a PokéAPI resource URL. */
export function idFromUrl(url: string): number {
  const parts = url.split("/").filter(Boolean);
  return Number(parts.at(-1));
}

/** Official artwork URL for a given national dex id (CDN, no API call). */
export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
