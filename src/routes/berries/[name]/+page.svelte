<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { ArrowLeft } from 'lucide-svelte';
	import { getBerry } from '$lib/api/client';
	import type { Berry } from '$lib/api/schemas';
	import { formatName, typeColor } from '$lib/utils';
	import Spinner from '$lib/components/Spinner.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';

	let berry = $state<Berry | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const name = $derived(page.params.name);

	const flavorColor: Record<string, string> = {
		bitter: '#22c55e',
		dry: '#3b82f6',
		sour: '#eab308',
		spicy: '#ef4444',
		sweet: '#ec4899'
	};

	async function load() {
		loading = true;
		error = null;
		try {
			berry = await getBerry(name ?? "");
		} catch (err) {
			error = err instanceof Error ? err.message : 'Berry not found.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (name) {
			load();
		}
	});

	const facts = $derived(
		berry
			? [
					{ label: 'Growth time', value: `${berry.growth_time} h/stage` },
					{ label: 'Max harvest', value: `${berry.max_harvest} berries` },
					{ label: 'Size', value: `${berry.size} mm` },
					{ label: 'Smoothness', value: `${berry.smoothness}` },
					{ label: 'Soil dryness', value: `${berry.soil_dryness}` },
					{ label: 'Natural gift', value: `${berry.natural_gift_power} pw` }
				]
			: []
	);
</script>

<svelte:head>
	<title>{berry ? formatName(berry.name) : 'Berry'} · Pokédex</title>
</svelte:head>

<a
	href="{base}/berries/"
	class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-500"
>
	<ArrowLeft size={16} /> Back to berries
</a>

{#if error}
	<ErrorState message={error} onRetry={load} />
{:else if loading || !berry}
	<div class="flex justify-center py-20"><Spinner /></div>
{:else}
	<article class="mx-auto max-w-2xl">
		<header class="mb-8 flex items-center gap-5">
			<div
				class="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-lime-300 to-emerald-400 text-3xl font-bold text-emerald-900 shadow-lg"
			>
				{berry.name.charAt(0).toUpperCase()}
			</div>
			<div>
				<p class="text-sm text-slate-400">#{berry.id}</p>
				<h1 class="text-3xl font-bold tracking-tight">
					{formatName(berry.name)} Berry
				</h1>
				<p class="mt-1 text-sm text-slate-500">
					{formatName(berry.firmness.name)} firmness ·
					<span style="color: {typeColor(berry.natural_gift_type.name)}"
						>{formatName(berry.natural_gift_type.name)}</span
					> gift type
				</p>
			</div>
		</header>

		<section class="mb-8">
			<h2 class="mb-3 text-lg font-semibold">Flavor profile</h2>
			<div class="space-y-2.5">
				{#each berry.flavors.filter((f) => f.potency > 0) as f (f.flavor.name)}
					<div class="flex items-center gap-3">
						<span class="w-16 text-sm font-medium">{formatName(f.flavor.name)}</span>
						<div class="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
							<div
								class="h-full rounded-full transition-all"
								style="width: {Math.min(100, (f.potency / 40) * 100)}%; background-color: {flavorColor[f.flavor.name] ?? '#94a3b8'};"
							></div>
						</div>
						<span class="w-8 text-right text-sm tabular-nums text-slate-500">{f.potency}</span>
					</div>
				{:else}
					<p class="text-sm text-slate-400">This berry has no notable flavors.</p>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="mb-3 text-lg font-semibold">Details</h2>
			<dl class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#each facts as fact (fact.label)}
					<div
						class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
					>
						<dt class="text-xs text-slate-400">{fact.label}</dt>
						<dd class="mt-0.5 font-semibold">{fact.value}</dd>
					</div>
				{/each}
			</dl>
		</section>
	</article>
{/if}
