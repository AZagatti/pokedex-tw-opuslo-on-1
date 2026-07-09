<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { Heart, Moon, Sun, Cherry, Menu, X } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';

	let mobileOpen = $state(false);

	const links = [
		{ href: '/', icon: null, label: 'Pokédex' },
		{ href: '/berries/', icon: Cherry, label: 'Berries' },
		{ href: '/favorites/', icon: Heart, label: 'Favorites' },
	];

	function isActive(href: string): boolean {
		const path = page.url.pathname.replace(base, '') || '/';
		if (href === '/') {
			return path === '/';
		}
		return path.startsWith(href);
	}
</script>

<header
	class="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80"
>
	<div
		class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
	>
		<a
			href="{base}/"
			class="flex items-center gap-2 text-xl font-black tracking-tight"
		>
			<span
				class="grid h-8 w-8 place-items-center rounded-full border-2 border-slate-800 bg-gradient-to-b from-red-500 to-red-600 shadow-inner dark:border-slate-200"
			>
				<span class="h-2.5 w-2.5 rounded-full bg-white ring-2 ring-slate-800"
				></span>
			</span>
			<span class="text-slate-900 dark:text-white">Poké<span
					class="text-brand-500">dex</span
				></span>
		</a>

		<nav class="hidden items-center gap-1 md:flex" aria-label="Main">
			{#each links as link (link.href)}
				<a
					href="{base}{link.href}"
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition {isActive(
						link.href
					)
						? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
						: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}"
				>
					{#if link.icon}
						<link.icon size={16} />
					{/if}
					{link.label}
					{#if link.href === '/favorites/' && favorites.count > 0}
						<span
							class="ml-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[0.65rem] font-bold text-white"
							>{favorites.count}</span
						>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => theme.toggle()}
				class="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
				aria-label="Toggle {theme.current === 'dark' ? 'light' : 'dark'} mode"
			>
				{#if theme.current === 'dark'}
					<Sun size={20} />
				{:else}
					<Moon size={20} />
				{/if}
			</button>
			<button
				type="button"
				onclick={() => (mobileOpen = !mobileOpen)}
				class="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
				aria-label="Toggle menu"
				aria-expanded={mobileOpen}
			>
				{#if mobileOpen}<X size={20} />{:else}<Menu size={20} />{/if}
			</button>
		</div>
	</div>

	{#if mobileOpen}
		<nav
			class="border-t border-slate-200 px-4 py-2 md:hidden dark:border-slate-800"
			aria-label="Mobile"
		>
			{#each links as link (link.href)}
				<a
					href="{base}{link.href}"
					onclick={() => (mobileOpen = false)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition {isActive(
						link.href
					)
						? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
						: 'text-slate-600 dark:text-slate-300'}"
				>
					{#if link.icon}<link.icon size={16} />{/if}
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>
