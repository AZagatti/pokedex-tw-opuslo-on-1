<script lang="ts">
	import { CircleAlert, RotateCw } from 'lucide-svelte';

	interface Props {
		message?: string;
		onRetry?: () => void;
	}
	const {
		message = 'Something went wrong while loading data.',
		onRetry,
	}: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center dark:border-red-900/50 dark:bg-red-950/30"
	role="alert"
>
	<CircleAlert size={40} class="text-red-500" />
	<p class="max-w-sm text-sm text-red-700 dark:text-red-300">{message}</p>
	{#if onRetry}
		<button
			type="button"
			onclick={onRetry}
			class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
		>
			<RotateCw size={16} />
			Try again
		</button>
	{/if}
</div>
