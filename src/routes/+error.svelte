<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { Home } from 'lucide-svelte';
</script>

<svelte:head>
	<title>{page.status} · Pokédex</title>
</svelte:head>

<section class="grid place-items-center py-24 text-center">
	<p class="text-7xl font-black text-brand-500">{page.status}</p>
	<h1 class="mt-4 text-2xl font-bold">
		{page.status === 404 ? 'Page not found' : 'Something went wrong'}
	</h1>
	<p class="mt-2 max-w-md text-sm text-slate-500">
		{page.error?.message ??
			'The page you are looking for does not exist or has moved.'}
	</p>
	<a
		href="{base}/"
		class="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
	>
		<Home size={16} /> Back to Pokédex
	</a>
</section>
