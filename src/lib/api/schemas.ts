import { z } from "zod";

const namedResource = z.object({
  name: z.string(),
  url: z.string(),
});
export type NamedResource = z.infer<typeof namedResource>;

export const paginatedSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(namedResource),
});
export type Paginated = z.infer<typeof paginatedSchema>;

export const pokemonSchema = z.object({
  abilities: z.array(
    z.object({
      ability: namedResource,
      is_hidden: z.boolean(),
      slot: z.number(),
    })
  ),
  base_experience: z.number().nullable().default(0),
  cries: z
    .object({
      latest: z.string().nullable().optional(),
      legacy: z.string().nullable().optional(),
    })
    .optional(),
  height: z.number(),
  id: z.number(),
  moves: z.array(
    z.object({
      move: namedResource,
    })
  ),
  name: z.string(),
  species: namedResource,
  sprites: z.object({
    front_default: z.string().nullable(),
    back_default: z.string().nullable(),
    front_shiny: z.string().nullable(),
    other: z
      .object({
        "official-artwork": z
          .object({
            front_default: z.string().nullable(),
            front_shiny: z.string().nullable(),
          })
          .optional(),
        home: z
          .object({
            front_default: z.string().nullable(),
          })
          .optional(),
        dream_world: z
          .object({
            front_default: z.string().nullable(),
          })
          .optional(),
      })
      .optional(),
  }),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      effort: z.number(),
      stat: namedResource,
    })
  ),
  types: z.array(
    z.object({
      slot: z.number(),
      type: namedResource,
    })
  ),
  weight: z.number(),
});
export type Pokemon = z.infer<typeof pokemonSchema>;

export const pokemonSpeciesSchema = z.object({
  color: namedResource,
  evolution_chain: z.object({ url: z.string() }),
  flavor_text_entries: z.array(
    z.object({
      flavor_text: z.string(),
      language: namedResource,
      version: namedResource,
    })
  ),
  genera: z.array(
    z.object({
      genus: z.string(),
      language: namedResource,
    })
  ),
  generation: namedResource,
  id: z.number(),
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
  name: z.string(),
});
export type PokemonSpecies = z.infer<typeof pokemonSpeciesSchema>;

interface EvoLink {
  species: NamedResource;
  evolves_to: EvoLink[];
  evolution_details: {
    min_level: number | null;
    trigger: NamedResource | null;
    item: NamedResource | null;
  }[];
}

const evoLinkSchema: z.ZodType<EvoLink> = z.lazy(() =>
  z.object({
    evolution_details: z.array(
      z.object({
        min_level: z.number().nullable(),
        trigger: namedResource.nullable().default(null),
        item: namedResource.nullable().default(null),
      })
    ),
    evolves_to: z.array(evoLinkSchema),
    species: namedResource,
  })
);

export const evolutionChainSchema = z.object({
  chain: evoLinkSchema,
  id: z.number(),
});
export type EvolutionChain = z.infer<typeof evolutionChainSchema>;
export type { EvoLink };

export const generationSchema = z.object({
  id: z.number(),
  main_region: namedResource,
  name: z.string(),
  pokemon_species: z.array(namedResource),
});
export type Generation = z.infer<typeof generationSchema>;

export const typeListSchema = z.object({
  results: z.array(namedResource),
});

export const typeDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: namedResource,
      slot: z.number(),
    })
  ),
});
export type TypeDetail = z.infer<typeof typeDetailSchema>;

export const berrySchema = z.object({
  firmness: namedResource,
  flavors: z.array(
    z.object({
      potency: z.number(),
      flavor: namedResource,
    })
  ),
  growth_time: z.number(),
  id: z.number(),
  item: namedResource,
  max_harvest: z.number(),
  name: z.string(),
  natural_gift_power: z.number(),
  natural_gift_type: namedResource,
  size: z.number(),
  smoothness: z.number(),
  soil_dryness: z.number(),
});
export type Berry = z.infer<typeof berrySchema>;
