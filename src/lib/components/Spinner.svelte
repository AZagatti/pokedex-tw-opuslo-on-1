<script lang="ts">
	interface Props {
		size?: number;
		label?: string;
	}
	const { size = 32, label = 'Loading' }: Props = $props();
</script>

<div class="flex items-center justify-center" role="status" aria-label={label}>
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		class="animate-spin text-brand-500"
		fill="none"
		aria-hidden="true"
	>
		<circle
			cx="12"
			cy="12"
			r="10"
			stroke="currentColor"
			stroke-width="4"
			class="opacity-20"
		/>
		<path
			d="M12 2a10 10 0 0 1 10 10"
			stroke="currentColor"
			stroke-width="4"
			stroke-linecap="round"
		/>
	</svg>
	<span class="sr-only">{label}…</span>
</div>
