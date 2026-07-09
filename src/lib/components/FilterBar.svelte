<script lang="ts">
	import { Search, X, SlidersHorizontal } from 'lucide-svelte';
	import { pokedex } from '$lib/stores/pokedex.svelte';
import type { SortKey } from '$lib/stores/pokedex.svelte';
	import { GENERATIONS, TYPE_COLORS, debounce, formatName } from '$lib/utils';

	let searchInput = $state(pokedex.search);
	let showFilters = $state(false);

	const commit = debounce((v: string) => pokedex.setSearch(v), 250);

	function onInput(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		searchInput = v;
		commit(v);
	}

	function clearSearch() {
		searchInput = '';
		pokedex.setSearch('');
	}

	const sortOptions: { value: SortKey; label: string }[] = [
		{ label: 'Dex № ↑', value: 'dex' },
		{ label: 'Dex № ↓', value: 'dex-desc' },
		{ label: 'Name A–Z', value: 'name' },
		{ label: 'Name Z–A', value: 'name-desc' },
	];

	const types = Object.keys(TYPE_COLORS);
</script>

<div class="mb-6 space-y-4">
	<div class="flex flex-col gap-3 sm:flex-row">
		<div class="relative flex-1">
			<Search
				class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
			/>
			<input
				type="search"
				placeholder="Search by name or number…"
				value={searchInput}
				oninput={onInput}
				aria-label="Search Pokémon"
				class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900"
			/>
			{#if searchInput}
				<button
					onclick={clearSearch}
					aria-label="Clear search"
					class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
				>
					<X class="size-4" />
				</button>
			{/if}
		</div>

		<div class="flex gap-2">
			<select
				value={pokedex.sort}
				onchange={(e) =>
					pokedex.setSort((e.target as HTMLSelectElement).value as SortKey)}
				aria-label="Sort order"
				class="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900"
			>
				{#each sortOptions as opt (opt.value)}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>

			<button
				onclick={() => (showFilters = !showFilters)}
				aria-expanded={showFilters}
				class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
			>
				<SlidersHorizontal class="size-4" />
				Filters
			</button>
		</div>
	</div>

	{#if showFilters}
		<div
			class="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
		>
			<div>
				<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
					Generation
				</p>
				<div class="flex flex-wrap gap-2">
					<button
						onclick={() => pokedex.setGeneration(null)}
						class="rounded-lg px-3 py-1 text-xs font-medium transition {pokedex.generation ===
						null
							? 'bg-brand-500 text-white'
							: 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}"
					>
						All
					</button>
					{#each GENERATIONS as gen (gen.id)}
						<button
							onclick={() => pokedex.setGeneration(gen.id)}
							class="rounded-lg px-3 py-1 text-xs font-medium transition {pokedex.generation ===
							gen.id
								? 'bg-brand-500 text-white'
								: 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}"
						>
							{gen.name}
							<span class="opacity-60">· {gen.region}</span>
						</button>
					{/each}
				</div>
			</div>

			<div>
				<p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
					Type {pokedex.selectedTypes.length > 0
						? `(${pokedex.selectedTypes.length} selected)`
						: ''}
				</p>
				<div class="flex flex-wrap gap-2">
					{#each types as type (type)}
						{@const active = pokedex.selectedTypes.includes(type)}
						<button
							type="button"
							onclick={() => pokedex.toggleType(type)}
							aria-pressed={active}
							aria-label="Filter by {formatName(type)} type"
							class="rounded-full px-3 py-1 text-xs font-semibold text-white transition {active
								? 'ring-2 ring-slate-900 ring-offset-1 dark:ring-white'
								: 'opacity-70 hover:opacity-100'}"
							style="background-color: {TYPE_COLORS[type]};"
						>
							{formatName(type)}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<div class="flex items-center justify-between text-sm text-slate-500">
		<span>
			{#if pokedex.typeLoading}
				Filtering by type…
			{:else}
				{pokedex.totalCount.toLocaleString()} Pokémon
			{/if}
		</span>
		{#if pokedex.hasActiveFilters}
			<button
				onclick={() => {
					searchInput = '';
					pokedex.clearFilters();
				}}
				class="flex items-center gap-1 font-medium text-brand-500 hover:text-brand-600"
			>
				<X class="size-3.5" /> Clear filters
			</button>
		{/if}
	</div>
</div>
