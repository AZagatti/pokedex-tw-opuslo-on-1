<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { getBerryList, getBerry, idFromUrl } from '$lib/api/client';
	import type { Berry } from '$lib/api/schemas';
	import { formatName } from '$lib/utils';
	import Spinner from '$lib/components/Spinner.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';

	let berries = $state<Berry[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let search = $state('');

	const firmnessColor: Record<string, string> = {
		hard: '#fcd34d',
		soft: '#86efac',
		'super-hard': '#f87171',
		'very-hard': '#fb923c',
		'very-soft': '#a7f3d0'
	};

	async function load() {
		loading = true;
		error = null;
		try {
			const list = await getBerryList(64, 0);
			const details = await Promise.all(
				list.results.map((r) => getBerry(idFromUrl(r.url)))
			);
			berries = details.toSorted((a, b) => a.id - b.id);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load berries.';
		} finally {
			loading = false;
		}
	}

	onMount(load);

	const filtered = $derived(
		search.trim()
			? berries.filter((b) => b.name.includes(search.trim().toLowerCase()))
			: berries
	);
</script>

<svelte:head>
	<title>Berries · Pokédex</title>
</svelte:head>

<section>
	<div class="mb-6">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Berries</h1>
		<p class="mt-1 text-sm text-slate-500">
			Grow times, flavors, and firmness for every berry.
		</p>
	</div>

	<div class="mb-6">
		<input
			type="search"
			bind:value={search}
			placeholder="Search berries…"
			aria-label="Search berries"
			class="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40 dark:border-slate-700 dark:bg-slate-900"
		/>
	</div>

	{#if error}
		<ErrorState message={error} onRetry={load} />
	{:else if loading}
		<div class="flex justify-center py-20"><Spinner /></div>
	{:else if filtered.length === 0}
		<EmptyState title="No berries found" message="Try a different search." />
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as berry (berry.id)}
				<a
					href="{base}/berries/{berry.name}/"
					class="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
				>
					<div
						class="grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-bold shadow-inner"
						style="background-color: {firmnessColor[berry.firmness.name] ?? '#e2e8f0'}; color: #1e293b;"
					>
						{berry.name.charAt(0).toUpperCase()}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-baseline justify-between gap-2">
							<h3 class="truncate font-semibold group-hover:text-brand-500">
								{formatName(berry.name)}
							</h3>
							<span class="text-xs text-slate-400">#{berry.id}</span>
						</div>
						<p class="mt-0.5 text-xs text-slate-500">
							{formatName(berry.firmness.name)} · grows in {berry.growth_time}h · size {berry.size}mm
						</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
