<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		getPokemon,
		getPokemonSpecies,
		getEvolutionChain,
		artworkUrl,
		spriteUrl,
		idFromUrl,
	} from '$lib/api/client';
	import type {
		Pokemon,
		PokemonSpecies,
		EvolutionChain as EvoChain,
	} from '$lib/api/schemas';
	import {
		formatName,
		dexNumber,
		typeColor,
		generationForId,
	} from '$lib/utils';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import StatBar from '$lib/components/StatBar.svelte';
	import EvolutionChainView from '$lib/components/EvolutionChain.svelte';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { ArrowLeft, Volume2, Ruler, Weight } from 'lucide-svelte';

	const name = $derived(page.params.name ?? '');

	let pokemon = $state<Pokemon | null>(null);
	let species = $state<PokemonSpecies | null>(null);
	let evolution = $state<EvoChain | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showShiny = $state(false);

	let loadSeq = 0;

	async function loadAll(target: string) {
		const seq = ++loadSeq;
		loading = true;
		error = null;
		pokemon = null;
		species = null;
		evolution = null;
		try {
			const p = await getPokemon(target);
			if (seq !== loadSeq) {
				return; // superseded by a newer navigation
			}
			pokemon = p;
			// Species + evolution are secondary — don't block core render on them.
			getPokemonSpecies(p.species.name)
				.then((s) => {
					if (seq !== loadSeq) {
						return;
					}
					species = s;
					return getEvolutionChain(s.evolution_chain.url);
				})
				.then((chain) => {
					if (chain && seq === loadSeq) {
						evolution = chain;
					}
				})
				.catch(() => {
					/* evolution/species optional */
				});
		} catch (err) {
			if (seq === loadSeq) {
				error = err instanceof Error ? err.message : 'Failed to load Pokémon.';
			}
		} finally {
			if (seq === loadSeq) {
				loading = false;
			}
		}
	}

	$effect(() => {
		if (name) {
			loadAll(name);
		}
	});

	const statTotal = $derived(
		pokemon ? pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0) : 0
	);
	const gen = $derived(pokemon ? generationForId(pokemon.id) : undefined);
	const flavor = $derived(
		species?.flavor_text_entries
			.find((e) => e.language.name === 'en')
			?.flavor_text.replaceAll(/[\n\f]/gu, ' ') ?? ''
	);
	const genus = $derived(
		species?.genera.find((g) => g.language.name === 'en')?.genus ?? ''
	);
	const heroArt = $derived(
		pokemon
			? showShiny
				? (pokemon.sprites.other?.['official-artwork']?.front_shiny ??
					artworkUrl(pokemon.id))
				: artworkUrl(pokemon.id)
			: ''
	);
	const cryUrl = $derived(pokemon?.cries?.latest ?? null);

	let audio: HTMLAudioElement | null = null;
	function playCry() {
		if (!cryUrl) {
			return;
		}
		audio ??= new Audio();
		audio.pause();
		audio.src = cryUrl;
		audio.volume = 0.4;
		audio.play().catch(() => {
			/* autoplay may be blocked */
		});
	}

	const primaryColor = $derived(
		pokemon ? typeColor(pokemon.types[0].type.name) : '#9fa19f'
	);
</script>

<svelte:head>
	<title>{formatName(name)} — Pokédex</title>
</svelte:head>

<a
	href="{base}/"
	class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-500"
>
	<ArrowLeft size={16} /> Back to Pokédex
</a>

