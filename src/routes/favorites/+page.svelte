<script lang="ts">
	import { base } from '$app/paths';
	import { Heart, Trash2 } from 'lucide-svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	const ids = $derived([...favorites.ids].sort((a, b) => a - b));
</script>

<svelte:head>
	<title>Favorites · Pokédex</title>
</svelte:head>

<section>
	<div class="mb-6 flex items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Favorites</h1>
			<p class="mt-1 text-sm text-slate-500">
				{favorites.count} Pokémon saved locally.
			</p>
		</div>
		{#if favorites.count > 0}
			<button
				type="button"
				onclick={() => favorites.clear()}
				class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-300 hover:text-red-500 dark:border-slate-700 dark:text-slate-300"
			>
				<Trash2 size={16} /> Clear all
			</button>
		{/if}
	</div>

	{#if ids.length === 0}
		<EmptyState
			title="No favorites yet"
			message="Tap the heart on any Pokémon to save it here."
		/>
		<div class="mt-4 text-center">
			<a
				href="{base}/"
				class="inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
			>
				<Heart size={16} class="mr-1.5" /> Browse Pokédex
			</a>
		</div>
	{:else}
		<div
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		>
			{#each ids as id (id)}
				<PokemonCard {id} name={String(id)} />
			{/each}
		</div>
	{/if}
</section>
