import { browser } from "$app/environment";

const KEY = "pokedex:favorites";

function load(): number[] {
  if (!browser) {
    return [];
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n) => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

class FavoritesStore {
  ids = $state<number[]>(load());

  has(id: number): boolean {
    return this.ids.includes(id);
  }

  /** Re-hydrate from localStorage on mount (SPA safety). */
  init(): void {
    this.ids = load();
  }

  toggle(id: number): void {
    this.ids = this.has(id)
      ? this.ids.filter((x) => x !== id)
      : [...this.ids, id];
    this.persist();
  }

  clear(): void {
    this.ids = [];
    this.persist();
  }

  get count(): number {
    return this.ids.length;
  }

  private persist(): void {
    if (browser) {
      localStorage.setItem(KEY, JSON.stringify(this.ids));
    }
  }
}

export const favorites = new FavoritesStore();
