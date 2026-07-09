<script lang="ts">
	import { SearchX } from 'lucide-svelte';

	interface Props {
		title?: string;
		message?: string;
		children?: import('svelte').Snippet;
	}
	const {
		title = 'No results found',
		message = 'Try adjusting your search or filters.',
		children,
	}: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700"
>
	<SearchX size={44} class="text-slate-300 dark:text-slate-600" />
	<h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">
		{title}
	</h3>
	<p class="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
	{#if children}
		{@render children()}
	{/if}
</div>
