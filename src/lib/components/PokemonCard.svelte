<script lang="ts">
	import { untrack } from 'svelte';
	import { base } from '$app/paths';
	import { getPokemon, artworkUrl, spriteUrl } from '$lib/api/client';
	import type { Pokemon } from '$lib/api/schemas';
	import { dexNumber, formatName, typeColor } from '$lib/utils';
	import FavoriteButton from './FavoriteButton.svelte';
	import PokemonImage from './PokemonImage.svelte';
	import TypeBadge from './TypeBadge.svelte';

	interface Props {
		id: number;
		name: string;
		/** Optional preloaded detail (e.g. from a type filter). */
		detail?: Pokemon;
		eager?: boolean;
	}

	const { id, name, detail, eager = false }: Props = $props();

	let data = $state<Pokemon | undefined>(untrack(() => detail));
	let failed = $state(false);

	$effect(() => {
		if (data || failed) {
			return;
		}
		let cancelled = false;
		getPokemon(id)
			.then((p) => {
				if (!cancelled) {
					data = p;
				}
			})
			.catch(() => {
				if (!cancelled) {
					failed = true;
				}
			});
		return () => {
			cancelled = true;
		};
	});

	const displayName = $derived(data?.name ?? name);
	const types = $derived(data?.types.map((t) => t.type.name) ?? []);
	const gradient = $derived(
		types.length
			? `linear-gradient(140deg, ${typeColor(types[0])}22, ${typeColor(types.at(-1) ?? types[0])}0d)`
			: 'transparent'
	);
</script>

<a
	href="{base}/pokemon/{displayName}/"
	class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/50"
	style="background-image: {gradient};"
	data-testid="pokemon-card"
>
	<div class="absolute right-3 top-3 z-10">
		<FavoriteButton {id} name={displayName} />
	</div>

	<span
		class="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500"
	>
		{dexNumber(id)}
	</span>

	<div
		class="relative mx-auto aspect-square w-full max-w-[9rem] transition-transform duration-300 group-hover:scale-110"
	>
		<PokemonImage
			src={artworkUrl(id)}
			fallback={spriteUrl(id)}
			alt={formatName(displayName)}
			{eager}
			class="h-full w-full"
		/>
	</div>

	<h2
		class="mt-1 text-center text-base font-bold text-slate-800 dark:text-slate-100"
	>
		{formatName(displayName)}
	</h2>

	<div class="mt-2 flex min-h-[1.75rem] flex-wrap justify-center gap-1.5">
		{#if data}
			{#each types as t (t)}
				<TypeBadge type={t} size="sm" />
			{/each}
		{:else if failed}
			<span class="text-xs text-slate-400">—</span>
		{:else}
			<span class="skeleton h-5 w-14"></span>
			<span class="skeleton h-5 w-14"></span>
		{/if}
	</div>
</a>
