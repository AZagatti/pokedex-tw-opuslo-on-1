<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';

	const { children } = $props();

	onMount(() => {
		theme.init();
		favorites.init();
	});
</script>

<svelte:head>
	<title>Pokédex</title>
	<meta
		name="description"
		content="A fast, modern Pokédex built with SvelteKit — browse, search, and favorite Pokémon and berries."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
		{@render children()}
	</main>
	<footer
		class="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
	>
		Data from
		<a
			href="https://pokeapi.co"
			class="font-medium underline hover:text-brand-500"
			target="_blank"
			rel="noopener noreferrer">PokéAPI</a
		>. Built with SvelteKit.
	</footer>
</div>
