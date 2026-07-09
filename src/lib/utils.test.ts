import { describe, expect, it } from "vitest";

import {
  dexNumber,
  formatName,
  generationForId,
  statLabel,
  typeColor,
  flattenEvolution,
} from "./utils";

describe("formatName", () => {
  it("title-cases hyphenated slugs", () => {
    expect(formatName("mr-mime")).toBe("Mr Mime");
    expect(formatName("pikachu")).toBe("Pikachu");
  });
});

describe("dexNumber", () => {
  it("zero-pads to four digits", () => {
    expect(dexNumber(25)).toBe("#0025");
    expect(dexNumber(1025)).toBe("#1025");
  });
});

describe("typeColor", () => {
  it("returns a color for known types and falls back for unknown", () => {
    expect(typeColor("fire")).toMatch(/^#/u);
    expect(typeColor("nonsense")).toBe("#9fa19f");
  });
});

describe("statLabel", () => {
  it("maps api stat names to short labels", () => {
    expect(statLabel("special-attack")).toBe("Sp. Atk");
    expect(statLabel("hp")).toBe("HP");
  });
});

describe("generationForId", () => {
  it("finds the generation for a dex id", () => {
    expect(generationForId(1)?.region).toBe("Kanto");
    expect(generationForId(1025)?.region).toBe("Paldea");
    expect(generationForId(99_999)).toBeUndefined();
  });
});

describe("flattenEvolution", () => {
  it("flattens a linear chain into one path", () => {
    const chain = {
      evolution_details: [],
      evolves_to: [
        {
          species: { name: "ivysaur", url: "x/2/" },
          evolution_details: [{ min_level: 16, trigger: null, item: null }],
          evolves_to: [],
        },
      ],
      species: { name: "bulbasaur", url: "x/1/" },
    };
    const paths = flattenEvolution(chain, (u) =>
      Number(u.replace(/\/$/u, "").split("/").at(-1))
    );
    expect(paths).toHaveLength(1);
    expect(paths[0].map((s) => s.name)).toEqual(["bulbasaur", "ivysaur"]);
    expect(paths[0][1].minLevel).toBe(16);
  });
});
