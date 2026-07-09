import { browser } from "$app/environment";
import { getPokemonIndex, getTypeDetail, idFromUrl } from "$lib/api/client";
import { generationForId, GENERATIONS } from "$lib/utils";

export type SortKey = "dex" | "dex-desc" | "name" | "name-desc";

export interface IndexEntry {
  name: string;
  id: number;
}

const PAGE_SIZE = 30;

class PokedexStore {
  all = $state<IndexEntry[]>([]);
  loading = $state(true);
  error = $state<string | null>(null);

  search = $state("");
  generation = $state<number | null>(null);
  selectedTypes = $state<string[]>([]);
  sort = $state<SortKey>("dex");

  typeMembers = $state<Set<number> | null>(null);
  typeLoading = $state(false);

  private visibleCount = $state(PAGE_SIZE);

  async load() {
    if (!browser || this.all.length > 0) {
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const index = await getPokemonIndex();
      this.all = index.results
        .map((r) => ({
          id: idFromUrl(r.url),
          name: r.name,
        }))
        // Exclude alternate forms (ids >= 10000) — keep the national dex.
        .filter((e) => e.id <= 1025);
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : "Failed to load Pokédex.";
    } finally {
      this.loading = false;
    }
  }

  private typeSeq = 0;

  private async resolveTypes() {
    const seq = ++this.typeSeq;
    if (this.selectedTypes.length === 0) {
      this.typeMembers = null;
      this.typeLoading = false;
      return;
    }
    this.typeLoading = true;
    try {
      const sets = await Promise.all(
        this.selectedTypes.map(async (t) => {
          const detail = await getTypeDetail(t);
          return new Set(detail.pokemon.map((p) => idFromUrl(p.pokemon.url)));
        })
      );
      if (seq !== this.typeSeq) {
        return; // superseded by a newer toggle
      }
      // Intersection: a pokemon must have ALL selected types.
      const [first, ...rest] = sets;
      const members = new Set<number>();
      for (const id of first) {
        if (rest.every((s) => s.has(id))) {
          members.add(id);
        }
      }
      this.typeMembers = members;
    } catch (err) {
      if (seq === this.typeSeq) {
        this.typeMembers = new Set();
        this.error = err instanceof Error ? err.message : "Type filter failed.";
      }
    } finally {
      if (seq === this.typeSeq) {
        this.typeLoading = false;
      }
    }
  }

  toggleType(type: string) {
    this.selectedTypes = this.selectedTypes.includes(type)
      ? this.selectedTypes.filter((t) => t !== type)
      : [...this.selectedTypes, type];
    this.resetPage();
    void this.resolveTypes();
  }

  setSearch(value: string) {
    this.search = value;
    this.resetPage();
  }

  setGeneration(gen: number | null) {
    this.generation = gen;
    this.resetPage();
  }

  setSort(sort: SortKey) {
    this.sort = sort;
    this.resetPage();
  }

  clearFilters() {
    this.search = "";
    this.generation = null;
    this.selectedTypes = [];
    this.sort = "dex";
    this.typeMembers = null;
    this.resetPage();
  }

  private resetPage() {
    this.visibleCount = PAGE_SIZE;
  }

  loadMore() {
    this.visibleCount += PAGE_SIZE;
  }

  get hasActiveFilters(): boolean {
    return (
      this.search.trim() !== "" ||
      this.generation !== null ||
      this.selectedTypes.length > 0 ||
      this.sort !== "dex"
    );
  }

  get filtered(): IndexEntry[] {
    let list = this.all;
    const q = this.search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (e) => e.name.includes(q) || String(e.id) === q || e.id === Number(q)
      );
    }

    if (this.generation !== null) {
      const gen = GENERATIONS.find((g) => g.id === this.generation);
      if (gen) {
        list = list.filter((e) => e.id >= gen.range[0] && e.id <= gen.range[1]);
      }
    }

    if (this.typeMembers) {
      const members = this.typeMembers;
      list = list.filter((e) => members.has(e.id));
    }

    const sorted = [...list];
    switch (this.sort) {
      case "dex": {
        sorted.sort((a, b) => a.id - b.id);
        break;
      }
      case "dex-desc": {
        sorted.sort((a, b) => b.id - a.id);
        break;
      }
      case "name": {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      }
      case "name-desc": {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      }
      default: {
        break;
      }
    }
    return sorted;
  }

  get visible(): IndexEntry[] {
    return this.filtered.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filtered.length;
  }

  get totalCount(): number {
    return this.filtered.length;
  }

  genForId = generationForId;
}

export const pokedex = new PokedexStore();
