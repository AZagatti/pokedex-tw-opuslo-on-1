<script lang="ts">
	import { base } from '$app/paths';
	import type { EvolutionChain as EvoChain } from '$lib/api/schemas';
	import { artworkUrl, idFromUrl } from '$lib/api/client';
	import { flattenEvolution, formatName, dexNumber } from '$lib/utils';
	import { ChevronRight } from 'lucide-svelte';
	import PokemonImage from './PokemonImage.svelte';

	interface Props {
		chain: EvoChain;
		currentName: string;
	}

	const { chain, currentName }: Props = $props();
	// Render the primary evolution path (first branch).
	const stages = $derived(flattenEvolution(chain.chain, idFromUrl)[0] ?? []);
</script>

{#if stages.length > 1}
	<div class="flex flex-wrap items-center justify-center gap-2">
		{#each stages as stage, i (stage.name)}
			{#if i > 0}
				<div
					class="flex flex-col items-center text-slate-400"
					aria-hidden="true"
				>
					<ChevronRight size={20} />
					<span class="text-[0.6rem] leading-tight">
						{#if stage.minLevel}Lv. {stage.minLevel}{:else if stage.item}{formatName(
								stage.item
							)}{:else if stage.trigger}{formatName(stage.trigger)}{/if}
					</span>
				</div>
			{/if}
			<a
				href="{base}/pokemon/{stage.name}/"
				class="group flex flex-col items-center rounded-xl p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 {stage.name ===
				currentName
					? 'ring-2 ring-brand-400'
					: ''}"
			>
				<div class="h-20 w-20">
					<PokemonImage src={artworkUrl(stage.id)} alt={stage.name} />
				</div>
				<span class="text-xs font-medium">{formatName(stage.name)}</span>
				<span class="text-[0.65rem] text-slate-400">{dexNumber(stage.id)}</span>
			</a>
		{/each}
	</div>
{:else}
	<p class="text-center text-sm text-slate-400">
		This Pokémon does not evolve.
	</p>
{/if}
