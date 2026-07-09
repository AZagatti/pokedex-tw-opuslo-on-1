<script lang="ts">
	import { statLabel } from '$lib/utils';

	interface Props {
		name: string;
		value: number;
		max?: number;
	}

	const { name, value, max = 200 }: Props = $props();

	const pct = $derived(Math.min(100, (value / max) * 100));
	const color = $derived(
		value >= 100 ? '#22c55e' : value >= 60 ? '#eab308' : '#ef4444'
	);
</script>

<div class="flex items-center gap-3">
	<span class="w-16 shrink-0 text-xs font-medium text-slate-500"
		>{statLabel(name)}</span
	>
	<span class="w-8 shrink-0 text-right text-sm font-semibold tabular-nums"
		>{value}</span
	>
	<div
		class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
	>
		<div
			class="h-full rounded-full transition-[width] duration-700 ease-out"
			style="width: {pct}%; background-color: {color};"
		></div>
	</div>
</div>
