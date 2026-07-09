<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import { favorites } from '$lib/stores/favorites.svelte';

	interface Props {
		id: number;
		name: string;
		size?: number;
		showLabel?: boolean;
	}

	const { id, name, size = 20, showLabel = false }: Props = $props();
	const active = $derived(favorites.has(id));
</script>

<button
	type="button"
	onclick={(e) => {
		e.preventDefault();
		e.stopPropagation();
		favorites.toggle(id);
	}}
	class={showLabel
		? 'inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white active:scale-95 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800'
		: 'grid place-items-center rounded-full bg-white/80 p-1.5 backdrop-blur transition hover:scale-110 hover:bg-white active:scale-95 dark:bg-slate-800/80 dark:hover:bg-slate-800'}
	aria-pressed={active}
	aria-label={active
		? `Remove ${name} from favorites`
		: `Add ${name} to favorites`}
	title={active ? 'Remove from favorites' : 'Add to favorites'}
>
	<Heart
		{size}
		class={active
			? 'fill-brand-500 text-brand-500'
			: 'text-slate-400 dark:text-slate-500'}
	/>
	{#if showLabel}
		<span>{active ? 'Favorited' : 'Favorite'}</span>
	{/if}
</button>
