/** Pokémon type → tailwind-friendly color tokens for badges/gradients. */
export const TYPE_COLORS: Record<string, string> = {
  bug: "#90c12c",
  dark: "#5a5366",
  dragon: "#0b6dc3",
  electric: "#f4d23c",
  fairy: "#ec8fe6",
  fighting: "#ce4069",
  fire: "#ff6f52",
  flying: "#8fa8dd",
  ghost: "#5269ad",
  grass: "#63bc5a",
  ground: "#d97845",
  ice: "#74cec0",
  normal: "#9fa19f",
  poison: "#ab6ac8",
  psychic: "#f97176",
  rock: "#c7b78b",
  steel: "#5a8ea1",
  water: "#4d90d5",
};

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "#9fa19f";
}

/** Short human labels for stat names returned by the API. */
export const STAT_LABELS: Record<string, string> = {
  attack: "Attack",
  defense: "Defense",
  hp: "HP",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export function statLabel(name: string): string {
  return STAT_LABELS[name] ?? name;
}

/** Title-case a hyphenated PokéAPI slug, e.g. "mr-mime" → "Mr Mime". */
export function formatName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Zero-padded national dex number, e.g. 25 → "#0025". */
export function dexNumber(id: number): string {
  return `#${id.toString().padStart(4, "0")}`;
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const GENERATIONS = [
  { id: 1, name: "Gen I", range: [1, 151], region: "Kanto" },
  { id: 2, name: "Gen II", range: [152, 251], region: "Johto" },
  { id: 3, name: "Gen III", range: [252, 386], region: "Hoenn" },
  { id: 4, name: "Gen IV", range: [387, 493], region: "Sinnoh" },
  { id: 5, name: "Gen V", range: [494, 649], region: "Unova" },
  { id: 6, name: "Gen VI", range: [650, 721], region: "Kalos" },
  { id: 7, name: "Gen VII", range: [722, 809], region: "Alola" },
  { id: 8, name: "Gen VIII", range: [810, 905], region: "Galar" },
  { id: 9, name: "Gen IX", range: [906, 1025], region: "Paldea" },
] as const;

export function generationForId(
  id: number
): (typeof GENERATIONS)[number] | undefined {
  return GENERATIONS.find((g) => id >= g.range[0] && id <= g.range[1]);
}

/** A single stage in a flattened evolution chain. */
export interface EvoStage {
  name: string;
  id: number;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
}

interface RawEvoLink {
  species: { name: string; url: string };
  evolves_to: RawEvoLink[];
  evolution_details: {
    min_level: number | null;
    trigger: { name: string } | null;
    item: { name: string } | null;
  }[];
}

/** Flatten a (possibly branching) evolution chain into ordered stages. */
export function flattenEvolution(
  root: RawEvoLink,
  idFromUrl: (url: string) => number
): EvoStage[][] {
  const paths: EvoStage[][] = [];

  function walk(link: RawEvoLink, trail: EvoStage[]): void {
    const detail = link.evolution_details.at(-1);
    const stage: EvoStage = {
      id: idFromUrl(link.species.url),
      item: detail?.item?.name ?? null,
      minLevel: detail?.min_level ?? null,
      name: link.species.name,
      trigger: detail?.trigger?.name ?? null,
    };
    const nextTrail = [...trail, stage];
    if (link.evolves_to.length === 0) {
      paths.push(nextTrail);
      return;
    }
    for (const child of link.evolves_to) {
      walk(child, nextTrail);
    }
  }

  walk(root, []);
  return paths;
}

/**
 * Darken a hex color by `amount` (0–1) for use as a badge background, so white
 * text meets WCAG AA contrast even on the lighter type colors.
 */
export function darken(hex: string, amount = 0.45): string {
  const m = /^#?(?<r>[\da-f]{2})(?<g>[\da-f]{2})(?<b>[\da-f]{2})$/iu.exec(hex);
  if (!m?.groups) {
    return hex;
  }
  const scale = (c: string) =>
    Math.round(Number.parseInt(c, 16) * (1 - amount))
      .toString(16)
      .padStart(2, "0");
  return `#${scale(m.groups.r)}${scale(m.groups.g)}${scale(m.groups.b)}`;
}
