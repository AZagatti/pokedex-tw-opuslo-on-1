import { browser } from "$app/environment";

const KEY = "pokedex:theme";
export type Theme = "light" | "dark";

function initial(): Theme {
  if (!browser) {
    return "light";
  }
  const stored = localStorage.getItem(KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

class ThemeStore {
  current = $state<Theme>(initial());

  toggle(): void {
    this.current = this.current === "dark" ? "light" : "dark";
    this.apply();
  }

  set(theme: Theme): void {
    this.current = theme;
    this.apply();
  }

  /** Apply the persisted/preferred theme to the DOM on mount. */
  init(): void {
    this.current = initial();
    this.apply();
  }

  apply(): void {
    if (!browser) {
      return;
    }
    document.documentElement.classList.toggle("dark", this.current === "dark");
    localStorage.setItem(KEY, this.current);
  }
}

export const theme = new ThemeStore();
