<script lang="ts">
	import { onMount } from 'svelte';
	import { pokedex } from '$lib/stores/pokedex.svelte';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import CardSkeleton from '$lib/components/CardSkeleton.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let sentinel = $state<HTMLDivElement | null>(null);

	onMount(() => {
		pokedex.load();
	});

	$effect(() => {
		const el = sentinel;
		if (!el) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && pokedex.hasMore) {
					pokedex.loadMore();
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<section>
	<div class="mb-6">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Pokédex</h1>
		<p class="mt-1 text-sm text-slate-500">
			Browse all 1,025 Pokémon across nine generations.
		</p>
	</div>

	<FilterBar />

	{#if pokedex.error}
		<ErrorState message={pokedex.error} onRetry={() => pokedex.load()} />
	{:else if pokedex.loading}
		<div
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		>
			{#each Array(15) as _, i (i)}
				<CardSkeleton />
			{/each}
		</div>
	{:else if pokedex.visible.length === 0}
		<EmptyState
			title="No Pokémon found"
			message="Try adjusting your search or filters."
		/>
	{:else}
		<div
			class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		>
			{#each pokedex.visible as entry (entry.id)}
				<PokemonCard id={entry.id} name={entry.name} />
			{/each}
		</div>

		{#if pokedex.hasMore}
			<div
				bind:this={sentinel}
				class="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			>
				{#each Array(5) as _, i (i)}
					<CardSkeleton />
				{/each}
			</div>
		{/if}
	{/if}
</section>