{#if loading}
	<div class="grid min-h-[50vh] place-items-center">
		<Spinner label="Loading Pokémon…" />
	</div>
{:else if error}
	<ErrorState message={error} onRetry={() => loadAll(name)} />
{:else if pokemon}
	<article class="space-y-8">
		<!-- Hero -->
		<div
			class="relative overflow-hidden rounded-3xl p-6 sm:p-8"
			style="background: linear-gradient(135deg, {primaryColor}33, {primaryColor}11);"
		>
			<div class="flex flex-col gap-6 sm:flex-row sm:items-center">
				<div class="relative mx-auto w-56 max-w-full sm:mx-0">
					<div class="aspect-square drop-shadow-xl">
						<PokemonImage src={heroArt} alt={pokemon.name} eager />
					</div>
				</div>
				<div class="flex-1 text-center sm:text-left">
					<div
						class="flex items-center justify-center gap-3 sm:justify-start"
					>
						<span class="text-sm font-semibold text-slate-500"
							>{dexNumber(pokemon.id)}</span
						>
						{#if gen}
							<span
								class="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
								>{gen.name} · {gen.region}</span
							>
						{/if}
					</div>
					<h1 class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
						{formatName(pokemon.name)}
					</h1>
					{#if genus}
						<p class="text-sm text-slate-500">{genus}</p>
					{/if}
					<div
						class="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start"
					>
						{#each pokemon.types as t (t.type.name)}
							<TypeBadge type={t.type.name} />
						{/each}
					</div>
					<div
						class="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start"
					>
						<FavoriteButton id={pokemon.id} name={pokemon.name} showLabel />
						{#if cryUrl}
							<button
								type="button"
								onclick={playCry}
								class="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
							>
								<Volume2 size={16} /> Play cry
							</button>
						{/if}
						<button
							type="button"
							onclick={() => (showShiny = !showShiny)}
							class="inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
							aria-pressed={showShiny}
						>
							✨ {showShiny ? 'Normal' : 'Shiny'}
						</button>
					</div>
				</div>
			</div>
		</div>

		{#if flavor}
			<p class="mx-auto max-w-2xl text-center text-slate-600 dark:text-slate-300">
				{flavor}
			</p>
		{/if}

		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Stats -->
			<section
				class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
			>
				<h2 class="mb-4 text-lg font-semibold">Base stats</h2>
				<div class="space-y-2.5">
					{#each pokemon.stats as s (s.stat.name)}
						<StatBar name={s.stat.name} value={s.base_stat} />
					{/each}
					<div class="flex items-center gap-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
						<span class="w-16 shrink-0 text-xs font-semibold">Total</span>
						<span class="w-8 shrink-0 text-right text-sm font-bold tabular-nums"
							>{statTotal}</span
						>
					</div>
				</div>
				<div class="mt-5 grid grid-cols-3 gap-3 text-center">
					<div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
						<Ruler size={16} class="mx-auto text-slate-400" />
						<div class="mt-1 text-sm font-semibold">
							{(pokemon.height / 10).toFixed(1)} m
						</div>
						<div class="text-[0.65rem] text-slate-400">Height</div>
					</div>
					<div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
						<Weight size={16} class="mx-auto text-slate-400" />
						<div class="mt-1 text-sm font-semibold">
							{(pokemon.weight / 10).toFixed(1)} kg
						</div>
						<div class="text-[0.65rem] text-slate-400">Weight</div>
					</div>
					<div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
						<div class="mt-1 text-sm font-semibold">{pokemon.base_experience}</div>
						<div class="text-[0.65rem] text-slate-400">Base XP</div>
					</div>
				</div>
			</section>

			<!-- Abilities + sprites -->
			<section class="space-y-6">
				<div
					class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
				>
					<h2 class="mb-3 text-lg font-semibold">Abilities</h2>
					<div class="flex flex-wrap gap-2">
						{#each pokemon.abilities as a (a.ability.name)}
							<span
								class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium dark:bg-slate-800"
							>
								{formatName(a.ability.name)}
								{#if a.is_hidden}
									<span class="text-[0.6rem] text-brand-500">Hidden</span>
								{/if}
							</span>
						{/each}
					</div>
				</div>

				<div
					class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
				>
					<h2 class="mb-3 text-lg font-semibold">Sprites</h2>
					<div class="flex flex-wrap gap-3">
						{#each [{ u: spriteUrl(pokemon.id), l: 'Front' }, { u: pokemon.sprites.back_default, l: 'Back' }, { u: pokemon.sprites.front_shiny, l: 'Shiny' }] as sp (sp.l)}
							{#if sp.u}
								<div class="text-center">
									<div class="h-20 w-20">
										<PokemonImage src={sp.u} alt="{pokemon.name} {sp.l}" />
									</div>
									<span class="text-[0.65rem] text-slate-400">{sp.l}</span>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</section>
		</div>

		<!-- Evolution -->
		<section
			class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
		>
			<h2 class="mb-4 text-lg font-semibold">Evolution</h2>
			{#if evolution}
				<EvolutionChainView chain={evolution} currentName={pokemon.name} />
			{:else}
				<div class="grid place-items-center py-4">
					<Spinner />
				</div>
			{/if}
		</section>

		<!-- Moves -->
		<section
			class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
		>
			<h2 class="mb-3 text-lg font-semibold">
				Moves <span class="text-sm font-normal text-slate-400"
					>({pokemon.moves.length})</span
				>
			</h2>
			<div class="flex flex-wrap gap-1.5">
				{#each pokemon.moves.slice(0, 40) as m (m.move.name)}
					<span
						class="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
						>{formatName(m.move.name)}</span
					>
				{/each}
				{#if pokemon.moves.length > 40}
					<span class="px-2 py-1 text-xs text-slate-400"
						>+{pokemon.moves.length - 40} more</span
					>
				{/if}
			</div>
		</section>
	</article>
{/if}
